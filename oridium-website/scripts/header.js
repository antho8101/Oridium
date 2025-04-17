document.addEventListener("DOMContentLoaded", () => {
  const burgerButtons = document.querySelectorAll(".burger-menu");
  const mobileMenu = document.getElementById("mobile-menu");

  if (burgerButtons.length > 0 && mobileMenu) {
    burgerButtons.forEach(button => {
      button.addEventListener("click", () => {
        mobileMenu.classList.toggle("open");
      });
    });
  }
});