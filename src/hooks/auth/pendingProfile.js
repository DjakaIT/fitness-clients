/**
 * Hands Apple's one-time name from the sign-in hook to AuthContext.
 *
 * Apple sends the user's name only on the first authorization, as part of the
 * sign-in result — not inside the Firebase credential. AuthContext, which
 * creates the users/{uid} document, runs from onAuthStateChanged, which fires
 * during signInWithCredential. So the name is stashed here *before* signing
 * in and taken by AuthContext when the auth state arrives; there is no window
 * in which the profile document gets written without it.
 */

let pendingDisplayName = null;

export function setPendingDisplayName(name) {
  pendingDisplayName = typeof name === "string" && name.trim() ? name : null;
}

/** Returns the stashed name once, then forgets it. */
export function takePendingDisplayName() {
  const name = pendingDisplayName;
  pendingDisplayName = null;
  return name;
}

export function clearPendingDisplayName() {
  pendingDisplayName = null;
}
