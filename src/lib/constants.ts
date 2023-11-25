export enum ErrorMessages {
  INVALID_OTP = "OTP code must be 6 characters long",
  VERIFICATION_NOT_FOUND = "Invalid verification code.",
  VERIFICATION_EXPIRED = "Verification code expired.",
  REGISTATION_EXPIRED = "Registration process expired.",
  USER_ALREADY_EXISTS = "User already exists, please login",
  INVALID_LOGIN = "Invalid username or password",
  INVALID_EMAIL = "Invalid email",
  INVALID_USERNAME = "Username must be at least 5 characters long",
  INVALID_PASSWORD_LENGTH = "Password must be at least 8 characters long",
  INVALID_PASSWORD = "Password is invalid",
  INVALID_CONFIRM_PASSWORD = "Passwords do not match",
  INVALID_NAME = "Invalid name",
  DEFAULT = "Something went wrong",
}

export enum CookiesKeys {
  SESSION = "session",
  EMAIL_VERIFICATION = "email_verification",
  CONTINUE_REGISTRATION = "continue_registration",
}
