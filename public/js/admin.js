const usersBox = document.getElementById("usersBox");
const knowledgeBox = document.getElementById("knowledgeBox");

const storedUser = localStorage.getItem("instraUser");

if (!storedUser) {
  window.location.href = "/";
}

const user = JSON.parse(storedUser);

if (user.role !== "admin") {
  window.location.href = "/dashboard";
}

async function loadUsers() {
  try {
    const response = await fetch("/api/admin/users");
    const data = await response.json();

    if (!data.success) {
      usersBox.innerHTML = `<p>${data.message}</p>`;
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Package</th>
            <th>Allowed Equipment</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.users.forEach((u) => {
      html += `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${u.packageName}</td>
          <td>${(u.allowedEquipment || []).join(", ") || "-"}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    usersBox.innerHTML = html;
  } catch (error) {
    usersBox.innerHTML = `<p>Error loading users: ${error.message}</p>`;
  }
}

async function updateKnowledgeStatus(id, status) {
  try {
    const response = await fetch(`/api/admin/knowledge/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        approvalStatus: status,
        reviewedBy: user.name,
        approvedBy: status === "Approved" ? user.name : ""
      })
    });

    const data = await response.json();

    if (!data.success) {
      alert(data.message || "Failed to update status.");
      return;
    }

    loadKnowledge();
  } catch (error) {
    alert("Status update error: " + error.message);
  }
}

async function loadKnowledge() {
  try {
    const response = await fetch("/api/admin/knowledge");
    const data = await response.json();

    if (!data.success) {
      knowledgeBox.innerHTML = `<p>${data.message}</p>`;
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Issue</th>
            <th>Status</th>
            <th>Confidence</th>
            <th>Problem Summary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.knowledge.forEach((k) => {
      html += `
        <tr>
          <td>${k.equipmentType}</td>
          <td>${k.issueType}</td>
          <td>${k.approvalStatus}</td>
          <td>${k.confidenceLevel}</td>
          <td>${k.problemSummary}</td>
          <td>
            <button onclick="updateKnowledgeStatus('${k._id}', 'Reviewed')">Reviewed</button>
            <button onclick="updateKnowledgeStatus('${k._id}', 'Approved')">Approve</button>
            <button onclick="updateKnowledgeStatus('${k._id}', 'Rejected')">Reject</button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    knowledgeBox.innerHTML = html;
  } catch (error) {
    knowledgeBox.innerHTML = `<p>Error loading knowledge: ${error.message}</p>`;
  }
}

loadUsers();
loadKnowledge();
