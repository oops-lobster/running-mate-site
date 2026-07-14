const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const menu = header?.querySelector("nav");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((element) => {
  if (reduceMotion) element.classList.add("is-visible");
  else revealObserver.observe(element);
});

const themeObserver = new IntersectionObserver(
  (entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!active || !header) return;
    header.classList.toggle("is-dark", active.target.dataset.theme === "dark");
  },
  { threshold: [0.25, 0.5, 0.75], rootMargin: "-70px 0px -55% 0px" },
);

document.querySelectorAll("[data-theme]").forEach((scene) => themeObserver.observe(scene));

menuButton?.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!expanded));
  menuButton.setAttribute("aria-label", expanded ? "메뉴 열기" : "메뉴 닫기");
  menu?.classList.toggle("is-open", !expanded);
  document.body.classList.toggle("menu-open", !expanded);
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "메뉴 열기");
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  });
});

const price = document.querySelector("[data-price]");
const period = document.querySelector("[data-period]");
document.querySelectorAll("[data-billing]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-billing]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const annual = button.dataset.billing === "annual";
    if (price) price.textContent = annual ? "₩600,000" : "₩59,000";
    if (period) period.textContent = annual ? "연 결제 · 월 5만원 꼴" : "매월";
  });
});
