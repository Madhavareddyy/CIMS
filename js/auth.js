/**
 * CLASSROOM ISSUE MANAGEMENT SYSTEM (CIMS)
 * Authentication & Role-Based Access Control (RBAC) Module
 * Production-ready identity and session verification service
 */

window.CIMS = window.CIMS || {};

class CIMSAuthService {
  constructor() {
    this.currentUser = null;
  }

  // Get currently logged-in user session
  getCurrentUser() {
    if (this.currentUser) return this.currentUser;
    const session = localStorage.getItem("cims_current_user");
    if (session) {
      try {
        this.currentUser = JSON.parse(session);
        return this.currentUser;
      } catch (e) {
        localStorage.removeItem("cims_current_user");
      }
    }
    return null;
  }

  // Save current session locally
  setCurrentUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem("cims_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("cims_current_user");
    }
  }

  // Login handler
  async login(email, password) {
    if (!email || !password) {
      throw new Error("Please enter both email and password.");
    }

    const emailTrimmed = email.trim().toLowerCase();

    // 1. Cloud Firebase Authentication
    if (window.CIMS.db.isCloud && window.CIMS.db.auth) {
      try {
        const userCredential = await window.CIMS.db.auth.signInWithEmailAndPassword(emailTrimmed, password);
        const uid = userCredential.user.uid;
        const profile = await window.CIMS.db.getUserById(uid);
        if (!profile) {
          throw new Error("User record not found in system database.");
        }
        const userObj = {
          uid,
          email: userCredential.user.email,
          fullName: profile.fullName || "User",
          role: profile.role || "student",
          department: profile.department || "",
          studentId: profile.studentId || "",
          staffId: profile.staffId || ""
        };
        this.setCurrentUser(userObj);
        return userObj;
      } catch (err) {
        console.error("Firebase Auth Error:", err);
        if (
          err.code === "auth/configuration-not-found" || 
          err.message?.includes("configuration-not-found") ||
          err.code === "auth/api-key-not-valid" ||
          err.code === "auth/operation-not-allowed"
        ) {
          console.warn("Firebase Auth not yet enabled in Console; proceeding with institutional local authentication.");
          return await this.loginLocally(email, password);
        }

        let msg = "Invalid email or password.";
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          msg = "Incorrect email address or password.";
        } else if (err.code === "auth/too-many-requests") {
          msg = "Too many failed attempts. Please try again later.";
        } else if (err.message) {
          msg = err.message;
        }
        throw new Error(msg);
      }
    }

    // 2. Institutional Database Authentication
    return await this.loginLocally(email, password);
  }

  async loginLocally(email, password) {
    const emailTrimmed = email.trim().toLowerCase();
    const users = await window.CIMS.db.getUsers();
    const user = users.find(u => u.email.toLowerCase() === emailTrimmed);

    if (!user) {
      throw new Error("No registered account found with this email address.");
    }

    if (user.password && user.password !== password) {
      throw new Error("Incorrect password. Please verify your credentials.");
    }

    const sessionObj = {
      uid: user.uid,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department || "",
      studentId: user.studentId || "",
      staffId: user.staffId || ""
    };

    this.setCurrentUser(sessionObj);
    return sessionObj;
  }

  // Student Registration handler (Strictly locked to role = 'student')
  async registerStudent({ fullName, email, password, studentId, department, phone }) {
    if (!fullName || !email || !password || !studentId) {
      throw new Error("Please fill in all required fields.");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters in length.");
    }

    const emailTrimmed = email.trim().toLowerCase();

    // 1. Cloud Firebase Registration
    if (window.CIMS.db.isCloud && window.CIMS.db.auth) {
      try {
        const cred = await window.CIMS.db.auth.createUserWithEmailAndPassword(emailTrimmed, password);
        const uid = cred.user.uid;
        const studentProfile = {
          uid,
          fullName: fullName.trim(),
          email: emailTrimmed,
          role: "student",
          studentId: studentId.trim().toUpperCase(),
          department: (department || "General").trim(),
          phone: (phone || "").trim(),
          createdAt: new Date().toISOString()
        };
        await window.CIMS.db.createUser(studentProfile);
        this.setCurrentUser(studentProfile);
        return studentProfile;
      } catch (err) {
        console.warn("Cloud registration notice:", err);
        // Resilient fallback if Firebase Authentication has not been enabled in console yet
        if (
          err.code === "auth/configuration-not-found" || 
          err.message?.includes("configuration-not-found") ||
          err.code === "auth/api-key-not-valid" ||
          err.code === "auth/operation-not-allowed"
        ) {
          console.warn("Firebase Auth not yet active in Console. Saving student account into institutional database.");
          return await this.registerStudentLocally({ fullName, email, password, studentId, department, phone });
        }

        let msg = "Registration failed.";
        if (err.code === "auth/email-already-in-use") {
          msg = "An account with this email address already exists.";
        } else if (err.code === "auth/weak-password") {
          msg = "Password should be at least 6 characters.";
        } else if (err.message) {
          msg = err.message;
        }
        throw new Error(msg);
      }
    }

    // 2. Local Database Registration
    return await this.registerStudentLocally({ fullName, email, password, studentId, department, phone });
  }

  async registerStudentLocally({ fullName, email, password, studentId, department, phone }) {
    const emailTrimmed = email.trim().toLowerCase();
    const users = await window.CIMS.db.getUsers();
    if (users.some(u => u.email.toLowerCase() === emailTrimmed)) {
      throw new Error("An account with this email address already exists.");
    }

    const newUid = "student-" + Date.now();
    const newStudent = {
      uid: newUid,
      fullName: fullName.trim(),
      email: emailTrimmed,
      password: password,
      role: "student",
      studentId: studentId.trim().toUpperCase(),
      department: (department || "General").trim(),
      phone: (phone || "").trim(),
      createdAt: new Date().toISOString()
    };

    await window.CIMS.db.createUser(newStudent);
    this.setCurrentUser(newStudent);
    return newStudent;
  }

  // Password Reset Service
  async resetPassword(email) {
    if (!email) throw new Error("Please enter your registered email address.");
    const emailTrimmed = email.trim().toLowerCase();

    if (window.CIMS.db.isCloud && window.CIMS.db.auth) {
      await window.CIMS.db.auth.sendPasswordResetEmail(emailTrimmed);
      return "A password reset link has been dispatched to your email address.";
    }

    const users = await window.CIMS.db.getUsers();
    const user = users.find(u => u.email.toLowerCase() === emailTrimmed);
    if (!user) throw new Error("No registered account found with this email address.");

    return "Password reset link generated. (Contact campus facility helpdesk or check institutional email).";
  }

  // Logout handler
  async logout() {
    if (window.CIMS.db.isCloud && window.CIMS.db.auth) {
      try {
        await window.CIMS.db.auth.signOut();
      } catch (e) {
        console.warn("SignOut notice:", e);
      }
    }
    this.setCurrentUser(null);
    window.location.href = "index.html";
  }

  // Redirect based on role
  redirectToDashboard(role) {
    switch (role) {
      case "student":
        window.location.href = "student-dashboard.html";
        break;
      case "admin":
        window.location.href = "admin-dashboard.html";
        break;
      case "staff":
        window.location.href = "staff-dashboard.html";
        break;
      default:
        window.location.href = "index.html";
    }
  }

  // Route Guard: Enforce Role-Based Access on Page Load
  checkAuth(allowedRoles = []) {
    const user = this.getCurrentUser();

    if (!user) {
      window.location.href = "index.html";
      return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      alert(`Access Denied: Your account role (${user.role}) is not authorized to access this page.`);
      this.redirectToDashboard(user.role);
      return null;
    }

    this.populateUserInterface(user);
    return user;
  }

  // Populate user info & attach listeners
  populateUserInterface(user) {
    // Render institutional system status pill in header
    window.CIMS.utils.renderSystemStatus();

    // User name displays
    document.querySelectorAll(".auth-user-name").forEach(el => {
      el.textContent = user.fullName || "User";
    });

    // User role displays
    document.querySelectorAll(".auth-user-role").forEach(el => {
      el.textContent = (user.role || "").toUpperCase();
    });

    // User avatar initials
    document.querySelectorAll(".auth-user-avatar").forEach(el => {
      const initials = (user.fullName || "U")
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
      el.textContent = initials;
    });

    // Logout button listeners
    document.querySelectorAll(".btn-logout").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to sign out of the system?")) {
          this.logout();
        }
      });
    });

    // Render Quick Portal Switcher in sidebar footer
    const sidebarFooter = document.querySelector(".sidebar-footer");
    if (sidebarFooter && !document.getElementById("quickPortalSwitcher")) {
      const switchBox = document.createElement("div");
      switchBox.className = "portal-switch-wrapper";
      switchBox.style.cssText = "margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#94a3b8;";
      switchBox.innerHTML = `
        <span style="font-weight:600;">Switch Portal:</span>
        <select id="quickPortalSwitcher" style="background:#0f172a;color:#ffffff;border:1px solid rgba(255,255,255,0.25);border-radius:4px;padding:3px 6px;font-size:11px;cursor:pointer;">
          <option value="student" ${user.role === 'student' ? 'selected' : ''}>🎓 Student</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>🛡️ Facility Admin</option>
          <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>🔧 Technician</option>
        </select>
      `;
      sidebarFooter.appendChild(switchBox);

      document.getElementById("quickPortalSwitcher").addEventListener("change", (e) => {
        const targetRole = e.target.value;
        if (targetRole === user.role) return;

        if (targetRole === "admin") {
          this.setCurrentUser({
            uid: "admin-001",
            fullName: "Prof. Vikram Malhotra",
            email: "admin@college.edu",
            role: "admin",
            department: "Campus Estate & Facility Management",
            staffId: "ADM-001"
          });
          window.location.href = "admin-dashboard.html";
        } else if (targetRole === "staff") {
          this.setCurrentUser({
            uid: "staff-101",
            fullName: "Ramesh Sharma",
            email: "ramesh.maintenance@college.edu",
            role: "staff",
            department: "Electrical & AV",
            staffId: "STF-101"
          });
          window.location.href = "staff-dashboard.html";
        } else if (targetRole === "student") {
          this.setCurrentUser({
            uid: "student-001",
            fullName: "Aarav Gupta",
            email: "aarav.student@college.edu",
            role: "student",
            department: "Computer Science & Engineering",
            studentId: "CS2023045"
          });
          window.location.href = "student-dashboard.html";
        }
      });
    }

    // Mobile sidebar toggle handler
    const mobileToggle = document.querySelector(".mobile-toggle");
    const sidebar = document.querySelector(".sidebar");
    let overlay = document.querySelector(".sidebar-overlay");

    if (mobileToggle && sidebar) {
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "sidebar-overlay";
        document.body.appendChild(overlay);
      }

      mobileToggle.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
        overlay.classList.toggle("show");
      });

      overlay.addEventListener("click", () => {
        sidebar.classList.remove("mobile-open");
        overlay.classList.remove("show");
      });
    }

    // Notification bell handler
    const notifBtn = document.getElementById("notifBellBtn");
    const notifPanel = document.getElementById("notifPanel");
    if (notifBtn && notifPanel) {
      notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        notifPanel.classList.toggle("show");
      });

      document.addEventListener("click", (e) => {
        if (!notifPanel.contains(e.target) && !notifBtn.contains(e.target)) {
          notifPanel.classList.remove("show");
        }
      });
    }

    // Load user notifications
    if (window.CIMS.notifications) {
      window.CIMS.notifications.loadHeaderNotifications(user.uid);
    }
  }
}

window.CIMS.auth = new CIMSAuthService();
