/**
 * Security-rules tests, run against the Firestore emulator by `npm run rules:test`.
 *
 * Every claim the README makes about the security model is asserted here
 * against the real rules engine, so the rules can be changed with evidence
 * rather than hope. Nothing in this file touches the production project.
 */
const fs = require("node:fs");
const path = require("node:path");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
  writeBatch,
} = require("firebase/firestore");
const {
  syncWeekInTransaction,
} = require("../../backend/services/appointmentService");

const TRAINER_EMAIL = "danielrajic145@gmail.com";

let testEnv;

const authed = (uid, email, emailVerified = true) =>
  testEnv
    .authenticatedContext(uid, { email, email_verified: emailVerified })
    .firestore();

const trainerDb = () => authed("trainer", TRAINER_EMAIL);
const clientDb = (uid = "clientA") => authed(uid, `${uid}@example.com`);
const anonDb = () => testEnv.unauthenticatedContext().firestore();

/** A date far enough ahead that the 24h cancellation deadline has not passed. */
function futureDate(daysAhead = 10) {
  const d = new Date(Date.now() + daysAhead * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

/** A slot that starts within the next few hours — inside the deadline. */
function imminentDate() {
  const d = new Date(Date.now() + 2 * 3600000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

const slotId = (date, time) => `${date}_${time}`;

/** Monday of a "YYYY-MM-DD" (UTC calendar), as "YYYY-MM-DD". */
function mondayOf(date) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

/** `days` after a "YYYY-MM-DD", as "YYYY-MM-DD". */
function addDays(date, days) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * A client booking the way the app writes one: the slot and her week list
 * (`booking_weeks`), committed together. `slots` overrides the list.
 */
function book(db, uid, date, time, { slots, extra = {} } = {}) {
  const weekStart = mondayOf(date);
  const batch = writeBatch(db);
  batch.set(doc(db, "booking_weeks", `${uid}_${weekStart}`), {
    userId: uid,
    weekStart,
    slots: slots ?? [slotId(date, time)],
  });
  batch.set(doc(db, "appointments", slotId(date, time)), {
    userId: uid,
    appointmentDate: date,
    time,
    status: "active",
    weekStart,
    ...extra,
  });
  return batch.commit();
}

/** Seeds documents bypassing the rules, the way the trainer/console would. */
const seed = (fn) =>
  testEnv.withSecurityRulesDisabled((ctx) => fn(ctx.firestore()));

const activeClient = (uid) => ({
  uid,
  email: `${uid}@example.com`,
  role: "user",
  status: "active",
  trainingType: "in_person",
});

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "marta-fitness-rules-test",
    firestore: {
      rules: fs.readFileSync(
        path.join(__dirname, "..", "..", "firestore.rules"),
        "utf8",
      ),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await seed(async (db) => {
    await setDoc(doc(db, "users", "clientA"), activeClient("clientA"));
    await setDoc(doc(db, "users", "clientB"), activeClient("clientB"));
    await setDoc(doc(db, "users", "pendingC"), {
      ...activeClient("pendingC"),
      status: "pending",
    });
    await setDoc(doc(db, "users", "onlineD"), {
      ...activeClient("onlineD"),
      trainingType: "online",
    });
    await setDoc(doc(db, "users", "trainer"), {
      uid: "trainer",
      email: TRAINER_EMAIL,
      role: "admin",
      status: "active",
    });
  });
});

describe("unauthenticated access", () => {
  it("is denied everywhere", async () => {
    const db = anonDb();
    await assertFails(getDoc(doc(db, "users", "clientA")));
    await assertFails(getDoc(doc(db, "appointments", "x")));
    await assertFails(getDoc(doc(db, "config", "trainerSchedule")));
    await assertFails(getDocs(collection(db, "measurements")));
  });
});

describe("users — privilege escalation", () => {
  it("lets a client read their own profile but not another client's", async () => {
    const db = clientDb("clientA");
    await assertSucceeds(getDoc(doc(db, "users", "clientA")));
    await assertFails(getDoc(doc(db, "users", "clientB")));
  });

  // The headline fix: a client could previously approve themselves.
  it("refuses a client raising their own status to active", async () => {
    await seed((db) =>
      setDoc(doc(db, "users", "pendingC"), {
        ...activeClient("pendingC"),
        status: "pending",
      }),
    );
    const db = authed("pendingC", "pendingC@example.com");
    await assertFails(
      updateDoc(doc(db, "users", "pendingC"), { status: "active" }),
    );
  });

  it("refuses a client promoting themselves to admin", async () => {
    const db = clientDb("clientA");
    await assertFails(
      updateDoc(doc(db, "users", "clientA"), { role: "admin" }),
    );
  });

  it("refuses a client rewriting their own uid or e-mail", async () => {
    const db = clientDb("clientA");
    await assertFails(
      updateDoc(doc(db, "users", "clientA"), { uid: "trainer" }),
    );
    await assertFails(
      updateDoc(doc(db, "users", "clientA"), { email: TRAINER_EMAIL }),
    );
  });

  it("still lets a client update their own harmless profile fields", async () => {
    const db = clientDb("clientA");
    await assertSucceeds(
      updateDoc(doc(db, "users", "clientA"), {
        displayName: "Ana",
        photoURL: "https://example.com/a.jpg",
      }),
    );
  });

  it("lets a waiting client pick and correct a training type, but not an invented one", async () => {
    const db = authed("pendingC", "pendingC@example.com");
    await assertSucceeds(
      updateDoc(doc(db, "users", "pendingC"), { trainingType: "online" }),
    );
    await assertSucceeds(
      updateDoc(doc(db, "users", "pendingC"), { trainingType: "in_person" }),
    );
    await assertFails(
      updateDoc(doc(db, "users", "pendingC"), { trainingType: "vip" }),
    );
    await assertFails(
      updateDoc(doc(db, "users", "pendingC"), { trainingType: null }),
    );
  });

  // Regression: the type was editable forever, so an approved online client
  // could flip herself to in-person and start booking the trainer's calendar.
  it("freezes the training type once the client is approved", async () => {
    await assertFails(
      updateDoc(
        doc(authed("onlineD", "onlineD@example.com"), "users", "onlineD"),
        {
          trainingType: "in_person",
        },
      ),
    );
    await assertFails(
      updateDoc(doc(clientDb("clientA"), "users", "clientA"), {
        trainingType: "online",
      }),
    );
  });

  it("lets an approved client with no type yet pick one, once", async () => {
    await seed((db) =>
      updateDoc(doc(db, "users", "clientA"), { trainingType: null }),
    );
    const db = clientDb("clientA");
    await assertSucceeds(
      updateDoc(doc(db, "users", "clientA"), { trainingType: "online" }),
    );
    await assertFails(
      updateDoc(doc(db, "users", "clientA"), { trainingType: "in_person" }),
    );
  });

  it("lets the trainer change any client's training type", async () => {
    await assertSucceeds(
      updateDoc(doc(trainerDb(), "users", "clientA"), {
        trainingType: "online",
      }),
    );
  });

  // The trainer's client list loads every profile; a client must not be able
  // to stuff hers with fields of her own or a megabyte-long name.
  it("refuses a client adding unknown fields or oversized values to her profile", async () => {
    const db = clientDb("clientA");
    await assertFails(
      updateDoc(doc(db, "users", "clientA"), { notes: "anything" }),
    );
    await assertFails(
      updateDoc(doc(db, "users", "clientA"), { displayName: "x".repeat(101) }),
    );
    await assertFails(updateDoc(doc(db, "users", "clientA"), { photoURL: 42 }));
  });

  it("accepts the login refresh only with the server's clock", async () => {
    const db = clientDb("clientA");
    await assertSucceeds(
      setDoc(
        doc(db, "users", "clientA"),
        { lastLogin: serverTimestamp(), displayName: "Ana" },
        { merge: true },
      ),
    );
    await assertFails(
      updateDoc(doc(db, "users", "clientA"), {
        lastLogin: new Date("2000-01-01"),
      }),
    );
  });

  // An older profile may carry a field the allowlist does not name; only the
  // keys a write changes are checked, so its login refresh must still pass.
  it("still accepts the login refresh on a profile with a legacy field", async () => {
    await seed((db) =>
      updateDoc(doc(db, "users", "clientA"), { legacyField: true }),
    );
    await assertSucceeds(
      setDoc(
        doc(clientDb("clientA"), "users", "clientA"),
        { lastLogin: serverTimestamp() },
        { merge: true },
      ),
    );
  });

  it("lets the trainer approve a pending client", async () => {
    const db = trainerDb();
    await assertSucceeds(
      updateDoc(doc(db, "users", "pendingC"), { status: "active" }),
    );
  });

  it("lets only the trainer list clients", async () => {
    await assertSucceeds(getDocs(collection(trainerDb(), "users")));
    await assertFails(getDocs(collection(clientDb("clientA"), "users")));
  });

  it("forces self-registration to land as a pending client", async () => {
    const db = authed("newbie", "newbie@example.com");
    await assertFails(
      setDoc(doc(db, "users", "newbie"), {
        uid: "newbie",
        email: "newbie@example.com",
        role: "admin",
        status: "active",
      }),
    );
    await assertSucceeds(
      setDoc(doc(db, "users", "newbie"), {
        uid: "newbie",
        email: "newbie@example.com",
        role: "user",
        status: "pending",
      }),
    );
  });

  it("accepts exactly the profile AuthContext creates, and nothing extra", async () => {
    const db = authed("newbie", "newbie@example.com");
    const profile = {
      uid: "newbie",
      email: "newbie@example.com",
      displayName: "Nova Klijentica",
      photoURL: null,
      role: "user",
      status: "pending",
      trainingType: null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };
    await assertFails(
      setDoc(doc(db, "users", "newbie"), { ...profile, notes: "x" }),
    );
    // Skipping the waiting room's type pick is not a way around approval,
    // but there is no reason to accept it either.
    await assertFails(
      setDoc(doc(db, "users", "newbie"), {
        ...profile,
        trainingType: "in_person",
      }),
    );
    await assertSucceeds(setDoc(doc(db, "users", "newbie"), profile));
  });

  it("accepts the trainer's own first sign-in as an approved admin", async () => {
    await seed((db) => deleteDoc(doc(db, "users", "trainer")));
    await assertSucceeds(
      setDoc(doc(trainerDb(), "users", "trainer"), {
        uid: "trainer",
        email: TRAINER_EMAIL,
        displayName: "Marta",
        photoURL: "https://example.com/m.jpg",
        role: "admin",
        status: "active",
        trainingType: null,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      }),
    );
  });

  // An unverified address could be an unowned one.
  it("does not treat an unverified trainer e-mail as the trainer", async () => {
    const db = authed("imposter", TRAINER_EMAIL, false);
    await assertFails(getDocs(collection(db, "users")));
  });
});

describe("appointments — booking", () => {
  const date = futureDate();

  it("lets an active client book a free slot under its slot id", async () => {
    await assertSucceeds(book(clientDb("clientA"), "clientA", date, "09:00"));
  });

  // The week list is where the weekly cap lives; a booking that skips it
  // would skip the cap.
  it("refuses a booking that is not on her week list", async () => {
    const db = clientDb("clientA");
    await assertFails(
      setDoc(doc(db, "appointments", slotId(date, "09:00")), {
        userId: "clientA",
        appointmentDate: date,
        time: "09:00",
        status: "active",
        weekStart: mondayOf(date),
      }),
    );
    await assertFails(
      book(db, "clientA", date, "09:00", {
        slots: [slotId(date, "10:00")],
      }),
    );
  });

  // The document id is the collision key, so it must match the payload.
  it("refuses a booking whose document id does not match its date and time", async () => {
    const db = clientDb("clientA");
    await assertFails(
      setDoc(doc(db, "appointments", "some-random-id"), {
        userId: "clientA",
        appointmentDate: date,
        time: "09:00",
        status: "active",
      }),
    );
    await assertFails(
      setDoc(doc(db, "appointments", slotId(date, "10:00")), {
        userId: "clientA",
        appointmentDate: date,
        time: "09:00",
        status: "active",
      }),
    );
  });

  it("refuses booking on somebody else's behalf", async () => {
    const db = clientDb("clientA");
    await assertFails(
      setDoc(doc(db, "appointments", slotId(date, "09:00")), {
        userId: "clientB",
        appointmentDate: date,
        time: "09:00",
        status: "active",
      }),
    );
  });

  it("refuses a client still in the waiting room", async () => {
    const db = authed("pendingC", "pendingC@example.com");
    await assertFails(
      setDoc(doc(db, "appointments", slotId(date, "09:00")), {
        userId: "pendingC",
        appointmentDate: date,
        time: "09:00",
        status: "active",
      }),
    );
  });

  it("refuses a malformed date or time", async () => {
    const db = clientDb("clientA");
    await assertFails(
      setDoc(doc(db, "appointments", "17-03-2025_09:00"), {
        userId: "clientA",
        appointmentDate: "17-03-2025",
        time: "09:00",
        status: "active",
      }),
    );
  });

  it("refuses a time that is not a real clock time", async () => {
    const db = clientDb("clientA");
    await assertFails(
      setDoc(doc(db, "appointments", slotId(date, "25:99")), {
        userId: "clientA",
        appointmentDate: date,
        time: "25:99",
        status: "active",
      }),
    );
  });

  // Regression: nothing stopped an approved *online* client from booking (or
  // reading) the in-person calendar.
  it("refuses an online client booking or reading the calendar", async () => {
    const db = authed("onlineD", "onlineD@example.com");
    await assertFails(
      setDoc(doc(db, "appointments", slotId(date, "09:00")), {
        userId: "onlineD",
        appointmentDate: date,
        time: "09:00",
        status: "active",
      }),
    );
    await assertFails(
      getDocs(
        query(collection(db, "appointments"), where("status", "==", "active")),
      ),
    );
  });

  it("refuses booking a slot in the past or far beyond the coming week", async () => {
    const db = clientDb("clientA");
    await assertFails(book(db, "clientA", futureDate(-3), "09:00"));
    await assertFails(book(db, "clientA", futureDate(40), "09:00"));
  });

  // The slot documents are readable by every in-person client, so nothing
  // but the booking itself may be stored on them — no names, no notes.
  it("refuses extra fields on a booking", async () => {
    const db = clientDb("clientA");
    await assertFails(
      book(db, "clientA", date, "09:00", { extra: { userName: "Ana Anić" } }),
    );
    await assertSucceeds(
      book(db, "clientA", date, "09:00", {
        extra: { createdAt: serverTimestamp(), updatedAt: serverTimestamp() },
      }),
    );
  });

  it("refuses claiming a released slot that has already passed", async () => {
    const past = futureDate(-3);
    await seed((db) =>
      setDoc(doc(db, "appointments", slotId(past, "09:00")), {
        userId: "clientA",
        appointmentDate: past,
        time: "09:00",
        status: "cancelled",
      }),
    );
    await assertFails(book(clientDb("clientB"), "clientB", past, "09:00"));
  });

  it("stops a second client overwriting an active booking", async () => {
    await seed((db) =>
      setDoc(doc(db, "appointments", slotId(date, "09:00")), {
        userId: "clientA",
        appointmentDate: date,
        time: "09:00",
        status: "active",
      }),
    );
    await assertFails(book(clientDb("clientB"), "clientB", date, "09:00"));
  });

  it("lets a client claim a slot somebody else released", async () => {
    await seed((db) =>
      setDoc(doc(db, "appointments", slotId(date, "09:00")), {
        userId: "clientA",
        appointmentDate: date,
        time: "09:00",
        status: "cancelled",
      }),
    );
    await assertSucceeds(book(clientDb("clientB"), "clientB", date, "09:00"));
  });

  it("lets a client see the week's slots so availability can be shown", async () => {
    await assertSucceeds(
      getDocs(
        query(
          collection(clientDb("clientA"), "appointments"),
          where("status", "==", "active"),
        ),
      ),
    );
  });

  it("lets only the trainer delete an appointment", async () => {
    await seed((db) =>
      setDoc(doc(db, "appointments", slotId(date, "09:00")), {
        userId: "clientA",
        appointmentDate: date,
        time: "09:00",
        status: "active",
      }),
    );

    await assertFails(
      deleteDoc(
        doc(clientDb("clientA"), "appointments", slotId(date, "09:00")),
      ),
    );
    await assertSucceeds(
      deleteDoc(doc(trainerDb(), "appointments", slotId(date, "09:00"))),
    );
  });
});

describe("booking weeks — the weekly cap, enforced by the server", () => {
  // Next week's Monday, so every day of it is bookable and > 24h away
  // (except, on a Sunday, Monday itself — tests that cancel use Friday).
  const monday = addDays(mondayOf(futureDate(0)), 7);
  const day = (i) => addDays(monday, i);
  const listRef = (db, uid = "clientA", weekStart = monday) =>
    doc(db, "booking_weeks", `${uid}_${weekStart}`);
  const list = (slots, over = {}) => ({
    userId: "clientA",
    weekStart: monday,
    slots,
    ...over,
  });

  it("accepts up to four slots on four different days", async () => {
    await assertSucceeds(
      setDoc(
        listRef(clientDb()),
        list([0, 1, 2, 3].map((i) => slotId(day(i), "09:00"))),
      ),
    );
  });

  it("refuses a fifth slot", async () => {
    await assertFails(
      setDoc(
        listRef(clientDb()),
        list([0, 1, 2, 3, 4].map((i) => slotId(day(i), "09:00"))),
      ),
    );
  });

  it("refuses two slots on the same day", async () => {
    await assertFails(
      setDoc(
        listRef(clientDb()),
        list([slotId(day(1), "09:00"), slotId(day(1), "17:00")]),
      ),
    );
  });

  it("refuses a slot outside the list's week", async () => {
    await assertFails(
      setDoc(listRef(clientDb()), list([slotId(day(7), "09:00")])),
    );
    await assertFails(
      setDoc(listRef(clientDb()), list([slotId(day(-1), "09:00")])),
    );
  });

  // Overlapping 7-day windows would each get their own four slots.
  it("refuses a week that does not start on a Monday", async () => {
    const tuesday = day(1);
    await assertFails(
      setDoc(
        listRef(clientDb(), "clientA", tuesday),
        list([slotId(day(2), "09:00")], { weekStart: tuesday }),
      ),
    );
  });

  it("refuses a list under someone else's id, or from an online client", async () => {
    await assertFails(
      setDoc(listRef(clientDb(), "clientB"), list([], { userId: "clientB" })),
    );
    await assertFails(
      setDoc(
        listRef(authed("onlineD", "onlineD@example.com"), "onlineD"),
        list([], { userId: "onlineD" }),
      ),
    );
  });

  // The way around the cap would be: book four, drop them from the list,
  // book four more. A slot may leave the list only once it is released.
  it("refuses dropping a booking from the list while it is still active", async () => {
    const friday = slotId(day(4), "09:00");
    await assertSucceeds(book(clientDb(), "clientA", day(4), "09:00"));
    await assertFails(setDoc(listRef(clientDb()), list([])));
    await assertFails(deleteDoc(listRef(clientDb())));
    expect(
      (await getDoc(doc(trainerDb(), "appointments", friday))).exists(),
    ).toBe(true);
  });

  it("lets a booking leave the list when it is cancelled in the same write", async () => {
    await assertSucceeds(book(clientDb(), "clientA", day(4), "09:00"));
    const db = clientDb();
    const batch = writeBatch(db);
    batch.update(doc(db, "appointments", slotId(day(4), "09:00")), {
      status: "cancelled",
    });
    batch.set(listRef(db), list([]));
    await assertSucceeds(batch.commit());
  });

  it("lets the client delete a list once its week is over", async () => {
    const pastMonday = addDays(monday, -14);
    await seed(async (db) => {
      await setDoc(doc(db, "appointments", slotId(pastMonday, "09:00")), {
        userId: "clientA",
        appointmentDate: pastMonday,
        time: "09:00",
        status: "active",
      });
      await setDoc(
        listRef(db, "clientA", pastMonday),
        list([slotId(pastMonday, "09:00")], { weekStart: pastMonday }),
      );
    });
    await assertSucceeds(deleteDoc(listRef(clientDb(), "clientA", pastMonday)));
  });

  it("is readable by its owner and the trainer only", async () => {
    await seed((db) => setDoc(listRef(db), list([])));
    await assertSucceeds(getDoc(listRef(clientDb())));
    await assertSucceeds(getDoc(listRef(trainerDb())));
    await assertFails(getDoc(listRef(clientDb("clientB"))));
  });
});

// The rules above, exercised through the app's own transaction body
// (backend/services/appointmentService.js) rather than hand-built writes —
// what the phone sends is exactly what is checked here.
describe("the app's booking transaction against the real rules", () => {
  const monday = addDays(mondayOf(futureDate(0)), 7);
  const slot = (i, time = "09:00") => ({ date: addDays(monday, i), time });

  const sync = (db, desired, existing = [], uid = "clientA") =>
    runTransaction(db, (tx) =>
      syncWeekInTransaction({
        tx,
        slotRef: (id) => doc(db, "appointments", id),
        weekRef: (id) => doc(db, "booking_weeks", id),
        weekStart: monday,
        userId: uid,
        desired,
        existing,
        timestamp: serverTimestamp,
      }),
    );

  it("books a week, then changes one day, keeping the other", async () => {
    const db = clientDb();
    await assertSucceeds(sync(db, [slot(1), slot(4)]));
    await assertSucceeds(sync(db, [slot(1), slot(2)], [slot(1), slot(4)]));

    const friday = await getDoc(
      doc(db, "appointments", slotId(slot(4).date, "09:00")),
    );
    expect(friday.data().status).toBe("cancelled");
    const week = await getDoc(doc(db, "booking_weeks", `clientA_${monday}`));
    expect(week.data().slots).toEqual([
      slotId(slot(1).date, "09:00"),
      slotId(slot(2).date, "09:00"),
    ]);
  });

  it("refuses a fifth session even when the app's own checks are skipped", async () => {
    await assertFails(
      sync(clientDb(), [slot(0), slot(1), slot(2), slot(3), slot(4)]),
    );
  });

  it("refuses two sessions on one day even when the app's checks are skipped", async () => {
    await assertFails(sync(clientDb(), [slot(1), slot(1, "17:00")]));
  });

  it("lets a second client claim a slot the first one released", async () => {
    await assertSucceeds(sync(clientDb("clientA"), [slot(1), slot(4)]));
    await assertSucceeds(
      sync(clientDb("clientA"), [slot(1), slot(2)], [slot(1), slot(4)]),
    );
    await assertSucceeds(
      sync(clientDb("clientB"), [slot(4), slot(3)], [], "clientB"),
    );
  });

  it("refuses a slot another client holds", async () => {
    await assertSucceeds(sync(clientDb("clientA"), [slot(1), slot(4)]));
    await expect(
      sync(clientDb("clientB"), [slot(1), slot(3)], [], "clientB"),
    ).rejects.toMatchObject({ code: "slot-taken" });
  });
});

describe("account deletion", () => {
  beforeEach(() =>
    seed(async (db) => {
      await setDoc(doc(db, "weekly_review", "revA"), { userId: "clientA" });
      await setDoc(doc(db, "weekly_review", "revB"), { userId: "clientB" });
      await setDoc(doc(db, "workouts", "w_A"), { userId: "clientA" });
      await setDoc(doc(db, "workouts", "w_B"), { userId: "clientB" });
    }),
  );

  it("lets a client delete her own profile, reviews and programs", async () => {
    const db = clientDb("clientA");
    await assertSucceeds(deleteDoc(doc(db, "weekly_review", "revA")));
    await assertSucceeds(deleteDoc(doc(db, "workouts", "w_A")));
    await assertSucceeds(deleteDoc(doc(db, "users", "clientA")));
  });

  it("refuses her deleting anybody else's", async () => {
    const db = clientDb("clientA");
    await assertFails(deleteDoc(doc(db, "weekly_review", "revB")));
    await assertFails(deleteDoc(doc(db, "workouts", "w_B")));
    await assertFails(deleteDoc(doc(db, "users", "clientB")));
  });

  it("still keeps programs read-only for her otherwise", async () => {
    await assertFails(
      updateDoc(doc(clientDb("clientA"), "workouts", "w_A"), { x: 1 }),
    );
  });
});

describe("appointments — the 24h cancellation rule", () => {
  const far = futureDate();
  const soon = imminentDate();

  const seedSlot = (date, time, uid = "clientA") =>
    seed((db) =>
      setDoc(doc(db, "appointments", slotId(date, time)), {
        userId: uid,
        appointmentDate: date,
        time,
        status: "active",
      }),
    );

  it("lets a client cancel their own session well before it starts", async () => {
    await seedSlot(far, "09:00");
    const db = clientDb("clientA");
    await assertSucceeds(
      updateDoc(doc(db, "appointments", slotId(far, "09:00")), {
        status: "cancelled",
      }),
    );
  });

  // The app already blocks this; the rule is the backstop for a tampered client.
  it("refuses a client cancelling a session that is hours away", async () => {
    const d = new Date(Date.now() + 2 * 3600000);
    const time = `${String(d.getUTCHours()).padStart(2, "0")}:00`;
    await seedSlot(soon, time);

    const db = clientDb("clientA");
    await assertFails(
      updateDoc(doc(db, "appointments", slotId(soon, time)), {
        status: "cancelled",
      }),
    );
  });

  it("refuses a client cancelling somebody else's session", async () => {
    await seedSlot(far, "09:00", "clientA");
    const db = clientDb("clientB");
    await assertFails(
      updateDoc(doc(db, "appointments", slotId(far, "09:00")), {
        status: "cancelled",
      }),
    );
  });

  it("refuses a client rewriting the date or time to dodge the deadline", async () => {
    await seedSlot(far, "09:00");
    const db = clientDb("clientA");
    await assertFails(
      updateDoc(doc(db, "appointments", slotId(far, "09:00")), {
        status: "cancelled",
        appointmentDate: futureDate(30),
      }),
    );
  });

  it("refuses a cancellation that also writes anything else", async () => {
    await seedSlot(far, "09:00");
    const db = clientDb("clientA");
    await assertFails(
      updateDoc(doc(db, "appointments", slotId(far, "09:00")), {
        status: "cancelled",
        note: "x",
      }),
    );
    await assertSucceeds(
      updateDoc(doc(db, "appointments", slotId(far, "09:00")), {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
      }),
    );
  });

  it("lets the trainer cancel at any time, deadline or not", async () => {
    const d = new Date(Date.now() + 2 * 3600000);
    const time = `${String(d.getUTCHours()).padStart(2, "0")}:00`;
    await seedSlot(soon, time);

    const db = trainerDb();
    await assertSucceeds(
      updateDoc(doc(db, "appointments", slotId(soon, time)), {
        status: "cancelled",
      }),
    );
  });
});

describe("measurements and weekly reviews stay private", () => {
  beforeEach(async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "measurements", "clientA_2025-03-17"), {
        userId: "clientA",
        date: "2025-03-17",
        weight: "62",
      });
      await setDoc(doc(db, "weekly_review", "rev1"), {
        userId: "clientA",
        reflection: "private",
      });
      await setDoc(doc(db, "workouts", "2025-03-17_clientA_1"), {
        userId: "clientA",
        weekStart: "2025-03-17",
      });
    });
  });

  it("lets a client read their own measurements", async () => {
    await assertSucceeds(
      getDoc(doc(clientDb("clientA"), "measurements", "clientA_2025-03-17")),
    );
  });

  it("refuses another client reading them", async () => {
    await assertFails(
      getDoc(doc(clientDb("clientB"), "measurements", "clientA_2025-03-17")),
    );
  });

  // The model flipped: an online client measures herself and the trainer
  // reads. The trainer no longer writes measurements.
  it("lets a client update her own measurements and not the trainer", async () => {
    await assertSucceeds(
      updateDoc(
        doc(clientDb("clientA"), "measurements", "clientA_2025-03-17"),
        { weight: "61" },
      ),
    );
    await assertFails(
      updateDoc(doc(trainerDb(), "measurements", "clientA_2025-03-17"), {
        weight: "50",
      }),
    );
  });

  it("refuses a client editing another client's measurements", async () => {
    await assertFails(
      updateDoc(
        doc(clientDb("clientB"), "measurements", "clientA_2025-03-17"),
        { weight: "50" },
      ),
    );
  });

  it("keeps a weekly review readable by its author and the trainer only", async () => {
    await assertSucceeds(
      getDoc(doc(clientDb("clientA"), "weekly_review", "rev1")),
    );
    await assertFails(
      getDoc(doc(clientDb("clientB"), "weekly_review", "rev1")),
    );
    await assertSucceeds(getDoc(doc(trainerDb(), "weekly_review", "rev1")));
  });

  const review = (uid, over = {}) => ({
    userId: uid,
    userName: "Ana Anić",
    ratings: { training: 4, eating: 3, communication: 5 },
    reflection: "Dobar tjedan.",
    createdAt: serverTimestamp(),
    ...over,
  });

  it("lets a client write a review only under their own id", async () => {
    const db = clientDb("clientA");
    await assertSucceeds(
      setDoc(doc(db, "weekly_review", "new1"), review("clientA")),
    );
    await assertFails(
      setDoc(doc(db, "weekly_review", "new2"), review("clientB")),
    );
  });

  // An Apple account can have no name at all; that must not block a review.
  it("accepts a review from a client with no name", async () => {
    await assertSucceeds(
      setDoc(
        doc(clientDb("clientA"), "weekly_review", "new1"),
        review("clientA", { userName: null }),
      ),
    );
  });

  it("refuses ratings outside 1–5, missing categories or non-numbers", async () => {
    const db = clientDb("clientA");
    for (const ratings of [
      { training: 0, eating: 3, communication: 5 },
      { training: 6, eating: 3, communication: 5 },
      { training: 4.5, eating: 3, communication: 5 },
      { training: "5", eating: 3, communication: 5 },
      { training: 4, eating: 3 },
      { training: 4, eating: 3, communication: 5, mood: 5 },
    ]) {
      await assertFails(
        setDoc(doc(db, "weekly_review", "bad"), review("clientA", { ratings })),
      );
    }
  });

  it("refuses an oversized reflection, a fake date or extra fields", async () => {
    const db = clientDb("clientA");
    await assertFails(
      setDoc(
        doc(db, "weekly_review", "bad"),
        review("clientA", { reflection: "x".repeat(2001) }),
      ),
    );
    await assertFails(
      setDoc(
        doc(db, "weekly_review", "bad"),
        review("clientA", { createdAt: new Date("2020-01-01") }),
      ),
    );
    await assertFails(
      setDoc(
        doc(db, "weekly_review", "bad"),
        review("clientA", { pinned: true }),
      ),
    );
  });

  it("refuses a review from a client still in the waiting room", async () => {
    await assertFails(
      setDoc(
        doc(authed("pendingC", "pendingC@example.com"), "weekly_review", "x"),
        review("pendingC"),
      ),
    );
  });

  it("keeps a program readable by its owner, writable only by the trainer", async () => {
    await assertSucceeds(
      getDoc(doc(clientDb("clientA"), "workouts", "2025-03-17_clientA_1")),
    );
    await assertFails(
      getDoc(doc(clientDb("clientB"), "workouts", "2025-03-17_clientA_1")),
    );
    await assertFails(
      updateDoc(doc(clientDb("clientA"), "workouts", "2025-03-17_clientA_1"), {
        weekStart: "hacked",
      }),
    );
    await assertSucceeds(
      updateDoc(doc(trainerDb(), "workouts", "2025-03-17_clientA_1"), {
        sessionsPerWeek: 3,
      }),
    );
  });
});

describe("trainer schedule", () => {
  beforeEach(() =>
    seed((db) =>
      setDoc(doc(db, "config", "trainerSchedule"), { weekStart: "2025-03-17" }),
    ),
  );

  it("is readable by clients so they can see availability", async () => {
    await assertSucceeds(
      getDoc(doc(clientDb("clientA"), "config", "trainerSchedule")),
    );
  });

  it("is not readable by a client still in the waiting room", async () => {
    await assertFails(
      getDoc(
        doc(
          authed("pendingC", "pendingC@example.com"),
          "config",
          "trainerSchedule",
        ),
      ),
    );
  });

  it("is writable only by the trainer", async () => {
    await assertFails(
      updateDoc(doc(clientDb("clientA"), "config", "trainerSchedule"), {
        monday: [],
      }),
    );
    await assertSucceeds(
      updateDoc(doc(trainerDb(), "config", "trainerSchedule"), { monday: [] }),
    );
  });
});

describe("client check-ins", () => {
  const date = "2026-09-25";
  const measurement = (uid, over = {}) => ({
    userId: uid,
    date,
    weight: "62.5",
    waist: "70",
    hips: "",
    chest: "",
    arms: "",
    photoAngles: ["front"],
    ...over,
  });

  it("lets an approved client create her own check-in under her id", async () => {
    await assertSucceeds(
      setDoc(
        doc(clientDb("clientA"), "measurements", `clientA_${date}`),
        measurement("clientA"),
      ),
    );
  });

  it("refuses a check-in filed under someone else's id", async () => {
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "measurements", `clientB_${date}`),
        measurement("clientB"),
      ),
    );
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "measurements", `clientA_${date}`),
        measurement("clientB"),
      ),
    );
  });

  it("refuses a document id that does not match the date", async () => {
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "measurements", "clientA_2020-01-01"),
        measurement("clientA"),
      ),
    );
  });

  it("refuses a client still in the waiting room", async () => {
    await assertFails(
      setDoc(
        doc(
          authed("pendingC", "pendingC@example.com"),
          "measurements",
          `pendingC_${date}`,
        ),
        measurement("pendingC"),
      ),
    );
  });

  it("refuses oversized values and more than four photo angles", async () => {
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "measurements", `clientA_${date}`),
        measurement("clientA", { weight: "x".repeat(50) }),
      ),
    );
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "measurements", `clientA_${date}`),
        measurement("clientA", {
          photoAngles: ["front", "back", "left", "right", "top"],
        }),
      ),
    );
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "measurements", `clientA_${date}`),
        measurement("clientA", { photoAngles: ["selfie"] }),
      ),
    );
  });

  it("refuses fields a check-in does not have", async () => {
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "measurements", `clientA_${date}`),
        measurement("clientA", { notes: "x".repeat(500000) }),
      ),
    );
    await assertSucceeds(
      setDoc(
        doc(clientDb("clientA"), "measurements", `clientA_${date}`),
        measurement("clientA", { updatedAt: serverTimestamp() }),
      ),
    );
  });

  it("lets the client and the trainer delete a check-in, not another client", async () => {
    await seed((db) =>
      setDoc(
        doc(db, "measurements", `clientA_${date}`),
        measurement("clientA"),
      ),
    );
    await assertFails(
      deleteDoc(doc(clientDb("clientB"), "measurements", `clientA_${date}`)),
    );
    await assertSucceeds(
      deleteDoc(doc(clientDb("clientA"), "measurements", `clientA_${date}`)),
    );
  });

  // Same class of bug as exercise_logs: a read rule built on
  // `resource.data.userId` crashes rather than denying when the document does
  // not exist. A client checking whether she already has a check-in for a
  // date must not hit that crash.
  it("lets a client read her own not-yet-existing check-in cleanly", async () => {
    const snap = await getDoc(
      doc(clientDb("clientA"), "measurements", "clientA_2099-01-01"),
    );
    expect(snap.exists()).toBe(false);
  });

  it("still refuses another client's not-yet-existing check-in", async () => {
    await assertFails(
      getDoc(doc(clientDb("clientB"), "measurements", "clientA_2099-01-01")),
    );
  });
});

describe("progress photos", () => {
  const date = "2026-09-25";
  const JPEG = "/9j/4AAQSkZJRgABAQ" + "A".repeat(100);
  const photo = (uid, angle = "front", over = {}) => ({
    userId: uid,
    date,
    angle,
    mimeType: "image/jpeg",
    data: JPEG,
    ...over,
  });
  const id = (uid, angle = "front") => `${uid}_${date}_${angle}`;

  it("lets an approved client upload her own photo for a valid angle", async () => {
    for (const angle of ["front", "back", "left", "right"]) {
      await assertSucceeds(
        setDoc(
          doc(clientDb("clientA"), "progress_photos", id("clientA", angle)),
          photo("clientA", angle),
        ),
      );
    }
  });

  // The angle is part of the id and limited to four values — that is what
  // caps a check-in at four photos.
  it("refuses a fifth angle", async () => {
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "progress_photos", id("clientA", "top")),
        photo("clientA", "top"),
      ),
    );
  });

  it("refuses an id that does not match the owner, date and angle", async () => {
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "progress_photos", id("clientA", "back")),
        photo("clientA", "front"),
      ),
    );
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "progress_photos", id("clientB")),
        photo("clientB"),
      ),
    );
  });

  it("refuses anything that is not a JPEG", async () => {
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "progress_photos", id("clientA")),
        photo("clientA", "front", { data: "PHNjcmlwdD4=" }),
      ),
    );
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "progress_photos", id("clientA")),
        photo("clientA", "front", { mimeType: "image/png" }),
      ),
    );
  });

  it("refuses a second payload smuggled next to the photo", async () => {
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "progress_photos", id("clientA")),
        photo("clientA", "front", { extra: "/9j/" + "A".repeat(200_000) }),
      ),
    );
  });

  it("refuses a photo over the size cap", async () => {
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "progress_photos", id("clientA")),
        photo("clientA", "front", { data: "/9j/" + "A".repeat(700_000) }),
      ),
    );
  });

  it("refuses a client still in the waiting room", async () => {
    await assertFails(
      setDoc(
        doc(
          authed("pendingC", "pendingC@example.com"),
          "progress_photos",
          id("pendingC"),
        ),
        photo("pendingC"),
      ),
    );
  });

  describe("reading", () => {
    beforeEach(() =>
      seed((db) =>
        setDoc(doc(db, "progress_photos", id("clientA")), photo("clientA")),
      ),
    );

    it("is allowed for the owner and the trainer", async () => {
      await assertSucceeds(
        getDoc(doc(clientDb("clientA"), "progress_photos", id("clientA"))),
      );
      await assertSucceeds(
        getDoc(doc(trainerDb(), "progress_photos", id("clientA"))),
      );
    });

    it("is refused for another client, even by query", async () => {
      await assertFails(
        getDoc(doc(clientDb("clientB"), "progress_photos", id("clientA"))),
      );
      await assertFails(
        getDocs(
          query(
            collection(clientDb("clientB"), "progress_photos"),
            where("userId", "==", "clientA"),
          ),
        ),
      );
    });

    it("works as a query for the owner's own date", async () => {
      await assertSucceeds(
        getDocs(
          query(
            collection(clientDb("clientA"), "progress_photos"),
            where("userId", "==", "clientA"),
            where("date", "==", date),
          ),
        ),
      );
    });

    it("lets the owner delete her photo, not another client", async () => {
      await assertFails(
        deleteDoc(doc(clientDb("clientB"), "progress_photos", id("clientA"))),
      );
      await assertSucceeds(
        deleteDoc(doc(clientDb("clientA"), "progress_photos", id("clientA"))),
      );
    });
  });

  it("lets a client read her own not-yet-existing photo cleanly", async () => {
    const snap = await getDoc(
      doc(clientDb("clientA"), "progress_photos", id("clientA", "back")),
    );
    expect(snap.exists()).toBe(false);
  });
});

describe("exercise logs", () => {
  const log = (uid, exerciseId = "35", over = {}) => ({
    userId: uid,
    exerciseId,
    exerciseName: "HIP THRUST šipka",
    lastSets: [40, 45, 45],
    history: [
      { weekStart: "2026-09-21", trainingNumber: 1, sets: [40, 45, 45] },
    ],
    ...over,
  });

  it("lets a client log her own weights", async () => {
    await assertSucceeds(
      setDoc(
        doc(clientDb("clientA"), "exercise_logs", "clientA_35"),
        log("clientA"),
      ),
    );
  });

  it("refuses a log under another client's id", async () => {
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "exercise_logs", "clientB_35"),
        log("clientB"),
      ),
    );
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "exercise_logs", "clientA_36"),
        log("clientA", "35"),
      ),
    );
  });

  it("refuses runaway sizes that would bloat the document", async () => {
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "exercise_logs", "clientA_35"),
        log("clientA", "35", { lastSets: Array(11).fill(20) }),
      ),
    );
    await assertFails(
      setDoc(
        doc(clientDb("clientA"), "exercise_logs", "clientA_35"),
        log("clientA", "35", { history: Array(21).fill({ sets: [1] }) }),
      ),
    );
  });

  it("accepts the full document the app writes, but no unknown fields", async () => {
    const full = log("clientA", "35", {
      lastWeekStart: "2026-09-21",
      lastTrainingNumber: 1,
      updatedAt: serverTimestamp(),
    });
    await assertSucceeds(
      setDoc(doc(clientDb("clientA"), "exercise_logs", "clientA_35"), full),
    );
    await assertFails(
      setDoc(doc(clientDb("clientA"), "exercise_logs", "clientA_35"), {
        ...full,
        notes: "x",
      }),
    );
  });

  it("is readable by the owner and the trainer, not by another client", async () => {
    await seed((db) =>
      setDoc(doc(db, "exercise_logs", "clientA_35"), log("clientA")),
    );
    await assertSucceeds(
      getDoc(doc(clientDb("clientA"), "exercise_logs", "clientA_35")),
    );
    await assertSucceeds(
      getDoc(doc(trainerDb(), "exercise_logs", "clientA_35")),
    );
    await assertFails(
      getDoc(doc(clientDb("clientB"), "exercise_logs", "clientA_35")),
    );
  });

  it("refuses a client in the waiting room", async () => {
    await assertFails(
      setDoc(
        doc(
          authed("pendingC", "pendingC@example.com"),
          "exercise_logs",
          "pendingC_35",
        ),
        log("pendingC"),
      ),
    );
  });

  // Regression: logging a set for an exercise for the first time reads its
  // (not yet existing) document before writing it — inside a transaction,
  // exactly as MyWorkoutsScreen does. A read rule written as
  // `isOwner(resource.data.userId)` looks right but crashes on a null
  // `resource`, which Firestore reports to the client as a bare permission
  // error with no indication it was actually a rule evaluation crash.
  it("lets a client read her own not-yet-existing log without the read rule crashing", async () => {
    const db = clientDb("clientA");
    const ref = doc(db, "exercise_logs", "clientA_99");

    await assertSucceeds(
      runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) {
          tx.set(ref, log("clientA", "99"));
        }
      }),
    );

    const saved = await getDoc(ref);
    expect(saved.exists()).toBe(true);
  });

  it("still refuses reading another client's not-yet-existing log the same way", async () => {
    const db = clientDb("clientB");
    const ref = doc(db, "exercise_logs", "clientA_99");
    await assertFails(runTransaction(db, (tx) => tx.get(ref)));
  });
});

describe("video catalogue", () => {
  beforeEach(() =>
    seed((db) =>
      setDoc(doc(db, "videos", "1"), {
        youtubeID: "abc123",
        title: "Dead bug",
        category: "Trbušni mišići",
        order: 0,
      }),
    ),
  );

  it("is readable by an approved client", async () => {
    await assertSucceeds(getDocs(collection(clientDb("clientA"), "videos")));
  });

  // The videos are the paid product; someone still in the waiting room has not
  // been approved to see them.
  it("is not readable by a client still in the waiting room", async () => {
    const db = authed("pendingC", "pendingC@example.com");
    await assertFails(getDoc(doc(db, "videos", "1")));
  });

  it("is writable only by the trainer", async () => {
    await assertFails(
      updateDoc(doc(clientDb("clientA"), "videos", "1"), { title: "hacked" }),
    );
    await assertSucceeds(
      updateDoc(doc(trainerDb(), "videos", "1"), { title: "Dead bug (legs)" }),
    );
  });

  it("lets the trainer add and remove a video", async () => {
    const db = trainerDb();
    await assertSucceeds(
      setDoc(doc(db, "videos", "99"), {
        youtubeID: "xyz789",
        title: "Novi",
        category: "Noge",
        order: 99,
      }),
    );
    await assertSucceeds(deleteDoc(doc(db, "videos", "99")));
  });
});

describe("default deny", () => {
  it("refuses a collection the rules do not mention", async () => {
    const db = clientDb("clientA");
    await assertFails(getDoc(doc(db, "secrets", "x")));
    await assertFails(setDoc(doc(db, "secrets", "x"), { a: 1 }));
    await assertFails(setDoc(doc(trainerDb(), "secrets", "x"), { a: 1 }));
  });
});
