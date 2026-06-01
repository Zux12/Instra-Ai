const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");
const equipmentGrid = document.getElementById("equipmentGrid");
const selectedEquipmentText = document.getElementById("selectedEquipmentText");
const questionInput = document.getElementById("questionInput");
const askBtn = document.getElementById("askBtn");
const answerBox = document.getElementById("answerBox");

let selectedEquipment = "";

const storedUser = localStorage.getItem("instraUser");

if (!storedUser) {
  window.location.href = "/";
}

const user = JSON.parse(storedUser);

userInfo.textContent = `${user.name} | ${user.packageName}`;

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("instraUser");
  window.location.href = "/";
});

async function loadEquipment() {
  try {
    const response = await fetch(`/api/equipment/${encodeURIComponent(user.email)}`);
    const data = await response.json();

    if (!data.success) {
      equipmentGrid.innerHTML = `<p>${data.message}</p>`;
      return;
    }

    equipmentGrid.innerHTML = "";

    data.equipment.forEach((item) => {
      const card = document.createElement("div");
      card.className = item.unlocked
        ? "equipment-card unlocked"
        : "equipment-card locked";

      card.innerHTML = `
        <h3>${item.name}</h3>
        <span class="badge ${item.unlocked ? "badge-unlocked" : "badge-locked"}">
          ${item.unlocked ? "Unlocked" : "Locked"}
        </span>
      `;

      if (item.unlocked) {
        card.addEventListener("click", () => {
          selectedEquipment = item.name;
          selectedEquipmentText.textContent = `Selected equipment: ${item.name}`;
          answerBox.textContent = "You can now ask a troubleshooting question for this equipment.";
        });
      } else {
        card.addEventListener("click", () => {
          answerBox.textContent = `${item.name} is locked. Upgrade your subscription to access this module.`;
        });
      }

      equipmentGrid.appendChild(card);
    });
  } catch (error) {
    equipmentGrid.innerHTML = `<p>Error loading equipment: ${error.message}</p>`;
  }
}

askBtn.addEventListener("click", async () => {
  const question = questionInput.value.trim();

  if (!selectedEquipment) {
    answerBox.textContent = "Please select an unlocked equipment module first.";
    return;
  }

  if (!question) {
    answerBox.textContent = "Please enter your troubleshooting question.";
    return;
  }

  answerBox.textContent = "INSTRA AI is analyzing the approved knowledge...";

  try {
    const response = await fetch("/api/ai/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: user.email,
        equipmentType: selectedEquipment,
        question
      })
    });

    const data = await response.json();

    if (!data.success) {
      answerBox.textContent = data.message || "AI request failed.";
      return;
    }

    answerBox.textContent = data.response;
  } catch (error) {
    answerBox.textContent = "AI error: " + error.message;
  }
});

loadEquipment();
