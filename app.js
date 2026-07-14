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

const chatScenarios = {
  korean: {
    student: "오늘 국어 실모 68점이었어요. 화작에 12분 쓰고 독서 마지막 지문을 거의 못 풀었어요.",
    mentor: "Cathy",
    initial: "C",
    sentAt: "21:18",
    repliedAt: "21:26",
    reply: "화작 12분은 괜찮아. 독서 첫 두 지문에서 각각 몇 분을 썼는지 먼저 보자. 오늘 회고 사진도 올려주면, 내일 끊어야 할 기준을 하나 정해줄게.",
  },
  math: {
    student: "수학 오답을 다시 봐도 다음 날 똑같이 막혀요. 뭘 남겨야 할까요?",
    mentor: "Ray",
    initial: "R",
    sentAt: "22:04",
    repliedAt: "22:12",
    reply: "정답 풀이 전체보다 ‘처음 막힌 한 줄’을 남겨보자. 오늘 틀린 문제 중 3개만 골라서, 막힌 순간과 다시 풀 첫 행동을 적어줘. 내일 시작 전에 내가 순서 확인해줄게.",
  },
  plan: {
    student: "오후 계획을 거의 못 지켰어요. 내일 계획을 전부 다시 짜야 할까요?",
    mentor: "Cathy",
    initial: "C",
    sentAt: "20:47",
    repliedAt: "20:55",
    reply: "전부 다시 짜지 말자. 오늘 밀린 세션 중 점수에 바로 연결되는 하나만 내일 첫 블록으로 옮기고, 나머지는 버려도 돼. 지금 타임라인을 보내주면 우선순위 같이 고를게.",
  },
};

const chatLog = document.querySelector("[data-chat-log]");
const chatTopicButtons = [...document.querySelectorAll("[data-chat-topic]")];
const workflowSteps = [...document.querySelectorAll(".mentor-workflow li")];
let chatReplyTimer;

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
};

const createStudentMessage = (scenario) => {
  const message = createElement("div", "chat-message mine");
  const meta = createElement("div", "chat-message-meta");
  meta.append(createElement("b", "", "나"), createElement("span", "", scenario.sentAt));
  message.append(meta, createElement("p", "", scenario.student));
  return message;
};

const createMentorMessage = (scenario, typing = false) => {
  const message = createElement("div", "chat-message theirs");
  const avatar = createElement("div", "chat-avatar", scenario.initial);
  avatar.setAttribute("aria-hidden", "true");
  const stack = document.createElement("div");
  const meta = createElement("div", "chat-message-meta");
  meta.append(createElement("b", "", scenario.mentor));

  if (!typing) {
    meta.append(createElement("span", "direct-label", "개별 답장"), createElement("span", "", scenario.repliedAt));
    stack.append(meta, createElement("p", "", scenario.reply));
  } else {
    const indicator = createElement("div", "chat-typing");
    indicator.setAttribute("aria-label", `${scenario.mentor} 멘토가 답장을 작성하고 있습니다.`);
    indicator.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));
    meta.append(createElement("span", "", "답장 작성 중"));
    stack.append(meta, indicator);
  }

  message.append(avatar, stack);
  return message;
};

const setWorkflowState = (answered) => {
  workflowSteps.forEach((step, index) => {
    step.classList.toggle("done", index < (answered ? 2 : 1));
    step.classList.toggle("active", index === (answered ? 2 : 1));
  });
};

const playChatScenario = (topic) => {
  const scenario = chatScenarios[topic];
  if (!chatLog || !scenario) return;
  window.clearTimeout(chatReplyTimer);

  chatTopicButtons.forEach((button) => {
    const selected = button.dataset.chatTopic === topic;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  chatLog.setAttribute("aria-busy", "true");
  chatLog.replaceChildren(createStudentMessage(scenario), createMentorMessage(scenario, true));
  setWorkflowState(false);

  chatReplyTimer = window.setTimeout(() => {
    chatLog.replaceChildren(createStudentMessage(scenario), createMentorMessage(scenario));
    chatLog.setAttribute("aria-busy", "false");
    setWorkflowState(true);
  }, reduceMotion ? 0 : 760);
};

chatTopicButtons.forEach((button) => {
  button.addEventListener("click", () => playChatScenario(button.dataset.chatTopic));
});
