/**
 * CLASSROOM ISSUE MANAGEMENT SYSTEM (CIMS)
 * Student Dashboard & Complaint Submission Module
 */

window.CIMS = window.CIMS || {};

class CIMSStudentModule {
  // Initialize Student Dashboard
  async initDashboard(currentUser) {
    const issues = await window.CIMS.db.getIssues({ studentId: currentUser.uid });

    const total = issues.length;
    const pending = issues.filter(i => i.status === "pending" || i.status === "assigned").length;
    const inProgress = issues.filter(i => i.status === "in_progress").length;
    const resolved = issues.filter(i => i.status === "resolved").length;

    // Populate counters
    document.getElementById("studentTotalCount").textContent = total;
    document.getElementById("studentPendingCount").textContent = pending;
    document.getElementById("studentProgressCount").textContent = inProgress;
    document.getElementById("studentResolvedCount").textContent = resolved;

    // Populate Recent Complaints Table
    const tableBody = document.getElementById("studentRecentTableBody");
    const emptyState = document.getElementById("studentEmptyState");

    if (total === 0) {
      if (tableBody) tableBody.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
      return;
    }

    if (emptyState) emptyState.style.display = "none";
    if (tableBody) {
      const recentIssues = issues.slice(0, 5);
      tableBody.innerHTML = recentIssues
        .map(i => window.CIMS.issues.renderIssueTableRow(i, "student"))
        .join("");
    }
  }

  // Initialize Report Issue Form
  initReportForm(currentUser) {
    const form = document.getElementById("reportIssueForm");
    if (!form) return;

    const descInput = document.getElementById("issueDescription");
    const charCounter = document.getElementById("charCounter");
    const alertBox = document.getElementById("reportAlertBox");

    // Dynamic character counter
    if (descInput && charCounter) {
      descInput.addEventListener("input", () => {
        const len = descInput.value.length;
        charCounter.textContent = `${len} / 1000 characters`;
        if (len < 10) {
          charCounter.style.color = "var(--color-danger)";
        } else {
          charCounter.style.color = "var(--color-text-light)";
        }
      });
    }

    // Form submit listener
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (alertBox) alertBox.classList.remove("show");

      const categoryEl = document.querySelector('input[name="category"]:checked');
      const classroomEl = document.getElementById("classroomNumber");
      const priorityEl = document.querySelector('input[name="priority"]:checked');
      const submitBtn = document.getElementById("btnSubmitIssue");

      if (!categoryEl) {
        this.showFormAlert(alertBox, "Please select an issue category.");
        return;
      }

      const classroom = classroomEl ? classroomEl.value.trim() : "";
      if (!classroom) {
        this.showFormAlert(alertBox, "Please specify the classroom or lab number.");
        classroomEl.focus();
        return;
      }

      const description = descInput ? descInput.value.trim() : "";
      if (description.length < 10) {
        this.showFormAlert(alertBox, "Please provide a detailed description (at least 10 characters).");
        descInput.focus();
        return;
      }

      const priority = priorityEl ? priorityEl.value : "medium";

      // Prevent duplicate submission button spamming
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Submitting Issue...';
      }

      try {
        const issueData = {
          studentId: currentUser.uid,
          studentName: currentUser.fullName,
          studentEmail: currentUser.email,
          category: categoryEl.value,
          classroomNumber: classroom,
          description: description,
          priority: priority
        };

        const createdIssue = await window.CIMS.db.createIssue(issueData);

        window.CIMS.utils.showToast(`Issue ${createdIssue.issueCode} submitted successfully!`, "success");
        setTimeout(() => {
          window.location.href = "my-issues.html";
        }, 800);
      } catch (err) {
        console.error("Error creating issue:", err);
        this.showFormAlert(alertBox, "Failed to submit issue. Please check your connection and try again.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = "Submit Issue Report";
        }
      }
    });
  }

  showFormAlert(el, message) {
    if (!el) {
      alert(message);
      return;
    }
    el.className = "form-alert alert-danger show";
    el.innerHTML = `
      <svg style="width:18px;height:18px;stroke:currentColor;fill:none;flex-shrink:0;" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
      <span>${window.CIMS.utils.escapeHtml(message)}</span>
    `;
  }

  // Initialize My Issues Page
  async initMyIssuesPage(currentUser) {
    const tableBody = document.getElementById("myIssuesTableBody");
    const emptyState = document.getElementById("myIssuesEmptyState");
    const countBadge = document.getElementById("issuesCountBadge");

    const searchInput = document.getElementById("searchIssuesInput");
    const statusFilter = document.getElementById("statusFilterSelect");
    const categoryFilter = document.getElementById("categoryFilterSelect");

    let allIssues = await window.CIMS.db.getIssues({ studentId: currentUser.uid });

    const render = () => {
      let filtered = [...allIssues];

      // Status filter
      const sVal = statusFilter ? statusFilter.value : "";
      if (sVal) {
        filtered = filtered.filter(i => i.status === sVal);
      }

      // Category filter
      const cVal = categoryFilter ? categoryFilter.value : "";
      if (cVal) {
        filtered = filtered.filter(i => i.category === cVal);
      }

      // Keyword search
      const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      if (q) {
        filtered = filtered.filter(i =>
          (i.classroomNumber && i.classroomNumber.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.issueCode && i.issueCode.toLowerCase().includes(q))
        );
      }

      if (countBadge) countBadge.textContent = `${filtered.length} issues`;

      if (filtered.length === 0) {
        if (tableBody) tableBody.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
      } else {
        if (emptyState) emptyState.style.display = "none";
        if (tableBody) {
          tableBody.innerHTML = filtered
            .map(i => window.CIMS.issues.renderIssueTableRow(i, "student"))
            .join("");
        }
      }
    };

    if (searchInput) searchInput.addEventListener("input", render);
    if (statusFilter) statusFilter.addEventListener("change", render);
    if (categoryFilter) categoryFilter.addEventListener("change", render);

    render();
  }
}

window.CIMS.student = new CIMSStudentModule();
