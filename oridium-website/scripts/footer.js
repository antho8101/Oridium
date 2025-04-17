document.addEventListener("DOMContentLoaded", () => {
    const headers = document.querySelectorAll(".footer-accordion-header");
  
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        const item = header.parentElement;
        const content = item.querySelector(".footer-accordion-content");
        const isOpen = item.classList.contains("active");
  
        // Fermer tous les items
        document.querySelectorAll(".footer-accordion-item.active").forEach((openItem) => {
          openItem.classList.remove("active");
          openItem.querySelector(".footer-accordion-content").style.maxHeight = null;
        });
  
        // Si celui qu’on clique n’était pas actif, on l’ouvre
        if (!isOpen) {
          item.classList.add("active");
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    });
  });  