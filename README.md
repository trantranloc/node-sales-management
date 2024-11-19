
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
- Fetches invoice data from MongoDB using the `Bill` com]**.
