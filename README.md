# CampusHire — Placement & Internship Management Portal

CampusHire is a MERN-stack web application designed to simplify the placement and internship process for students and placement officers. Students can maintain their profiles, explore opportunities, check eligibility, and track applications, while placement officers can manage opportunities and review student applications.

## Features

### Student
- Register and log in securely.
- View and update profile information, including education, skills, CGPA, and graduation year.
- Upload and view a resume in PDF format.
- Browse placement and internship opportunities.
- Review opportunity requirements and eligibility criteria.
- Apply for opportunities and track application status.

### Placement Officer
- Log in with role-based access.
- Create and manage placement and internship opportunities.
- Define eligibility criteria, including minimum CGPA, eligible degrees, graduation years, and required skills.
- View student applications.
- Update application statuses: Pending, Shortlisted, Rejected, and Selected.

### General
- REST API built with Node.js and Express.
- MongoDB integration using Mongoose.
- JWT-based authentication and password hashing.
- Server-side eligibility validation and duplicate-application prevention.
- React-based user interface.

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React, JavaScript, HTML, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Tokens (JWT), bcrypt |
| API Testing | Postman |
| Development Tools | VS Code, Git, GitHub |

## Project Structure

```text
CampusHire/
├── client/
│   ├── src/
│   └── package.json
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── server.js
│   └── package.json
├── .gitignore
└── README.md
```

*Note: Adjust the structure above to match the actual folders and files in your repository.*

## Getting Started

### Prerequisites
- Node.js and npm
- MongoDB local instance or MongoDB Atlas account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Priyanshu-Yadav19/Campushire.git
cd Campushire
```

### 2. Configure the Backend

```bash
cd server
npm install
```

Create a `.env` file in the backend directory and add the environment variables required by your application. For example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
```

Use the exact variable names expected by your backend code. Never commit your real `.env` file or credentials.

Start the backend using the script defined in `server/package.json`, for example:

```bash
npm run dev
```

### 3. Configure the Frontend

Open a second terminal from the project root:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## API Overview

The backend uses the versioned API prefix `/api/v1`.

The API covers functionality such as:
- Health checks
- Authentication
- Student profiles
- Opportunities
- Applications
- Resume management

Refer to the backend routes for the exact endpoints and request formats.

## Application Workflow

1. Students register and complete their profiles.
2. Placement officers publish opportunities with eligibility requirements.
3. Students review opportunities and apply when eligible.
4. The backend checks eligibility and prevents duplicate applications.
5. Placement officers review applications and update their statuses.
6. Students track application progress through their accounts.

## Security

- Passwords are hashed before storage.
- Protected endpoints use authentication and role-based authorization.
- Sensitive configuration is stored in environment variables.
- Eligibility and duplicate-application checks are handled by the backend.

## Screenshots

Add screenshots of the working application to a `screenshots/` folder and display them here.

Suggested screenshots:
- Login and registration
- Student dashboard
- Student profile and resume section
- Opportunity listing and details
- Application tracking
- Placement officer dashboard

Example:

```markdown
![Student Dashboard](screenshots/student-dashboard.png)
```

## Future Improvements

- Email notifications for application status changes
- Improved resume file storage and validation
- Pagination and advanced opportunity filters
- Production deployment
- Automated testing and API documentation

## Author

**Priyanshu Yadav**

GitHub: [Priyanshu-Yadav19](https://github.com/Priyanshu-Yadav19)

---

CampusHire was developed as a learning project to apply MERN-stack development concepts, REST API design, database modeling, authentication, and role-based access control.
