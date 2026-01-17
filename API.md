# Chat App API Documentation

## Overview

This is a RESTful API for a real-time chat application built with Node.js, Express, TypeScript, and MongoDB. The API provides endpoints for user authentication, messaging, and contact management.

**Version:** v1
**Base URL:** `http://localhost:{PORT}/api/v1` (PORT configured in `.env`)

## Table of Contents

- [Authentication](#authentication)
- [Security & Rate Limiting](#security--rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Authentication Routes](#authentication-routes)
  - [Message Routes](#message-routes)
- [Data Models](#data-models)

---

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication. Tokens are stored in HTTP-only cookies for security.

### Authentication Flow

1. **Register** or **Login** to receive a JWT token
2. Token is automatically stored in an HTTP-only cookie named `auth_token`
3. Token expires after **10 minutes**
4. Protected endpoints automatically validate the token via middleware
5. **Logout** clears the authentication cookie

### Protected Routes

Protected routes require a valid JWT token in the `auth_token` cookie. If authentication fails, the API returns:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Security & Rate Limiting

The API uses **Arcjet** for security protection:

- **Rate Limiting:** 3 requests per 10 seconds per client
- **Bot Detection:** Automated bot traffic is blocked
- **Shield Protection:** SQL injection and other attack vectors are filtered
- **Allowlist:** Postman and search engines are allowed

All endpoints are protected by these security measures.

---

## Error Handling

All responses follow a consistent structure:

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Resource created
- `400` - Bad request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Resource not found
- `409` - Conflict (e.g., user already exists)
- `500` - Internal server error

---

## Endpoints

### Health Check

#### `GET /api/v1/health`

Check if the API is running.

**Authentication:** Not required

**Response:**

```json
{
  "status": "ok"
}
```

---

### Authentication Routes

All authentication routes are prefixed with `/api/v1/auth`.

---

#### `POST /api/v1/auth/register`

Register a new user account.

**Authentication:** Not required

**Request Body:**

```json
{
  "username": "string (3-30 characters)",
  "email": "string (valid email format)",
  "password": "string (minimum 6 characters recommended)"
}
```

**Validation:**
- Username: 3-30 characters
- Email: Valid email format (lowercase, trimmed)
- Password: Will be hashed with bcrypt before storage

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**Error Responses:**

- **400** - Missing or invalid fields
  ```json
  {
    "success": false,
    "message": "username, email, and password are required"
  }
  ```

- **409** - User already exists
  ```json
  {
    "success": false,
    "message": "User with this email already exists"
  }
  ```

**Side Effects:**
- Sends a welcome email to the registered email address (non-blocking)
- Email failure does not affect registration success

---

#### `POST /api/v1/auth/login`

Authenticate a user and receive a JWT token.

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

**Cookie Set:**
- Name: `auth_token`
- Type: HTTP-only
- Secure: true (in production)
- SameSite: strict
- Max Age: 10 minutes (600000ms)

**Error Responses:**

- **400** - Missing fields
  ```json
  {
    "success": false,
    "message": "email and password are required"
  }
  ```

- **401** - Invalid credentials
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

**Security Note:** The same error message is returned for both invalid email and invalid password to prevent user enumeration attacks.

---

#### `POST /api/v1/auth/logout`

Logout the current user and clear the authentication token.

**Authentication:** Required

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Side Effects:**
- Clears the `auth_token` cookie

**Note:** This endpoint always returns success, even if an error occurs, to ensure the client can proceed with logout flow.

---

#### `GET /api/v1/auth/me`

Get the currently authenticated user's profile.

**Authentication:** Required

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  }
}
```

**Error Responses:**

- **401** - Not authenticated
- **404** - User not found (token valid but user deleted)

---

#### `PUT /api/v1/auth/update-user`

Update the authenticated user's username and/or password.

**Authentication:** Required

**Request Body:**

```json
{
  "username": "string (optional, 3-30 characters)",
  "password": "string (optional)"
}
```

**Validation:**
- At least one field (username or password) must be provided
- Username will be trimmed
- Password will be hashed before storage

**Success Response (200) - Username Updated:**

```json
{
  "success": true,
  "message": "User updated successfully"
}
```

**Success Response (200) - Password Updated:**

```json
{
  "success": true,
  "message": "Password updated. Please login again."
}
```

**Side Effects:**
- If password is updated, the `auth_token` cookie is cleared (session invalidated)
- User must login again after password change

**Error Responses:**

- **400** - No fields provided or invalid types
  ```json
  {
    "success": false,
    "message": "At least one field must be updated"
  }
  ```

- **401** - Not authenticated
- **404** - User not found

---

### Message Routes

All message routes are prefixed with `/api/v1/messages` and require authentication.

---

#### `GET /api/v1/messages/all-contacts`

Get all users except the current authenticated user (potential chat contacts).

**Authentication:** Required

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string (ObjectId)",
      "username": "string"
    }
  ]
}
```

**Note:**
- Results are sorted by creation date (newest first)
- Email and password fields are excluded from the response
- Returns all users except the authenticated user

**Error Responses:**

- **401** - Not authenticated
- **400** - Invalid user identifier

---

#### `GET /api/v1/messages/chat-contacts`

Get only users with whom the authenticated user has exchanged messages.

**Authentication:** Required

**Request Body:** None

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string (ObjectId)",
      "username": "string"
    }
  ]
}
```

**Note:**
- Returns an empty array if no conversations exist
- Results are sorted by creation date (newest first)
- Uses aggregation to find unique chat partners

**Error Responses:**

- **401** - Not authenticated
- **400** - Invalid user identifier

---

#### `GET /api/v1/messages/:id`

Get all messages between the authenticated user and another user.

**Authentication:** Required

**URL Parameters:**
- `id` - The other user's ID (ObjectId format)

**Example:**
```
GET /api/v1/messages/507f1f77bcf86cd799439011
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string (ObjectId)",
      "senderId": "string (ObjectId)",
      "receiverId": "string (ObjectId)",
      "text": "string (optional)",
      "image": "string (optional, URL)",
      "createdAt": "ISO 8601 date string",
      "updatedAt": "ISO 8601 date string"
    }
  ]
}
```

**Note:**
- Messages are sorted chronologically (oldest first)
- Returns messages in both directions (sent and received)
- Returns an empty array if no messages exist

**Error Responses:**

- **400** - Missing or invalid user ID
  ```json
  {
    "success": false,
    "message": "User ID is required"
  }
  ```
  or
  ```json
  {
    "success": false,
    "message": "Invalid user identifier"
  }
  ```

- **401** - Not authenticated

---

#### `POST /api/v1/messages/send/:id`

Send a message to another user.

**Authentication:** Required

**URL Parameters:**
- `id` - The receiver's user ID (ObjectId format)

**Request Body:**

```json
{
  "text": "string (optional, max 2000 characters)",
  "image": "string (optional, image URL)"
}
```

**Validation:**
- At least one of `text` or `image` must be provided
- Text cannot exceed 2000 characters
- Receiver must exist in the database

**Example Requests:**

Text only:
```json
{
  "text": "Hello there!"
}
```

Image only:
```json
{
  "image": "https://example.com/image.jpg"
}
```

Both:
```json
{
  "text": "Check this out",
  "image": "https://example.com/image.jpg"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "string (ObjectId)",
    "senderId": "string (ObjectId)",
    "receiverId": "string (ObjectId)",
    "text": "string (optional)",
    "image": "string (optional)",
    "createdAt": "ISO 8601 date string",
    "updatedAt": "ISO 8601 date string"
  }
}
```

**Error Responses:**

- **400** - Missing content
  ```json
  {
    "success": false,
    "message": "Message must contain either text or an image"
  }
  ```

- **400** - Missing or invalid receiver ID
  ```json
  {
    "success": false,
    "message": "Receiver ID is required"
  }
  ```
  or
  ```json
  {
    "success": false,
    "message": "Invalid receiver identifier"
  }
  ```

- **401** - Not authenticated

- **404** - Receiver not found
  ```json
  {
    "success": false,
    "message": "Receiver not found"
  }
  ```

---

## Data Models

### User Model

```typescript
{
  _id: ObjectId,
  username: string,      // 3-30 characters, trimmed, indexed
  email: string,         // Unique, lowercase, trimmed, validated, indexed
  password: string,      // Bcrypt hashed (60 characters), excluded by default
  createdAt: Date        // Immutable, auto-generated
}
```

**Constraints:**
- Email must match regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Password must be hashed (60+ characters) before saving
- Username: 3-30 characters

---

### Message Model

```typescript
{
  _id: ObjectId,
  senderId: ObjectId,    // Reference to users, required, indexed
  receiverId: ObjectId,  // Reference to users, required, indexed
  text: string,          // Optional, max 2000 characters, trimmed
  image: string,         // Optional, trimmed (URL)
  createdAt: Date,       // Auto-generated
  updatedAt: Date        // Auto-updated
}
```

**Constraints:**
- At least one of `text` or `image` must be present
- Text cannot exceed 2000 characters

---

## Environment Variables

Required environment variables for the backend (see `backend/.env.sample`):

```bash
MONGODB_URI=<MongoDB connection string>
MONGODB_DB_NAME=<Database name>
NODE_ENV=development|staging|production
PORT=<Server port>
RESEND_API_KEY=<Email service API key>
RESEND_FROM_EMAIL=<Sender email address>
JWT_SECRET=<JWT signing secret>
ARCJET_KEY=<Arcjet security service key>
ARCJET_ENV=<Arcjet environment>
VERIFICATION_CODE_TTL_MINUTES=<Email verification code TTL>
```

---

## Best Practices

### Security

1. **Never log sensitive data** - Passwords are never logged, only user IDs
2. **HTTP-only cookies** - Tokens stored in HTTP-only cookies prevent XSS attacks
3. **Password hashing** - All passwords are hashed with bcrypt before storage
4. **User enumeration prevention** - Same error message for invalid email/password
5. **Rate limiting** - 3 requests per 10 seconds prevents abuse

### Error Handling

1. All errors are logged with structured context (requestId, userId, etc.)
2. User-facing errors never expose internal details
3. Consistent error response format across all endpoints

### Performance

1. Database queries use `.lean()` for better performance when mutations aren't needed
2. Indexed fields: email, username, senderId, receiverId
3. Atomic updates with `findByIdAndUpdate` where appropriate

---

## Example Usage

### Complete Authentication Flow

```bash
# 1. Register a new user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'

# 2. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'

# 3. Get current user (using saved cookie)
curl -X GET http://localhost:3000/api/v1/auth/me \
  -b cookies.txt

# 4. Get all contacts
curl -X GET http://localhost:3000/api/v1/messages/all-contacts \
  -b cookies.txt

# 5. Send a message
curl -X POST http://localhost:3000/api/v1/messages/send/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "text": "Hello from the API!"
  }'

# 6. Get messages with a user
curl -X GET http://localhost:3000/api/v1/messages/507f1f77bcf86cd799439011 \
  -b cookies.txt

# 7. Logout
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -b cookies.txt
```

---

## Support

For issues or questions about this API, please refer to the project repository or contact the development team.

---

**Last Updated:** January 2026
**API Version:** v1
