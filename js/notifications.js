/**
 * CLASSROOM ISSUE MANAGEMENT SYSTEM (CIMS)
 * Notification System Module
 */

window.CIMS = window.CIMS || {};

class CIMSNotificationService {
  async loadHeaderNotifications(userId) {
    if (!userId) return;

    try {
      const notifs = await window.CIMS.db.getNotifications(userId);
      const unreadCount = notifs.filter(n => !n.isRead).length;

      const badge = document.getElementById("notifBadge");
      if (badge) {
        if (unreadCount > 0) {
          badge.textContent = unreadCount > 9 ? "9+" : unreadCount;
          badge.style.display = "block";
        } else {
          badge.style.display = "none";
        }
      }

      const listContainer = document.getElementById("notifList");
      if (!listContainer) return;

      if (notifs.length === 0) {
        listContainer.innerHTML = `
          <div class="notification-empty">
            <svg style="width:36px;height:36px;margin-bottom:8px;stroke:#94a3b8;fill:none;" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p>No notifications yet</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = notifs.map(n => `
        <div class="notification-item ${n.isRead ? "" : "unread"}" data-id="${window.CIMS.utils.escapeHtml(n.id)}" data-issue-id="${window.CIMS.utils.escapeHtml(n.issueId || "")}">
          <div class="notification-dot" style="${n.isRead ? "visibility:hidden;" : ""}"></div>
          <div class="notification-body">
            <h5>${window.CIMS.utils.escapeHtml(n.title)}</h5>
            <p>${window.CIMS.utils.escapeHtml(n.message)}</p>
            <div class="notification-time">${window.CIMS.utils.formatRelativeTime(n.createdAt)}</div>
          </div>
        </div>
      `).join("");

      // Add click listeners to items
      listContainer.querySelectorAll(".notification-item").forEach(item => {
        item.addEventListener("click", async () => {
          const notifId = item.dataset.id;
          const issueId = item.dataset.issueId;
          await window.CIMS.db.markNotificationAsRead(notifId);
          item.classList.remove("unread");
          const dot = item.querySelector(".notification-dot");
          if (dot) dot.style.visibility = "hidden";
          
          if (issueId) {
            window.location.href = `issue-details.html?id=${issueId}`;
          }
        });
      });

      // Mark All Read Button
      const markAllBtn = document.getElementById("markAllReadBtn");
      if (markAllBtn) {
        markAllBtn.onclick = async () => {
          for (const n of notifs.filter(x => !x.isRead)) {
            await window.CIMS.db.markNotificationAsRead(n.id);
          }
          this.loadHeaderNotifications(userId);
        };
      }
    } catch (err) {
      console.warn("Error loading notifications:", err);
    }
  }

  // Trigger automated notification to student when status changes
  async notifyStatusChange(issue, newStatus, actorName) {
    if (!issue || !issue.studentId) return;

    const statusTexts = {
      assigned: `has been assigned to maintenance technician ${issue.assignedStaffName || "staff"}`,
      in_progress: "is now being actively serviced",
      completed: "has been completed by maintenance staff and is pending admin sign-off",
      resolved: "has been verified and marked RESOLVED",
      rejected: "has been reviewed and declined"
    };

    const actionText = statusTexts[newStatus] || `status changed to ${newStatus}`;

    await window.CIMS.db.createNotification({
      userId: issue.studentId,
      title: `Issue ${newStatus.toUpperCase()}`,
      message: `Your reported complaint (${issue.category} in ${issue.classroomNumber}) ${actionText}.`,
      issueId: issue.id
    });
  }

  // Trigger automated notification to staff when assigned
  async notifyStaffAssigned(staffId, issue, adminName) {
    if (!staffId || !issue) return;

    await window.CIMS.db.createNotification({
      userId: staffId,
      title: "New Task Assigned",
      message: `${adminName} assigned you to fix ${issue.category} in ${issue.classroomNumber} (Priority: ${issue.priority.toUpperCase()}).`,
      issueId: issue.id
    });
  }
}

window.CIMS.notifications = new CIMSNotificationService();
