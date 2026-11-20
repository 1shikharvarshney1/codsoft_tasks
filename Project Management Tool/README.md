# ProManage - Full Stack Project Management Tool

A modern, responsive project management web application built with **React**, **Node.js (Express)**, and **MongoDB (Mongoose)**. It provides project and task lifecycle management, user authentication via JWT, collaborative task assignment, deadline tracking with overdue warnings, and automatic progress calculation.

---

## 🌟 Key Features

1. **Project Management (CRUD)**:
   - Create, view, update, and delete projects with a target deadline and description.
   - Cascade deletion: deleting a project automatically cleans up all associated tasks.
2. **Task Management (CRUD)**:
   - Create tasks nested inside specific projects.
   - Edit task details, deadlines, priority (`Low`, `Medium`, `High`), and statuses.
   - Delete individual tasks.
3. **Collaborative Task Assignment**:
   - Register and authenticate users using JSON Web Tokens (JWT) and Bcrypt password hashing.
   - Assign tasks to any registered team member via a dynamic user dropdown.
4. **Deadline & Overdue Tracking**:
   - Assign due dates to projects and individual tasks.
   - Automated server-side and client-side overdue detection: tasks and projects past their deadline that are not completed are clearly flagged with red badges and alerts.
5. **Real-time Progress Calculation**:
   - Dynamic project completion percentage: $\text{Progress} = \left(\frac{\text{Completed Tasks}}{\text{Total Tasks}}\right) \times 100\%$.
   - Interactive visual progress bar with status color shifts (Amber $\rightarrow$ Blue $\rightarrow$ Green).
   - Fast status toggle (`To Do`, `In Progress`, `Done`) directly updates the project progress.

---

## 🏗️ Project Architecture

```
Project Management Tool/
├── README.md
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── authRoutes.js
│       ├── projectRoutes.js
│       └── taskRoutes.js
└── client/
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── services/
        │   └── api.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── ProjectCard.jsx
        │   ├── ProjectModal.jsx
        │   ├── TaskModal.jsx
        │   ├── TaskItem.jsx
        │   └── ProgressBar.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            └── ProjectDetails.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16+ recommended, tested on v24)
- **npm** or **yarn**
- **MongoDB** (Local MongoDB Community Server running on `mongodb://127.0.0.1:27017` or a free MongoDB Atlas URI)

---

### 1. Backend Setup (`/server`)

1. Open your terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from the example:
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env
   # Or on Mac/Linux:
   cp .env.example .env
   ```

4. Configure your `.env` variables if necessary:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/project_management_db
   JWT_SECRET=super_secret_jwt_key_change_in_production
   ```

5. Start the backend server:
   ```bash
   # Production mode:
   npm start

   # Development mode with auto-reload:
   npm run dev
   ```
   The backend API will be running at `http://localhost:5000`.

---

### 2. Frontend Setup (`/client`)

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create a `.env` file:
   ```bash
   # On Windows PowerShell:
   Copy-Item .env.example .env
   # Or on Mac/Linux:
   cp .env.example .env
   ```
   *Default API URL points to `http://localhost:5000/api`.*

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

---

## 📡 REST API Reference

All protected endpoints require an `Authorization` header formatted as:
`Authorization: Bearer <your_jwt_token>`

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (returns user + JWT) | Public |
| `POST` | `/api/auth/login` | Authenticate user credentials (returns user + JWT) | Public |
| `GET` | `/api/auth/me` | Get current logged-in user details | Private |
| `GET` | `/api/auth/users` | List all users for task assignments | Private |

### Project Routes (`/api/projects`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/projects` | Get all projects with computed stats, progress %, and overdue flag | Private |
| `POST` | `/api/projects` | Create a new project (`title`, `description`, `dueDate`) | Private |
| `GET` | `/api/projects/:id` | Get single project with aggregated task progress | Private |
| `PUT` | `/api/projects/:id` | Update project title, description, or due date | Private |
| `DELETE` | `/api/projects/:id` | Delete project and cascade-delete its tasks | Private |

### Task Routes (`/api/tasks`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/tasks/project/:projectId` | Get all tasks belonging to a project | Private |
| `POST` | `/api/tasks/project/:projectId` | Create task inside project with status, priority, due date, and assigned user | Private |
| `PUT` | `/api/tasks/:id` | Update task fields (status, priority, assignment, etc.) | Private |
| `DELETE` | `/api/tasks/:id` | Delete a single task by ID | Private |
| `GET` | `/api/tasks/my-tasks` | Get all tasks assigned to the current user | Private |

---

## 🧪 Tech Stack

- **Client**: React 18, React Router v6, Axios, Lucide React icons, Vite
- **Server**: Node.js, Express, Mongoose (MongoDB ODM), JSON Web Tokens (JWT), Bcrypt.js, CORS, Dotenv
- **Database**: MongoDB
