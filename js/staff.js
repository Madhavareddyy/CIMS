/**
 * CLASSROOM ISSUE MANAGEMENT SYSTEM (CIMS)
 * Maintenance Staff Dashboard & Assigned Tasks Controller Module
 */

window.CIMS = window.CIMS || {};

class CIMSStaffModule {
  // Initialize Maintenance Staff Dashboard
  async initDashboard(currentUser) {
    const issues = await window.CIMS.db.getIssues({ assignedStaffId: currentUser.uid });

    const totalAssigned = issues.length;
    const pendingAcceptance = issues.filter(i => i.status === "assigned").length;
    const inProgress = issues.filter(i => i.status === "in_progress").length;
    const completed = issues.filter(i => i.status === "completed" || i.status === "resolved").length;

    // Set stats
    const totalEl = document.getElementById("staffTotalCount");
    const assignedEl = document.getElementById("staffAssignedCount");
    const progressEl = document.getElementById("staffProgressCount");
    const completedEl = document.getElementById("staffCompletedCount");

    if (totalEl) totalEl.textContent = totalAssigned;
    if (assignedEl) assignedEl.textContent = pendingAcceptance;
    if (progressEl) progressEl.textContent = inProgress;
    if (completedEl) completedEl.textContent = completed;

    // Urgent Task Notification Banner
    const urgentTasks = issues.filter(i => 
      (i.priority === "urgent" || i.priority === "high") && 
      (i.status === "assigned" || i.status === "in_progress")
    );

    const urgentBanner = document.getElementById("staffUrgentBanner");
    if (urgentBanner) {
      if (urgentTasks.length > 0) {
        urgentBanner.style.display = "flex";
        document.getElementById("staffUrgentCount").textContent = urgentTasks.length;
      } else {
        urgentBanner.style.display = "none";
      }
    }

    // Populate Tasks Table
    const tableBody = document.getElementById("staffTasksTableBody");
    const emptyState = document.getElementById("staffEmptyState");

    const activeTasks = issues.filter(i => i.status !== "resolved" && i.status !== "rejected");

    if (activeTasks.length === 0) {
      if (tableBody) tableBody.innerHTML = "";
      if (emptyState) emptyState.style.display = "block";
    } else {
      if (emptyState) emptyState.style.display = "none";
      if (tableBody) {
        tableBody.innerHTML = activeTasks.slice(0, 6).map(i => `
          <tr>
            <td class="font-semibold">
              <a href="issue-details.html?id=${window.CIMS.utils.escapeHtml(i.id)}" style="color:var(--color-primary);text-decoration:none;">
                ${window.CIMS.utils.escapeHtml(i.issueCode || i.id)}
              </a>
            </td>
            <td>
              <div class="font-semibold">${window.CIMS.utils.escapeHtml(i.category)}</div>
              <div class="text-muted" style="font-size:12px;">Classroom: ${window.CIMS.utils.escapeHtml(i.classroomNumber)}</div>
            </td>
            <td>${window.CIMS.utils.renderPriorityPill(i.priority)}</td>
            <td>${window.CIMS.utils.renderStatusBadge(i.status)}</td>
            <td class="text-muted" style="font-size:12px;">${window.CIMS.utils.formatDate(i.assignedAt || i.createdAt)}</td>
            <td class="text-right">
              ${i.status === "assigned" ? `
                <button class="btn btn-primary btn-sm btn-quick-accept" data-id="${window.CIMS.utils.escapeHtml(i.id)}">
                  Accept
                </button>
              ` : `
                <a href="issue-details.html?id=${window.CIMS.utils.escapeHtml(i.id)}" class="btn btn-secondary btn-sm">
                  Update
                </a>
              `}
            </td>
          </tr>
        `).join("");

        // Attach quick accept buttons
        tableBody.querySelectorAll(".btn-quick-accept").forEach(btn => {
          btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            const targetIssue = issues.find(x => x.id === id);
            await window.CIMS.db.updateIssue(id, { status: "in_progress" }, {
              action: "STATUS_UPDATED",
              name: currentUser.fullName,
              uid: currentUser.uid,
              role: "staff",
              details: "Task accepted and set to In Progress."
            });
            if (targetIssue) {
              await window.CIMS.notifications.notifyStatusChange(targetIssue, "in_progress", currentUser.fullName);
            }
            window.CIMS.utils.showToast("Task accepted!", "success");
            this.initDashboard(currentUser);
          });
        });
      }
    }
  }

  // Initialize Assigned Tasks Page
  async initAssignedTasksPage(currentUser) {
    const tableBody = document.getElementById("assignedTasksTableBody");
    const emptyState = document.getElementById("assignedTasksEmptyState");
    const countBadge = document.getElementById("assignedTasksCountBadge");

    const searchInput = document.getElementById("staffTaskSearch");
    const statusTabSelect = document.getElementById("staffStatusTab");
    const priorityFilter = document.getElementById("staffPriorityFilter");

    let allTasks = await window.CIMS.db.getIssues({ assignedStaffId: currentUser.uid });

    const render = () => {
      let filtered = [...allTasks];

      // Tab / Status filter
      const tab = statusTabSelect ? statusTabSelect.value : "all";
      if (tab === "active") {
        filtered = filtered.filter(i => i.status === "assigned" || i.status === "in_progress");
      } else if (tab === "completed") {
        filtered = filtered.filter(i => i.status === "completed" || i.status === "resolved");
      } else if (tab !== "all") {
        filtered = filtered.filter(i => i.status === tab);
      }

      // Priority
      const pVal = priorityFilter ? priorityFilter.value : "";
      if (pVal) {
        filtered = filtered.filter(i => i.priority === pVal);
      }

      // Keyword Search
      const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
      if (q) {
        filtered = filtered.filter(i =>
          (i.classroomNumber && i.classroomNumber.toLowerCase().includes(q)) ||
          (i.description && i.description.toLowerCase().includes(q)) ||
          (i.issueCode && i.issueCode.toLowerCase().includes(q)) ||
          (i.category && i.category.toLowerCase().includes(q))
        );
      }

      if (countBadge) countBadge.textContent = `${filtered.length} tasks`;

      if (filtered.length === 0) {
        if (tableBody) tableBody.innerHTML = "";
        if (emptyState) emptyState.style.display = "block";
      } else {
        if (emptyState) emptyState.style.display = "none";
        if (tableBody) {
          tableBody.innerHTML = filtered.map(i => `
            <tr>
              <td class="font-semibold">
                <a href="issue-details.html?id=${window.CIMS.utils.escapeHtml(i.id)}" style="color:var(--color-primary);text-decoration:none;">
                  ${window.CIMS.utils.escapeHtml(i.issueCode || i.id)}
                </a>
              </td>
              <td>
                <div class="font-semibold">${window.CIMS.utils.escapeHtml(i.category)}</div>
                <div class="text-muted" style="font-size:12px;">Classroom: ${window.CIMS.utils.escapeHtml(i.classroomNumber)}</div>
              </td>
              <td>${window.CIMS.utils.renderPriorityPill(i.priority)}</td>
              <td>${window.CIMS.utils.renderStatusBadge(i.status)}</td>
              <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--color-navy-muted);">
                ${window.CIMS.utils.escapeHtml(i.resolutionNotes || "None")}
              </td>
              <td class="text-right">
                <a href="issue-details.html?id=${window.CIMS.utils.escapeHtml(i.id)}" class="btn btn-secondary btn-sm">
                  Manage Task
                </a>
              </td>
            </tr>
          `).join("");
        }
      }
    };

    if (searchInput) searchInput.addEventListener("input", render);
    if (statusTabSelect) statusTabSelect.addEventListener("change", render);
    if (priorityFilter) priorityFilter.addEventListener("change", render);

    render();
  }
}

window.CIMS.staff = new CIMSStaffModule();
