# Classroom Issue Management System (CIMS)
## Software Requirements Specification (SRS)
**Document Standard:** IEEE 830 Standard Format  
**Course:** Software Development Fundamentals (SDF) Academic Assignment  
**Target Environment:** College / University Campus Infrastructure  

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the functional and non-functional requirements for the **Classroom Issue Management System (CIMS)**. CIMS is a web-based facility management application tailored for higher education campuses, facilitating real-time reporting, routing, maintenance tracking, and administrative resolution of physical classroom defects (projectors, fans, electrical sockets, benches, lighting, and Wi-Fi infrastructure).

### 1.2 Scope
CIMS replaces ad-hoc paper complaint registers, manual logbooks, and scattered emails with a centralized, role-based platform. The system operates across three user roles:
1. **Students:** Report classroom equipment and infrastructure defects; track real-time repair progress; receive status change notifications.
2. **Campus Facility Administrators:** Triage incoming issues, set priorities, dispatch work orders to maintenance technicians, supervise workload, verify completed repairs, and analyze equipment failure trends.
3. **Maintenance Staff / Technicians:** View assigned field tasks, accept tasks, perform repairs, record resolution findings, and flag jobs as completed for administrative inspection.

### 1.3 Definitions and Acronyms
- **CIMS:** Classroom Issue Management System.
- **RBAC:** Role-Based Access Control.
- **SLA:** Service Level Agreement.
- **Firestore:** Cloud-hosted NoSQL document database by Google Firebase.
- **XSS:** Cross-Site Scripting attack vector.
- **SDF:** Software Development Fundamentals.

---

## 2. Overall Description

### 2.1 Product Perspective
CIMS is a client-tier web application built using standard HTML5, CSS3, and Vanilla JavaScript (ES6+ modular architecture), coupled with Google Firebase services (Firebase Authentication, Cloud Firestore) and Chart.js for data visualization.

### 2.2 User Roles & Operational Summary
| User Class | Description | Primary Capabilities |
| :--- | :--- | :--- |
| **Student** | Enrolled college student | Register, login, report issues, view own complaints, view progress timeline, receive notifications. |
| **Admin** | Campus estate / facility officer | View all campus tickets, assign maintenance technicians, escalate/de-escalate priority, sign-off on completions, manage staff directory, view analytics. |
| **Maintenance Staff** | Field repair technician | View assigned work orders, accept jobs (In Progress), log repair notes/parts used, mark work completed. |

### 2.3 Operating Environment
- Modern desktop and mobile web browsers: Google Chrome 90+, Mozilla Firefox 88+, Microsoft Edge 90+, Safari 14+.
- Client architecture: Zero-dependency client-side runtime with CDN-hosted Firebase Compat SDK and Chart.js.
- Local evaluation mode: Integrated reactive `localStorage` fallback enabling complete faculty evaluation without pre-configuring Google Cloud credentials.

---

## 3. Functional Requirements

### 3.1 Student Module
- **FR-01 (Student Registration):** The system shall allow students to create an account with full name, college ID, department, email, contact phone, and password ($\ge 6$ characters). Role must be strictly locked to `student`.
- **FR-02 (Student Authentication):** The system shall authenticate students using their institutional email and password.
- **FR-03 (Issue Submission):** Students shall be able to log a classroom defect by choosing one of 8 asset categories (*Projector*, *Fan*, *Lighting*, *Wi-Fi*, *Benches and furniture*, *Electrical problems*, *Cleanliness*, *Other*), entering the classroom/lab location, setting the urgency, and providing a description ($\ge 10$ characters).
- **FR-04 (My Issues Roster):** Students shall be able to view only their own reported issues with status indicators, filtering by status/category and searching by keywords.
- **FR-05 (Issue Details & History):** Students shall be able to inspect detailed ticket information, technician notes, and an immutable status timeline. Access to issues filed by other students must be strictly forbidden.
- **FR-06 (Notifications):** Students shall receive immediate notification alerts when an issue changes state (Assigned, In Progress, Completed, Resolved, Rejected).

### 3.2 Facility Administrator Module
- **FR-07 (Admin Overview Dashboard):** Administrators shall have real-time visibility of total, pending/unassigned, in-progress, and resolved classroom issues.
- **FR-08 (High Priority Alert):** The admin console shall highlight urgent and high-priority issues requiring immediate attention.
- **FR-09 (Issue Triage & Staff Assignment):** Admins shall have the ability to assign/reassign any reported issue to registered maintenance staff.
- **FR-10 (Priority Escalation):** Admins shall be able to adjust issue priority (*Low*, *Medium*, *High*, *Urgent*).
- **FR-11 (Verification & Closure):** Admins shall inspect staff resolution notes and mark tickets as `Resolved` or `Rejected` with recorded justification.
- **FR-12 (Staff Account Management):** Admins shall view technician profiles, monitor live active task workloads, and provision new maintenance staff members.
- **FR-13 (CSV Audit Export):** Admins shall have the ability to export all filtered classroom issues into a standard CSV spreadsheet for estate audits.

### 3.3 Maintenance Technician Module
- **FR-14 (Assigned Task Roster):** Technicians shall view tickets assigned specifically to their staff ID.
- **FR-15 (Task Acceptance):** Technicians shall transition assigned jobs to `In Progress` with a single click.
- **FR-16 (Resolution Notes):** Technicians shall record repair notes, parts replaced, and inspection findings.
- **FR-17 (Work Completion):** Technicians shall mark finished repairs as `Completed`, queuing them for final administrative sign-off.
- **FR-18 (Administrative Barrier):** Maintenance staff must be prohibited from accessing administrative functions (reassigning tickets to other staff or creating staff accounts).

### 3.4 Data Visualization & Analytics Module
- **FR-19 (Category Distribution Chart):** The system shall compute and render a doughnut chart of issues broken down by equipment category.
- **FR-20 (Priority Distribution Chart):** The system shall render a bar chart displaying issues distributed across severity levels.
- **FR-21 (Monthly Trends Line Chart):** The system shall display a multi-month historical trend line of issue volumes.
- **FR-22 (Data Authenticity):** All charts and statistics must be calculated directly from live database records without placeholder or random numbers.

---

## 4. Non-Functional Requirements

### 4.1 Security Requirements
- **NFR-01 (Role-Based Access Control):** Client route guards and Cloud Firestore Security Rules must enforce zero-trust access.
- **NFR-02 (Student Ownership Verification):** Students must be blocked at both client and database tiers from reading or updating other students' complaints.
- **NFR-03 (Privilege Escalation Prevention):** Public registration must never permit setting `role = 'admin'` or `role = 'staff'`.
- **NFR-04 (Input Sanitization):** All user-provided strings rendered into the DOM must pass through HTML character entity escaping (`escapeHtml()`) to prevent Cross-Site Scripting (XSS).

### 4.2 Usability & SaaS Design Requirements
- **NFR-05 (Visual Theme):** Clean, professional institutional theme adhering to Navy Blue (`#0f172a`, `#1e293b`), Primary Blue (`#2563eb`), Light Blue (`#eff6ff`), and White cards.
- **NFR-06 (Responsive Design):** The application layout must adapt seamlessly across desktop monitors, tablets ($\le 992px$), and mobile viewports ($\le 768px, \le 480px$) with slide-out sidebar navigation.
- **NFR-07 (Clear Feedback):** Form submissions must feature loading spinners, action disablement against double-submits, and actionable error messages.

### 4.3 Reliability & Performance
- **NFR-08 (Zero Crash Graceful Fallback):** If Cloud Firebase credentials are not provided or network is offline, the system shall seamlessly fall back to local reactive storage without runtime crashes.
- **NFR-09 (Query Optimization):** Database queries must utilize compound indexes for low-latency sorting and filtering.
- **NFR-10 (Persistence):** State must persist across browser page reloads and tab closures.
