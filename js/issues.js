/**
 * CLASSROOM ISSUE MANAGEMENT SYSTEM (CIMS)
 * Issue Operations, Timeline Rendering & Details Module
 */

window.CIMS = window.CIMS || {};

class CIMSIssueService {
  // Render an HTML table row for an issue
  renderIssueTableRow(issue, viewerRole = "student") {
    const u = window.CIMS.utils;
    const staffName = issue.assignedStaffName || '<span class="text-muted">Unassigned</span>';

    return `
      <tr data-id="${u.escapeHtml(issue.id)}">
        <td class="font-semibold text-primary">
          <a href="issue-details.html?id=${u.escapeHtml(issue.id)}" style="color:var(--color-primary);text-decoration:none;">
            ${u.escapeHtml(issue.issueCode || issue.id)}
          </a>
        </td>
        <td>
          <div class="font-semibold">${u.escapeHtml(issue.category)}</div>
          <div class="text-muted" style="font-size:12px;">${u.escapeHtml(issue.classroomNumber)}</div>
        </td>
        ${viewerRole !== "student" ? `
          <td>
            <div class="font-semibold">${u.escapeHtml(issue.studentName || "Student")}</div>
            <div class="text-muted" style="font-size:11px;">${u.escapeHtml(issue.studentEmail || "")}</div>
          </td>
        ` : ""}
        <td>${u.renderPriorityPill(issue.priority)}</td>
        <td>${u.renderStatusBadge(issue.status)}</td>
        ${viewerRole === "admin" ? `<td>${staffName}</td>` : ""}
        <td class="text-muted" style="font-size:12px;">${u.formatDate(issue.createdAt)}</td>
        <td class="text-right">
          <a href="issue-details.html?id=${u.escapeHtml(issue.id)}" class="btn btn-secondary btn-sm">
            View Details
          </a>
        </td>
      </tr>
    `;
  }

  // Load and render issue details on issue-details.html
  async loadIssueDetailsPage(currentUser) {
    const urlParams = new URLSearchParams(window.location.search);
    const issueId = urlParams.get("id");

    if (!issueId) {
      alert("No Issue ID specified.");
      window.history.back();
      return;
    }

    const u = window.CIMS.utils;
    const issue = await window.CIMS.db.getIssueById(issueId);

    if (!issue) {
      document.getElementById("issueDetailsContent").innerHTML = `
        <div class="card empty-state">
          <h3>Issue Not Found</h3>
          <p>The classroom issue you requested does not exist or may have been deleted.</p>
          <a href="javascript:history.back()" class="btn btn-primary">Go Back</a>
        </div>
      `;
      return;
    }

    // Role-based security check:
    // If student, they can only view issues they created!
    if (currentUser.role === "student" && issue.studentId !== currentUser.uid) {
      alert("Security Violation: You are not authorized to view issues submitted by other students.");
      window.location.href = "student-dashboard.html";
      return;
    }

    // Populate Issue Header & Badge
    document.getElementById("issueCodeTitle").textContent = issue.issueCode || issue.id;
    document.getElementById("issueStatusBadge").innerHTML = u.renderStatusBadge(issue.status);
    document.getElementById("issuePriorityPill").innerHTML = u.renderPriorityPill(issue.priority);

    // Populate Fields
    document.getElementById("issueCategory").textContent = issue.category;
    document.getElementById("issueClassroom").textContent = issue.classroomNumber;
    document.getElementById("issueReporter").textContent = `${issue.studentName} (${issue.studentEmail || "Student"})`;
    document.getElementById("issueDate").textContent = u.formatDate(issue.createdAt);
    document.getElementById("issueDescription").textContent = issue.description;

    // Assigned Staff Field
    const staffDisplay = document.getElementById("issueAssignedStaff");
    if (staffDisplay) {
      staffDisplay.textContent = issue.assignedStaffName || "Unassigned";
    }

    // Resolution Notes Field
    const notesDisplay = document.getElementById("issueResolutionNotes");
    if (notesDisplay) {
      notesDisplay.textContent = issue.resolutionNotes || "No resolution notes submitted yet.";
    }

    // Render Role Actions Card
    this.renderRoleActionControls(issue, currentUser);

    // Render Activity Logs Timeline
    await this.renderTimeline(issue.id);
  }

  // Render role-specific action buttons & controls
  renderRoleActionControls(issue, currentUser) {
    const actionsContainer = document.getElementById("roleActionsContainer");
    if (!actionsContainer) return;

    if (currentUser.role === "admin") {
      this.renderAdminControls(issue, currentUser, actionsContainer);
    } else if (currentUser.role === "staff") {
      this.renderStaffControls(issue, currentUser, actionsContainer);
    } else {
      // Student: read-only info
      actionsContainer.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Complaint Status Tracking</h3>
          </div>
          <p class="text-muted" style="font-size:14px;line-height:1.6;">
            Your issue is currently <strong>${issue.status.replace("_", " ").toUpperCase()}</strong>.
            You will receive instant dashboard notifications as soon as facility staff update or resolve this classroom request.
          </p>
          ${issue.status === "completed" ? `
            <div style="margin-top:14px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:13px;color:#166534;">
              <strong>Maintenance Completed!</strong> Staff has finished the required repairs. Final admin inspection is underway.
            </div>
          ` : ""}
          ${issue.status === "resolved" ? `
            <div style="margin-top:14px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:13px;color:#166534;">
              <strong>Resolved!</strong> This issue has been verified and closed by college facility administration.
            </div>
          ` : ""}
        </div>
      `;
    }
  }

  // Admin Controls (Assign Staff, Change Priority, Status Transition, Verify & Resolve)
  async renderAdminControls(issue, currentUser, container) {
    const staffList = await window.CIMS.db.getUsers("staff");

    const staffOptions = staffList.map(s => `
      <option value="${s.uid}" ${issue.assignedStaffId === s.uid ? "selected" : ""}>
        ${window.CIMS.utils.escapeHtml(s.fullName)} (${window.CIMS.utils.escapeHtml(s.specialization || s.department || "Staff")})
      </option>
    `).join("");

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Administrative Actions</h3>
        </div>

        <!-- Priority Update Form -->
        <div class="form-group">
          <label class="form-label">Change Priority</label>
          <div style="display:flex;gap:8px;">
            <select id="adminPrioritySelect" class="form-control">
              <option value="low" ${issue.priority === "low" ? "selected" : ""}>Low</option>
              <option value="medium" ${issue.priority === "medium" ? "selected" : ""}>Medium</option>
              <option value="high" ${issue.priority === "high" ? "selected" : ""}>High</option>
              <option value="urgent" ${issue.priority === "urgent" ? "selected" : ""}>Urgent</option>
            </select>
            <button id="btnUpdatePriority" class="btn btn-secondary btn-sm">Update</button>
          </div>
        </div>

        <!-- Staff Assignment Form -->
        <div class="form-group">
          <label class="form-label">Assign Maintenance Staff</label>
          <div style="display:flex;gap:8px;">
            <select id="adminStaffSelect" class="form-control">
              <option value="">-- Choose Staff Member --</option>
              ${staffOptions}
            </select>
            <button id="btnAssignStaff" class="btn btn-primary btn-sm">Assign</button>
          </div>
        </div>

        <!-- Status Management Actions -->
        <div class="form-group" style="margin-top:24px;border-top:1px solid var(--color-border);padding-top:16px;">
          <label class="form-label">Update Status</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${issue.status === "completed" ? `
              <button id="btnAdminResolve" class="btn btn-success btn-block" style="margin-bottom:8px;">
                ✓ Verify & Mark Resolved
              </button>
            ` : `
              <button id="btnAdminDirectResolve" class="btn btn-success btn-sm">
                Mark Resolved
              </button>
            `}
            <button id="btnAdminReject" class="btn btn-danger btn-sm">
              Reject Issue
            </button>
            <button id="btnAdminResetPending" class="btn btn-secondary btn-sm">
              Reset to Pending
            </button>
          </div>
        </div>
      </div>
    `;

    // Event: Update Priority
    document.getElementById("btnUpdatePriority").onclick = async () => {
      const newPriority = document.getElementById("adminPrioritySelect").value;
      if (newPriority === issue.priority) return;

      await window.CIMS.db.updateIssue(issue.id, { priority: newPriority }, {
        action: "PRIORITY_CHANGED",
        name: currentUser.fullName,
        uid: currentUser.uid,
        role: "admin",
        details: `Priority changed from '${issue.priority}' to '${newPriority}'.`
      });

      window.CIMS.utils.showToast("Priority updated successfully.", "success");
      setTimeout(() => window.location.reload(), 600);
    };

    // Event: Assign Staff
    document.getElementById("btnAssignStaff").onclick = async () => {
      const staffUid = document.getElementById("adminStaffSelect").value;
      if (!staffUid) {
        alert("Please select a maintenance staff member.");
        return;
      }
      const selectedStaff = staffList.find(s => s.uid === staffUid);
      const staffName = selectedStaff ? selectedStaff.fullName : "Staff";

      const newStatus = (issue.status === "pending") ? "assigned" : issue.status;

      await window.CIMS.db.updateIssue(issue.id, {
        assignedStaffId: staffUid,
        assignedStaffName: staffName,
        assignedAt: new Date().toISOString(),
        status: newStatus
      }, {
        action: "STAFF_ASSIGNED",
        name: currentUser.fullName,
        uid: currentUser.uid,
        role: "admin",
        details: `Assigned to ${staffName}. Status changed to '${newStatus}'.`
      });

      // Dispatch notifications
      await window.CIMS.notifications.notifyStaffAssigned(staffUid, issue, currentUser.fullName);
      await window.CIMS.notifications.notifyStatusChange({ ...issue, assignedStaffName: staffName }, newStatus, currentUser.fullName);

      window.CIMS.utils.showToast(`Issue assigned to ${staffName}.`, "success");
      setTimeout(() => window.location.reload(), 600);
    };

    // Event: Verify & Resolve
    const resolveBtn = document.getElementById("btnAdminResolve") || document.getElementById("btnAdminDirectResolve");
    if (resolveBtn) {
      resolveBtn.onclick = async () => {
        if (!confirm("Are you sure you want to mark this issue as RESOLVED? This confirms repairs are inspected.")) return;

        await window.CIMS.db.updateIssue(issue.id, {
          status: "resolved",
          resolvedAt: new Date().toISOString()
        }, {
          action: "ISSUE_RESOLVED",
          name: currentUser.fullName,
          uid: currentUser.uid,
          role: "admin",
          details: "Verified completion and marked issue as Resolved."
        });

        await window.CIMS.notifications.notifyStatusChange(issue, "resolved", currentUser.fullName);
        window.CIMS.utils.showToast("Issue successfully marked as Resolved.", "success");
        setTimeout(() => window.location.reload(), 600);
      };
    }

    // Event: Reject
    document.getElementById("btnAdminReject").onclick = async () => {
      const reason = prompt("Enter reason for rejection (optional):", "Duplicate or invalid classroom complaint.");
      if (reason === null) return;

      await window.CIMS.db.updateIssue(issue.id, {
        status: "rejected"
      }, {
        action: "ISSUE_REJECTED",
        name: currentUser.fullName,
        uid: currentUser.uid,
        role: "admin",
        details: `Issue rejected. Reason: ${reason}`
      });

      await window.CIMS.notifications.notifyStatusChange(issue, "rejected", currentUser.fullName);
      window.CIMS.utils.showToast("Issue marked as Rejected.", "warning");
      setTimeout(() => window.location.reload(), 600);
    };

    // Event: Reset to Pending
    document.getElementById("btnAdminResetPending").onclick = async () => {
      await window.CIMS.db.updateIssue(issue.id, {
        status: "pending",
        assignedStaffId: null,
        assignedStaffName: null
      }, {
        action: "STATUS_RESET",
        name: currentUser.fullName,
        uid: currentUser.uid,
        role: "admin",
        details: "Reset status to Pending and unassigned staff."
      });

      window.CIMS.utils.showToast("Issue reset to Pending.", "info");
      setTimeout(() => window.location.reload(), 600);
    };
  }

  // Staff Controls (Accept task, update resolution notes, mark completed)
  renderStaffControls(issue, currentUser, container) {
    // Check if assigned to this staff member
    const isAssignedToMe = issue.assignedStaffId === currentUser.uid;

    if (!isAssignedToMe) {
      container.innerHTML = `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Staff Actions</h3></div>
          <p class="text-muted" style="font-size:14px;">This classroom issue is assigned to another staff member (${issue.assignedStaffName || "Unassigned"}).</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Task Action Panel</h3>
        </div>

        <!-- In Progress Button -->
        ${issue.status === "assigned" ? `
          <div style="margin-bottom:16px;">
            <button id="btnStaffAccept" class="btn btn-primary btn-block">
              ▶ Accept Task & Set to In Progress
            </button>
          </div>
        ` : ""}

        <!-- Resolution Notes Form -->
        <div class="form-group">
          <label class="form-label" for="staffNotesTextarea">Resolution Notes & Findings</label>
          <textarea id="staffNotesTextarea" class="form-control" rows="4" placeholder="Detail the repairs completed, parts replaced, or ongoing inspection notes...">${window.CIMS.utils.escapeHtml(issue.resolutionNotes || "")}</textarea>
          <div class="form-hint">These notes will be reviewed by college admin before final closure.</div>
        </div>

        <div style="display:flex;gap:8px;flex-direction:column;">
          <button id="btnStaffSaveNotes" class="btn btn-secondary btn-block">
            Save Resolution Notes
          </button>
          
          ${issue.status !== "completed" && issue.status !== "resolved" ? `
            <button id="btnStaffComplete" class="btn btn-success btn-block" style="margin-top:6px;">
              ✓ Mark Task as Completed
            </button>
          ` : `
            <div style="padding:10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:12px;color:#166534;text-align:center;">
              Task marked as completed! Awaiting admin sign-off.
            </div>
          `}
        </div>
      </div>
    `;

    // Accept Task
    const acceptBtn = document.getElementById("btnStaffAccept");
    if (acceptBtn) {
      acceptBtn.onclick = async () => {
        await window.CIMS.db.updateIssue(issue.id, {
          status: "in_progress"
        }, {
          action: "STATUS_UPDATED",
          name: currentUser.fullName,
          uid: currentUser.uid,
          role: "staff",
          details: "Staff accepted task and marked status as 'In Progress'."
        });

        await window.CIMS.notifications.notifyStatusChange(issue, "in_progress", currentUser.fullName);
        window.CIMS.utils.showToast("Task accepted. Status is now In Progress.", "success");
        setTimeout(() => window.location.reload(), 600);
      };
    }

    // Save Notes
    document.getElementById("btnStaffSaveNotes").onclick = async () => {
      const notes = document.getElementById("staffNotesTextarea").value.trim();
      await window.CIMS.db.updateIssue(issue.id, {
        resolutionNotes: notes
      }, {
        action: "NOTES_ADDED",
        name: currentUser.fullName,
        uid: currentUser.uid,
        role: "staff",
        details: "Updated maintenance resolution notes."
      });

      window.CIMS.utils.showToast("Resolution notes saved.", "success");
      setTimeout(() => window.location.reload(), 600);
    };

    // Mark Completed
    const compBtn = document.getElementById("btnStaffComplete");
    if (compBtn) {
      compBtn.onclick = async () => {
        const notes = document.getElementById("staffNotesTextarea").value.trim();
        if (!notes) {
          alert("Please enter resolution notes describing what work was done before marking completed.");
          return;
        }

        await window.CIMS.db.updateIssue(issue.id, {
          status: "completed",
          resolutionNotes: notes
        }, {
          action: "WORK_COMPLETED",
          name: currentUser.fullName,
          uid: currentUser.uid,
          role: "staff",
          details: `Staff finished repair work and marked task Completed. Notes: ${notes}`
        });

        await window.CIMS.notifications.notifyStatusChange(issue, "completed", currentUser.fullName);
        window.CIMS.utils.showToast("Task marked as completed! Submitted for admin verification.", "success");
        setTimeout(() => window.location.reload(), 600);
      };
    }
  }

  // Render Activity Timeline
  async renderTimeline(issueId) {
    const timelineContainer = document.getElementById("issueTimeline");
    if (!timelineContainer) return;

    const u = window.CIMS.utils;
    const logs = await window.CIMS.db.getActivityLogs(issueId);

    if (logs.length === 0) {
      timelineContainer.innerHTML = `<p class="text-muted" style="font-size:13px;">No history recorded yet.</p>`;
      return;
    }

    timelineContainer.innerHTML = logs.map(log => {
      let markerClass = "info";
      if (log.action === "ISSUE_RESOLVED" || log.action === "WORK_COMPLETED") markerClass = "success";
      if (log.action === "ISSUE_REJECTED") markerClass = "warning";

      return `
        <div class="timeline-item">
          <div class="timeline-marker ${markerClass}"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-title">${u.escapeHtml(log.action.replace("_", " "))}</span>
              <span class="timeline-date">${u.formatDate(log.timestamp)}</span>
            </div>
            <div class="timeline-details">${u.escapeHtml(log.details)}</div>
            <div class="text-muted" style="font-size:11px;margin-top:4px;">
              By: <strong>${u.escapeHtml(log.performedBy)}</strong> (${u.escapeHtml(log.performedByRole)})
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Export issues to CSV file (useful for admin reports)
  exportToCSV(issues, filename = "cims-issues-report.csv") {
    if (!issues || !issues.length) {
      alert("No data available to export.");
      return;
    }

    const headers = [
      "Issue ID", "Category", "Classroom", "Priority", "Status",
      "Student Name", "Student Email", "Assigned Staff", "Created Date", "Resolution Notes"
    ];

    const rows = issues.map(i => [
      `"${i.issueCode || i.id}"`,
      `"${i.category || ""}"`,
      `"${i.classroomNumber || ""}"`,
      `"${i.priority || ""}"`,
      `"${i.status || ""}"`,
      `"${i.studentName || ""}"`,
      `"${i.studentEmail || ""}"`,
      `"${i.assignedStaffName || ""}"`,
      `"${i.createdAt || ""}"`,
      `"${(i.resolutionNotes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

window.CIMS.issues = new CIMSIssueService();
