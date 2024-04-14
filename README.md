## Habit Tracker API Documentation

This API provides functionalities for a habit tracker application.

Here's the database diagram:
![Database Diagram](https://i.ibb.co/z47L8pv/Screenshot-2024-04-15-at-12-34-30-AM.png)

Here's an overview of the endpoints:

**Authentication:**

- **POST /api/auth/signup**
  - Creates a new user account.
  - Request Body:
    - `email` (string): User's email address.
    - `password` (string): User's password.
    - `username` (string): User's username (optional).
  - Response:
    - On success: Status code 201 with a message and the newly created user object.
    - On failure: Status code 500 with an error message.
- **POST /api/auth/signin**
  - Signs in an existing user.
  - Request Body:
    - `email` (string): User's email address.
    - `password` (string): User's password.
  - Response:
    - On success: Status code 200 with a message and the user's session object.
    - On failure: Status code 500 with an error message.

**Habits:**

- **GET /api/habits/view** (requires authentication)
  - Retrieves a list of all habits for the authenticated user.
  - Response:
    - On success: Status code 200 with an array of habit objects.
    - On failure: Status code 401 (unauthorized) or 500 with an error message.
- **POST /api/habits/add** (requires authentication)
  - Creates a new habit for the authenticated user.
  - Request Body:
    - `habit_name` (string): The name of the habit.
  - Response:
    - On success: Status code 201 with a message and the newly created habit object.
    - On failure: Status code 401 (unauthorized) or 500 with an error message.
- **PATCH /api/habits/edit/:habitId** (requires authentication)
  - Updates an existing habit for the authenticated user.
  - Path Parameter:
    - `:habitId` (string): The ID of the habit.
  - Request Body:
    - `habit_name` (string): The updated name of the habit (optional).
  - Response:
    - On success: Status code 200 with a message and the updated habit object.
    - On failure: Status code 401 (unauthorized) or 404 (habit not found) or 500 with an error message.
- **DELETE /api/habits/delete/:habitId** (requires authentication)
  - Deletes an existing habit for the authenticated user.
  - Path Parameter:
    - `:habitId` (string): The ID of the habit.
  - Response:
    - On success: Status code 200 with a message.
    - On failure: Status code 401 (unauthorized) or 404 (habit not found) or 500 with an error message.

**Habit Progression:**

- **POST /api/habits/progression/:habitId** (requires authentication)
  - Marks a habit as completed for the current date for the authenticated user.
  - Path Parameter:
    - `:habitId` (string): The ID of the habit.
  - Response:
    - On success: Status code 201 with a message indicating successful habit completion.
    - On failure: Status code 401 (unauthorized) or 404 (habit not found) or 500 with an error message.

**Additional Notes:**

- The API expects a valid user session token in the authorization header.
