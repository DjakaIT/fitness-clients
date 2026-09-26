/**
 * Sign in with Apple — the parts that are pure logic.
 *
 * Two Apple behaviours shape everything here:
 *  - Apple sends the user's name exactly once, on the very first
 *    authorization, and never a photo. Miss it and the account has no name
 *    for good; Firebase itself leaves displayName null.
 *  - The user may choose "Hide My Email", in which case the address Apple
 *    shares is a private relay (…@privaterelay.appleid.com), not her real one.
 */

const MAX_NAME_LENGTH = 80;

/** Apple's fullName object → "Ime Prezime", or null when Apple sent nothing. */
export function formatAppleFullName(fullName) {
  if (!fullName || typeof fullName !== "object") return null;
  const name = [fullName.givenName, fullName.familyName]
    .filter((part) => typeof part === "string" && part.trim())
    .map((part) => part.trim())
    .join(" ")
    .slice(0, MAX_NAME_LENGTH)
    .trim();
  return name || null;
}

export function isPrivateRelayEmail(email) {
  return (
    typeof email === "string" &&
    email.trim().toLowerCase().endsWith("@privaterelay.appleid.com")
  );
}

/**
 * Error codes the person can do something about, mapped to what to do.
 * Firebase and expo-apple-authentication both report through `error.code`.
 */
const MESSAGES = {
  // Firebase is set to one account per e-mail address. The same person who
  // first signed up with Google gets this when she tries Apple with the same
  // address — her data lives on the Google account, so that is the way in.
  "auth/account-exists-with-different-credential":
    "Ovaj e-mail je već registriran preko Google prijave. Prijavi se s Googleom.",
  "auth/operation-not-allowed": "Prijava s Appleom trenutno nije dostupna.",
  "auth/network-request-failed": "Nema veze s internetom. Pokušaj ponovo.",
  ERR_REQUEST_NOT_HANDLED: "Prijava s Appleom trenutno nije dostupna.",
};

const GENERIC_MESSAGE = "Prijava nije uspjela. Pokušaj ponovo.";

/** The user closed Apple's sheet — a choice, not an error. */
export function isAppleCancellation(error) {
  return error?.code === "ERR_REQUEST_CANCELED";
}

export function appleSignInErrorMessage(code) {
  return MESSAGES[code] ?? GENERIC_MESSAGE;
}
