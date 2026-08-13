# Lifeline | Blood Donor Registry & Location Finder

Lifeline is a modern, responsive web application for registering voluntary blood donors, finding donors by blood group and location (Division, District, Upazila/Area), and managing donor availability profiles. 

This application is built as a **MERN Stack** variant utilizing a **Next.js API routes backend**, **MongoDB** for database persistence (via Mongoose), and a premium **vanilla HTML5, CSS3, and JavaScript frontend** (served statically).

---

## Features
- **Donor Registration**: Add donor details including Name, Contact Number (validated for Bangladeshi formats), Blood Group, Location (Division, District, Upazila/Area), and Availability Status.
- **Auto-Generated Donor ID**: Every donor receives a unique ID (e.g., `D-123456`) upon registration, which is required to edit or delete their profile.
- **Advanced Search & Directory**: Find active donors matching specific blood groups, divisions, districts, or upazilas. High-contrast indicators display donor availability.
- **Profile Management**: Retrieve, update availability, edit locations/phone numbers, or permanently delete donor profiles using the unique Donor ID.
- **Glassmorphic Responsive Design**: Highly engaging, modern slate interface optimized for desktop, tablet, and mobile screens.

---

## Tech Stack
- **Frontend**: Semantic HTML5, CSS3 (Custom Glassmorphism Design System), Vanilla ES6 JavaScript (Fetch API & DOM)
- **Backend APIs**: Next.js App Router API Routes
- **Database**: MongoDB & Mongoose ORM
- **Deployment & Hosting**: Vercel

---

## Prerequisites
Ensure you have the following installed on your machine:
1. **Node.js** (v18.x or later recommended)
2. **npm** (comes packaged with Node.js)
3. **MongoDB**:
   - Either a local MongoDB Community Server running on `mongodb://127.0.0.1:27017`
   - Or a **MongoDB Atlas** cloud cluster URI.

---

## Installation & Setup

### 1. Initialize & Install Dependencies
Navigate to the project root directory and run:
```bash
npm install
```
This will install Next.js, React, React-DOM, Mongoose, and dev dependencies (ESLint).

### 2. Configure Environment Variables
Create a file named `.env.local` in the root directory (if it does not exist) and add your MongoDB Connection URI:

**For a Local MongoDB Instance:**
```env
MONGODB_URI=mongodb://127.0.0.1:27017/donor_db
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/donor_db?retryWrites=true&w=majority
```
*(Replace `<username>`, `<password>`, and host name with your Atlas credentials).*

---

## Running the Application

### Development Mode
To launch the Next.js development server:
```bash
npm run dev
```
Alternatively, on Windows, you can simply double-click the `start.bat` script in the project root to run the dev server in a new window.

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Production Mode (Build and Run)
To build the application for production optimization:
```bash
npm run build
```
Once the build compiles successfully, start the server in production mode:
```bash
npm run start
```

---

## API Endpoints

### 1. Donors Endpoint (`/api/donors`)
- **`GET`**: Search donors.
  - **Query Parameters**:
    - `bloodGroup` (optional, e.g. `O+`, `A-`)
    - `division` (optional, e.g. `Dhaka`, `Sylhet`)
    - `district` (optional, e.g. `Gazipur`)
    - `upazilaOrArea` (optional, e.g. `Savar`)
    - `status` (optional, `Available` or `Unavailable`)
- **`POST`**: Register a new donor.
  - **Body Format (JSON)**:
    ```json
    {
      "name": "Rahman Ali",
      "phone": "01712345678",
      "bloodGroup": "O+",
      "division": "Dhaka",
      "district": "Dhaka",
      "upazilaOrArea": "Mirpur",
      "status": "Available"
    }
    ```

### 2. Individual Donor Endpoint (`/api/donors/[id]`)
*Supports lookups by either custom generated `Donor ID` (e.g. `D-123456`) or MongoDB `_id`.*
- **`GET`**: Retrieve a single donor profile.
- **`PUT`**: Update donor profile information (e.g., status, phone number).
- **`DELETE`**: Remove the donor profile permanently.

---

## Project Structure
```
donor-registration-system/
├── public/                 # Static Assets (Frontend)
│   ├── index.html          # Main HTML structure and form tabs
│   ├── styles.css          # Glassmorphism design system styles
│   └── app.js              # Tab controller, validation, and API fetch calls
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API Route Handlers
│   │   │   └── donors/     # CRUD controllers
│   │   ├── globals.css     # CSS reset and globals
│   │   ├── layout.js       # Root HTML wrap template
│   │   └── page.js         # Redirects / root URL to /index.html
│   ├── lib/
│   │   └── db.js           # Mongoose cache connection handler
│   └── models/
│       └── donor.js        # Mongoose Schema & pre-save validators
├── .env.local              # Local environment credentials
├── package.json            # Node project configuration
└── README.md               # Setup & execution instructions
```

---

## Troubleshooting

### `500 (Internal Server Error)` on API Calls
This error occurs when the backend API fails to establish a connection to your MongoDB server. 
1. Check if MongoDB is running locally (`mongod` process) or check your connection in Atlas.
2. Confirm your `.env.local` contains the correct connection string matching `MONGODB_URI`.
3. Check the backend server console log for the detailed database connection error trace.

### Contact Validation Errors
Phone numbers are validated strictly against Bangladeshi operator formats. Ensure your input matches:
- 11 digits: starting with `01` followed by `3-9` and 8 digits (e.g., `01712345678`).
- International format prefixes like `+8801...` or `8801...` are also supported.
