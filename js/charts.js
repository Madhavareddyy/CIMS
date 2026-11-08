/**
 * CLASSROOM ISSUE MANAGEMENT SYSTEM (CIMS)
 * Data Visualization & Analytics Module (Chart.js Integration)
 */

window.CIMS = window.CIMS || {};

class CIMSChartService {
  constructor() {
    this.categoryChart = null;
    this.priorityChart = null;
    this.trendChart = null;
    this.statusChart = null;
  }

  // Render Charts on Admin Dashboard
  renderDashboardCharts(issues = []) {
    this.renderCategoryChart(issues, "categoryChartCanvas");
    this.renderPriorityChart(issues, "priorityChartCanvas");
  }

  // Render Full Analytics Suite on Reports Page
  renderReportsCharts(issues = []) {
    this.renderCategoryChart(issues, "reportCategoryCanvas");
    this.renderPriorityChart(issues, "reportPriorityCanvas");
    this.renderTrendChart(issues, "reportTrendCanvas");
    this.renderStatusDoughnut(issues, "reportStatusCanvas");
  }

  // 1. Issues by Category (Doughnut Chart)
  renderCategoryChart(issues, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return;

    if (this.categoryChart) {
      this.categoryChart.destroy();
    }

    const categories = [
      "Projector",
      "Fan",
      "Lighting",
      "Wi-Fi",
      "Benches and furniture",
      "Electrical problems",
      "Cleanliness",
      "Other"
    ];

    // Compute actual counts from database records
    const counts = categories.map(cat => 
      issues.filter(i => (i.category || "").toLowerCase() === cat.toLowerCase()).length
    );

    const hasData = counts.some(c => c > 0);

    const ctx = canvas.getContext("2d");
    this.categoryChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categories,
        datasets: [{
          data: hasData ? counts : [1],
          backgroundColor: hasData ? [
            "#2563eb", // Projector (Blue)
            "#3b82f6", // Fan (Sky)
            "#f59e0b", // Lighting (Amber)
            "#8b5cf6", // Wi-Fi (Purple)
            "#10b981", // Benches (Emerald)
            "#ef4444", // Electrical (Red)
            "#06b6d4", // Cleanliness (Cyan)
            "#64748b"  // Other (Slate)
          ] : ["#e2e8f0"],
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              font: { size: 11, family: "-apple-system, BlinkMacSystemFont, sans-serif" },
              color: "#334155"
            }
          },
          tooltip: {
            enabled: hasData,
            callbacks: {
              label: function(context) {
                return ` ${context.label}: ${context.parsed} issues`;
              }
            }
          }
        },
        cutout: "65%"
      }
    });
  }

  // 2. Issues by Priority (Bar Chart)
  renderPriorityChart(issues, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return;

    if (this.priorityChart) {
      this.priorityChart.destroy();
    }

    const priorities = ["Low", "Medium", "High", "Urgent"];
    const counts = [
      issues.filter(i => (i.priority || "").toLowerCase() === "low").length,
      issues.filter(i => (i.priority || "").toLowerCase() === "medium").length,
      issues.filter(i => (i.priority || "").toLowerCase() === "high").length,
      issues.filter(i => (i.priority || "").toLowerCase() === "urgent").length
    ];

    const ctx = canvas.getContext("2d");
    this.priorityChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: priorities,
        datasets: [{
          label: "Classroom Issues",
          data: counts,
          backgroundColor: [
            "#94a3b8", // Low
            "#f59e0b", // Medium
            "#ea580c", // High
            "#ef4444"  // Urgent
          ],
          borderRadius: 6,
          maxBarThickness: 42
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 },
              color: "#64748b"
            },
            grid: {
              color: "#f1f5f9"
            }
          },
          x: {
            ticks: {
              font: { size: 12, weight: "bold" },
              color: "#334155"
            },
            grid: { display: false }
          }
        }
      }
    });
  }

  // 3. Monthly Trends (Line Chart)
  renderTrendChart(issues, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return;

    if (this.trendChart) {
      this.trendChart.destroy();
    }

    // Get last 6 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    const months = [];
    const monthlyCounts = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mKey = `${d.getFullYear()}-${d.getMonth()}`;
      months.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);

      const count = issues.filter(issue => {
        if (!issue.createdAt) return false;
        const idate = new Date(issue.createdAt);
        return idate.getFullYear() === d.getFullYear() && idate.getMonth() === d.getMonth();
      }).length;

      monthlyCounts.push(count);
    }

    const ctx = canvas.getContext("2d");
    this.trendChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [{
          label: "Reported Issues",
          data: monthlyCounts,
          fill: true,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          tension: 0.35,
          pointBackgroundColor: "#2563eb",
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              font: { size: 11 },
              color: "#64748b"
            },
            grid: { color: "#f1f5f9" }
          },
          x: {
            ticks: { font: { size: 11 }, color: "#64748b" },
            grid: { display: false }
          }
        }
      }
    });
  }

  // 4. Status Breakdown Doughnut
  renderStatusDoughnut(issues, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || typeof Chart === "undefined") return;

    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const statuses = ["Pending", "Assigned", "In Progress", "Completed", "Resolved", "Rejected"];
    const counts = [
      issues.filter(i => i.status === "pending").length,
      issues.filter(i => i.status === "assigned").length,
      issues.filter(i => i.status === "in_progress").length,
      issues.filter(i => i.status === "completed").length,
      issues.filter(i => i.status === "resolved").length,
      issues.filter(i => i.status === "rejected").length
    ];

    const ctx = canvas.getContext("2d");
    this.statusChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: statuses,
        datasets: [{
          data: counts,
          backgroundColor: [
            "#f59e0b", // Pending (Amber)
            "#0284c7", // Assigned (Info Blue)
            "#8b5cf6", // In Progress (Purple)
            "#3b82f6", // Completed (Light Blue)
            "#10b981", // Resolved (Green)
            "#ef4444"  // Rejected (Red)
          ],
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 10, font: { size: 11 }, color: "#334155" }
          }
        },
        cutout: "60%"
      }
    });
  }
}

window.CIMS.charts = new CIMSChartService();
