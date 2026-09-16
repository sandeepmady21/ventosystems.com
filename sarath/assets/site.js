/* Shared, local-only navigation. No data is collected or sent. */
(() => {
  "use strict";
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!header || !toggle || !nav) return;

  function closeMenu(returnFocus = false) {
    header.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    if (returnFocus) toggle.focus();
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-open"))
      closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  const desktop = window.matchMedia("(min-width: 1100px)");
  desktop.addEventListener("change", () => closeMenu());

  let page = location.pathname.split("/").pop() || "index.html";
  if (page.startsWith("newsletter-")) page = "newsletter.html";
  nav.querySelectorAll("a").forEach((link) => {
    if (link.getAttribute("href") === page)
      link.setAttribute("aria-current", "page");
  });

  // Apply mobile hiding only after its control and handlers are ready.
  toggle.hidden = false;
  document.documentElement.classList.add("js");

  // Make long newsletter tables scrollable using the keyboard, too.
  document.querySelectorAll(".table-scroll").forEach((table, index) => {
    table.tabIndex = 0;
    table.setAttribute("role", "region");
    const caption = table.querySelector("caption");
    table.setAttribute(
      "aria-label",
      caption ? caption.textContent.trim() : `Scrollable table ${index + 1}`,
    );
  });
})();
