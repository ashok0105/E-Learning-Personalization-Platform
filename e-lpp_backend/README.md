# E-LPP Backend Modules

The backend is built using a modular MVC (Model-View-Controller) architecture based on **Node.js, Express.js, and MongoDB**.

## 1. Core Modules (Dependencies)
These are the primary NPM packages powering the backend:
- `express`: The web framework for handling HTTP requests and routing.
- `mongoose`: The Object Data Modeling (ODM) library for MongoDB.
- `jsonwebtoken`: Used for securely transmitting information and authenticating users via JWT.
- `bcryptjs`: Used for securely hashing user passwords before storing them in the database.
- `cors`: Middleware to allow cross-origin requests from your React frontend.
- `dotenv`: Loads environment variables from a `.env` file.

## 2. Directory Structure & App Modules
The backend separates concerns into distinct folders:

### `config/` (Configuration)
- `db.js`: Contains the logic to connect to the MongoDB instance using Mongoose.

### `models/` (Database Schemas)
Defines the structure of the data stored in MongoDB.
- `User.js`: Defines the schema for users (`name`, `email`, `password`, `role`).
- `Course.js`: Defines the schema for courses (`title`, `description`, `price`, `instructor`, etc.).
- *(Additional models like `Enrollment.js`, `Progress.js`, `Quiz.js`, `Certificate.js` exist for future expansion).*

### `controllers/` (Business Logic)
Contains the actual functions executed when an API route is hit.
- `authController.js`: Handles user registration (`register`) and login (`login`), password hashing, and token generation.
- `courseController.js`: Handles fetching approved courses (`getApprovedCourses`) and creating new courses (`createCourse`).
- *(Controllers for Admin and Enrollment also exist).*

### `routes/` (API Endpoints)
Maps the incoming HTTP requests (GET, POST, etc.) to the specific controller functions.
- `authRoutes.js`: Maps `/signup` and `/login` to `authController`.
- `courseRoutes.js`: Maps course-related endpoints to `courseController`.

### `middleware/` (Request Interceptors)
Functions that run *before* the request reaches the controller.
- `authMiddleware.js`: Verifies the JWT sent from the frontend to ensure the user is logged in before accessing private routes.

### `Server.js` (Entry Point)
The main file that ties everything together. It initializes Express, connects to the database via `config/db.js`, applies global middleware (`cors`, `express.json()`), and mounts the API routes (e.g., `/api/auth` and `/api/courses`).
