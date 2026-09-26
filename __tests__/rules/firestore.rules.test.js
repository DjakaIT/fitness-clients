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
