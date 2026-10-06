/** The person closed the provider's sheet — a choice, never an error to show. */
export class SignInCancelledError extends Error {
  constructor() {
    super("Sign-in was cancelled.");
    this.name = "SignInCancelledError";
    this.code = "cancelled";
  }
}
