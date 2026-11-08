# Classroom Issue Management System (CIMS)
## Limitations & Future Enhancements Document
**Course:** Software Development Fundamentals (SDF)  
**Scope:** Academic Assignment Evaluation & Enterprise Roadmap  

---

## 1. Academic Project Scope & Boundaries
CIMS was engineered to demonstrate core principles of **Software Development Fundamentals (SDF)**:
- Modular JavaScript architecture (ES6+) without reliance on heavyweight frontend frameworks (React, Angular, Vue).
- Real-world database design using Cloud Firestore NoSQL collections.
- Strict security architecture using client route guards and declarative Cloud Firestore Security Rules (`firestore.rules`).
- Responsive, accessible SaaS-grade UI design with HTML5 and CSS3.

Because this project is designed for academic clarity and evaluative transparency, specific enterprise and infrastructural boundaries were deliberately established.

---

## 2. Current System Limitations

### 2.1 Backend Serverless Constraints
- **Absence of Dedicated Custom API Server:** CIMS relies directly on Google Firebase SDKs (Client-to-Cloud architecture). While this simplifies deployment and minimizes server maintenance, it requires database business logic and authorization to be enforced through Firebase Security Rules rather than backend microservice middleware.
- **Client-Side Notification Generation:** Notifications are created client-side by application service methods (`CIMS.notifications.notifyStatusChange`). In a large-scale commercial system, these would typically be triggered server-side via Firebase Cloud Functions in response to Firestore database triggers (`onUpdate`).

### 2.2 Live Firebase Cloud Configuration Requirement
- **Dual-Engine Architecture:** The application includes a self-contained Evaluation Demo Mode that runs completely locally without external network dependencies.
- **Features Requiring Live Firebase Project:**
  - Real-time cross-device data synchronization across different physical computers.
  - Multi-user remote concurrent access over the internet.
  - Production-tier Firebase Authentication email verification.
  - Server-enforced Cloud Firestore rules execution.

### 2.3 Media & Attachment Storage
- In the current baseline assignment version, issues focus on structured textual metadata, location, urgency, and category. Direct image upload of broken hardware to Cloud Storage for Firebase can be configured as an add-on.

---

## 3. Future Enhancements Roadmap

### 3.1 QR Code & NFC Classroom Identification
- **Doorway QR Placards:** Mount weatherproof QR codes on each classroom and lab entrance.
- **Instant Scan & Report:** Students or faculty scanning the QR code with their mobile device are routed directly to `report-issue.html?room=LH-204`, auto-populating the classroom number and displaying current active tickets in that room to eliminate duplicate submissions.

### 3.2 Automated SLA Escalation & Scheduled Webhooks
- **SLA Breach Timers:** Integrate automated background chronometers. If an `urgent` electrical or safety defect remains unassigned for $> 2$ hours or in progress for $> 24$ hours, the system automatically escalates notification alerts to the Head of Campus Estates.
- **Firebase Cloud Functions:** Implement event-driven backend functions to dispatch SMS or WhatsApp alerts to technicians on duty.

### 3.3 Artificial Intelligence / Computer Vision Diagnostics
- **Photo Defect Classifier:** Leverage Google Cloud Vision API to inspect uploaded photos of broken fixtures, automatically recommending the category (e.g. detecting a shattered projector lens or burned electrical plug) and estimating repair priority.

### 3.4 Native Mobile Application for Technicians
- **Offline Field Mode:** Provide maintenance staff with a lightweight mobile app (or Progressive Web App - PWA) with service workers, allowing technicians in basement classrooms with poor Wi-Fi connectivity to review work orders and sync completed checklists once connectivity is restored.

### 3.5 Preventative Maintenance Scheduling
- **Periodic Asset Inspections:** Expand CIMS from purely reactive student complaints to recurring preventative maintenance (e.g., scheduled quarterly projector filter cleanings, monthly fire extinguisher checks, and semester-break bench repairs).
