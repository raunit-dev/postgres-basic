# Postgres Basic API

This project is a basic Node.js application that demonstrates user authentication and management using Express.js and a PostgreSQL database. It provides a simple RESTful API for user signup, signin, and fetching user data.

## Features

- User registration with password hashing (bcrypt)
- User sign-in with password verification
- Create a user with an address in a single transaction
- Fetch user details and addresses
- Built with TypeScript

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)

## Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd postgres-basic
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

## Configuration

1.  Create a `.env` file in the root of the project.
2.  Add your PostgreSQL connection string to the `.env` file:

    ```
    DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>"
    ```

## Running the Application

To start the development server, run the following command:

```bash
npm run dev
```

This will compile the TypeScript code and start the server on `http://localhost:3000`.

## API Endpoints

### Authentication

-   `POST /signup`
    -   Registers a new user.
    -   **Request Body:**
        ```json
        {
          "username": "testuser",
          "email": "test@example.com",
          "password": "password123"
        }
        ```
    -   **Response:**
        ```json
        {
          "message": "User registered",
          "user": {
            "id": 1,
            "username": "testuser",
            "email": "test@example.com"
          }
        }
        ```

-   `POST /signin`
    -   Signs in an existing user.
    -   **Request Body:**
        ```json
        {
          "email": "test@example.com",
          "password": "password123"
        }
        ```
    -   **Response:**
        ```json
        {
          "message": "Sign-in successful",
          "user": {
            "id": 1,
            "username": "testuser",
            "email": "test@example.com"
          }
        }
        ```

### User Management

-   `POST /users`
    -   Creates a new user along with their address.
    -   **Request Body:**
        ```json
        {
          "username": "newuser",
          "email": "new@example.com",
          "password": "password123",
          "city": "New York",
          "country": "USA",
          "street": "123 Main St",
          "pincode": "10001"
        }
        ```

-   `GET /users/:id`
    -   Fetches a user by their ID.

-   `GET /users/:id/address`
    -   Fetches a user's address by their user ID.

-   `GET /users/:id/details`
    -   Fetches a user's details along with their address.

## Database Schema

The application will automatically create the following tables in your database:

-   **`users`**
    -   `id` (SERIAL PRIMARY KEY)
    -   `username` (VARCHAR(50) UNIQUE NOT NULL)
    -   `email` (VARCHAR(255) UNIQUE NOT NULL)
    -   `password` (VARCHAR(255) NOT NULL)
    -   `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)

-   **`addresses`**
    -   `id` (SERIAL PRIMARY KEY)
    -   `user_id` (INTEGER NOT NULL, FOREIGN KEY to `users.id`)
    -   `city` (VARCHAR(100) NOT NULL)
    -   `country` (VARCHAR(100) NOT NULL)
    -   `street` (VARCHAR(255) NOT NULL)
    -   `pincode` (VARCHAR(20) NOT NULL)
    -   `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
