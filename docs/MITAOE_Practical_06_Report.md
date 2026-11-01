# MITAOE Web Technology – Practical No. 06
## Student Management REST API

| Field | Details |
| --- | --- |
| Student Name | ______________________ |
| Roll Number | ______________________ |
| Class / Division | ______________________ |
| Subject | Web Technology |
| Practical No. | 06 |
| Title | RESTful API development with database connectivity, CRUD operations and Postman testing |
| Date of Submission | ______________________ |

---

## 1. Aim

To design and implement a database-connected **Student Management REST API** using Node.js, Express and MongoDB, to perform complete **Create, Read, Update and Delete (CRUD)** operations through RESTful endpoints, to provide a React dashboard that consumes the API, and to verify every endpoint using **Postman** locally and against a deployed public URL.

---

## 2. Objectives

1. Understand the principles of REST and implement resource-based endpoints for the `student` resource.
2. Connect an Express application to a persistent MongoDB database using Mongoose.
3. Implement complete CRUD operations with correct HTTP methods and status codes.
4. Design a validated schema that prevents invalid and duplicate data from entering the database.
5. Organise the backend into routes, controllers, models and middleware, with centralized error handling.
6. Build a responsive React dashboard that performs every operation through the API.
7. Test all endpoints with a reusable Postman collection, including negative test cases.
8. Prepare and document the application for public deployment.

---

## 3. Technologies Used

| Component | Technology | Purpose |
| --- | --- | --- |
| Runtime | Node.js 18+ | Server-side JavaScript |
| Backend framework | Express 5 | Routing, middleware, HTTP handling |
| Database | MongoDB | Persistent document storage |
| ODM | Mongoose 9 | Schema, validation, queries |
| Configuration | dotenv | Environment variables, secret handling |
| CORS | cors | Controlled cross-origin access |
| Frontend | React 19 + Vite | Administration dashboard |
| HTTP client | Axios | Frontend-to-API communication |
| Icons | Lucide React | Interface icons |
| API testing | Postman / Newman | Endpoint verification and automation |
| Deployment target | Render + MongoDB Atlas | Public hosting and managed database |

---

## 4. Introduction to RESTful APIs

**REST (Representational State Transfer)** is an architectural style for network applications. A REST API exposes *resources* — here, `students` — as URLs, and clients manipulate those resources using standard HTTP methods. Each request is stateless: the server does not remember previous requests, so every request carries all the information needed to process it.

| HTTP method | Semantics | Endpoint used in this practical |
| --- | --- | --- |
| `GET` | Read a resource or collection | `GET /api/students`, `GET /api/students/:id` |
| `POST` | Create a new resource | `POST /api/students` |
| `PUT` | Update an existing resource | `PUT /api/students/:id` |
| `DELETE` | Remove a resource | `DELETE /api/students/:id` |

REST responses are self-describing: the **status code** communicates the outcome, and the **JSON body** carries the data or a descriptive error.

| Status code | Meaning | Example in this API |
| --- | --- | --- |
| `200 OK` | Request processed successfully | List, read, update, delete succeeded |
| `201 Created` | New resource created | Student inserted into MongoDB |
| `400 Bad Request` | Client sent invalid data | Missing field, invalid email, duplicate email/ID, malformed id |
| `404 Not Found` | Resource does not exist | Fetching or updating a deleted student |
| `500 Internal Server Error` | Unexpected server failure | Database/connection failure |

Design rules followed: nouns (not verbs) in URLs, plural resource names, consistent JSON envelopes, validation before persistence, and no sensitive values in responses.

---

## 5. System Architecture

```text
┌──────────────────────────────┐
│      React Dashboard         │
│   (Vite · Axios · JSX)       │
│  Forms · Table · Filters     │
└──────────────┬───────────────┘
               │  HTTP + JSON  (REST)
               ▼
┌──────────────────────────────┐
│   Express REST API           │
│                              │
│  routes/studentRoutes.js     │  ← endpoint definitions
│           │                  │
│  middleware/validateStudent  │  ← body + ObjectId validation
│           │                  │
│  controllers/studentController│ ← CRUD logic (async/await)
│           │                  │
│  middleware/errorHandler     │  ← centralized JSON errors
└──────────────┬───────────────┘
               │  Mongoose ODM
               ▼
┌──────────────────────────────┐
│  models/Student.js (schema)  │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│   MongoDB (Atlas / local)    │
│   database: student_management│
│   collection: students       │
└──────────────────────────────┘
```

Request lifecycle: the browser (or Postman) sends JSON → CORS and `express.json()` middleware → route → validation middleware → controller → Mongoose → MongoDB → controller builds the response → error handler if anything failed.

---

## 6. Database Design

**Database:** `student_management` · **Collection:** `students`

### Schema

| Field | Type | Constraints | Purpose |
| --- | --- | --- | --- |
| `_id` | ObjectId | Auto-generated primary key | Unique document identifier |
| `studentId` | String | Required, **unique**, 3–20 chars (`A–Z`, `0–9`, `-`), stored uppercase | College roll/registration number |
| `name` | String | Required, 2–80 characters, trimmed | Student full name |
| `email` | String | Required, **unique**, lowercase, valid email pattern | Contact and duplicate detection |
| `phone` | String | Required, 10 digit Indian mobile (`+91` optional) | Contact number |
| `department` | String | Required, enum: `CSE, IT, AIDS, ECE, EEE, MECH, CIVIL` | Academic department |
| `year` | Number | Required, integer 1–4 | Current year of study |
| `division` | String | Required, single letter `A`–`Z` (uppercase) | Class division |
| `createdAt` | Date | Auto (timestamps) | Record creation time |
| `updatedAt` | Date | Auto (timestamps) | Last modification time |

### Indexes

| Index | Reason |
| --- | --- |
| `studentId` unique | Prevents duplicate roll numbers |
| `email` unique | Prevents duplicate students |
| `createdAt` (descending) | Fast sorted listing (newest first) |

MongoDB enforces the unique indexes at database level, while validation middleware and the Mongoose schema reject invalid data *before* it reaches the collection. A duplicate insert therefore returns `400` with a clear message instead of creating a second record.

### Sample document

```json
{
  "_id": "672f1c2b8e1a4d4f9c0a12ab",
  "studentId": "MTA2023CS001",
  "name": "Aarav Patil",
  "email": "aarav.patil@mitaoe.ac.in",
  "phone": "9876543210",
  "department": "CSE",
  "year": 3,
  "division": "A",
  "createdAt": "2026-11-01T10:12:31.004Z",
  "updatedAt": "2026-11-01T10:12:31.004Z"
}
```

---

## 7. API Endpoint Documentation

**Base URL:** `http://localhost:5001/api` (local) · `https://<deployed-service>/api` (production)

| Method | Endpoint | Function | Success | Errors |
| --- | --- | --- | --- | --- |
| `GET` | `/health` | Service and database status | `200` | `500` |
| `GET` | `/students` | Retrieve all students (optional `search`, `department`, `year`) | `200` | `400`, `500` |
| `GET` | `/students/:id` | Retrieve one student by id | `200` | `400`, `404` |
| `POST` | `/students` | Create a student | `201` | `400` |
| `PUT` | `/students/:id` | Update a student | `200` | `400`, `404` |
| `DELETE` | `/students/:id` | Delete a student | `200` | `400`, `404` |

### Success response envelope

```json
{ "success": true, "message": "Student created successfully", "data": { "...": "..." } }
```

### Error response envelope

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Email format is invalid" }]
}
```

### Request / response examples

**POST `/api/students`**

```json
{
  "studentId": "MTA2023CS001",
  "name": "Aarav Patil",
  "email": "aarav.patil@mitaoe.ac.in",
  "phone": "9876543210",
  "department": "CSE",
  "year": 3,
  "division": "A"
}
```

→ `201 Created` with the stored document (including `_id`, `createdAt`, `updatedAt`).

**GET `/api/students`** → `200 OK`

```json
{ "success": true, "count": 1, "data": [{ "_id": "672f...", "studentId": "MTA2023CS001", "...": "..." }] }
```

**GET `/api/students/672f1c2b8e1a4d4f9c0a12ab`** → `200 OK` with the document; unknown id → `404 Not Found`.

**PUT `/api/students/672f1c2b8e1a4d4f9c0a12ab`**

```json
{ "name": "Aarav S Patil", "department": "IT", "year": 4, "division": "B" }
```

→ `200 OK` with the updated document.

**DELETE `/api/students/672f1c2b8e1a4d4f9c0a12ab`** → `200 OK` with the deleted document; repeating it → `404 Not Found`.

**POST `/api/students` with an invalid email** → `400 Bad Request`

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Email format is invalid" }]
}
```

---

## 8. Implementation

### 8.1 Backend structure

| File | Responsibility |
| --- | --- |
| `server/server.js` | Loads `.env`, connects MongoDB, starts HTTP server, graceful shutdown |
| `server/app.js` | Express app, CORS allowlist, JSON body limit, health/meta routes, 404 + error handlers |
| `server/config/db.js` | Mongoose connection with a clear error when `MONGO_URI` is missing |
| `server/models/Student.js` | Schema, enums, regex validation, unique indexes, timestamps |
| `server/middleware/validateStudent.js` | Normalizes and validates request body and `:id` parameter |
| `server/controllers/studentController.js` | CRUD functions using `async`/`await` |
| `server/routes/studentRoutes.js` | Maps HTTP methods and paths to middleware + controllers |
| `server/middleware/errorHandler.js` | Converts validation, cast, duplicate-key and unknown errors into JSON |
| `server/utils/ApiError.js` | Error type carrying status code and field details |

### 8.2 Validation strategy

Three layers prevent bad data:

1. **Frontend** — required fields, email/phone patterns, dropdowns for department/year/division.
2. **Request middleware** — trims input, uppercases codes, converts `year` to a number, rejects unknown fields, returns `400` with per-field messages.
3. **Mongoose schema + unique indexes** — final guarantee, also protects direct database writes.

Example of the validation middleware applied to create:

```js
router.route("/")
  .get(getStudents)
  .post(validateCreateStudent, createStudent);

router.route("/:id")
  .get(validateObjectId, getStudentById)
  .put(validateObjectId, validateUpdateStudent, updateStudent)
  .delete(validateObjectId, deleteStudent);
```

### 8.3 Centralized error handling

Controllers throw `ApiError` (for example `ApiError.notFound(...)`); Express forwards it to a single handler that maps Mongoose errors to the correct status:

```js
if (err.name === "ValidationError") { statusCode = 400; details = /* field messages */ }
if (err.code === 11000) {             statusCode = 400; /* duplicate email / studentId */ }
```

This removes repeated `try/catch` blocks and guarantees every failure returns the same JSON shape.

### 8.4 Security and configuration

- `MONGO_URI`, `PORT`, `NODE_ENV` and `CLIENT_ORIGIN` come from environment variables; `.env` is git-ignored and `.env.example` documents them.
- CORS only accepts origins listed in `CLIENT_ORIGIN` (unset = development convenience).
- Request bodies are limited to 100 kB; unknown routes return JSON `404`.
- Internal error details are hidden when `NODE_ENV=production`.
- Unknown body fields (such as `_id` or `createdAt`) are rejected instead of silently mass-assigned.

### 8.5 Frontend implementation

| File | Responsibility |
| --- | --- |
| `client/src/api/studentsApi.js` | Axios instance (`VITE_API_URL` or `/api`), CRUD calls, readable error messages |
| `client/src/App.jsx` | Loads students, dashboard statistics, notifications, delete confirmation |
| `client/src/components/StudentDirectory.jsx` | Live search, department/year filters, table, pagination |
| `client/src/components/StudentForm.jsx` | Add/edit form with client validation and API submission |
| `client/src/components/ConfirmDialog.jsx` | Explicit delete confirmation |
| `client/src/components/Toast.jsx` | Success and error notifications |
| `client/src/constants/departments.js` | Department labels, years and divisions |

In development Vite proxies `/api` to the Express server, so no hardcoded URL is required; in production `VITE_API_URL` supplies the deployed API base URL.

### 8.6 Persistence

All operations use Mongoose queries (`create`, `find`, `findById`, `findByIdAndUpdate`, `findByIdAndDelete`), so records live in MongoDB. No in-memory array is used as storage. Persistence was verified by restarting the API process and re-reading the records.

---

## 9. Postman Testing Results

**Collection:** `MITAOE_Practical_06_Student_Management_API`
**Environment used:** Local (`baseUrl = http://localhost:5001/api`)
**Runner:** Newman (Postman CLI), collection executed against the running API and local MongoDB.

| # | Request | Expected | Observed |
| --- | --- | --- | --- |
| 0 | API Health Check | `200`, database connected | `200`, `database: connected` |
| 1 | Create Student | `201`, document returned | `201`, `_id` and timestamps present |
| 2 | Get All Students | `200`, created student listed | `200`, record found in collection |
| 3 | Get Student by ID | `200`, matches created data | `200`, fields matched |
| 4 | Update Student | `200`, updated values returned | `200`, name/phone/department/year/division updated |
| 5 | Delete Student | `200`, deleted document returned | `200` |
| 6 | Verify Deleted Student Returns `404` | `404` | `404`, message "not found" |
| 7 | Verify Invalid Input Handling | `400`, field errors, no record | `400`, `email` and `phone` reported, no record created |
| 8a | Setup duplicate-email baseline | `201` | `201` |
| 8b | Verify Duplicate Email Handling | `400`, "already exists" | `400`, exactly one record keeps the email |
| 9 | Cleanup test data | `200` | `200`, database left clean |

**Summary from Newman**

```text
iterations     1 executed,  0 failed
requests      13 executed,  0 failed
test-scripts  11 executed,  0 failed
assertions    35 executed,  0 failed
total run duration: 169 ms · average response time: 3 ms
```

Additionally, 19 manual endpoint checks (curl) covering invalid ObjectId, unknown routes, malformed JSON, duplicate Student ID, invalid year and repeated deletion all returned the expected status codes.

**How to reproduce**

```bash
# 1. start MongoDB and the API
npm run server

# 2. run the collection
npx newman run postman/MITAOE_Practical_06_Student_Management_API.postman_collection.json \
  -e postman/MITAOE_Practical_06_Local.postman_environment.json
```

In the Postman application: import the collection and environment, select the environment, then use **Run collection**. To test a deployed API, set `baseUrl` in the Deployed environment to the public URL.

Screenshots of the application for this report are in the `screenshots/` folder (dashboard, add form, directory, search/filter, edit, validation, delete confirmation). They were captured from the running application.

---

## 10. Deployment Details

**Target platform:** Render (Node web service for the API, static site for the dashboard) with **MongoDB Atlas** as the managed database. This matches the platform the repository already used.

| Setting | API service | Frontend static site |
| --- | --- | --- |
| Root directory | `server` | `client` |
| Build command | `npm install` | `npm install && npm run build` |
| Start command | `npm start` | — (publish `dist`) |
| Variables | `MONGO_URI`, `NODE_ENV=production`, `CLIENT_ORIGIN` | `VITE_API_URL=https://<api>/api` |
| Port | Provided by Render via `process.env.PORT`; server binds `0.0.0.0` | — |

Required Atlas step: create a database user, allow connections from the hosting platform, and add the database name to the connection string.

Verification steps after deploying:

1. `GET https://<api>/api/health` returns `200` with `"database": "connected"`.
2. The Postman collection passes with the **Deployed** environment.
3. The dashboard URL loads records from the public API (browser console free of CORS errors).

**Deployment status:** the code, scripts and configuration required for deployment are complete; the public deployment has **not** been performed or verified at the time this report was prepared. No deployed URL or deployment screenshot is claimed here. After deploying, record the URLs below and attach the Postman run output.

| Item | Value |
| --- | --- |
| Frontend URL | _to be filled after deployment_ |
| API base URL | _to be filled after deployment_ |
| Health check result | _to be filled after deployment_ |
| Postman (deployed) result | _to be filled after deployment_ |

---

## 11. Result

The Student Management REST API was implemented and executed successfully. All five CRUD operations work against a persistent MongoDB database with correct HTTP status codes; invalid and duplicate input is rejected with field-level messages; a React dashboard performs every operation through the API; and the complete Postman collection passed (13 requests, 35 assertions, 0 failures) against the locally running API. Deployment configuration and instructions are ready, and public deployment remains to be carried out and verified.

---

## 12. Conclusion

The practical demonstrates how a REST API is designed around a resource, validated at multiple layers, and connected to a real database. Separating routes, controllers, models and middleware kept the code readable and made error handling consistent, while environment-based configuration kept credentials out of source control. Testing with Postman — including negative cases — showed that validation and differentiation between `200`, `201`, `400` and `404` responses are as important as the happy path. The project is ready for public deployment; the remaining step is to host it and repeat the same tests against the public URL.
