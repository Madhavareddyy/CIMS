/**
 * CLASSROOM ISSUE MANAGEMENT SYSTEM (CIMS)
 * Enterprise Database & Firebase Integration Service
 * Production-ready hybrid cloud integration layer with local offline persistence
 */

window.CIMS = window.CIMS || {};

// Standard Production Seed Data for Campus Facility Operations
const INITIAL_STAFF_MEMBERS = [
  {
    uid: "staff-101",
    fullName: "Ramesh Sharma",
    email: "ramesh.maintenance@college.edu",
    password: "password123",
    role: "staff",
    department: "Electrical & AV",
    phone: "+91 98765 43210",
    staffId: "STF-101",
    specialization: "Projectors, AV & Electrical",
    activeTasks: 1,
    createdAt: new Date("2024-01-15T10:00:00Z").toISOString()
  },
  {
    uid: "staff-102",
    fullName: "Suresh Patel",
    email: "suresh.maintenance@college.edu",
    password: "password123",
    role: "staff",
    department: "HVAC & Electrical",
    phone: "+91 98765 43211",
    staffId: "STF-102",
    specialization: "Fans, Air Conditioners & Lighting",
    activeTasks: 1,
    createdAt: new Date("2024-01-16T11:00:00Z").toISOString()
  },
  {
    uid: "staff-103",
    fullName: "Anita Verma",
    email: "anita.network@college.edu",
    password: "password123",
    role: "staff",
    department: "Network & IT Support",
    phone: "+91 98765 43212",
    staffId: "STF-103",
    specialization: "Campus Wi-Fi, Routers & LAN",
    activeTasks: 1,
    createdAt: new Date("2024-02-01T09:00:00Z").toISOString()
  },
  {
    uid: "staff-104",
    fullName: "Manoj Kumar",
    email: "manoj.civil@college.edu",
    password: "password123",
    role: "staff",
    department: "Civil & Carpentry",
    phone: "+91 98765 43213",
    staffId: "STF-104",
    specialization: "Benches, Furniture & Cleanliness",
    activeTasks: 0,
    createdAt: new Date("2024-02-10T14:00:00Z").toISOString()
  }
];

const INITIAL_USERS = [
  {
    uid: "admin-001",
    fullName: "Prof. Vikram Malhotra",
    email: "admin@college.edu",
    password: "password123",
    role: "admin",
    department: "Campus Estate & Facility Management",
    staffId: "ADM-001",
    phone: "+91 98000 11223",
    createdAt: new Date("2024-01-01T08:00:00Z").toISOString()
  },
  {
    uid: "student-001",
    fullName: "Aarav Gupta",
    email: "aarav.student@college.edu",
    password: "password123",
    role: "student",
    department: "Computer Science & Engineering",
    studentId: "CS2023045",
    phone: "+91 98111 22334",
    createdAt: new Date("2024-01-10T09:00:00Z").toISOString()
  },
  {
    uid: "student-002",
    fullName: "Priya Sundaram",
    email: "priya.student@college.edu",
    password: "password123",
    role: "student",
    department: "Information Technology",
    studentId: "IT2023012",
    phone: "+91 98222 33445",
    createdAt: new Date("2024-01-12T10:00:00Z").toISOString()
  },
  ...INITIAL_STAFF_MEMBERS
];

const INITIAL_ISSUES = [
  {
    id: "issue-2024-001",
    issueCode: "CIMS-2024-001",
    studentId: "student-001",
    studentName: "Aarav Gupta",
    studentEmail: "aarav.student@college.edu",
    category: "Projector",
    classroomNumber: "CS-Lab-3",
    description: "The ceiling projector lamp is flickering violently and turns off abruptly after 5 minutes of operation. Lab faculty cannot project lecture slides.",
    priority: "high",
    status: "in_progress",
    assignedStaffId: "staff-101",
    assignedStaffName: "Ramesh Sharma",
    assignedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    resolutionNotes: "Checked HDMI cables and verified lamp hours. Replacement lamp bulb requisitioned from store. Replacing bulb today.",
    resolvedAt: null,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: "issue-2024-002",
    issueCode: "CIMS-2024-002",
    studentId: "student-001",
    studentName: "Aarav Gupta",
    studentEmail: "aarav.student@college.edu",
    category: "Wi-Fi",
    classroomNumber: "LH-102",
    description: "Campus Wi-Fi access point in Lecture Hall 102 has no internet throughput. SSIDs 'College_Student_Wi-Fi' shows connected without internet.",
    priority: "medium",
    status: "assigned",
    assignedStaffId: "staff-103",
    assignedStaffName: "Anita Verma",
    assignedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    resolutionNotes: "",
    resolvedAt: null,
    createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: "issue-2024-003",
    issueCode: "CIMS-2024-003",
    studentId: "student-002",
    studentName: "Priya Sundaram",
    studentEmail: "priya.student@college.edu",
    category: "Fan",
    classroomNumber: "LH-204",
    description: "Ceiling fan #3 makes a loud grinding noise and wobbles noticeably at medium and high speeds. Risk of falling.",
    priority: "urgent",
    status: "in_progress",
    assignedStaffId: "staff-102",
    assignedStaffName: "Suresh Patel",
    assignedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    resolutionNotes: "Fan isolated from power switchboard. Bearings need grease and bracket tightening.",
    resolvedAt: null,
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  },
  {
    id: "issue-2024-004",
    issueCode: "CIMS-2024-004",
    studentId: "student-002",
    studentName: "Priya Sundaram",
    studentEmail: "priya.student@college.edu",
    category: "Electrical problems",
    classroomNumber: "Seminar-Hall-B",
    description: "The primary power strip near podium sparks when plugging in laptops. MCB tripped twice during morning session.",
    priority: "urgent",
    status: "pending",
    assignedStaffId: null,
    assignedStaffName: null,
    assignedAt: null,
    resolutionNotes: "",
    resolvedAt: null,
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
  },
  {
    id: "issue-2024-005",
    issueCode: "CIMS-2024-005",
    studentId: "student-001",
    studentName: "Aarav Gupta",
    studentEmail: "aarav.student@college.edu",
    category: "Lighting",
    classroomNumber: "LH-105",
    description: "Three tube lights in the rear rows are dead, causing dim lighting during afternoon classes.",
    priority: "low",
    status: "resolved",
    assignedStaffId: "staff-101",
    assignedStaffName: "Ramesh Sharma",
    assignedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    resolutionNotes: "Replaced 3 defective 36W LED batten fixtures and tested circuit. Fully functional.",
    resolvedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString()
  },
  {
    id: "issue-2024-006",
    issueCode: "CIMS-2024-006",
    studentId: "student-002",
    studentName: "Priya Sundaram",
    studentEmail: "priya.student@college.edu",
    category: "Benches and furniture",
    classroomNumber: "LH-301",
    description: "Fourth row bench seat has splintered wood with exposed nail heads. Unsafe for students to sit.",
    priority: "medium",
    status: "completed",
    assignedStaffId: "staff-104",
    assignedStaffName: "Manoj Kumar",
    assignedAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    resolutionNotes: "Secured wooden plank with recessed screws and sanded surface smooth. Ready for admin verification.",
    resolvedAt: null,
    createdAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  }
];

const INITIAL_ACTIVITY_LOGS = [
  {
    id: "log-1",
    issueId: "issue-2024-001",
    action: "ISSUE_CREATED",
    performedBy: "Aarav Gupta",
    performedByUid: "student-001",
    performedByRole: "student",
    details: "Issue reported with priority 'High'.",
    timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  {
    id: "log-2",
    issueId: "issue-2024-001",
    action: "STAFF_ASSIGNED",
    performedBy: "Prof. Vikram Malhotra",
    performedByUid: "admin-001",
    performedByRole: "admin",
    details: "Assigned to helpdesk agent Ramesh Sharma. Status set to 'Assigned'.",
    timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  },
  {
    id: "log-3",
    issueId: "issue-2024-001",
    action: "STATUS_UPDATED",
    performedBy: "Ramesh Sharma",
    performedByUid: "staff-101",
    performedByRole: "staff",
    details: "Task accepted. Status updated to 'In Progress'. Added note: Replaced lamp bulb requisitioned.",
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: "log-4",
    issueId: "issue-2024-005",
    action: "ISSUE_RESOLVED",
    performedBy: "Prof. Vikram Malhotra",
    performedByUid: "admin-001",
    performedByRole: "admin",
    details: "Completion verified and marked as 'Resolved'.",
    timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString()
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    userId: "student-001",
    title: "Issue In Progress",
    message: "Your complaint CIMS-2024-001 (Projector in CS-Lab-3) is now being serviced by Ramesh Sharma.",
    issueId: "issue-2024-001",
    isRead: false,
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: "notif-2",
    userId: "student-001",
    title: "Issue Resolved",
    message: "Complaint CIMS-2024-005 (Lighting in LH-105) has been successfully resolved.",
    issueId: "issue-2024-005",
    isRead: true,
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString()
  },
  {
    id: "notif-3",
    userId: "staff-101",
    title: "New Task Assigned",
    message: "You have been assigned to repair Projector in CS-Lab-3 (Priority: High).",
    issueId: "issue-2024-001",
    isRead: true,
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  }
];

class CIMSFirebaseService {
  constructor() {
    this.isCloud = false;
    this.auth = null;
    this.firestore = null;
    this.init();
  }

  // Detect configuration: checks window.FIREBASE_CONFIG or stored config
  getConfig() {
    if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey && !window.FIREBASE_CONFIG.apiKey.includes("YOUR_")) {
      return window.FIREBASE_CONFIG;
    }
    const stored = localStorage.getItem("cims_cloud_config");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Save live Firebase configuration from admin settings
  saveCloudConfig(configObj) {
    localStorage.setItem("cims_cloud_config", JSON.stringify(configObj));
    window.location.reload();
  }

  init() {
    this.initStorage();
    const config = this.getConfig();

    if (config && config.apiKey && typeof firebase !== "undefined" && firebase.initializeApp) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(config);
        }
        this.auth = firebase.auth();
        this.firestore = firebase.firestore();
        this.isCloud = true;
        console.log("CIMS: Connected to Cloud Firebase successfully.");
      } catch (err) {
        console.warn("CIMS: Firebase initialization notice:", err);
        this.isCloud = false;
      }
    } else {
      this.isCloud = false;
    }
  }

  initStorage() {
    const existingIssues = localStorage.getItem("cims_issues");
    const issuesEmpty = !existingIssues || JSON.parse(existingIssues).length === 0;

    if (!localStorage.getItem("cims_initialized") || issuesEmpty) {
      localStorage.setItem("cims_users", JSON.stringify(INITIAL_USERS));
      localStorage.setItem("cims_issues", JSON.stringify(INITIAL_ISSUES));
      localStorage.setItem("cims_activity_logs", JSON.stringify(INITIAL_ACTIVITY_LOGS));
      localStorage.setItem("cims_notifications", JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem("cims_initialized", "true");
    }
  }

  // --- ISSUES API ---
  async getIssues(filter = {}) {
    let cloudIssues = [];
    if (this.isCloud && this.firestore) {
      try {
        let query = this.firestore.collection("issues");
        if (filter.studentId) {
          query = query.where("studentId", "==", filter.studentId);
        }
        if (filter.assignedStaffId) {
          query = query.where("assignedStaffId", "==", filter.assignedStaffId);
        }
        if (filter.status) {
          query = query.where("status", "==", filter.status);
        }
        // Notice: Avoid composite index requirements in Firestore by omitting .orderBy() on compound queries
        const snapshot = await query.get();
        cloudIssues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("Firestore getIssues error (falling back to institutional storage):", err);
      }
    }

    const localIssues = JSON.parse(localStorage.getItem("cims_issues") || "[]");

    // Merge cloud and local issues uniquely by id or issueCode
    const combined = [...cloudIssues];
    localIssues.forEach(loc => {
      const exists = combined.some(c => c.id === loc.id || (loc.issueCode && c.issueCode === loc.issueCode));
      if (!exists) {
        combined.push(loc);
      }
    });

    // Apply all filters in JavaScript for guaranteed reliability
    let issues = combined;
    if (filter.studentId) {
      issues = issues.filter(i => 
        i.studentId === filter.studentId || 
        (filter.email && i.studentEmail && i.studentEmail.toLowerCase() === filter.email.toLowerCase())
      );
    }
    if (filter.assignedStaffId) {
      issues = issues.filter(i => 
        i.assignedStaffId === filter.assignedStaffId || 
        (filter.staffId && i.assignedStaffId === filter.staffId)
      );
    }
    if (filter.status) {
      issues = issues.filter(i => i.status === filter.status);
    }
    if (filter.category) {
      issues = issues.filter(i => i.category === filter.category);
    }
    if (filter.priority) {
      issues = issues.filter(i => i.priority === filter.priority);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      issues = issues.filter(i => 
        (i.classroomNumber && i.classroomNumber.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q)) ||
        (i.issueCode && i.issueCode.toLowerCase().includes(q)) ||
        (i.studentName && i.studentName.toLowerCase().includes(q)) ||
        (i.assignedStaffName && i.assignedStaffName.toLowerCase().includes(q))
      );
    }
    return issues.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  async getIssueById(issueId) {
    if (!issueId) return null;

    if (this.isCloud && this.firestore) {
      try {
        const doc = await this.firestore.collection("issues").doc(issueId).get();
        if (doc.exists) {
          return { id: doc.id, ...doc.data() };
        }
      } catch (e) {
        console.warn("Firestore getIssueById check notice:", e);
      }
    }

    const issues = JSON.parse(localStorage.getItem("cims_issues") || "[]");
    return issues.find(i => i.id === issueId || i.issueCode === issueId) || null;
  }

  async createIssue(issueData) {
    const timestamp = new Date().toISOString();
    const issueCode = "CIMS-" + new Date().getFullYear() + "-" + String(Math.floor(100 + Math.random() * 900));

    const payload = {
      ...issueData,
      issueCode,
      status: "pending",
      assignedStaffId: null,
      assignedStaffName: null,
      assignedAt: null,
      resolutionNotes: "",
      resolvedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    let newId = "issue-" + Date.now();

    if (this.isCloud && this.firestore) {
      try {
        const docRef = await this.firestore.collection("issues").add(payload);
        newId = docRef.id;
      } catch (e) {
        console.warn("Firestore createIssue fallback to local:", e);
      }
    }

    const newRecord = { id: newId, ...payload };
    const issues = JSON.parse(localStorage.getItem("cims_issues") || "[]");
    issues.unshift(newRecord);
    localStorage.setItem("cims_issues", JSON.stringify(issues));

    await this.addActivityLog({
      issueId: newId,
      action: "ISSUE_CREATED",
      performedBy: issueData.studentName,
      performedByUid: issueData.studentId,
      performedByRole: "student",
      details: `Issue reported in ${issueData.classroomNumber} with priority '${issueData.priority}'.`
    });

    return newRecord;
  }

  async updateIssue(issueId, updateFields, actorInfo = null) {
    const timestamp = new Date().toISOString();
    const dataToSave = { ...updateFields, updatedAt: timestamp };

    // 1. Update in local storage
    const issues = JSON.parse(localStorage.getItem("cims_issues") || "[]");
    const index = issues.findIndex(i => i.id === issueId || i.issueCode === issueId);
    let updatedRecord = null;
    if (index !== -1) {
      issues[index] = { ...issues[index], ...dataToSave };
      localStorage.setItem("cims_issues", JSON.stringify(issues));
      updatedRecord = issues[index];
    } else {
      updatedRecord = { id: issueId, ...dataToSave };
      issues.unshift(updatedRecord);
      localStorage.setItem("cims_issues", JSON.stringify(issues));
    }

    // 2. Update in Cloud Firestore if available
    if (this.isCloud && this.firestore) {
      try {
        await this.firestore.collection("issues").doc(issueId).set(dataToSave, { merge: true });
      } catch (err) {
        console.warn("Firestore updateIssue notice:", err);
      }
    }

    // 3. Log activity
    if (actorInfo) {
      await this.addActivityLog({
        issueId,
        action: actorInfo.action || "STATUS_UPDATED",
        performedBy: actorInfo.name,
        performedByUid: actorInfo.uid,
        performedByRole: actorInfo.role,
        details: actorInfo.details || "Issue record updated."
      });
    }

    return updatedRecord;
  }

  // --- ACTIVITY LOGS API ---
  async getActivityLogs(issueId) {
    let cloudLogs = [];
    if (this.isCloud && this.firestore) {
      try {
        const snap = await this.firestore.collection("activityLogs")
          .where("issueId", "==", issueId)
          .get();
        cloudLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        console.warn("Firestore getActivityLogs notice:", e);
      }
    }

    const localLogs = JSON.parse(localStorage.getItem("cims_activity_logs") || "[]")
      .filter(l => l.issueId === issueId);

    const merged = [...cloudLogs];
    localLogs.forEach(loc => {
      if (!merged.some(m => m.id === loc.id || (m.timestamp === loc.timestamp && m.action === loc.action))) {
        merged.push(loc);
      }
    });

    return merged.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
  }

  async addActivityLog(logData) {
    const payload = {
      ...logData,
      timestamp: logData.timestamp || new Date().toISOString()
    };

    const logs = JSON.parse(localStorage.getItem("cims_activity_logs") || "[]");
    const newLog = { id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4), ...payload };
    logs.unshift(newLog);
    localStorage.setItem("cims_activity_logs", JSON.stringify(logs));

    if (this.isCloud && this.firestore) {
      try {
        await this.firestore.collection("activityLogs").add(payload);
      } catch (err) {
        console.warn("Firestore addActivityLog notice:", err);
      }
    }

    return newLog;
  }

  // --- NOTIFICATIONS API ---
  async getNotifications(userId) {
    let cloudNotifs = [];
    if (this.isCloud && this.firestore) {
      try {
        const snap = await this.firestore.collection("notifications")
          .where("userId", "==", userId)
          .get();
        cloudNotifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        console.warn("Firestore getNotifications notice:", e);
      }
    }

    const localNotifs = JSON.parse(localStorage.getItem("cims_notifications") || "[]")
      .filter(n => n.userId === userId);

    const merged = [...cloudNotifs];
    localNotifs.forEach(loc => {
      if (!merged.some(m => m.id === loc.id)) {
        merged.push(loc);
      }
    });

    return merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 20);
  }

  async createNotification(notifData) {
    const payload = {
      ...notifData,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    const notifs = JSON.parse(localStorage.getItem("cims_notifications") || "[]");
    const newNotif = { id: "notif-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4), ...payload };
    notifs.unshift(newNotif);
    localStorage.setItem("cims_notifications", JSON.stringify(notifs));

    if (this.isCloud && this.firestore) {
      try {
        await this.firestore.collection("notifications").add(payload);
      } catch (err) {
        console.warn("Firestore createNotification notice:", err);
      }
    }

    return newNotif;
  }

  async markNotificationAsRead(notifId) {
    const notifs = JSON.parse(localStorage.getItem("cims_notifications") || "[]");
    const idx = notifs.findIndex(n => n.id === notifId);
    if (idx !== -1) {
      notifs[idx].isRead = true;
      localStorage.setItem("cims_notifications", JSON.stringify(notifs));
    }

    if (this.isCloud && this.firestore) {
      try {
        await this.firestore.collection("notifications").doc(notifId).update({ isRead: true });
      } catch (e) {
        console.warn("Firestore markNotificationAsRead notice:", e);
      }
    }
  }

  // --- USERS & STAFF API ---
  async getUsers(role = null) {
    let cloudUsers = [];
    if (this.isCloud && this.firestore) {
      try {
        let query = this.firestore.collection("users");
        if (role) {
          query = query.where("role", "==", role);
        }
        const snap = await query.get();
        cloudUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      } catch (e) {
        console.warn("Firestore getUsers notice:", e);
      }
    }

    const localUsers = JSON.parse(localStorage.getItem("cims_users") || "[]");
    const merged = [...cloudUsers];
    localUsers.forEach(lu => {
      if (!merged.some(cu => cu.uid === lu.uid || (lu.email && cu.email === lu.email))) {
        if (!role || lu.role === role) merged.push(lu);
      }
    });

    return role ? merged.filter(u => u.role === role) : merged;
  }

  async getUserById(uid) {
    if (!uid) return null;
    if (this.isCloud && this.firestore) {
      try {
        const doc = await this.firestore.collection("users").doc(uid).get();
        if (doc.exists) return { uid: doc.id, ...doc.data() };
      } catch (e) {
        console.warn("Firestore getUserById notice:", e);
      }
    }

    const users = JSON.parse(localStorage.getItem("cims_users") || "[]");
    return users.find(u => u.uid === uid || u.email === uid) || null;
  }

  async createUser(userData) {
    const users = JSON.parse(localStorage.getItem("cims_users") || "[]");
    const existingIdx = users.findIndex(u => u.uid === userData.uid || u.email === userData.email);
    if (existingIdx !== -1) {
      users[existingIdx] = { ...users[existingIdx], ...userData };
    } else {
      users.push(userData);
    }
    localStorage.setItem("cims_users", JSON.stringify(users));

    if (this.isCloud && this.firestore) {
      try {
        await this.firestore.collection("users").doc(userData.uid).set(userData, { merge: true });
      } catch (e) {
        console.warn("Firestore createUser notice:", e);
      }
    }

    return userData;
  }

  async updateUser(uid, fields) {
    const users = JSON.parse(localStorage.getItem("cims_users") || "[]");
    const idx = users.findIndex(u => u.uid === uid);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...fields };
      localStorage.setItem("cims_users", JSON.stringify(users));
    }

    if (this.isCloud && this.firestore) {
      try {
        await this.firestore.collection("users").doc(uid).update(fields);
      } catch (e) {
        console.warn("Firestore updateUser notice:", e);
      }
    }
  }
}

window.CIMS.db = new CIMSFirebaseService();

// UI Utility Helpers
window.CIMS.utils = {
  escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  formatDate(dateString) {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  },

  formatRelativeTime(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - d) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  },

  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${this.escapeHtml(message)}</span>
      <button style="background:none;border:none;color:#fff;cursor:pointer;font-size:16px;line-height:1;" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 4500);
  },

  renderStatusBadge(status) {
    const s = (status || "").toLowerCase();
    const labels = {
      pending: "Pending",
      assigned: "Assigned",
      in_progress: "In Progress",
      completed: "Completed",
      resolved: "Resolved",
      rejected: "Rejected"
    };
    return `<span class="badge badge-${this.escapeHtml(s)}">${labels[s] || this.escapeHtml(status)}</span>`;
  },

  renderPriorityPill(priority) {
    const p = (priority || "").toLowerCase();
    return `<span class="priority-pill priority-${this.escapeHtml(p)}">${this.escapeHtml(priority || "N/A")}</span>`;
  },

  // Subtle institutional status pill in header
  renderSystemStatus() {
    const isCloud = window.CIMS.db.isCloud;
    const containers = document.querySelectorAll(".system-status-indicator");
    containers.forEach(el => {
      el.innerHTML = isCloud
        ? `<span class="status-dot"></span> Cloud Connected`
        : `<span class="status-dot offline"></span> Campus Database (Local)`;
      el.title = isCloud
        ? "Connected to Google Cloud Firestore database"
        : "Running on local institutional storage. Click to configure Firebase Cloud if desired.";
      el.style.cursor = "pointer";
      el.onclick = () => window.CIMS.utils.showCloudConfigModal();
    });
  },

  // In-app Cloud Configuration Modal (so real users don't need to manually edit code files)
  showCloudConfigModal() {
    let modal = document.getElementById("cloudConfigModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "cloudConfigModal";
      modal.className = "modal-backdrop";
      modal.innerHTML = `
        <div class="modal" style="max-width:560px;">
          <div class="modal-header">
            <h3>Cloud Database Settings</h3>
            <button class="modal-close" onclick="this.closest('.modal-backdrop').classList.remove('show')">&times;</button>
          </div>
          <div class="modal-body">
            <p style="font-size:13px;color:var(--color-navy-muted);margin-bottom:16px;line-height:1.5;">
              Connect this portal to your real <strong>Google Firebase Project</strong> for live multi-user cloud synchronization across devices.
            </p>
            <div class="form-group">
              <label class="form-label">Firebase API Key <span class="required">*</span></label>
              <input type="text" id="cfgApiKey" class="form-control" placeholder="AIzaSy...">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Project ID <span class="required">*</span></label>
                <input type="text" id="cfgProjectId" class="form-control" placeholder="my-college-cims">
              </div>
              <div class="form-group">
                <label class="form-label">Auth Domain</label>
                <input type="text" id="cfgAuthDomain" class="form-control" placeholder="my-college-cims.firebaseapp.com">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">App ID</label>
              <input type="text" id="cfgAppId" class="form-control" placeholder="1:123456789012:web:abcdef...">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-backdrop').classList.remove('show')">Close</button>
            <button type="button" class="btn btn-primary" id="btnSaveCloudConfig">Connect Cloud</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById("btnSaveCloudConfig").onclick = () => {
        const apiKey = document.getElementById("cfgApiKey").value.trim();
        const projectId = document.getElementById("cfgProjectId").value.trim();
        const authDomain = document.getElementById("cfgAuthDomain").value.trim() || `${projectId}.firebaseapp.com`;
        const appId = document.getElementById("cfgAppId").value.trim();

        if (!apiKey || !projectId) {
          alert("Please provide at least your Firebase API Key and Project ID.");
          return;
        }

        window.CIMS.db.saveCloudConfig({
          apiKey,
          projectId,
          authDomain,
          appId,
          storageBucket: `${projectId}.appspot.com`
        });
      };
    }

    const currentCfg = window.CIMS.db.getConfig();
    if (currentCfg) {
      if (document.getElementById("cfgApiKey")) document.getElementById("cfgApiKey").value = currentCfg.apiKey || "";
      if (document.getElementById("cfgProjectId")) document.getElementById("cfgProjectId").value = currentCfg.projectId || "";
      if (document.getElementById("cfgAuthDomain")) document.getElementById("cfgAuthDomain").value = currentCfg.authDomain || "";
      if (document.getElementById("cfgAppId")) document.getElementById("cfgAppId").value = currentCfg.appId || "";
    }

    modal.classList.add("show");
  }
};
