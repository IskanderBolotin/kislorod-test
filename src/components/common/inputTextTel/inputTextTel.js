const telInput = document.getElementById("tel");
const maskOptions = {
  mask: "+7(000)000-00-00",
  lazy: false,
};

const maskTel = new IMask(telInput, maskOptions);
