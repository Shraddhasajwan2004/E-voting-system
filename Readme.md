# Apna Mat - Secure E-Voting Portal

Apna Mat is a production-grade, full-stack electronic voting application designed to provide a secure, transparent, and user-friendly platform for conducting elections. Built with modern web technologies, it ensures data integrity and real-time processing of votes.

## 🚀 Features

- **Voter Authentication**: Secure login and registration with Aadhaar and EPIC number verification.
- **Admin Dashboard**: Comprehensive control panel for managing candidates, constituencies, and voting schedules.
- **Constituency-Based Voting**: Voters only see candidates from their registered constituency.
- **Real-time Results**: Instant aggregation and visualization of voting data.
- **Secure Database**: Hosted on Aiven Cloud MySQL for 24/7 availability and high security.
- **Responsive Design**: Polished UI built with Tailwind CSS and Framer Motion for a seamless experience across devices.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide React
- **Backend**: Node.js, Express, TypeScript, JWT (JSON Web Tokens)
- **Database**: MySQL (Aiven Cloud)
- **Deployment**: Vercel (Frontend), Render (Backend)

---

## 📂 Folder Structure

```text
E-voting-system/
├── src/                # Frontend React Application
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages (Home, Login, Admin, etc.)
│   ├── context/        # Auth and Global State management
│   └── lib/            # Utility functions
├── server/             # Backend Express Server
│   ├── config/         # Database and environment configuration
│   ├── controllers/    # Business logic for API endpoints
│   ├── routes/         # API route definitions
│   └── middleware/     # Auth and security middleware
├── server.ts           # Server entry point
├── package.json        # Dependencies and scripts
└── .env                # Environment variables (Local only)
```

---

## 📊 Database Architecture (ER Diagram)

The system uses a relational database model to ensure data consistency and security.

### ER Diagram (Mermaid)

```mermaid
erDiagram
    USERS ||--o| VOTERS : "is a"
    USERS ||--o{ COMPLAINTS : "files"
    USERS ||--o{ FACE_DATA : "has"
    CANDIDATES ||--o{ VOTES : "receives"
    VOTERS ||--o{ VOTES : "casts (indirectly)"
    
    USERS {
        int id PK
        string name
        string email UK
        string mobile
        string aadhaar_last4
        string password_hash
        string role
        string address
        string city
        string state
    }
    
    VOTERS {
        int id PK
        int user_id FK
        string epic_number UK
        string constituency
        string polling_station
        boolean has_voted
    }
    
    CANDIDATES {
        int id PK
        string name
        string party_name
        string party_symbol
        string constituency
        string city
        string state
    }
    
    VOTES {
        int id PK
        int candidate_id FK
        datetime timestamp
    }
    
    COMPLAINTS {
        int id PK
        int user_id FK
        string subject
        string description
        string status
    }
    
    CONSTITUENCIES {
        int id PK
        string name
        string city
        string state
    }
```

---

## 🔄 System Workflow

### 1. Database Handling Workflow
The application follows a strict request-response cycle with the Aiven Cloud MySQL database.

```mermaid
graph TD
    A[User Action] --> B[Frontend React]
    B --> C{API Request}
    C --> D[Express Server]
    D --> E[JWT Middleware]
    E --> F[Controller Logic]
    F --> G[(Aiven Cloud MySQL)]
    G --> F
    F --> D
    D --> B
    B --> H[UI Update]
```

### 2. Operational Workflow
1.  **Registration**: User provides details -> Backend creates `user` record -> Backend creates `voter` record.
2.  **Authentication**: User logs in -> Backend verifies password hash -> Returns JWT token.
3.  **Admin Setup**: Admin adds candidates and sets voting start/end times in the `settings` table.
4.  **Voting**: 
    - Voter enters Voting Booth.
    - System checks `has_voted` status and current time against `settings`.
    - Voter selects candidate -> `votes` table gets a new entry -> `voters.has_voted` updated to `true`.
5.  **Results**: Admin dashboard fetches count of votes grouped by candidate and constituency.

---

## 💻 Commands to Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/voting-app.git
cd voting-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env` file in the root directory:
```text
DATABASE_URL="mysql://avnadmin:your_password@your_host:port/defaultdb?ssl-mode=REQUIRED"
JWT_SECRET="your_random_secret_key"
```

### 4. Run the Application
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 🌐 Deployment

- **Database**: [Aiven.io](https://aiven.io/) (MySQL)
- **Backend**: [Render.com](https://render.com/)
- **Frontend**: [Vercel.com](https://vercel.com/)

---

© 2026 Election Commission of India. Developed for secure digital democracy.
