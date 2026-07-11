# Lab | REST API CRUD

In this lab you will build a contacts REST API from scratch using **Express** and **Mongoose**.

The project skeleton is already set up for you:

- `package.json` with all dependencies installed (`express`, `mongoose`, `http-errors`, `dotenv`) and `start` / `dev` scripts.
- `src/app.js` with Express configured: `dotenv` and `express.json()` — with `// TODO` comments marking where to plug things in.
- `src/lib/db.js` with a `require('mongoose')` ready for you to complete.
- Empty folders `src/controllers/`, `src/lib/` and `src/middlewares/` waiting for your files.

> **Before starting:** copy `.env.template` to `.env` and fill in your MongoDB connection string.

---

## Iteration 1 — First controller: probe

The goal is to wire up your first route end-to-end.

A **probe** (or health check) is a lightweight endpoint that returns a simple response to confirm the server is up and reachable. It is commonly used by monitoring tools, load balancers and deployment pipelines to verify that a service is running correctly — without touching the database or any business logic.

**Steps:**

1. Create `src/controllers/index.js`. It should export an Express `Router`.
2. Create `src/controllers/probe.controller.js`. Export a single handler called `status` that sends a JSON response:
   ```json
   { "status": "ok" }
   ```
3. Register the route `GET /status` in `controllers/index.js` using your `probe.status` handler.
4. Mount the router in `src/app.js` under the prefix `/api/v1`. Look for the `// TODO` comment.

**Verify:** `GET http://localhost:3000/api/v1/status` should return `200 { "status": "ok" }`.

> **Hint:** The router in `controllers/index.js` works exactly like a mini `app`. Use `router.get(...)` to register routes and `module.exports = router` to export it.

---

## Iteration 2 — Database connection and Contact model

### 2a — Connect to MongoDB

Complete `src/lib/db.js` so that it connects to MongoDB when required.

- Use `mongoose.connect(process.env.MONGODB_URI)`.
- Log a message on success and exit the process on failure.
- Require `db.js` from `src/app.js` (below the `dotenv` line) so the connection is established when the server starts.

> **Hint:** `mongoose.connect()` returns a Promise — use `.then()` and `.catch()` to handle success and errors.

### 2b — Contact model

Create `src/lib/models/contact.model.js` with a Mongoose schema for a contact. Include at least these fields:

| Field | Type | Notes |
|---|---|---|
| `name` | String | required |
| `age` | Number | |
| `birthdate` | Date | |
| `email` | String | required, unique |
| `phone` | String | |

Add validation where it makes sense (minimum length, format, range…). The Mongoose docs are your friend:
- [Validation](https://mongoosejs.com/docs/validation.html)
- [SchemaTypes](https://mongoosejs.com/docs/schematypes.html)

Enable `timestamps: true` so Mongoose automatically adds `createdAt` and `updatedAt`.

> **Hint — cleaning up the output:** By default Mongoose returns `_id` and `__v` in every document. You can hide them and expose a clean `id` string by adding a `toJSON` transform to your schema options:
>
> ```js
> {
>   timestamps: true,
>   toJSON: {
>     transform: (doc, ret) => {
>       ret.id = doc.id;
>       delete ret._id;
>       delete ret.__v;
>       return ret;
>     }
>   }
> }
> ```

---

## Iteration 3 — Error middleware

Create `src/middlewares/errors.mid.js`. It must export **two middleware functions** and mount them in `src/app.js` using the second `// TODO` comment.

### `notFound`

A regular middleware (3 parameters) that catches any request that didn't match a route and forwards a `404` HTTP error to Express.

> **Hint:** Use `createHttpError` from the `http-errors` package to create the error, then pass it to `next`.

### `globalHandler`

An error-handling middleware. Express identifies it as an error handler because it has **4 parameters**: `(error, req, res, next)`.

For now, keep it simple: respond with the error's status code (or `500` as fallback) and a JSON body with a `message` field.

The response body should always be JSON with at least a `message` field.

> **Hint:** HTTP errors created with `http-errors` already carry a `status` property and a `message`. You can use them directly.

> **For later:** once you have the CRUD working, come back here and add specific handling for Mongoose errors:
> - `ValidationError` (`error.name === 'ValidationError'`) → `400`
> - `CastError` (`error.name === 'CastError'`) — triggered by an invalid MongoDB id → `404`

---

## Iteration 4 — List & Create contacts

Create `src/controllers/contacts.controller.js` and register the routes in `src/controllers/index.js`.

### `GET /api/v1/contacts`

Returns an array of all contacts.

- Status code: `200`
- Use `Contact.find()`
- If the collection is empty, return an empty array — that is not an error.

### `POST /api/v1/contacts`

Creates a new contact from the request body.

- Status code: `201`
- Use `Contact.create(req.body)`
- Validation errors from Mongoose will be caught automatically by your `globalHandler` — just call `next(error)` inside a `catch`.

> **Hint — always use try/catch:** All your controller handlers should be `async` functions wrapped in try/catch. Forward any error to Express with `next(error)` — your `globalHandler` will take care of the response.
>
> ```js
> module.exports.list = async (req, res, next) => {
>   try {
>     // ...
>   } catch (error) {
>     next(error);
>   }
> };
> ```

---

## Iteration 5 — Detail, Update & Delete

Add the remaining three routes to `contacts.controller.js`.

### `GET /api/v1/contacts/:id`

Returns a single contact by id.

- Status code: `200`
- If no contact is found, respond with `404`. Use `createHttpError` to generate the error and forward it with `next`.

> **Hint:** `Contact.findById(id)` returns `null` when the document doesn't exist.

### `PATCH /api/v1/contacts/:id`

Updates a contact with the fields provided in the request body.

- Status code: `200` with the updated contact.
- Make sure validations run on update too: pass `{ runValidators: true, new: true }` to `findByIdAndUpdate`.
- If the contact doesn't exist, respond `404`.

### `DELETE /api/v1/contacts/:id`

Deletes a contact by id.

- Status code: `204` (no body).
- If the contact doesn't exist, respond `404`.

> **Hint:** `findByIdAndDelete` also returns `null` when no document matches.

---

## Bonus — Filter by name

Extend `GET /api/v1/contacts` to accept an optional query parameter `name`.

When provided, return only contacts whose `name` contains that string (case-insensitive).

```
GET /api/v1/contacts?name=ana
```

> **Hint:** MongoDB supports [regular expression queries](https://www.mongodb.com/docs/manual/reference/operator/query/regex/). In Mongoose you can pass a regex directly as a field filter:
>
> ```js
> { name: { $regex: search, $options: 'i' } }
> ```
>
> Build the filter object conditionally — only add the `name` filter when the query param is present.

---

## Bonus 2 — Configuration with Convict

Right now the app reads `process.env.PORT` and `process.env.MONGODB_URI` directly. As a project grows, scattered `process.env` reads become hard to track and there is no validation that required values are actually set.

[Convict](https://github.com/mozilla/node-convict) lets you define a **schema** for your configuration: expected keys, types, default values, environment variable mappings and validation rules — all in one place.

**Steps:**

1. Create `src/lib/config.js`. Define a convict schema with at least:
   - `port` — number, default `3000`, loaded from `PORT`
   - `db.uri` — string, no default, loaded from `MONGODB_URI`

2. Call `config.validate({ allowed: 'strict' })` at the end of the file so convict throws on startup if a required value is missing.

3. Export the validated config instance.

4. Replace the direct `process.env` reads in `app.js` and `db.js` with `config.get('port')` and `config.get('db.uri')`.

> **Hint — minimal schema structure:**
>
> ```js
> const convict = require('convict');
>
> const config = convict({
>   port: {
>     doc: 'Port the server listens on',
>     format: 'port',
>     default: 3000,
>     env: 'PORT',
>   },
>   db: {
>     uri: {
>       doc: 'MongoDB connection URI',
>       format: String,
>       default: null,
>       env: 'MONGODB_URI',
>     },
>   },
> });
>
> config.validate({ allowed: 'strict' });
>
> module.exports = config;
> ```
>
> Convict's built-in `'port'` format validates that the value is an integer between 1 and 65535. See all built-in formats in the [convict docs](https://github.com/mozilla/node-convict/tree/master/packages/convict#built-in-formats).
