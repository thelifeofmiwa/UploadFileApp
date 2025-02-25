class FileUploadComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.state = {
        name: "",
        file: null,
        progress: 0,
        status: "Перед загрузкой дайте имя файлу",
        fileUploaded: false,
      };
      this.render();
    }
  
    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: Arial, sans-serif;
            padding: 20px;
            border-radius: 10px;
            width: 350px;
            background: linear-gradient(to bottom, #6a5acd, #ffffff);
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            position: relative;
          }
          h2 {
            color: white;
            text-align: center;
          }
          .input-container {
            position: relative;
            display: flex;
            align-items: center;
          }
          input {
            width: 100%;
            padding: 8px;
            font-size: 14px;
            border: none;
            border-radius: 5px;
            background: white;
            color: #6a5acd;
          }
          .clear-btn {
            position: absolute;
            right: 10px;
            cursor: pointer;
            color: #6a5acd;
          }
          .drop-zone {
            border: 2px solid rgba(165, 165, 165, 1);
            text-align: center;
            padding: 20px;
            margin-top: 10px;
            cursor: pointer;
            color: rgba(95, 92, 240, 1);
            width: 300px;
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 20px;
            font-size: 16px;
            background-color: rgba(255, 255, 255, 0.3);
          }
          .drop-zone span {
            white-space: normal;
            word-wrap: break-word;
          }
          .progress-container {
            display: flex;
            align-items: center;
            margin-top: 10px;
          }
          .progress-bar {
            flex-grow: 1;
            height: 5px;
            background: #6a5acd;
            border-radius: 5px;
          }
          .progress-text {
            margin-left: 10px;
            color: white;
          }
          .cancel-btn {
            margin-left: 10px;
            cursor: pointer;
            color: white;
          }
          button {
            width: 100%;
            margin-top: 10px;
            padding: 10px;
            font-size: 16px;
            background-color: #6a5acd;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 5px;
          }
          button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
          }
        </style>
        <h2>Загрузочное окно</h2>
        <p id="nameStatus">${this.state.status}</p>
        <div class="input-container">
          <input type="text" id="name" placeholder="Название файла" value="${this.state.name}" />
          <span class="clear-btn">✖</span>
        </div>
        <div class="drop-zone" id="dropZone">
          <span>Перенесите ваш файл<br>в область ниже</span>
        </div>
        <div class="progress-container" id="progressContainer" style="display: none;">
          <div class="progress-bar" id="progressBar" style="width: ${this.state.progress}%"></div>
          <span class="progress-text" id="progressText">${this.state.progress}%</span>
          <span class="cancel-btn" id="cancelBtn">✖</span>
        </div>
        <button id="uploadBtn" ${this.state.fileUploaded ? "disabled" : ""}>Загрузить</button>
        <p id="statusMsg"></p>
      `;
      this.setupEventListeners();
    }
  
    setupEventListeners() {
      const nameInput = this.shadowRoot.getElementById("name");
      const clearBtn = this.shadowRoot.querySelector(".clear-btn");
      const dropZone = this.shadowRoot.getElementById("dropZone");
      const uploadBtn = this.shadowRoot.getElementById("uploadBtn");
      const progressContainer = this.shadowRoot.getElementById("progressContainer");
      const progressBar = this.shadowRoot.getElementById("progressBar");
      const progressText = this.shadowRoot.getElementById("progressText");
      const cancelBtn = this.shadowRoot.getElementById("cancelBtn");
      const statusMsg = this.shadowRoot.getElementById("statusMsg");
      const nameStatus = this.shadowRoot.getElementById("nameStatus");
  
      clearBtn.addEventListener("click", () => {
        this.state.name = "";
        this.state.fileUploaded = false;
        this.state.progress = 0;
        this.state.status = "Перед загрузкой дайте имя файлу";
        this.state.file = null;
        this.render();
      });
  
      nameInput.addEventListener("input", () => {
        this.state.name = nameInput.value;
        this.state.status = this.state.name
          ? "Перенесите ваш файл в область ниже"
          : "Перед загрузкой дайте имя файлу";
        uploadBtn.disabled = !(this.state.name && this.state.file);
        nameStatus.textContent = this.state.status;
      });
  
      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.style.borderColor = "#ffffff";
      });
  
      dropZone.addEventListener("dragleave", () => {
        dropZone.style.borderColor = "rgba(165, 165, 165, 1)";
      });
  
      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        this.state.file = e.dataTransfer.files[0];
        if (this.state.file) {
          this.startUpload(this.state.file);
        }
      });
  
      dropZone.addEventListener("click", () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.addEventListener("change", () => {
          this.state.file = fileInput.files[0];
          if (this.state.file) {
            this.startUpload(this.state.file);
          }
        });
        fileInput.click();
      });
  
      cancelBtn.addEventListener("click", () => {
        this.state.file = null;
        this.state.progress = 0;
        this.state.status = "Перенесите ваш файл в область ниже";
        this.state.fileUploaded = false;
        this.render();
      });
  
      uploadBtn.addEventListener("click", async () => {
        if (!this.state.file || !this.state.name) return;
        statusMsg.textContent = "Загрузка...";
  
        const formData = new FormData();
        formData.append("file", this.state.file);
        formData.append("name", this.state.name);
  
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
            statusMsg.textContent = `Файл успешно загружен: ${result.message}`;
            this.state.fileUploaded = true;
            this.state.status = "Загрузите ваш файл";
            uploadBtn.disabled = true;
            this.render();
          } else {
            statusMsg.textContent = `Ошибка загрузки: ${result.error}`;
          }
        } catch (error) {
          statusMsg.textContent = "Ошибка сервера. Попробуйте снова.";
        }
      });
    }
  
    startUpload(file) {
      const progressContainer = this.shadowRoot.getElementById("progressContainer");
      const progressBar = this.shadowRoot.getElementById("progressBar");
      const progressText = this.shadowRoot.getElementById("progressText");
      const uploadBtn = this.shadowRoot.getElementById("uploadBtn");
  
      progressContainer.style.display = "flex";
      let progress = 0;
      const interval = setInterval(() => {
        if (progress >= 100) {
          clearInterval(interval);
          uploadBtn.disabled = false;
          this.state.status = "Загрузите ваш файл";
          this.render();
        } else {
          progress += 10;
          this.state.progress = progress;
          progressBar.style.width = `${progress}%`;
          progressText.textContent = `${progress}%`;
        }
      }, 500);
    }
  }
  
  customElements.define("file-upload", FileUploadComponent);
  