const chatBox = document.getElementById("chatBox");
const statusEl = document.getElementById("status");
const downloadLink = document.getElementById("downloadLink");

// ================= CHAT UI =================
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "chat-msg " + sender;
  div.innerHTML = `<b>${sender === "agent" ? "Agent" : "You"}:</b> ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ================= INITIAL GREETING =================
addMessage(
  "Hello 👋 Welcome to BMSCSE-CT.\n\n" +
  "Please choose conversion type:\n" +
  "1️⃣ Standard Conversion (clear tables, VTU results)\n" +
  "2️⃣ Advanced Conversion (scanned, unclear, multi-page, handwritten)\n\n" +
  "Reply with 1 or 2.",
  "agent"
);

// ================= AI AGENT =================
async function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  // ===== NUMERIC SELECTION (BEST UX) =====
  if (text === "1") {
    window.selectedEndpoint = "/convert-multiple/";
    addMessage(
      "✅ Standard Conversion selected.\n" +
      "Upload clear PDFs or images (e.g., VTU results).",
      "agent"
    );
    return;
  }

  if (text === "2") {
    window.selectedEndpoint = "/convert-advanced/";
    addMessage(
      "🚀 Advanced Conversion selected.\n" +
      "Upload scanned, unclear, multi-page, or handwritten documents.",
      "agent"
    );
    return;
  }

  // ===== OPTIONAL: BACKEND AI ROUTING =====
  try {
    const res = await fetch("http://127.0.0.1:8000/agent/route-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task: text })
    });

    const decision = await res.json();
    window.selectedEndpoint = decision.endpoint;

    addMessage(decision.message, "agent");

  } catch (err) {
    console.error(err);
    window.selectedEndpoint = "/convert-multiple/";
    addMessage(
      "Please reply with:\n" +
      "1️⃣ Standard Conversion\n" +
      "2️⃣ Advanced Conversion",
      "agent"
    );
  }
}

// ================= FILE UPLOAD =================
async function uploadFiles() {
  const files = document.getElementById("files").files;
  if (files.length === 0) {
    alert("Please select files");
    return;
  }

  let formData = new FormData();
  for (let file of files) {
    formData.append("files", file);
  }

  statusEl.innerText = "Processing...";
  addMessage("Processing your files, please wait ⏳", "agent");

  // Default fallback
  const endpoint = window.selectedEndpoint || "/convert-multiple/";

  try {
    const response = await fetch("http://127.0.0.1:8000" + endpoint, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const result = await response.json();

    statusEl.innerText = result.message || "Conversion Successful!";
    addMessage("✅ Conversion completed successfully.", "agent");

    downloadLink.href =
      "http://127.0.0.1:8000/download/" + result.file_id;
    downloadLink.style.display = "block";

  } catch (err) {
    console.error(err);
    statusEl.innerText = "Error occurred";
    addMessage("❌ Something went wrong during conversion.", "agent");
  }
}
