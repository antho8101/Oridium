document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger-toggle");
    const mobileMenu = document.getElementById("mobile-menu");
  
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
  });  