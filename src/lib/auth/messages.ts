import type { AuthError } from "@supabase/supabase-js";

/** Plain B1 English for the errors a user can fix. */
export function authErrorMessage(error: AuthError | null | undefined, fallback = "Something went wrong. Try again."): string {
  if (!error) return fallback;
  switch (error.code) {
    case "invalid_credentials":
    case "email_not_confirmed":
      return "That email or password is not right. Try again.";
    case "otp_expired":
    case "otp_disabled":
      return "That code is not right or has expired. Ask for a new one.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
    case "over_sms_send_rate_limit":
      return "Too many tries. Wait a minute, then try again.";
    case "weak_password":
      return "Choose a longer password. Use at least 8 characters.";
    case "same_password":
      return "That is your old password. Choose a new one.";
    case "mfa_verification_failed":
    case "mfa_challenge_expired":
      return "That 2-step code is not right. Try the next code from your app.";
    case "session_not_found":
    case "refresh_token_not_found":
      return "Your session ended. Log in again.";
    case "user_not_found":
    case "signup_disabled":
      return "We do not know that email. New clients get an invite from Secuabase.";
    default:
      if (error.message?.toLowerCase().includes("signups not allowed")) {
        return "We do not know that email. New clients get an invite from Secuabase.";
      }
      return fallback;
  }
}
