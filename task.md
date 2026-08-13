# Blood Donor Finder — Task Checklist

## Sprint 0: Project Setup & GitHub
- [x] Initialize GitHub Repository
- [x] Scaffold the Next.js App
- [x] Setup MVC Architecture (models, controllers, components)
- [x] Database Connection (MongoDB)

## Sprint 1: Admin Basics
- [x] Feature 10: Admin view of all registered donors
- [x] Feature 11: Verify donor information

## Sprint 2: Requests & Notifications
- [x] Feature 12: Manage blood requests (public form + admin management)
- [x] Feature 17: Confirmation system
  - [x] Update BloodRequest model & types
  - [x] Create commit/confirm controllers & API routes
  - [x] Create public request board for donors
  - [x] Update admin requests page to manage confirmations
- [x] Feature 14: Real-time notifications (Polling approach)
  - [x] Create Notification model & types
  - [x] Trigger notifications on BloodRequest creation
  - [x] Create Notification API routes
  - [x] Build NotificationBell UI component
  - [x] Integrate into Navbar
