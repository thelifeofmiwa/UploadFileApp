import "./style.css";
import "./FileUploadComponent.mjs";

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    const fileUpload = document.createElement("file-upload");
    app.appendChild(fileUpload);
});
