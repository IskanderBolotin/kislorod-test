import { validateEmail } from "../common/inputTextEmail/inputTextEmail.js";
import "../common/inputTextTel/inputTextTel.js"

const loadedImageItem = (src, name) => `
  <li class="filesList__item"> 
    <div class="filesList__image">
      <img src="${src}" alt="${name}">
      <div class="filesList__close" data-name="${name}">
        <svg>
          <use xlink:href="./icons/sprite.svg#close"></use>
        </svg>
      </div>
    </div>
  </li>
`;

const fileLabelPattern = `
  <li class="filesList__item"> 
    <label class="inputFileMin" for="file"> 
      <span class="inputFile__icon">
        <svg>
          <use xlink:href="./icons/sprite.svg#load-file"></use>
        </svg>
      </span>
    </label>
  </li>
`;
const fileListPattern = `
  <ul class="filesList" id="file-list">
    ${fileLabelPattern}
  </ul>
`;

document.addEventListener("DOMContentLoaded", () => {
  const formBtn = document.getElementById("reviewBtn");
  const nameInput = document.forms["reviewForm"].elements["name"];
  const emailInput = document.forms["reviewForm"].elements["email"];
  const telInput = document.forms["reviewForm"].elements["tel"];
  const starsInput = document.forms["reviewForm"].elements["review"];
  const textInput = document.forms["reviewForm"].elements["textArea"];

  const fileWrapper = document.getElementById("file-wrapper");
  const fileInput = document.getElementById("file");
  const fileLabel = document.getElementById("file-label-main");
  let fileList = document.getElementById("file-list");
  let files = [];

  const thankBlock = document.querySelector(".thankyou");

  emailInput.addEventListener("input", (e) => {
    if (validateEmail(e.target)) {
      e.target.classList.remove("inputText--invalid");
    } else {
      e.target.classList.add("inputText--invalid");
    }
  });

  formBtn.addEventListener("click", () => {
  
    if (nameInput.value.length !== 0 ) {
      nameInput.classList.remove("inputText--invalid");
    } else {
      nameInput.classList.add("inputText--invalid");
      nameInput.focus()
      return;
    }

    if (validateEmail(emailInput)) {
      emailInput.classList.remove("inputText--invalid");
    } else {
      emailInput.classList.add("inputText--invalid");
      emailInput.focus();
      return;
    }

    if (textInput.value.length !== 0 ) {
      textInput.classList.remove("inputText--invalid");
    } else {
      textInput.classList.add("inputText--invalid");
      textInput.focus()
      return;
    }

    thankBlock.classList.add("show");

    console.log(
      "name: ",
      nameInput.value,
      "email: ",
      emailInput.value,
      "tel: ",
      telInput.value,
      "mark: ",
      starsInput.value,
      "comment: ",
      textInput.value,
      "files: ",
      files
    );
  });

  fileInput.addEventListener("change", (e) => {
    files = Array.from(e.target.files);
    console.log("files", files)
    if (files.length === 0) {
      fileLabel.classList.remove("hide");
      return;
    }
    
    if (!!fileList) {
      fileList.remove();
      fileList = null
    }

    files.forEach((item) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const src = e.target.result;

        if (!fileList) {
          fileLabel.classList.add("hide");
          fileWrapper.insertAdjacentHTML("beforeend", fileListPattern);
        }
        fileList = document.getElementById("file-list");

        fileList.insertAdjacentHTML(
          "beforeend",
          loadedImageItem(src, item.name)
        );
      };

      reader.readAsDataURL(item);
    });
  });

  fileWrapper.addEventListener("click", (e) => {
    if (!e.target.closest(".filesList__close")) {
      return
    }
    const {name} = e.target.closest(".filesList__close").dataset;
    
    files = files.filter(file => file.name !== name);

    const removedImage = fileWrapper.querySelector(`[data-name="${name}"]`).closest(".filesList__item");
    removedImage.remove();

    if (files.length === 0) {
      fileLabel.classList.remove("hide");
      if (!!fileList) {
        fileList.remove();
        fileList = null
      }
    }
  });
});
