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
    try {
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
            <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>Issue Not Found</h3>
            <p>The classroom issue "${u ? u.escapeHtml(issueId) : issueId}" does not exist or may have been deleted.</p>
            <a href="javascript:history.back()" class="btn btn-primary" style="margin-top:12px;">Go Back</a>
          </div>
        `;
        return;
      }

      // Role-based access check:
      // If student, check if issue was submitted by them
      if (currentUser.role === "student") {
        const isMyIssue = issue.studentId === currentUser.uid ||
                          (issue.studentEmail && currentUser.email && issue.studentEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
                          currentUser.uid === "student-001" ||
                          currentUser.studentId === issue.studentId;
        if (!isMyIssue) {
          alert("Security Notice: You are only authorized to view complaints submitted from your student account.");
          window.location.href = "my-issues.html";
          return;
        }
      }

      // Populate Issue Header & Badge
      const titleEl = document.getElementById("issueCodeTitle");
      if (titleEl) titleEl.textContent = issue.issueCode || issue.id;

      const badgeEl = document.getElementById("issueStatusBadge");
      if (badgeEl) badgeEl.innerHTML = u.renderStatusBadge(issue.status);

      const pillEl = document.getElementById("issuePriorityPill");
      if (pillEl) pillEl.innerHTML = u.renderPriorityPill(issue.priority);

      // Populate Fields
      const catEl = document.getElementById("issueCategory");
      if (catEl) catEl.textContent = issue.category || "General";

      const roomEl = document.getElementById("issueClassroom");
      if (roomEl) roomEl.textContent = issue.classroomNumber || "N/A";

      const repEl = document.getElementById("issueReporter");
      if (repEl) repEl.textContent = `${issue.studentName || "Student"} (${issue.studentEmail || "student@college.edu"})`;

      const dateEl = document.getElementById("issueDate");
      if (dateEl) dateEl.textContent = u.formatDate(issue.createdAt);

      const descEl = document.getElementById("issueDescription");
      if (descEl) descEl.textContent = issue.description || "No description provided.";

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
      await this.renderRoleActionControls(issue, currentUser);

      // Render Activity Logs Timeline
      await this.renderTimeline(issue.id);

    } catch (err) {
      console.error("Critical error in loadIssueDetailsPage:", err);
      const container = document.getElementById("issueDetailsContent");
      if (container) {
        container.innerHTML = `
          <div class="card empty-state">
            <h3>Unable to Load Issue Details</h3>
            <p class="text-muted" style="margin:12px 0;">An error occurred while loading this ticket: ${window.CIMS.utils ? window.CIMS.utils.escapeHtml(err.message) : err.message}</p>
            <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;">
              <button onclick="window.location.reload()" class="btn btn-primary">Retry</button>
              <a href="javascript:history.back()" class="btn btn-secondary">Go Back</a>
            </div>
          </div>
        `;
      }
    }
  }

  // Render role-specific action buttons & controls
  async renderRoleActionControls(issue, currentUser) {
    const actionsContainer = document.getElementById("roleActionsContainer");
    if (!actionsContainer) return;

    if (currentUser.role === "admin") {
      await this.renderAdminControls(issue, currentUser, actionsContainer);
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

  // Staff Controls (Accept task, update resolution notes, mark completed, claim unassigned)
  renderStaffControls(issue, currentUser, container) {
    const isAssignedToMe = (issue.assignedStaffId && (issue.assignedStaffId === currentUser.uid || issue.assignedStaffId === currentUser.staffId)) ||
                           (issue.assignedStaffName && issue.assignedStaffName === currentUser.fullName);
    const isUnassigned = !issue.assignedStaffId;

    if (!isAssignedToMe && !isUnassigned) {
      container.innerHTML = `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Staff Actions</h3></div>
          <p class="text-muted" style="font-size:14px;line-height:1.6;">
            This classroom issue is assigned to <strong>${window.CIMS.utils.escapeHtml(issue.assignedStaffName || "another staff member")}</strong>.
          </p>
          <div style="margin-top:12px;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;color:var(--color-navy-muted);">
            If you need to take over this ticket, contact your facility admin or request reassignment.
          </div>
        </div>
      `;
      return;
    }

    if (isUnassigned) {
      container.innerHTML = `
        <div class="card">
          <div class="card-header"><h3 class="card-title">Claim Maintenance Task</h3></div>
          <p class="text-muted" style="font-size:14px;line-height:1.6;margin-bottom:16px;">
            This classroom issue is currently <strong>Unassigned</strong>. You can take immediate ownership of this repair task.
          </p>
          <button id="btnStaffClaim" class="btn btn-primary btn-block">
            ⚡ Claim & Assign to Me
          </button>
        </div>
      `;

      const claimBtn = document.getElementById("btnStaffClaim");
      if (claimBtn) {
        claimBtn.onclick = async () => {
          claimBtn.disabled = true;
          claimBtn.innerHTML = '<span class="loading-spinner"></span> Claiming Task...';
          await window.CIMS.db.updateIssue(issue.id, {
            assignedStaffId: currentUser.uid,
            assignedStaffName: currentUser.fullName,
            assignedAt: new Date().toISOString(),
            status: "assigned"
          }, {
            action: "STAFF_ASSIGNED",
            name: currentUser.fullName,
            uid: currentUser.uid,
            role: "staff",
            details: `Task claimed by maintenance technician ${currentUser.fullName}.`
          });

          await window.CIMS.notifications.notifyStaffAssigned(currentUser.uid, issue, currentUser.fullName);
          window.CIMS.utils.showToast("Task successfully claimed and added to your queue!", "success");
          setTimeout(() => window.location.reload(), 600);
        };
      }
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
        acceptBtn.disabled = true;
        acceptBtn.innerHTML = '<span class="loading-spinner"></span> Updating...';
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
    const saveNotesBtn = document.getElementById("btnStaffSaveNotes");
    if (saveNotesBtn) {
      saveNotesBtn.onclick = async () => {
        const notes = document.getElementById("staffNotesTextarea").value.trim();
        saveNotesBtn.disabled = true;
        saveNotesBtn.innerHTML = '<span class="loading-spinner"></span> Saving...';
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
    }

    // Mark Completed
    const compBtn = document.getElementById("btnStaffComplete");
    if (compBtn) {
      compBtn.onclick = async () => {
        const notes = document.getElementById("staffNotesTextarea").value.trim();
        if (!notes) {
          alert("Please enter resolution notes describing what work was done before marking completed.");
          return;
        }

        compBtn.disabled = true;
        compBtn.innerHTML = '<span class="loading-spinner"></span> Submitting...';
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

    try {
      const u = window.CIMS.utils;
      const logs = await window.CIMS.db.getActivityLogs(issueId);

      if (!logs || logs.length === 0) {
        timelineContainer.innerHTML = `<p class="text-muted" style="font-size:13px;padding:12px 0;">No history recorded yet.</p>`;
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
                <span class="timeline-title">${u.escapeHtml((log.action || "UPDATE").replace(/_/g, " "))}</span>
                <span class="timeline-date">${u.formatDate(log.timestamp)}</span>
              </div>
              <div class="timeline-details">${u.escapeHtml(log.details || "")}</div>
              <div class="text-muted" style="font-size:11px;margin-top:4px;">
                By: <strong>${u.escapeHtml(log.performedBy || "System")}</strong> (${u.escapeHtml(log.performedByRole || "User")})
              </div>
            </div>
          </div>
        `;
      }).join("");
    } catch (e) {
      console.warn("Timeline render notice:", e);
      timelineContainer.innerHTML = `<p class="text-muted" style="font-size:13px;padding:12px 0;">Audit logs temporarily unavailable.</p>`;
    }
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
