type AuthEventName =
  | 'forgot_password_submitted'
  | 'reset_password_success'
  | 'invitation_token_validated'
  | 'invitation_activation_success';

type AuthEventPayload = Record<string, string | number | boolean | null | undefined>;

// Replace with analytics provider integration if/when tracking is introduced.
export function trackAuthEvent(_name: AuthEventName, _payload?: AuthEventPayload): void {
  // Intentionally no-op to avoid leaking sensitive data and keep callsites centralized.
}

