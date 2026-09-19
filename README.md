# Marta Fitness

A React Native (Expo) app for a personal trainer and her clients. Clients book
in-person sessions, follow weekly programs, log impressions and track
measurements; the trainer manages approvals, availability, programs and the
week's schedule.

## Stack

| Layer      | Choice                                               |
| ---------- | ---------------------------------------------------- |
| App        | Expo SDK 54, React Native 0.81, React 19             |
| Navigation | React Navigation 7 (native stack + bottom tabs)      |
| Backend    | Firebase Auth (Google sign-in) + Cloud Firestore     |
| Validation | Zod                                                  |
| Tests      | Jest + `jest-expo` + `@testing-library/react-native` |

## Getting started

```bash
npm install
cp .env.example .env     # then fill in the values
npm start                # Expo dev server
npm run android          # native build on a connected device
```

`.env` is never committed. Every key is prefixed `EXPO_PUBLIC_` because it is
bundled into the app — these are _client_ identifiers, not secrets. The only
thing protecting your data is `firestore.rules`.

## Tests

```bash
npm test                 # app suite
npm run test:coverage    # with coverage + thresholds
npm run test:watch
npm run rules:test       # security rules, against the Firestore emulator
```

The rules suite needs Java on PATH (the emulator is a JVM process); Android
Studio's bundled JDK is enough. It runs in plain Node under
`jest.rules.config.js`, separate from the app suite, which runs under
`jest-expo` with Firebase mocked.

Coverage thresholds are tiered (see `jest.config.js`): the booking domain in
`backend/` is held at 95–100%, the hook layer lower, because that layer is
mostly Firestore plumbing where a high bar buys mock-shaped tests rather than
confidence.

`__tests__/moduleGraph.test.js` loads every module in `src/` and `backend/`. It
is the cheapest guard against a rename that leaves a dangling import behind —
it fails on the exact file instead of crashing on a device.

## Architecture

```
backend/
  config/tenant.js          ← branding + booking policy (see "Re-branding")
  config/firebase.js        ← SDK init from env
  services/                 ← Firestore transaction bodies (injected tx, no SDK import)
  utils/                    ← pure domain: calendar maths, booking rules, schemas
src/
  context/                  ← auth session, theme
  hooks/                    ← data access, one concern each
  components/ pages/ styles/ navigation/
firestore.rules             ← the enforced access-control policy
```

The rule of thumb: **anything that decides whether something is allowed lives in
`backend/`, is pure, and is unit-tested.** Screens render; they do not decide.

## How booking works

The booking week is always _next_ week, Monday–Friday, so the trainer has the
current week to plan against. A client picks 2–4 slots, one per day.

Three things make this safe:

1. **One document per slot**, with the id pinned to `"<date>_<time>"`. Two
   clients racing for the same minute contend for the _same document key_, so
   Firestore serialises them and only one create wins. A random document id
   would let both succeed.
2. **One transaction per submission.** Slots the client is keeping are diffed
   out and never touched; only genuine additions and removals are written, and
   a conflict on any slot aborts the whole write. The previous flow cancelled
   every booking then re-created them, which briefly released unchanged slots
   into a window where anyone could take them.
3. **Three layers of the same rule.** The screen greys out what is unavailable,
   `validateSelection` re-checks the whole week at submit time against live
   data, and `firestore.rules` rejects anything that reaches the database
   anyway. A client that skips the UI entirely still cannot book an illegal
   slot.

Cancelling sets `status: "cancelled"` rather than deleting, so the slot's
history survives and the document id is not burned — a released slot can be
claimed again by anyone.

### One-time migration

Appointments created before the slot-keyed scheme have random document ids.
They are still readable and still cancellable, but a slot held by such a
document can be booked a second time, because the new write targets
`"<date>_<time>"` and would not collide with it.

`scripts/migrate-appointments.mjs` rewrites them onto their slot ids. **No
booking is cancelled** — every client keeps the sessions they already have, and
the script drops the `userName` / `userPhoto` fields that should never have been
on the document. It is dry run by default and safe to re-run.

```bash
# Firebase console → Project settings → Service accounts → Generate new private key
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json

npm run migrate:appointments              # show the plan, write nothing
npm run migrate:appointments -- --apply   # execute it
```

Two clients can turn out to hold the same slot — only possible because the old
code allowed it. The script reports those and changes nothing, because either
choice takes a session away from someone; decide who keeps it, remove the other
booking, and re-run. Everything else is resolved automatically: a client booked
twice for one slot is de-duplicated, and a released slot is re-claimed.

## Security model

There is exactly one privileged role: the trainer. Everything else is a client
who can see only their own data.

- **Identity.** The trainer is identified by a verified e-mail in
  `trainerEmails()` inside `firestore.rules`. The app mirrors that list via
  `EXPO_PUBLIC_ADMIN_EMAIL`, but the client-side copy only chooses which screens
  to render — it grants nothing.
- **`role` and `status` are not client-writable.** A client's own update is
  rejected if it changes either field, so nobody can self-approve out of the
  waiting room or promote themselves to admin. `AuthContext` never re-writes
  them on login for the same reason.
- **Appointments carry no personal data.** They store an opaque `userId` and
  nothing else; the trainer joins against `users` for names. Clients need to
  read the week to see what is free, and this keeps that read from exposing who
  booked what.
- **Private collections stay private.** Weekly reviews and measurements are
  readable by their owner and the trainer only.
- **Default deny.** Any path not matched explicitly is denied.

### Cancellation deadline

A client may cancel up to 24h before the session starts; after that only the
trainer can. That rule is enforced in three places: the sheet greys the button
out, `cancelAppointmentInTransaction` re-checks it against the stored document,
and `firestore.rules` refuses the write outright.

The rules copy rebuilds the slot start from its two string fields with
`timestamp.date()`, which is UTC while the app books in local time. For a
UTC+1/+2 trainer that lands 1–2h _after_ the true start, making the rule
slightly looser than 24h — never tighter, so it can never wrongly refuse a
legitimate cancellation. The exact deadline is the app's; the rule is the
backstop against a tampered client.

### Working on the rules

```bash
npm run rules:test     # 34 tests against the Firestore emulator (needs Java)
npm run rules:diff     # show the LIVE rules and what they cover vs. this file
npm run rules:deploy   # firebase deploy --only firestore:rules
```

`rules:test` is the one to run first — it asserts every claim on this page
against the real rules engine, locally, without touching production.

**Before the first deploy, run `npm run rules:diff`.** Deploying replaces the
live ruleset wholesale, so a collection the console protects but this file does
not mention would start falling to the default-deny catch-all. The diff lists
exactly that. `firebase.json` deliberately declares only `rules`, never
`indexes`, so a deploy can never touch your Firestore indexes.

## Re-branding for another trainer

The app is built so a new deployment is configuration, not a rewrite.

1. **`backend/config/tenant.js`** — `BRAND` (app name, trainer name) and
   `BOOKING_POLICY` (session length, day bounds, grid, min/max sessions per
   week, cancellation cutoff, working days). Every downstream calculation and
   every piece of UI copy derives from these; changing a session to 45 minutes
   or the day to 07:00–21:00 is a one-line edit.
2. **`.env`** — a fresh Firebase project's keys, plus `EXPO_PUBLIC_ADMIN_EMAIL`
   (comma-separated if a studio has co-trainers).
3. **`firestore.rules`** — mirror the same e-mails in `trainerEmails()` and
   redeploy. This is the list that is actually enforced.
4. **`app.json` / `app.config.js`** — app name, bundle id, icons.
5. **`src/styles/clientTheme.js`** — accent colour and surfaces. Light and dark
   share identical keys, so no screen needs a conditional.

Run `npm test` afterwards: `__tests__/tenant.test.js` asserts the policy stays
internally consistent (session fits the day, minimum ≤ maximum ≤ working days,
the trainer's block window covers the client day).

## Design system

Motion comes from `src/styles/motion.js`, which converts Apple's two
designer-facing spring parameters — damping ratio and response — into React
Native's stiffness/damping/mass. Defaults are critically damped, so nothing
overshoots unless a gesture or a success moment earns it. Press feedback fires
on press-_down_, never on release. `useReducedMotion` swaps movement for a
cross-fade when the OS asks for it.

Type tokens live in `clientTheme.js` with size-specific tracking: display sizes
get negative letter-spacing, body sits at zero, small all-caps labels open up. A
single global letter-spacing value is always wrong somewhere.
