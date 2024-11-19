
# Invoice and Employee Management System

## Introduction
This project is an application for managing invoices and employees, built on Node.js and Express. The application supports features such as displaying invoice lists, managing employees (add, update, delete, view details), and user management through login and registration systems.

---

## Directory Structure
```
├── models/               # MongoDB schema files
├── routes/               # Router files
├── views/                # EJS templates for rendering UI
├── app.js                # Main application file
├── package.json          # Dependencies and project metadata
```

---

## Key Features

### 1. Invoice Management
- **Route:** `/bills`
- Displays a list of user-specific invoices.
- Fetches invoice data from MongoDB using the `Bill` model.
- Renders the UI using EJS templates.

**Source Code:** [BillRouter.js](#)

---

### 2. Employee Management
- **Route:** `/employees`
- Features:
  - Retrieve a list of employees.
  - Add new employees with passwords hashed using `bcrypt`.
  - Update employee details.
  - View employee details.
  - Delete employees.

**Source Code:** [EmployeeRouter.js](#)

---

### 3. User Authentication (Login and Registration)
- **Routes:**
  - `/login`: Handles user login.
  - `/register`: Displays the registration form.
  - `/logout`: Ends the user session.
- Session management using `express-session` to store user data.

**Source Code:** [Global.js](#)

---

## System Requirements
- **Node.js**: >=16.0.0
- **MongoDB**: A NoSQL database for data storage.
- **Key Dependencies**:
  - `express`
  - `bcrypt`
  - `mongoose`
  - `express-session`
  - `ejs`

---

## Installation Guide

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Tran2612/shop-control.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

4. **Run the application**:
   ```bash
   npm start
   ```

5. **Access the application** at [http://localhost:3000](http://localhost:3000).

---

## Notes
- **Database Configuration:** Update your MongoDB URI in the configuration file (e.g., `app.js` or `.env`).
- **Auto-reload:** Use `nodemon` for better development experience.

---

## Author
This project is developed by **[Loc Tran Tran]**. For feedback or reporting issues, contact **[Tran26122003@gmail.com]**.
