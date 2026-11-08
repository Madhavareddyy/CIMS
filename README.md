# Classroom Issue Management System (CIMS)
## Enterprise Campus Facility & Maintenance Operations Portal

**Classroom Issue Management System (CIMS)** is a production-grade, secure, multi-role web platform designed for higher education campuses, universities, and schools to streamline facility upkeep, classroom equipment reliability, and rapid infrastructure maintenance.

---

## 🏛️ System Overview

In an active college campus, physical defects—such as flickering lecture hall projectors, damaged ceiling fans, dead lighting fixtures, intermittent Wi-Fi access points, broken desk furniture, and electrical hazards—disrupt lectures and pose safety risks.

CIMS provides a centralized, transparent platform replacing ad-hoc paper registers, manual complaint logs, and fragmented emails:

- **Students:** Instantly report classroom defects with precise room locations, urgency ratings, and descriptions; monitor live progress; receive automated notifications when work is accepted or resolved.
- **Facility Administrators:** Prioritize complaints, dispatch work orders to maintenance technicians, balance active technician workloads, inspect repair resolution notes, perform final sign-off, and track institutional failure analytics.
- **Maintenance Technicians:** Access an assigned work queue, accept field jobs into active service (`In Progress`), record parts replaced and diagnostic notes, and mark tasks `Completed` for administrative review.

---

## 🚀 Key Production Features

1. **Enterprise Role-Based Access Control (RBAC):**
   - Three distinct operational interfaces: **Student Portal**, **Administrative Console**, and **Maintenance Technician Portal**.
   - Zero-trust security: Student records are strictly isolated. Route guards block unauthorized URL access.
2. **Dual-Tier Database Architecture:**
   - **Cloud Mode:** Integrates directly with **Google Firebase Authentication** and **Cloud Firestore** for real-time multi-device synchronization.
   - **Local Hybrid Persistence:** Automatic fallback and offline sync so the application remains 100% operational in any network environment.
3. **In-App Cloud Configuration Manager:**
   - Administrators can link their Google Firebase Project credentials right from the browser interface without editing code files.
4. **Data-Driven Visual Analytics (Chart.js):**
   - Live breakdown charts: Asset Category Distribution, Priority / SLA Severity, 6-Month Issue Volume Trends, and Resolution Pipeline Health.
   - Automated computation from live database records without placeholder figures.
5. **Accreditation Audit Export:**
   - 1-click **Export CSV** allows administrators to export all filtered campus complaints with resolution notes and timestamps for facility audits and compliance reviews.
6. **Mobile Responsive Architecture:**
   - Full touch-friendly responsive interface with slide-out navigation drawers designed for field technicians using smartphones and tablets.

---

## 🛠️ Technology Stack

- **Frontend:** Semantic HTML5 markup, responsive CSS3 design system (Navy Blue / Professional SaaS Palette), Vanilla JavaScript (ES6+ modular modules).
- **Authentication:** Firebase Authentication (Email/Password) with institutional session management.
- **Database:** Google Cloud Firestore (NoSQL Document Database).
- **Security:** Cloud Firestore Security Rules (`firestore.rules`) enforcing server-level role verification and ownership checks.
- **Data Visualization:** Chart.js library for responsive charts.

---

## 📂 Project Directory Structure

```
MR/ (CIMS Root)
│
├── index.html                  # Secure institutional login portal & password recovery
├── register.html               # Student account self-registration (locked to student role)
├── student-dashboard.html      # Student portal: KPI counters & recent complaints
├── report-issue.html           # Complaint submission form (8 categories, room, urgency, description)
├── my-issues.html              # Student complaints tracker with search and filtering
├── issue-details.html          # Comprehensive ticket view with audit timeline & action controls
├── admin-dashboard.html        # Facility administrative console & KPI dashboard
├── manage-issues.html          # Master issue management console with CSV export
├── manage-staff.html           # Maintenance technician directory & workload supervisor
├── staff-dashboard.html        # Technician workspace & fast task acceptance
├── assigned-tasks.html         # Technician task queue & resolution notes manager
├── reports.html                # Campus facility reports & 4-chart analytics suite
├── profile.html                # User profile, RBAC permissions matrix & password management
│
├── css/
│   ├── style.css               # Design system, typography, color palette, badges, modals
│   ├── dashboard.css           # Statistics cards, chart containers, activity timelines
│   ├── forms.css               # Form controls, category selectors, segmented inputs
│   └── responsive.css          # Mobile drawer & tablet media queries (<992px, <768px)
│
├── js/
│   ├── firebase-config.js.example # Firebase configuration template
│   ├── firebase.js             # Core database service & cloud configuration modal
│   ├── auth.js                 # Authentication service, session manager & route guards
│   ├── student.js              # Student dashboard & complaint submission controller
│   ├── admin.js                # Administrator triage, issue console & staff management
│   ├── staff.js                # Maintenance technician dashboard & repair controller
│   ├── issues.js               # Shared ticket table, CSV exporter & timeline renderer
│   ├── notifications.js        # Bell dropdown notifications & automated status dispatches
│   └── charts.js               # Chart.js analytics engine
│
├── firestore.rules             # Production Cloud Firestore security rules
├── firestore.indexes.json      # Cloud Firestore composite indexes
├── firebase.json               # Firebase hosting and deployment configuration
│
└── documentation/
    ├── requirements.md         # IEEE 830 Software Requirements Specification
    ├── system-design.md        # Architecture diagrams, schemas & sequence flows
    ├── test-cases.md           # 15 comprehensive software verification test cases
    └── limitations.md          # Architectural boundaries and future development roadmap
```

---

## ⚡ How to Run and Deploy

### 1. Launching Locally
Open your terminal in the project directory (`MR`) and run a local web server:

```powershell
# Option A: Using Python (installed on your system)
python -m http.server 5500

# Option B: Using Node.js / npx (installed on your system)
npx serve .
```
Then navigate to: **`http://localhost:5500`** (or open `index.html` directly in Google Chrome / Microsoft Edge).

---

### 2. Default Initial Accounts (Pre-configured for Institutional Setup)

| Role | Email Address | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@college.edu` | `password123` | Full administrative control, staff dispatch, reports, CSV export |
| **Maintenance Staff** | `ramesh.maintenance@college.edu` | `password123` | Task execution, repair notes, status updates (Electrical & AV) |
| **Student** | `aarav.student@college.edu` | `password123` | Submit issues, track complaints, receive notifications |

*Note: New students can self-register at any time via `register.html`. Administrators can provision additional technicians with custom passwords via `manage-staff.html`.*

---

### 3. Connecting to Google Cloud Firebase (Optional for Live Multi-Device Sync)

You can connect CIMS to your live Google Cloud Firebase project either from the user interface or via configuration file:

#### Method A: From the Browser UI (Easiest)
1. On any page, click the **System Status Pill** in the top-right header (or the **Cloud Database Settings** link at the bottom of the login page).
2. Enter your Firebase API Key and Project ID.
3. Click **Connect Cloud**; the page will reload and connect live to Cloud Firestore!

#### Method B: Via Configuration File
1. In the [Firebase Console](https://console.firebase.google.com/), create a project and enable:
   - **Authentication** (Email/Password provider).
   - **Cloud Firestore** (Production mode).
2. Copy `js/firebase-config.js.example` to `js/firebase-config.js` and paste your project credentials:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyYOUR_ACTUAL_API_KEY",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef1234567890"
   };
   ```
3. Deploy Firestore Rules:
   - In the Firebase Console, go to **Firestore Database $\rightarrow$ Rules**, paste the contents of [`firestore.rules`](firestore.rules), and click **Publish**.

---

## 🔒 Security Architecture Highlights

1. **Role-Based Access Control:** Strict client route verification intercepts navigation attempts by unauthorized roles and redirects them to their permitted dashboard.
2. **Student Ownership Verification:** Students can only read and inspect their own submitted tickets. Access to complaints submitted by other students is denied at both client and database levels.
3. **Privilege Escalation Prevention:** Self-registration is strictly locked to `role: "student"`. Administrative and staff accounts can only be provisioned by authenticated administrators.
4. **XSS Sanitization:** All user-submitted text (descriptions, locations, resolution notes) is sanitized via HTML character entity escaping (`escapeHtml()`) before DOM rendering.
5. **Audit Trail Immutability:** Activity logs are strictly append-only; update and deletion permissions are blocked by database security rules.

---

## 📄 License & Attribution
Designed and built for institutional campus facility management. All rights reserved.
