import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.min.js";
import { ScrollToPlugin } from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/ScrollToPlugin.min.js";

gsap.registerPlugin(ScrollToPlugin);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      gsap.to(window, {
        duration: 1.4,
        scrollTo: { y: target, offsetY: -30 },
        ease: "back.out(0.5)"
      });
    }
  });
});