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
} = require("firebase/firestore");

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

  it("lets a client pick a valid training type, but not an invented one", async () => {
    const db = clientDb("clientA");
    await assertSucceeds(
      updateDoc(doc(db, "users", "clientA"), { trainingType: "online" }),
    );
    await assertFails(
      updateDoc(doc(db, "users", "clientA"), { trainingType: "vip" }),
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

  // An unverified address could be an unowned one.
  it("does not treat an unverified trainer e-mail as the trainer", async () => {
    const db = authed("imposter", TRAINER_EMAIL, false);
    await assertFails(getDocs(collection(db, "users")));
  });
});

describe("appointments — booking", () => {
  const date = futureDate();

  it("lets an active client book a free slot under its slot id", async () => {
    const db = clientDb("clientA");
    await assertSucceeds(
      setDoc(doc(db, "appointments", slotId(date, "09:00")), {
        userId: "clientA",
        appointmentDate: date,
        time: "09:00",
        status: "active",
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

  it("stops a second client overwriting an active booking", async () => {
    await seed((db) =>
      setDoc(doc(db, "appointments", slotId(date, "09:00")), {
        userId: "clientA",
        appointmentDate: date,
        time: "09:00",
        status: "active",
      }),
    );

    const db = clientDb("clientB");
    await assertFails(
      setDoc(doc(db, "appointments", slotId(date, "09:00")), {
        userId: "clientB",
        appointmentDate: date,
        time: "09:00",
        status: "active",
      }),
    );
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

    const db = clientDb("clientB");
    await assertSucceeds(
      setDoc(doc(db, "appointments", slotId(date, "09:00")), {
        userId: "clientB",
        appointmentDate: date,
        time: "09:00",
        status: "active",
      }),
    );
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

  it("refuses a client writing measurements at all — the trainer records them", async () => {
    await assertFails(
      updateDoc(
        doc(clientDb("clientA"), "measurements", "clientA_2025-03-17"),
        {
          weight: "50",
        },
      ),
    );
    await assertSucceeds(
      updateDoc(doc(trainerDb(), "measurements", "clientA_2025-03-17"), {
        weight: "61",
      }),
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

  it("lets a client write a review only under their own id", async () => {
    const db = clientDb("clientA");
    await assertSucceeds(
      setDoc(doc(db, "weekly_review", "new1"), {
        userId: "clientA",
        reflection: "ok",
      }),
    );
    await assertFails(
      setDoc(doc(db, "weekly_review", "new2"), {
        userId: "clientB",
        reflection: "spoof",
      }),
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
