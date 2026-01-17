# API Quick Reference - Frontend Development

Base URL: `http://localhost:{PORT}/api/v1`

## Authentication

JWT stored in HTTP-only cookie `auth_token` (10 min expiry)

---

## Routes

### Health Check

```
GET /api/v1/health
Auth: No
```

**Response:**

```json
{ "status": "ok" }
```

---

## Authentication Routes

### Register

```
POST /api/v1/auth/register
Auth: No
```

**Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

### Login

```
POST /api/v1/auth/login
Auth: No
```

**Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**

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

---

### Logout

```
POST /api/v1/auth/logout
Auth: Yes
```

**Body:** None

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get Current User

```
GET /api/v1/auth/me
Auth: Yes
```

**Body:** None

**Response (200):**

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

---

### Update User

```
PUT /api/v1/auth/update-user
Auth: Yes
```

**Body:**

```json
{
  "username": "string (optional)",
  "password": "string (optional)"
}
```

**Response (200) - Username Updated:**

```json
{
  "success": true,
  "message": "User updated successfully"
}
```

**Response (200) - Password Updated:**

```json
{
  "success": true,
  "message": "Password updated. Please login again."
}
```

Note: If password updated, cookie is cleared

---

## Message Routes

### Get All Contacts

```
GET /api/v1/messages/all-contacts
Auth: Yes
```

**Body:** None

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "username": "string"
    }
  ]
}
```

---

### Get Chat Contacts

```
GET /api/v1/messages/chat-contacts
Auth: Yes
```

**Body:** None

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "username": "string"
    }
  ]
}
```

---

### Get Messages with User

```
GET /api/v1/messages/:id
Auth: Yes
```

**Params:**

- `id` - User ID (ObjectId)

**Body:** None

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "senderId": "string",
      "receiverId": "string",
      "text": "string (optional)",
      "image": "string (optional)",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

### Send Message

```
POST /api/v1/messages/send/:id
Auth: Yes
```

**Params:**

- `id` - Receiver's User ID (ObjectId)

**Body:**

```json
{
  "text": "string (optional, max 2000)",
  "image": "string (optional, URL)"
}
```

Note: At least one of `text` or `image` required

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "string",
    "senderId": "string",
    "receiverId": "string",
    "text": "string (optional)",
    "image": "string (optional)",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes: 400, 401, 404, 409, 500
