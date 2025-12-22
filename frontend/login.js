async function login() {
    const email = document.getElementById("email").value.trim();
    const status = document.getElementById("status");

    if (!email) {
        status.innerText = "Please enter email ID";
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (!res.ok) {
            status.innerText = data.detail || "Login failed";
            return;
        }

        // Save login info
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);

        // Redirect
        window.location.href = "index.html";

    } catch (err) {
        status.innerText = "Backend not running";
    }
}
