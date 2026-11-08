# Classroom Issue Management System (CIMS)
## Software Testing & Verification Specification
**Course:** Software Development Fundamentals (SDF)  
**Document Type:** Test Case Specification & Execution Log  

---

## 1. Test Strategy Overview
Testing for CIMS combines:
- **Unit & Boundary Validation:** Client-side input format checks, required field constraints, character limits.
- **Role-Based Security Testing (RBAC):** Navigation barrier enforcement, direct URL manipulation attempts, role authorization verification.
- **Workflow & Integration Testing:** End-to-end complaint lifecycle from Student submission $\rightarrow$ Admin assignment $\rightarrow$ Staff execution $\rightarrow$ Admin resolution $\rightarrow$ Student notification.
- **Resilience & Correctness:** Persistence across browser reloads, Chart.js accuracy against database records, and responsive mobile viewport testing.

### Execution Status Key:
- `EXECUTED / PASSED`: Test was executed and verified working against actual code implementation.
- `PENDING CLOUD DEPLOYMENT`: Test applies specifically to live remote Firebase Cloud deployment with active cloud rules and requires user's remote Firebase credentials to be linked.

---

## 2. Test Case Roster

### TC-01: Valid Student Login
- **Test ID:** TC-01
- **Test Scenario:** Verify student can successfully authenticate with valid credentials and redirect to Student Dashboard.
- **Test Input:** Email: `aarav.student@college.edu`, Password: `student123`
- **Expected Result:** Authentication succeeds; user profile loaded; redirected to `student-dashboard.html`; welcome banner and student stats rendered.
- **Actual Result:** Authenticated; stored session in localStorage; redirected to `student-dashboard.html`; display shows "Aarav Gupta".
- **Status:** **EXECUTED / PASSED**

---

### TC-02: Invalid Login
- **Test ID:** TC-02
- **Test Scenario:** Verify system rejects incorrect email/password and presents visible user-friendly error feedback.
- **Test Input:** Email: `unknown.user@college.edu`, Password: `wrongpassword`
- **Expected Result:** Authentication fails; form alert box appears with "No user found with this email" or "Incorrect email address or password"; user remains on `index.html`.
- **Actual Result:** Error alert displays prominently in red above the form; submit button resets from loading state.
- **Status:** **EXECUTED / PASSED**

---

### TC-03: Student Registration
- **Test ID:** TC-03
- **Test Scenario:** Verify new student can register an account with valid information and role is strictly assigned as `student`.
- **Test Input:** Full Name: `Neha Sen`, Student ID: `CS2024101`, Department: `Computer Science & Engineering`, Email: `neha.sen@college.edu`, Password: `password123`, Confirm: `password123`
- **Expected Result:** Account created in database; role is hardcoded to `student`; auto-authenticated; redirected to `student-dashboard.html`.
- **Actual Result:** Account added to user repository with `role: "student"`; session initialized; redirected to dashboard.
- **Status:** **EXECUTED / PASSED**

---

### TC-04: Empty Issue Submission
- **Test ID:** TC-04
- **Test Scenario:** Verify system blocks empty or incomplete complaint submission with actionable client-side validation.
- **Test Input:** Category: *None*, Classroom: *""*, Description: *""*
- **Expected Result:** Form blocks submission; alert notifies user: "Please select an issue category" and "Please specify the classroom or lab number."
- **Actual Result:** Validation triggers before database dispatch; error alert rendered; no empty record created.
- **Status:** **EXECUTED / PASSED**

---

### TC-05: Valid Issue Submission
- **Test ID:** TC-05
- **Test Scenario:** Verify student can successfully submit a complete classroom issue report.
- **Test Input:** Category: `Projector`, Classroom: `LH-201`, Priority: `high`, Description: `HDMI port on ceiling projector is damaged and not detecting signal from podium computer.`
- **Expected Result:** Issue generated with auto-generated code `CIMS-2024-XXX`; status set to `pending`; initial audit log `ISSUE_CREATED` recorded; redirected to `my-issues.html`.
- **Actual Result:** Record created with server timestamp; status `pending`; toast notification shown; displayed at the top of `my-issues.html`.
- **Status:** **EXECUTED / PASSED**

---

### TC-06: Issue Tracking
- **Test ID:** TC-06
- **Test Scenario:** Verify student can search, filter, and track status transitions of their submitted complaints.
- **Test Input:** On `my-issues.html`, filter status by `In Progress` and enter search query `LH`.
- **Expected Result:** Table immediately updates showing only matching issues; count badge reflects accurate filtered count.
- **Actual Result:** Real-time client-side filter updates table dynamically; non-matching rows hidden without page reload.
- **Status:** **EXECUTED / PASSED**

---

### TC-07: Admin Issue Assignment
- **Test ID:** TC-07
- **Test Scenario:** Verify campus administrator can assign a pending ticket to a maintenance technician and change priority.
- **Test Input:** Select Issue `CIMS-2024-004`; assign to technician `Ramesh Sharma` (`staff-101`); update priority to `urgent`.
- **Expected Result:** Issue status transitions from `pending` to `assigned`; `assignedStaffId` set to `staff-101`; notifications generated for both staff member and reporting student; activity log recorded.
- **Actual Result:** Issue updated in database; timeline reflects `STAFF_ASSIGNED` and `PRIORITY_CHANGED`; notifications queued.
- **Status:** **EXECUTED / PASSED**

---

### TC-08: Staff Task Updates
- **Test ID:** TC-08
- **Test Scenario:** Verify maintenance technician can accept assigned task, add resolution findings, and flag work as completed.
- **Test Input:** Technician accepts task (transitions to `in_progress`), enters resolution notes: `"Replaced defective HDMI socket and tested video signal with podium laptop. Fully functional."`, clicks `Mark Task as Completed`.
- **Expected Result:** Status transitions to `completed`; resolution notes persisted; student receives notification; ticket awaits admin sign-off.
- **Actual Result:** Status updated to `completed`; notes saved; audit trail entry `WORK_COMPLETED` logged.
- **Status:** **EXECUTED / PASSED**

---

### TC-09: Unauthorized Admin Access
- **Test ID:** TC-09
- **Test Scenario:** Verify that a student attempting direct navigation to `admin-dashboard.html` or `manage-issues.html` is blocked.
- **Test Input:** Logged in as student `aarav.student@college.edu`; manually enter URL in browser address bar: `http://localhost:5500/admin-dashboard.html`.
- **Expected Result:** Route guard in `auth.checkAuth(['admin'])` intercepts navigation; alerts "Access Denied: Your account role (student) is not authorized"; redirects to `student-dashboard.html`.
- **Actual Result:** Route guard triggered; access denied alert shown; browser returned to student dashboard.
- **Status:** **EXECUTED / PASSED**

---

### TC-10: Student Access to Another Student's Issue
- **Test ID:** TC-10
- **Test Scenario:** Verify that Student A cannot view or manipulate an issue submitted by Student B.
- **Test Input:** Student A (`student-001`) manually opens `issue-details.html?id=issue-2024-003` (created by Student B `student-002`).
- **Expected Result:** Client guard detects `currentUser.role === 'student' && issue.studentId !== currentUser.uid`; alerts security violation; redirects to `student-dashboard.html`.
- **Actual Result:** Navigation halted; security alert dialog presented; student prevented from inspecting non-owned ticket.
- **Status:** **EXECUTED / PASSED**

---

### TC-11: Database Persistence After Refresh
- **Test ID:** TC-11
- **Test Scenario:** Verify data integrity and state persistence across page reloads and browser restarts.
- **Test Input:** Submit a new issue; assign staff; refresh browser using `Ctrl+F5` (Hard Reload).
- **Expected Result:** User session remains logged in; all issue changes, resolution notes, and activity timeline persist intact.
- **Actual Result:** State retrieved from persistent store; all modified records retain updated fields.
- **Status:** **EXECUTED / PASSED**

---

### TC-12: Invalid Form Inputs
- **Test ID:** TC-12
- **Test Scenario:** Verify registration and issue submission forms reject malformed inputs (short password, short description).
- **Test Input:** Registration with password `123`; issue report description with 4 characters `fix`.
- **Expected Result:** System enforces password $\ge 6$ characters; issue description enforces $\ge 10$ characters with red warning counter.
- **Actual Result:** Submission rejected; error messages displayed; submit buttons remain disabled or alert triggers.
- **Status:** **EXECUTED / PASSED**

---

### TC-13: Dashboard Statistics Correctness
- **Test ID:** TC-13
- **Test Scenario:** Verify KPI statistic counters and Chart.js analytics match actual database records, without fabricated numbers.
- **Test Input:** Query total issues in database ($N$ issues); calculate count of `pending`, `in_progress`, and `resolved`.
- **Expected Result:** KPI cards on `admin-dashboard.html` exactly equal the sums of issues matching each status in the database.
- **Actual Result:** Counters computed by array filters on live database array; exact 1:1 match verified.
- **Status:** **EXECUTED / PASSED**

---

### TC-14: Responsive Layout on Mobile
- **Test ID:** TC-14
- **Test Scenario:** Verify usability and layout adaptation on mobile viewport width (375px - 768px).
- **Test Input:** Browser resized to 375px width (iPhone / Android viewport).
- **Expected Result:** Sidebar collapses off-canvas; hamburger button appears in header; clicking hamburger opens slide-out drawer; tables scroll horizontally without breaking container; cards stack into single column.
- **Actual Result:** Responsive CSS media queries trigger; mobile drawer opens with overlay; touch targets conform to mobile standards.
- **Status:** **EXECUTED / PASSED**

---

### TC-15: Database Permission Restrictions (Cloud Rules)
- **Test ID:** TC-15
- **Test Scenario:** Verify Cloud Firestore security rules reject direct unauthorized writes from non-admin accounts.
- **Test Input:** Send simulated Firestore SDK write modifying `users/{uid}` with `role: "admin"` from student token.
- **Expected Result:** Cloud Firestore rule `isOwner(userId) && request.resource.data.role == resource.data.role` rejects modification with `PERMISSION_DENIED`.
- **Actual Result:** Firestore rule syntax and logic verified against specification. Live enforcement verified upon linking active Firebase Cloud project.
- **Status:** **PENDING CLOUD DEPLOYMENT** (Rule logic verified; requires remote Firebase deployment to execute live network test).

---

## 3. Summary of Execution Results
- **Total Test Cases:** 15
- **Executed and Passed:** 14 (93.3%)
- **Pending Remote Deployment:** 1 (6.7% - TC-15 Remote Firestore Rule Live Network Execution)
- **Failed Tests:** 0
