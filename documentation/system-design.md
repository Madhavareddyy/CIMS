# Classroom Issue Management System (CIMS)
## System Design & Architecture Document
**Course:** Software Development Fundamentals (SDF)  
**Standard:** Modular Clean Architecture & Firebase Cloud Integration  

---

## 1. System Architecture Overview

CIMS follows a decoupled, three-tier modular architecture designed for performance, security, and academic clarity:

```mermaid
flowchart TD
    subgraph Client_Presentation_Tier ["Presentation Tier (HTML5 / CSS3)"]
        UI_Student["Student Views (Dashboard, Report, My Issues)"]
        UI_Admin["Admin Views (Console, Staff, Reports)"]
        UI_Staff["Staff Views (Dashboard, Tasks)"]
        UI_Common["Shared Views (Login, Register, Details, Profile)"]
    end

    subgraph Controller_Tier ["Modular JavaScript Application Layer"]
        Auth["auth.js (RBAC & Session)"]
        Issues["issues.js (Ticket Operations & Export)"]
        Student["student.js (Submission & Student Views)"]
        Admin["admin.js (Triage & Staff Admin)"]
        Staff["staff.js (Repair Lifecycle)"]
        Notif["notifications.js (Alert Dispatcher)"]
        Charts["charts.js (Chart.js Visualizer)"]
    end

    subgraph Data_Abstraction_Tier ["Data Abstraction & Security Layer (firebase.js)"]
        DualEngine{"Firebase Config Present?"}
        CloudAdapter["Cloud Firestore & Firebase Auth"]
        LocalAdapter["Evaluation Mock Persistence (localStorage)"]
    end

    subgraph Backend_Cloud_Tier ["Google Firebase Cloud Services"]
        FirebaseAuth["Firebase Authentication"]
        CloudFirestore[("Cloud Firestore NoSQL")]
        SecurityRules["firestore.rules (RBAC Security Enforcement)"]
    end

    Client_Presentation_Tier --> Controller_Tier
    Controller_Tier --> DualEngine
    DualEngine -- "Yes (Live Mode)" --> CloudAdapter
    DualEngine -- "No (Evaluation Mode)" --> LocalAdapter
    CloudAdapter --> FirebaseAuth
    CloudAdapter --> CloudFirestore
    CloudFirestore -.-> SecurityRules
```

---

## 2. Database Schema (Cloud Firestore)

### 2.1 Collection: `users`
Stores user identity profiles, role designations, and institutional details.

| Field Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `uid` | String | Unique document ID (matches Auth UID) | `"student-001"` |
| `fullName` | String | User's full legal name | `"Aarav Gupta"` |
| `email` | String | Official college email address | `"aarav.student@college.edu"` |
| `role` | String | Authorization role: `'student'`, `'admin'`, `'staff'` | `"student"` |
| `studentId` | String | College Roll / Student ID (if student) | `"CS2023045"` |
| `staffId` | String | Employee / Technician ID (if staff) | `"STF-101"` |
| `department` | String | Academic department or maintenance division | `"Computer Science & Engineering"` |
| `specialization` | String | Technical specialization (if staff) | `"Projectors, AV & Electrical"` |
| `phone` | String | Contact phone number | `"+91 98111 22334"` |
| `createdAt` | ISO String / Timestamp | User profile creation timestamp | `"2024-01-10T09:00:00Z"` |

### 2.2 Collection: `issues`
Represents individual classroom defect reports and their operational lifecycle.

| Field Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | String | Unique Firestore Document ID | `"issue-2024-001"` |
| `issueCode` | String | Human-readable tracking identifier | `"CIMS-2024-001"` |
| `studentId` | String | UID of reporting student | `"student-001"` |
| `studentName` | String | Full name of student | `"Aarav Gupta"` |
| `studentEmail` | String | Email of student | `"aarav.student@college.edu"` |
| `category` | String | Issue category: `'Projector'`, `'Fan'`, `'Lighting'`, `'Wi-Fi'`, `'Benches and furniture'`, `'Electrical problems'`, `'Cleanliness'`, `'Other'` | `"Projector"` |
| `classroomNumber` | String | Classroom or lab identifier | `"CS-Lab-3"` |
| `description` | String | Detailed symptom description | `"The ceiling projector lamp flickers violently..."` |
| `priority` | String | Urgency level: `'low'`, `'medium'`, `'high'`, `'urgent'` | `"high"` |
| `status` | String | Ticket status: `'pending'`, `'assigned'`, `'in_progress'`, `'completed'`, `'resolved'`, `'rejected'` | `"in_progress"` |
| `assignedStaffId` | String / Null | UID of assigned maintenance technician | `"staff-101"` |
| `assignedStaffName` | String / Null | Full name of assigned technician | `"Ramesh Sharma"` |
| `assignedAt` | ISO String / Null | Timestamp when staff was assigned | `"2024-02-01T10:30:00Z"` |
| `resolutionNotes` | String | Technician repair findings and actions | `"Replacement lamp bulb requisitioned from store."` |
| `resolvedAt` | ISO String / Null | Timestamp when marked resolved by admin | `"2024-02-02T16:00:00Z"` |
| `createdAt` | ISO String / Timestamp | Timestamp when ticket was created | `"2024-02-01T08:00:00Z"` |
| `updatedAt` | ISO String / Timestamp | Timestamp of latest state change | `"2024-02-01T14:00:00Z"` |

### 2.3 Collection: `activityLogs`
Immutable audit log recording every transition, assignment, and priority modification.

| Field Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | String | Unique log record ID | `"log-101"` |
| `issueId` | String | Target issue document ID | `"issue-2024-001"` |
| `action` | String | Action code: `'ISSUE_CREATED'`, `'STAFF_ASSIGNED'`, `'STATUS_UPDATED'`, `'NOTES_ADDED'`, `'WORK_COMPLETED'`, `'ISSUE_RESOLVED'`, `'ISSUE_REJECTED'` | `"STAFF_ASSIGNED"` |
| `performedBy` | String | Actor's display name | `"Prof. Vikram Malhotra"` |
| `performedByUid` | String | Actor's UID | `"admin-001"` |
| `performedByRole` | String | Actor's role at time of action | `"admin"` |
| `details` | String | Human-readable explanation of modification | `"Assigned to technician Ramesh Sharma."` |
| `timestamp` | ISO String / Timestamp | Timestamp of action | `"2024-02-01T10:30:00Z"` |

### 2.4 Collection: `notifications`
Targeted real-time user notifications.

| Field Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | String | Unique notification ID | `"notif-501"` |
| `userId` | String | Recipient UID | `"student-001"` |
| `title` | String | Concise notification heading | `"Issue In Progress"` |
| `message` | String | Informational message body | `"Your complaint CIMS-2024-001 is being serviced."` |
| `issueId` | String | Associated issue ID for quick click navigation | `"issue-2024-001"` |
| `isRead` | Boolean | Read/unread flag | `false` |
| `createdAt` | ISO String / Timestamp | Creation timestamp | `"2024-02-01T11:00:00Z"` |

---

## 3. Issue Lifecycle State Machine

The issue follows a strict, controlled state transition workflow:

```mermaid
stateDiagram-v2
    [*] --> Pending : Student submits issue report
    Pending --> Assigned : Admin assigns maintenance technician
    Pending --> Rejected : Admin rejects invalid / duplicate issue
    
    Assigned --> In_Progress : Technician accepts task
    Assigned --> Assigned : Admin reassigns to different technician
    Assigned --> Rejected : Admin rejects issue
    
    In_Progress --> Completed : Technician completes repair & enters notes
    
    Completed --> Resolved : Admin verifies completion & closes ticket
    Completed --> In_Progress : Admin requests rework
    
    Resolved --> [*]
    Rejected --> [*]
```

### State Definitions:
1. **Pending:** Initial state when a student logs a complaint. No maintenance staff is yet assigned.
2. **Assigned:** Campus facility administrator has reviewed the complaint, chosen priority, and delegated it to a technician.
3. **In Progress:** Technician has accepted the work order and initiated diagnostic or physical repair.
4. **Completed:** Technician has completed physical repair work, recorded resolution notes, and submitted for review.
5. **Resolved:** Administrator has verified that equipment is operational and closed the ticket. Student is notified.
6. **Rejected:** Ticket is determined to be invalid, duplicate, or non-actionable with documented justification.

---

## 4. Sequence Diagrams

### 4.1 Issue Creation & Notification Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Student Web UI
    participant DB as CIMS Database Layer
    participant Cloud as Cloud Firestore
    actor Admin

    Student->>UI: Fills Category, Room & Description
    UI->>UI: Validates inputs (len >= 10, required fields)
    UI->>DB: createIssue(payload)
    DB->>Cloud: add doc to /issues with status='pending'
    DB->>Cloud: append to /activityLogs (ISSUE_CREATED)
    Cloud-->>DB: Document Created (ID: issue-xxx)
    DB-->>UI: Success Toast & Redirect to My Issues
    Admin->>UI: Views Admin Dashboard
    UI->>Cloud: getIssues() query
    Cloud-->>UI: Real-time update displays new pending issue
```

### 4.2 Maintenance Assignment & Repair Completion Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant UI_Admin as Admin Console
    participant DB as CIMS Database Layer
    actor Staff as Maintenance Staff
    participant UI_Staff as Staff Dashboard
    actor Student

    Admin->>UI_Admin: Selects Staff Member & Clicks 'Assign'
    UI_Admin->>DB: updateIssue(id, {assignedStaffId, status:'assigned'})
    DB->>DB: createNotification(for Staff)
    DB->>DB: createNotification(for Student)
    
    Staff->>UI_Staff: Clicks 'Accept Task'
    UI_Staff->>DB: updateIssue(id, {status:'in_progress'})
    
    Staff->>UI_Staff: Enters Resolution Notes & Clicks 'Mark Completed'
    UI_Staff->>DB: updateIssue(id, {status:'completed', resolutionNotes})
    
    Admin->>UI_Admin: Reviews Notes & Clicks 'Verify & Mark Resolved'
    UI_Admin->>DB: updateIssue(id, {status:'resolved', resolvedAt})
    DB->>DB: createNotification(for Student: 'Issue Resolved')
    Student->>Student: Sees 'Resolved' badge & Bell Notification
```

---

## 5. Role-Based Access Control (RBAC) Matrix

| Operation / Asset | Student | Maintenance Staff | Facility Administrator |
| :--- | :---: | :---: | :---: |
| Self-Registration | Yes (strictly as student) | No (provisioned by admin) | No (restricted setup) |
| View Own Reported Issues | **Yes** | N/A | **Yes** (all campus issues) |
| View Other Students' Issues | **DENIED** | **DENIED** | **Yes** |
| Submit New Issue | **Yes** | No | **Yes** |
| Assign / Reassign Staff | **DENIED** | **DENIED** | **Yes** |
| Change Issue Priority | **DENIED** | **DENIED** | **Yes** |
| Accept Assigned Task | **DENIED** | **Yes** (own queue) | **Yes** |
| Update Resolution Notes | **DENIED** | **Yes** (own queue) | **Yes** |
| Mark Task Completed | **DENIED** | **Yes** (own queue) | **Yes** |
| Mark Issue Resolved | **DENIED** | **DENIED** | **Yes** |
| Reject Issue | **DENIED** | **DENIED** | **Yes** |
| Provision Staff Accounts | **DENIED** | **DENIED** | **Yes** |
| View System Analytics | **DENIED** | **DENIED** | **Yes** |
| Export CSV Audit Data | **DENIED** | **DENIED** | **Yes** |
