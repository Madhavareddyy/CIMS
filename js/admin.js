/**
 * CLASSROOM ISSUE MANAGEMENT SYSTEM (CIMS)
 * Admin Dashboard, Issue Management & Staff Administration Module
 */

window.CIMS = window.CIMS || {};

class CIMSAdminModule {
  // Initialize Admin Dashboard Overview
  async initDashboard(currentUser) {
    const issues = await window.CIMS.db.getIssues();

    const total = issues.length;
    const pending = issues.filter(i => i.status === "pending").length;
    const assigned = issues.filter(i => i.status === "assigned").length;
    const inProgress = issues.filter(i => i.status === "in_progress").length;
    const completed = issues.filter(i => i.status === "completed").length;
    const resolved = issues.filter(i => i.status === "resolved").length;

    // Populate stat counters
    const totalEl = document.getElementById("adminTotalCount");
    const pendingEl = document.getElementById("adminPendingCount");
    const progressEl = document.getElementById("adminProgressCount");
    const resolvedEl = document.getElementById("adminResolvedCount");

    if (totalEl) totalEl.textContent = total;
    if (pendingEl) pendingEl.textContent = pending + assigned;
    if (progressEl) progressEl.textContent = inProgress + completed;
    if (resolvedEl) resolvedEl.textContent = resolved;

    // Urgent Issues Alert Banner
    const urgentCount = issues.filter(i => (i.priority === "urgent" || i.priority === "high") && i.status !== "resolved").length;
    const urgentBanner = document.getElementById("adminUrgentAlertBanner");
    if (urgentBanner) {
      if (urgentCount > 0) {
        urgentBanner.style.display = "flex";
        document.getElementById("urgentCountSpan").textContent = urgentCount;
      } else {
        urgentBanner.style.display = "none";
      }
    }

    // Populate Recent Submissions Table
    const tableBody = document.getElementById("adminRecentTableBody");
    if (tableBody) {
      const recent = issues.slice(0, 6);
      if (recent.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding:24px;">No classroom issues found.</td></tr>`;
      } else {
        tableBody.innerHTML = recent
          .map(i => window.CIMS.issues.renderIssueTableRow(i, "admin"))
          .join("");
      }
    }

    // Initialize Charts on Admin Dashboard
    if (window.CIMS.charts) {
      window.CIMS.charts.renderDashboardCharts(issues);
    }
  }

  // Initialize Manage Issues Page
  async initManageIssuesPage(currentUser) {
    const tableBody = document.getElementById("adminManageTableBody");
    const emptyState = document.getElementById("manageEmptyState");
    const countBadge = document.getElementById("manageCountBadge");

    const searchInput = document.getElementById("adminSearchInput");
    const statusFilter = document.getElementById("adminStatusFilter");
    const priorityFilter = document.getElementById("adminPriorityFilter");
    const categoryFilter = document.getElementById("adminCategoryFilter");
    const exportBtn = document.getElementById("btnExportIssues");

    let allIssues = await window.CIMS.db.getIssues();

    const render = () => {
      let filtered = [...allIssues];

      // Status
      const sVal = statusFilter ? statusFilter.value : "";
      if (sVal) {
        filtered = filtered.filter(i => i.status === sVal);
      }

      // Priority
      const pVal = priorityFilter ? priorityFilter.value : "";
      if (pVal) {
        filtered = filtered.filter(i => i.priority === pVal);
      }

      // Category
      const cVal = categoryFilter ? categoryFilter.value : "";
      if (cVal) {
        filtered = filtered.filter(i => i.category === cVal);
      }

      // Keyword
      const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      if (q) {
        filtered = filtered.filter(i =>
          (i.classroomNumber && i.classroomNumber.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.issueCode && i.issueCode.toLowerCase().includes(q)) ||
          (i.studentName && i.studentName.toLowerCase().includes(q)) ||
          (i.assignedStaffName && i.assignedStaffName.toLowerCase().includes(q))
        );
      }

      if (countBadge) countBadge.textContent = `${filtered.length} total records`;

      if (filtered.length === 0) {
        if (tableBody) tableBody.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
      } else {
        if (emptyState) emptyState.style.display = "none";
        if (tableBody) {
          tableBody.innerHTML = filtered
            .map(i => window.CIMS.issues.renderIssueTableRow(i, "admin"))
            .join("");
        }
      }
    };

    if (searchInput) searchInput.addEventListener("input", render);
    if (statusFilter) statusFilter.addEventListener("change", render);
    if (priorityFilter) priorityFilter.addEventListener("change", render);
    if (categoryFilter) categoryFilter.addEventListener("change", render);

    if (exportBtn) {
      exportBtn.onclick = () => {
        window.CIMS.issues.exportToCSV(allIssues, `CIMS_Classroom_Issues_${new Date().toISOString().slice(0, 10)}.csv`);
      };
    }

    render();
  }

  // Initialize Staff Management Page
  async initManageStaffPage(currentUser) {
    const tableBody = document.getElementById("staffTableBody");
    const modalBackdrop = document.getElementById("addStaffModal");
    const openModalBtn = document.getElementById("btnOpenAddStaffModal");
    const closeModalBtn = document.getElementById("btnCloseAddStaffModal");
    const cancelModalBtn = document.getElementById("btnCancelAddStaff");
    const addStaffForm = document.getElementById("addStaffForm");

    const refreshStaffList = async () => {
      const staffList = await window.CIMS.db.getUsers("staff");
      const allIssues = await window.CIMS.db.getIssues();

      if (staffList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding:24px;">No staff registered yet.</td></tr>`;
        return;
      }

      tableBody.innerHTML = staffList.map(staff => {
        // Calculate live active tasks assigned
        const activeCount = allIssues.filter(i => 
          i.assignedStaffId === staff.uid && 
          i.status !== "resolved" && 
          i.status !== "rejected"
        ).length;

        return `
          <tr>
            <td>
              <div class="font-semibold">${window.CIMS.utils.escapeHtml(staff.fullName)}</div>
              <div class="text-muted" style="font-size:11px;">ID: ${window.CIMS.utils.escapeHtml(staff.staffId || staff.uid)}</div>
            </td>
            <td>${window.CIMS.utils.escapeHtml(staff.email)}</td>
            <td>${window.CIMS.utils.escapeHtml(staff.department || "Maintenance")}</td>
            <td>
              <span class="badge" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;">
                ${window.CIMS.utils.escapeHtml(staff.specialization || "General")}
              </span>
            </td>
            <td>
              <span class="badge ${activeCount > 2 ? "badge-urgent" : "badge-assigned"}">
                ${activeCount} active task${activeCount === 1 ? "" : "s"}
              </span>
            </td>
            <td class="text-right">
              <a href="manage-issues.html?staff=${window.CIMS.utils.escapeHtml(staff.uid)}" class="btn btn-secondary btn-sm">
                View Tasks
              </a>
            </td>
          </tr>
        `;
      }).join("");
    };

    await refreshStaffList();

    // Modal Handlers
    if (openModalBtn && modalBackdrop) {
      openModalBtn.onclick = () => modalBackdrop.classList.add("show");
    }

    const hideModal = () => {
      if (modalBackdrop) modalBackdrop.classList.remove("show");
      if (addStaffForm) addStaffForm.reset();
    };

    if (closeModalBtn) closeModalBtn.onclick = hideModal;
    if (cancelModalBtn) cancelModalBtn.onclick = hideModal;

    // Add Staff Form Submission
    if (addStaffForm) {
      addStaffForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("newStaffName").value.trim();
        const email = document.getElementById("newStaffEmail").value.trim().toLowerCase();
        const password = (document.getElementById("newStaffPassword")?.value || "password123").trim();
        const dept = document.getElementById("newStaffDepartment").value.trim();
        const spec = document.getElementById("newStaffSpecialization").value.trim();
        const phone = document.getElementById("newStaffPhone").value.trim();

        if (!name || !email || !password) {
          alert("Please fill in staff name, email, and password.");
          return;
        }

        const newStaffObj = {
          uid: "staff-" + Date.now(),
          fullName: name,
          email: email,
          password: password,
          role: "staff",
          department: dept || "Facilities & Maintenance",
          specialization: spec || "General Repairs",
          phone: phone || "+91 98000 00000",
          staffId: "STF-" + Math.floor(100 + Math.random() * 900),
          createdAt: new Date().toISOString()
        };

        try {
          await window.CIMS.db.createUser(newStaffObj);
          window.CIMS.utils.showToast(`Staff member ${name} created successfully.`, "success");
          hideModal();
          await refreshStaffList();
        } catch (err) {
          alert("Error creating staff account: " + err.message);
        }
      });
    }
  }
}

window.CIMS.admin = new CIMSAdminModule();
