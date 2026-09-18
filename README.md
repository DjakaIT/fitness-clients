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
npm test                 # everything
npm run test:coverage    # with coverage + thresholds
npm run test:watch
```

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

Deploy rules after any change:

```bash
firebase deploy --only firestore:rules
```

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
