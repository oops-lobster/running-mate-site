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

const themedScenes = [...document.querySelectorAll("[data-theme]")];
const syncHeaderTheme = () => {
  if (!header) return;
  const probe = header.getBoundingClientRect().bottom + 1;
  const active = themedScenes.find((scene) => {
    const rect = scene.getBoundingClientRect();
    return rect.top <= probe && rect.bottom > probe;
  });
  header.classList.toggle("is-dark", active?.dataset.theme !== "light");
};

syncHeaderTheme();
window.addEventListener("scroll", syncHeaderTheme, { passive: true });

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
    if (period) period.textContent = annual ? "연 결제 · 월 5만원 꼴" : "/ 월";
  });
});

const screenImage = document.querySelector("[data-screen-image]");
const screenIndex = document.querySelector("[data-screen-index]");
const screenState = document.querySelector("[data-screen-state]");
const screenPoints = document.querySelector("[data-screen-points]");
const tourPhone = screenImage?.closest(".tour-phone");

document.querySelectorAll(".screen-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    if (tab.classList.contains("active")) return;

    document.querySelectorAll(".screen-tab").forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-selected", String(selected));
    });

    tourPhone?.classList.add("is-changing");
    window.setTimeout(() => {
      if (screenImage && tab.dataset.image) screenImage.src = tab.dataset.image;
      if (screenImage && tab.dataset.alt) screenImage.alt = tab.dataset.alt;
      if (screenIndex && tab.dataset.index) screenIndex.textContent = tab.dataset.index;
      if (screenState && tab.dataset.state) screenState.textContent = tab.dataset.state;
      if (screenPoints && tab.dataset.points) {
        const points = tab.dataset.points.split("|");
        screenPoints.replaceChildren(...points.map((point) => {
          const item = document.createElement("li");
          item.textContent = point;
          return item;
        }));
      }
      tourPhone?.classList.remove("is-changing");
    }, reduceMotion ? 0 : 150);
  });
});
