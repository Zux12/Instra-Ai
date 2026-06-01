const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "Logging in...";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!data.success) {
      loginMessage.textContent = data.message || "Login failed.";
      return;
    }

    localStorage.setItem("instraUser", JSON.stringify(data.user));

    if (data.user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dashboard";
    }
  } catch (error) {
    loginMessage.textContent = "Login error: " + error.message;
  }
});
