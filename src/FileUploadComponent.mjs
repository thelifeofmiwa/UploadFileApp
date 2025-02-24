class FileUploadComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: Arial, sans-serif;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            width: 300px;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
            background-color: #f9f9f9;
          }
          input, button {
            display: block;
            width: 100%;
            margin-bottom: 10px;
            padding: 8px;
            font-size: 14px;
          }
          button {
            background-color: #007bff;
            color: white;
            border: none;
            cursor: pointer;
          }
          button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
          }
          .error {
            color: red;
          }
          .hidden {
            display: none;
          }
        </style>
        <input type="text" id="name" placeholder="Enter your name" />
        <input type="file" id="fileInput" />
        <p id="errorMsg" class="error hidden"></p>
        <button id="uploadBtn" disabled>Upload to Server</button>
        <p id="statusMsg"></p>
      `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const nameInput = this.shadowRoot.getElementById("name");
        const fileInput = this.shadowRoot.getElementById("fileInput");
        const uploadBtn = this.shadowRoot.getElementById("uploadBtn");
        const errorMsg = this.shadowRoot.getElementById("errorMsg");
        const statusMsg = this.shadowRoot.getElementById("statusMsg");

        fileInput.addEventListener("change", () => {
            const file = fileInput.files[0];
            if (!file) return;

            const validTypes = ["text/plain", "application/json", "text/csv"];
            if (!validTypes.includes(file.type)) {
                errorMsg.textContent =
                    "Invalid file type. Only .txt, .json, .csv allowed.";
                errorMsg.classList.remove("hidden");
                uploadBtn.disabled = true;
                return;
            }

            if (file.size > 1024) {
                errorMsg.textContent = "File exceeds 1 KB size limit.";
                errorMsg.classList.remove("hidden");
                uploadBtn.disabled = true;
                return;
            }

            errorMsg.classList.add("hidden");
            uploadBtn.disabled = !nameInput.value;
        });

        nameInput.addEventListener("input", () => {
            uploadBtn.disabled = !(
                nameInput.value && fileInput.files.length > 0
            );
        });

        uploadBtn.addEventListener("click", async () => {
            const file = fileInput.files[0];
            const name = nameInput.value;
            if (!file || !name) return;

            uploadBtn.disabled = true;
            statusMsg.textContent = "Uploading...";

            const formData = new FormData();
            formData.append("file", file);
            formData.append("name", name);

            try {
                const response = await fetch(
                    "https://file-upload-server-mc26.onrender.com/api/v1/upload",
                    {
                        method: "POST",
                        body: formData,
                    }
                );

                const result = await response.json();
                if (response.ok) {
                    statusMsg.textContent = `Success: ${result.message}`;
                } else {
                    statusMsg.textContent = `Error: ${result.error}`;
                }
            } catch (error) {
                statusMsg.textContent = "Server error. Try again later.";
            } finally {
                uploadBtn.disabled = false;
            }
        });
    }
}

customElements.define("file-upload", FileUploadComponent);
