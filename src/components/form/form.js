import { validateEmail } from "../common/inputTextEmail/inputTextEmail.js";

const loadedImageItem = (src, alt) => `
  <li class="filesList__item"> 
    <div class="filesList__image">
      <img src="${src}" alt="${alt}">
      <div class="filesList__close">
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
  const fileLabel = document.getElementById("file-label-main");
  let fileList = document.getElementById("file-list");

  emailInput.addEventListener("input", (e) => {
    if (validateEmail(e.target)) {
      e.target.classList.remove("inputText--invalid");
    } else {
      e.target.classList.add("inputText--invalid");
    }
  });

  formBtn.addEventListener("click", () => {
    if (validateEmail(emailInput)) {
      emailInput.classList.remove("inputText--invalid");
    } else {
      emailInput.classList.add("inputText--invalid");
    }
    console.log(
      nameInput.value,
      emailInput.value,
      telInput.value,
      starsInput.value,
      textInput.value
    );
  });

  document.getElementById("file").addEventListener("change", (e) => {
    const files = Array.from(e.target.files);

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
});
