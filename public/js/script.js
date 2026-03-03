// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.text();

        if (data === "Login successful") {
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("message").innerText = data;
        }
    });
}


// REGISTER
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;

        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.text();
        document.getElementById("regMessage").innerText = data;
    });
}


// LOGOUT
function logout() {
    window.location.href = "login.html";
}
