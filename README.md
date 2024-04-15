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
- **PUT /api/habits/edit/:habitId** (requires authentication)
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

**Journal entries:**

- **POST /api/journal/add** (requires authentication)

  - Creates a new journal entry for the authenticated user.
  - Request Body:
    - `entry_content` (string): The content of the new journal entry.
  - Response:
    - On success: Status code 201 with a message indicating successful creation of the journal entry.
    - On failure: Status code 401 (unauthorized) or 500 with an error message.

- **GET /api/journal/entries** (requires authentication)

  - Retrieves all journal entries for the authenticated user.
  - Response:
    - On success: Status code 200 with a message indicating indicating successful retrieval of journal entries and an array of journal entry objects for the user. Each object contains details about the entry.
    - On failure: Status code 401 (unauthorized) or 500 with an error message.

- **PUT /api/journal/edit/:entryId** (requires authentication)
  - Updates an existing journal entry for the authenticated user.
  - Path Parameter:
    - `:entryId` (string): The ID of the journal entry to update.
  - Request Body:
    - `entry_content` (string): The updated content for the journal entry.
  - Response:
    - On success: Status code 200 with a message indicating successful update of the journal entry and the updated journal entry object with its details.
    - On failure: Status code 401 (unauthorized) or 500 with an error message.

**Habit Progression:**

- **POST /api/habits/progression/:habitId** (requires authentication)
  - Marks a habit as completed for the current date for the authenticated user.
  - Path Parameter:
    - `:habitId` (string): The ID of the habit.
  - Response:
    - On success: Status code 201 with a message indicating successful habit completion.
    - On failure: Status code 401 (unauthorized) or 404 (habit not found) or 500 with an error message.
- **GET /api/habits/progression/** (requires authentication)
  - Retrieves habit progression data for the authenticated user.
  - Response:
    - On success: Status code 200 with a message indicating successful habit completion and an object containing habit progression data for each habit of the user.
    - On failure: Status code 401 (unauthorized) or 500 with an error message.

**Additional Notes:**

- The API expects a valid user session token in the authorization header.
