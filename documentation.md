DEVELOPER API DOCUMENTATION — spring-world
===================   OVERVIEW  ====================

Base URL (local): `http://localhost:4000`

All JSON requests must send `Content-Type: application/json`.

Most endpoints require this header:
Authorization: Bearer <access_token>

Get an access token from `POST /auth/login`. Endpoints marked `Public` do not
require authentication. Endpoints marked `Admin` require a valid token AND
the logged-in user's role must be `admin`.


===================   AUTHENTICATION  ====================

=======> Login
METHOD: POST
URL: /auth/login
ACCESS: Public
DESCRIPTION: Validates an email and password and returns a JWT access token.
Token expiry is controlled by JWT_EXPIRES_IN (defaults to 1 hour).
JSON: {
  "email": "admin@example.com",
  "password": "your-password"
}
RESPONSE: {
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
ERROR (401): {
  "message": "Invalid credentials",
  "statusCode": 401
}


=======> Request password-reset OTP
METHOD: POST
URL: /auth/forgot-password
ACCESS: Public
DESCRIPTION: Generates a 6-digit OTP, saves it against the user with a
10-minute expiry, and emails it to the user via SMTP. If email delivery
fails, the request still succeeds (the OTP is already saved) — the
failure is only logged server-side.
JSON: {
  "email": "admin@example.com"
}
RESPONSE: {
  "message": "OTP sent to your email"
}
ERROR (401): {
  "message": "User not found",
  "statusCode": 401
}


=======> Verify OTP
METHOD: POST
URL: /auth/verify-otp
ACCESS: Public
DESCRIPTION: Verifies the OTP against the stored value and expiry. On
success, the OTP is cleared from the user record so it cannot be reused.
JSON: {
  "email": "admin@example.com",
  "otp": "123456"
}
RESPONSE: {
  "message": "OTP verified successfully"
}
ERROR (401): {
  "message": "Invalid OTP",
  "statusCode": 401
}
(also returns 401 "OTP expired" if more than 10 minutes have passed)


=======> Reset password
METHOD: POST
URL: /auth/reset-password
ACCESS: Public
DESCRIPTION: Sets a new password for the given email. The new password is
hashed with bcrypt before saving. There is currently no dependency on OTP
verification having just happened in the same request chain — reset works
as long as the email exists.
JSON: {
  "email": "admin@example.com",
  "newPassword": "new-secure-password"
}
RESPONSE: {
  "message": "Password reset successfully"
}
ERROR (401): {
  "message": "User not found",
  "statusCode": 401
}


===================   USERS  ====================

Base path: `/users`

=======> Create user (signup)
METHOD: POST
URL: /users
ACCESS: Public
DESCRIPTION: Creates a new user. Password is hashed with bcrypt before
saving. `role` cannot be set here — every new signup is created with
role "user" regardless of what is sent; role can only be changed via the
admin-only PATCH /users/:id/role endpoint below.
JSON: {
  "email": "abdul@example.com",
  "name": "Abdul",
  "password": "secure-password"
}
RESPONSE: {
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "abdul@example.com",
  "name": "Abdul",
  "role": "user",
  "createdAt": "2026-08-17T09:08:30.342Z",
  "updatedAt": "2026-08-17T09:08:30.342Z"
}
Note: password, otp, and otpExpiry are never included in any response.


=======> Get all users
METHOD: GET
URL: /users
ACCESS: Authenticated (any logged-in user)
DESCRIPTION: Returns every user record.
RESPONSE: [
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "test@example.com",
    "name": "Test",
    "role": "user",
    "createdAt": "2026-08-17T09:08:30.342Z",
    "updatedAt": "2026-08-17T09:08:30.342Z"
  }
]
ERROR (401, no/invalid token): {
  "message": "Unauthorized",
  "statusCode": 401
}


=======> Get one user
METHOD: GET
URL: /users/:id
ACCESS: Authenticated (any logged-in user)
DESCRIPTION: Returns one user by id, or a 404 if no user matches.
RESPONSE: {
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "frank@example.com",
  "name": "Frank",
  "role": "user",
  "createdAt": "2026-08-17T09:08:30.342Z",
  "updatedAt": "2026-08-17T09:08:30.342Z"
}
ERROR (404): {
  "message": "User with ID 3fa85f64-5717-4562-b3fc-2c963f66afa6 not found",
  "statusCode": 404
}


=======> Update user
METHOD: PATCH
URL: /users/:id
ACCESS: Authenticated (any logged-in user)
DESCRIPTION: Updates any supplied fields (name, email, password). A
supplied password is hashed before saving. role cannot be changed through
this endpoint — use PATCH /users/:id/role instead.
JSON: {
  "name": "Felix Updated"
}
RESPONSE: {
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "frank@example.com",
  "name": "Frank Updated",
  "role": "user",
  "createdAt": "2026-08-17T09:08:30.342Z",
  "updatedAt": "2026-08-17T10:00:00.000Z"
}


=======> Update user role
METHOD: PATCH
URL: /users/:id/role
ACCESS: Admin
DESCRIPTION: Promotes or demotes a user. Only accessible to users whose
own role is "admin" — a non-admin token (even the target user's own
token) receives 403 Forbidden. This is the only way a user's role can
change.
JSON: {
  "role": "admin"
}
RESPONSE: {
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "abdul@example.com",
  "name": "Abdul",
  "role": "admin",
  "createdAt": "2026-08-17T09:08:30.342Z",
  "updatedAt": "2026-08-17T10:05:00.000Z"
}
ERROR (403, non-admin token): {
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}


=======> Delete user
METHOD: DELETE
URL: /users/:id
ACCESS: Admin
DESCRIPTION: Deletes the user record. Only accessible to admins.
RESPONSE: (204 No Content on success)
ERROR (403, non-admin token): {
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}
ERROR (404): {
  "message": "User with ID 3fa85f64-5717-4562-b3fc-2c963f66afa6 not found",
  "statusCode": 404
}


===================   AUTHORIZATION MODEL  ====================

Every request to a protected route goes through two checks in order:

1. JwtAuthGuard — is there a valid, non-expired bearer token? If not: 401.
2. RolesGuard (only on routes marked Admin above) — does the logged-in
   user's role match what the route requires? If not: 403.

Role is looked up fresh from the database on every request (via
JwtStrategy), not baked into the token — so a role change takes effect
on the user's very next request, without needing to log in again.


===================   ENVIRONMENT VARIABLES  ====================

These are required for the backend to run. Ask the backend team for real
values — do not commit an actual `.env` file to the repo.

```env
# App
NODE_ENV=development
PORT=4000

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admn
DB_PASSWORD=Strong005
DB_NAME=ws_db

# TypeORM
DB_SYNCHRONIZE=true
DB_LOGGING=true

# JWT / Auth
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=1h

# Mail (Gmail SMTP example — requires a Google App Password, not the
# account's normal password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_real_gmail_address@gmail.com
EMAIL_PASSWORD=your_16_char_app_password_no_spaces
EMAIL_FROM=your_real_gmail_address@gmail.com

# CORS
CORS_ORIGIN=http://localhost:3000
```


===================   NOTES FOR FRONTEND  ====================

- Store the access_token securely (not in localStorage if avoidable) and
  attach it as `Authorization: Bearer <token>` on every request to a
  protected route.
- `id` is a UUID string, not a number.
- `createdAt`/`updatedAt` are ISO 8601 timestamps.
- `password`, `otp`, and `otpExpiry` are never returned in any response —
  do not expect them, and do not build UI around them being present.
- There is no refresh-token flow yet. When the access token expires
  (JWT_EXPIRES_IN, default 1h), the user must log in again.
- There is no pagination on GET /users yet — it returns the full list.
- New signups always get role "user". There is currently no public
  self-service way to become an admin — an existing admin must promote
  the account via PATCH /users/:id/role.