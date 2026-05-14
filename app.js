const defaultTrainingVideoSources = [
  { src: "videos/tropical-sunset-smoothie.mp4", type: "video/mp4" },
  { src: "videos/tropical-sunset-smoothie.mov" },
  { src: "videos/tropical-sunset-smoothie.MOV" }
];

const defaultModule = {
  id: "smoothie-demo",
  title: "How to Make a Tropical Sunset Smoothie",
  description: "Learn the steps for preparing a Tropical Sunset Smoothie safely and consistently.",
  category: "Food preparation",
  time: "5 minutes",
  status: "Live",
  steps: [
    "Wash your hands and prepare a clean blender jug.",
    "Add the smoothie ingredients in the correct order.",
    "Blend until the smoothie is even and smooth.",
    "Pour, garnish and serve the smoothie straight away."
  ],
  quiz: [
    {
      question: "What liquid base do you use for the Tropical Sunset Smoothie?",
      options: { A: "Coconut water", B: "Almond milk", C: "Apple juice", D: "Tap water" },
      correct: "A"
    }
  ]
};

const portalRoutes = [
  "staff",
  "staff-module",
  "quiz",
  "manager",
  "manager-create",
  "assign",
  "library"
];

const pages = document.querySelectorAll("[data-page]");
const routeLinks = document.querySelectorAll("[data-route]");
const nav = document.querySelector(".nav");
const menuButton = document.querySelector(".menu-button");
const moduleGrid = document.querySelector("#moduleGrid");
const assignModuleSelect = document.querySelector("#assignModuleSelect");
const loginForm = document.querySelector("#loginForm");
const loginEmail = document.querySelector("#loginEmail");
const loginPassword = document.querySelector("#loginPassword");
const loginMessage = document.querySelector("#loginMessage");
const moduleForm = document.querySelector("#moduleForm");
const moduleTitle = document.querySelector("#moduleTitle");
const moduleDescription = document.querySelector("#moduleDescription");
const moduleCategory = document.querySelector("#moduleCategory");
const moduleTime = document.querySelector("#moduleTime");
const trainingVideoLink = document.querySelector("#trainingVideoLink");
const moduleSteps = document.querySelector("#moduleSteps");
const quizBuilder = document.querySelector("#quizBuilder");
const addQuestionButton = document.querySelector("#addQuestionButton");
const moduleSaveMessage = document.querySelector("#moduleSaveMessage");
const quizForm = document.querySelector("#quizForm");
const quizResult = document.querySelector("#quizResult");
const quizReturn = document.querySelector(".quiz-return");
const tryAgainButton = document.querySelector("#tryAgainButton");
const scrollCue = document.querySelector(".scroll-cue");
const homeHero = document.querySelector("#home-hero");
const videoUploadInput = document.querySelector("#trainingVideoUpload");
const videoFileName = document.querySelector("#videoFileName");
const videoUploadPreview = document.querySelector("#videoUploadPreview");
const moduleVideoPreview = document.querySelector("#moduleVideoPreview");
const staffModuleStatus = document.querySelector("#staffModuleStatus");
const staffModuleAction = document.querySelector("#staffModuleAction");
const staffCompleteCount = document.querySelector("#staffCompleteCount");
const staffProgressCount = document.querySelector("#staffProgressCount");
const managerCompletionChart = document.querySelector("#managerCompletionChart");
const managerCompletionPercent = document.querySelector("#managerCompletionPercent");
const managerSummaryCompleted = document.querySelector("#managerSummaryCompleted");
const managerSummaryInProgress = document.querySelector("#managerSummaryInProgress");
const managerProgressStatus = document.querySelector("#managerProgressStatus");
const managerQuizScore = document.querySelector("#managerQuizScore");
const managerDateCompleted = document.querySelector("#managerDateCompleted");
const validRoutes = new Set([...pages].map((page) => page.dataset.page));
const savedModulesKey = "trainingRoomSavedModules";
const videoCompleteKey = "trainingRoomSmoothieVideoComplete";
const moduleCompleteKey = "trainingRoomSmoothieModuleComplete";
const demoEmail = "demo@trainingroom.com";
const demoPassword = "trainingroom123";
const maxStoredVideoBytes = 2.5 * 1024 * 1024;
const quizAnswers = {
  q1: "A",
  q2: "C",
  q3: "B",
  q4: "A"
};
const quizTotal = Object.keys(quizAnswers).length;
const memoryFlags = {};
let savedModules = loadSavedModules();
let pendingVideoFile = null;
let uploadedTrainingVideoUrl = "";
let uploadedTrainingVideoName = "";

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function getStoredFlag(key) {
  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return memoryFlags[key] === true;
  }
}

function setStoredFlag(key, value) {
  memoryFlags[key] = Boolean(value);

  try {
    window.localStorage.setItem(key, String(Boolean(value)));
  } catch {
    // Local fallback keeps the prototype working in stricter browser settings.
  }
}

function routeTo(route) {
  let target = validRoutes.has(route) ? route : "home";

  pages.forEach((page) => page.classList.toggle("active", page.dataset.page === target));
  routeLinks.forEach((link) => link.classList.toggle("active", link.dataset.route === target));
  document.body.classList.toggle("portal-mode", portalRoutes.includes(target));
  nav.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function goToRoute(route) {
  window.location.hash = route;
  routeTo(route);
}

function readRoute() {
  return window.location.hash.replace("#", "") || "home";
}

function loadSavedModules() {
  try {
    const storedModules = JSON.parse(window.localStorage.getItem(savedModulesKey) || "[]");
    return Array.isArray(storedModules) ? storedModules : [];
  } catch {
    return [];
  }
}

function saveSavedModules() {
  window.localStorage.setItem(savedModulesKey, JSON.stringify(savedModules));
}

function getAllModules() {
  return [defaultModule, ...savedModules];
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderModules() {
  if (!moduleGrid) return;

  moduleGrid.innerHTML = getAllModules()
    .map((module) => {
      const statusClass = module.status === "Live" ? "status-complete" : "status-new";
      const quizCount = module.quiz?.length || 0;
      const videoLabel = module.video?.link || module.video?.dataUrl ? "Video added" : module.video?.fileName ? "Video selected" : "No video yet";
      const action = module.id === defaultModule.id
        ? `<a class="button secondary" href="#staff-module" data-route="staff-module">View</a>`
        : `<button class="button secondary module-edit-button" type="button" data-module-id="${module.id}">Edit</button>`;

      return `
        <article class="module-card">
          <span class="status-label ${statusClass}">${escapeHtml(module.status || "Draft")}</span>
          <h2>${escapeHtml(module.title)}</h2>
          <p>${escapeHtml(module.description || module.category)}</p>
          <div class="module-card-meta">
            <span>${escapeHtml(module.category || "General")}</span>
            <span>${escapeHtml(module.time || "No time set")}</span>
            <span>${quizCount} quiz ${quizCount === 1 ? "question" : "questions"}</span>
            <span>${videoLabel}</span>
          </div>
          ${action}
        </article>
      `;
    })
    .join("");

  moduleGrid.querySelectorAll("[data-route]").forEach((link) => {
    link.addEventListener("click", handleRouteClick);
  });

  moduleGrid.querySelectorAll(".module-edit-button").forEach((button) => {
    button.addEventListener("click", () => {
      const module = savedModules.find((item) => item.id === button.dataset.moduleId);
      if (!module) return;
      fillModuleForm(module);
      goToRoute("manager-create");
    });
  });
}

function renderAssignModuleOptions() {
  if (!assignModuleSelect) return;

  assignModuleSelect.innerHTML = getAllModules()
    .map((module) => `<option value="${escapeHtml(module.id)}">${escapeHtml(module.title)}</option>`)
    .join("");
}

function renderEmptyVideoPreview(container, variant) {
  if (!container) return;
  container.classList.remove("video-player-card");
  container.classList.remove("video-embed-card");

  const title = variant === "module" ? "Training video" : "Video preview";
  const copy =
    variant === "module"
      ? "Upload a training video in Create Module to preview it here."
      : "Selected video will appear here before publishing.";

  container.innerHTML = `
    <span class="play-button" aria-hidden="true"></span>
    <div>
      <h${variant === "module" ? "2" : "3"}>${title}</h${variant === "module" ? "2" : "3"}>
      <p>${copy}</p>
    </div>
  `;
}

function getEmbeddableVideoUrl(src) {
  try {
    const url = new URL(src);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).at(-1);
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : "";
    }

    if (host === "player.vimeo.com") {
      return src;
    }
  } catch {
    return "";
  }

  return "";
}

function renderVideoPlayer(container, sources, name, heading = "") {
  const videoSources = Array.isArray(sources) ? sources : [{ src: sources }];
  const embedUrl = getEmbeddableVideoUrl(videoSources[0]?.src || "");
  let media;

  if (embedUrl) {
    media = document.createElement("iframe");
    media.className = "uploaded-video embedded-video";
    media.src = embedUrl;
    media.title = "Training video";
    media.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    media.allowFullscreen = true;
    container.classList.add("video-embed-card");
  } else {
    const video = document.createElement("video");
    video.className = "uploaded-video";
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";

    if (container === moduleVideoPreview) {
      video.addEventListener("ended", markTrainingVideoComplete);
    }

    videoSources.forEach((sourceData) => {
      const source = document.createElement("source");
      source.src = sourceData.src;
      if (sourceData.type) source.type = sourceData.type;
      video.append(source);
    });

    media = video;
    container.classList.remove("video-embed-card");
  }

  const children = [];

  if (heading) {
    const title = document.createElement("h2");
    title.textContent = heading;
    children.push(title);
  }

  children.push(media);

  if (name) {
    const fileName = document.createElement("p");
    fileName.className = "uploaded-video-name";
    fileName.textContent = name;
    children.push(fileName);
  }

  container.classList.add("video-player-card");
  container.replaceChildren(...children);
}

function renderUploadedVideo(container) {
  if (!container) return;

  if (!uploadedTrainingVideoUrl) {
    if (container === moduleVideoPreview) {
      renderVideoPlayer(container, defaultTrainingVideoSources, "", "Training video");
      return;
    }

    renderEmptyVideoPreview(container, container === moduleVideoPreview ? "module" : "upload");
    return;
  }

  renderVideoPlayer(
    container,
    [{ src: uploadedTrainingVideoUrl }],
    uploadedTrainingVideoName,
    container === moduleVideoPreview ? "Training video" : ""
  );
}

function isAcceptedVideo(file) {
  const allowedTypes = ["video/mp4", "video/quicktime", "video/webm"];
  const allowedExtensions = ["mp4", "mov", "webm"];
  const extension = file.name.split(".").pop().toLowerCase();
  return allowedTypes.includes(file.type) || allowedExtensions.includes(extension);
}

function updateTrainingVideo(file) {
  if (!file) return;

  if (!isAcceptedVideo(file)) {
    videoFileName.textContent = "Please choose an MP4, MOV or WebM file.";
    renderEmptyVideoPreview(videoUploadPreview, "upload");
    return;
  }

  if (uploadedTrainingVideoUrl) {
    URL.revokeObjectURL(uploadedTrainingVideoUrl);
  }

  pendingVideoFile = file;
  uploadedTrainingVideoUrl = URL.createObjectURL(file);
  uploadedTrainingVideoName = file.name;
  videoFileName.textContent = file.name;
  renderUploadedVideo(videoUploadPreview);
}

function markTrainingVideoComplete() {
  setStoredFlag(videoCompleteKey, true);
  syncQuizGate();
}

function syncQuizGate() {
  // The quiz lives on its own route. Keep this as a light MVP hook for video completion state.
  getStoredFlag(videoCompleteKey);
}

function syncStaffDashboard() {
  const isModuleComplete = getStoredFlag(moduleCompleteKey);

  if (staffCompleteCount) staffCompleteCount.textContent = isModuleComplete ? "1" : "0";
  if (staffProgressCount) staffProgressCount.textContent = isModuleComplete ? "0" : "1";

  if (staffModuleStatus) {
    staffModuleStatus.textContent = isModuleComplete ? "Complete" : "In progress";
    staffModuleStatus.classList.toggle("status-complete", isModuleComplete);
    staffModuleStatus.classList.toggle("status-progress", !isModuleComplete);
  }

  if (staffModuleAction) {
    staffModuleAction.textContent = isModuleComplete ? "View" : "Continue";
    staffModuleAction.classList.toggle("primary", !isModuleComplete);
    staffModuleAction.classList.toggle("secondary", isModuleComplete);
  }

  syncManagerProgress(isModuleComplete);
}

function syncManagerProgress(isModuleComplete = getStoredFlag(moduleCompleteKey)) {
  const completedCount = isModuleComplete ? 4 : 3;
  const inProgressCount = isModuleComplete ? 0 : 1;
  const completionPercent = isModuleComplete ? 80 : 60;

  if (managerCompletionChart) {
    managerCompletionChart.style.setProperty("--completion", `${completionPercent}%`);
    managerCompletionChart.setAttribute("aria-label", `${completionPercent} per cent complete`);
  }

  if (managerCompletionPercent) managerCompletionPercent.textContent = completionPercent;
  if (managerSummaryCompleted) managerSummaryCompleted.textContent = completedCount;
  if (managerSummaryInProgress) managerSummaryInProgress.textContent = inProgressCount;
  if (managerProgressStatus) managerProgressStatus.textContent = isModuleComplete ? "Complete" : "In progress";
  if (managerQuizScore) managerQuizScore.textContent = isModuleComplete ? "100 per cent" : "Not submitted";
  if (managerDateCompleted) managerDateCompleted.textContent = isModuleComplete ? "Today" : "Not completed";
}

function handleRouteClick(event) {
  if (event.currentTarget.getAttribute("aria-disabled") === "true") {
    event.preventDefault();
    return;
  }

  routeTo(event.currentTarget.dataset.route);
}

function getModuleStepsFromForm() {
  return moduleSteps.value
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean);
}

function getQuizFromForm() {
  return [...quizBuilder.querySelectorAll(".quiz-builder-item")]
    .map((item) => {
      return {
        question: item.querySelector('[name="quizQuestion"]').value.trim(),
        options: {
          A: item.querySelector('[name="optionA"]').value.trim(),
          B: item.querySelector('[name="optionB"]').value.trim(),
          C: item.querySelector('[name="optionC"]').value.trim(),
          D: item.querySelector('[name="optionD"]').value.trim()
        },
        correct: item.querySelector('[name="correctAnswer"]').value
      };
    })
    .filter((item) => item.question && item.options.A && item.options.B && item.options.C && item.options.D);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

async function getVideoFromForm() {
  const link = trainingVideoLink.value.trim();

  if (link) {
    return { type: "link", link };
  }

  if (!pendingVideoFile) return null;

  const video = {
    type: "upload",
    fileName: pendingVideoFile.name,
    fileSize: pendingVideoFile.size
  };

  if (pendingVideoFile.size <= maxStoredVideoBytes) {
    video.dataUrl = await readFileAsDataUrl(pendingVideoFile);
  } else {
    video.localOnly = true;
  }

  return video;
}

function makeModuleId() {
  return `module-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

async function buildModuleFromForm() {
  return {
    id: moduleForm.dataset.editingId || makeModuleId(),
    title: moduleTitle.value.trim(),
    description: moduleDescription.value.trim(),
    category: moduleCategory.value.trim(),
    time: moduleTime.value.trim(),
    status: "Live",
    steps: getModuleStepsFromForm(),
    quiz: getQuizFromForm(),
    video: await getVideoFromForm(),
    updatedAt: new Date().toISOString()
  };
}

function createQuizBuilderItem(question = {}) {
  const item = document.createElement("article");
  item.className = "quiz-builder-item";
  item.innerHTML = `
    <label>Question <input name="quizQuestion" type="text" value="${escapeHtml(question.question || "")}" required /></label>
    <div class="form-row">
      <label>A <input name="optionA" type="text" value="${escapeHtml(question.options?.A || "")}" required /></label>
      <label>B <input name="optionB" type="text" value="${escapeHtml(question.options?.B || "")}" required /></label>
    </div>
    <div class="form-row">
      <label>C <input name="optionC" type="text" value="${escapeHtml(question.options?.C || "")}" required /></label>
      <label>D <input name="optionD" type="text" value="${escapeHtml(question.options?.D || "")}" required /></label>
    </div>
    <label>Correct answer
      <select name="correctAnswer" required>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
    </label>
    <button class="button secondary remove-question-button" type="button">Remove question</button>
  `;

  item.querySelector('[name="correctAnswer"]').value = question.correct || "A";
  item.querySelector(".remove-question-button").addEventListener("click", () => {
    if (quizBuilder.querySelectorAll(".quiz-builder-item").length === 1) return;
    item.remove();
  });

  return item;
}

function fillModuleForm(module) {
  if (!moduleForm) return;

  moduleForm.dataset.editingId = module.id;
  moduleTitle.value = module.title || "";
  moduleDescription.value = module.description || "";
  moduleCategory.value = module.category || "";
  moduleTime.value = module.time || "";
  moduleSteps.value = (module.steps || []).join("\n");
  trainingVideoLink.value = module.video?.link || "";
  pendingVideoFile = null;

  if (uploadedTrainingVideoUrl) {
    URL.revokeObjectURL(uploadedTrainingVideoUrl);
    uploadedTrainingVideoUrl = "";
    uploadedTrainingVideoName = "";
  }

  videoFileName.textContent = module.video?.fileName ? module.video.fileName : "No video selected.";

  if (module.video?.dataUrl || module.video?.link) {
    renderVideoPlayer(videoUploadPreview, [{ src: module.video.dataUrl || module.video.link }], module.video.fileName || "", "");
  } else {
    renderEmptyVideoPreview(videoUploadPreview, "upload");
  }

  quizBuilder.replaceChildren(...(module.quiz?.length ? module.quiz : defaultModule.quiz).map(createQuizBuilderItem));
  moduleSaveMessage.textContent = "";
}

function resetModuleForm() {
  if (!moduleForm) return;

  delete moduleForm.dataset.editingId;
  moduleTitle.value = defaultModule.title;
  moduleDescription.value = defaultModule.description;
  moduleCategory.value = defaultModule.category;
  moduleTime.value = defaultModule.time;
  trainingVideoLink.value = "";
  moduleSteps.value = defaultModule.steps.join("\n");
  pendingVideoFile = null;
  videoFileName.textContent = "No video selected.";
  moduleSaveMessage.textContent = "";

  if (uploadedTrainingVideoUrl) {
    URL.revokeObjectURL(uploadedTrainingVideoUrl);
    uploadedTrainingVideoUrl = "";
    uploadedTrainingVideoName = "";
  }

  renderEmptyVideoPreview(videoUploadPreview, "upload");
  quizBuilder.replaceChildren(createQuizBuilderItem(defaultModule.quiz[0]));
}

function resetQuiz() {
  quizForm.reset();
  quizForm.classList.remove("is-submitted");
  quizResult.className = "quiz-result";
  quizResult.innerHTML = "";
  quizReturn.hidden = true;
  tryAgainButton.hidden = true;
}

function getQuizScore() {
  const formData = new FormData(quizForm);

  return Object.entries(quizAnswers).reduce((score, [question, answer]) => {
    return score + (formData.get(question) === answer ? 1 : 0);
  }, 0);
}

routeLinks.forEach((link) => {
  link.addEventListener("click", handleRouteClick);
});

document.querySelectorAll('a[data-route="manager-create"]').forEach((link) => {
  link.addEventListener("click", resetModuleForm);
});

window.addEventListener("hashchange", () => routeTo(readRoute()));

menuButton?.addEventListener("click", () => {
  nav.classList.toggle("open");
});

scrollCue?.addEventListener("click", (event) => {
  event.preventDefault();
  homeHero.scrollIntoView({ behavior: "smooth", block: "start" });
});

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;

  if (email === demoEmail && password === demoPassword) {
    loginMessage.textContent = "Signed in. Opening manager dashboard...";
    loginMessage.className = "form-message success";
    goToRoute("manager");
    return;
  }

  loginMessage.textContent = "Use demo@trainingroom.com and trainingroom123 for the class demo.";
  loginMessage.className = "form-message error";
});

addQuestionButton?.addEventListener("click", () => {
  quizBuilder.append(createQuizBuilderItem());
});

moduleForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!moduleForm.checkValidity()) {
    moduleForm.reportValidity();
    return;
  }

  moduleSaveMessage.textContent = "Saving module...";
  moduleSaveMessage.className = "form-message";

  const module = await buildModuleFromForm();
  const editingIndex = savedModules.findIndex((item) => item.id === module.id);

  if (editingIndex >= 0) {
    savedModules[editingIndex] = module;
  } else {
    savedModules.unshift(module);
  }

  try {
    saveSavedModules();
    moduleSaveMessage.textContent = "Module saved to Training Library.";
    moduleSaveMessage.className = "form-message success";
  } catch {
    if (module.video?.dataUrl) {
      delete module.video.dataUrl;
      module.video.localOnly = true;

      if (editingIndex >= 0) {
        savedModules[editingIndex] = module;
      } else {
        savedModules[0] = module;
      }

      try {
        saveSavedModules();
        moduleSaveMessage.textContent = "Module saved. The video file was too large for browser storage, so use a video link for a refresh-safe demo.";
        moduleSaveMessage.className = "form-message error";
      } catch {
        moduleSaveMessage.textContent = "The browser could not save this module. Try using a video link instead of a file upload.";
        moduleSaveMessage.className = "form-message error";
        return;
      }
    } else {
      moduleSaveMessage.textContent = "The browser could not save this module. Try shortening the content or using a video link.";
      moduleSaveMessage.className = "form-message error";
      return;
    }
  }

  renderModules();
  renderAssignModuleOptions();
  resetModuleForm();
  goToRoute("library");
});

quizForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!quizForm.checkValidity()) {
    quizForm.reportValidity();
    return;
  }

  const score = getQuizScore();
  const passed = score === quizTotal;
  quizForm.classList.add("is-submitted");
  quizResult.className = `quiz-result show ${passed ? "success" : "needs-retry"}`;

  if (passed) {
    setStoredFlag(moduleCompleteKey, true);
    syncStaffDashboard();
    quizResult.innerHTML = `<strong>Completion Confirmed</strong><span>Score: ${score} out of ${quizTotal}</span><span>Training complete. Your manager can now see that you have completed this module.</span>`;
    quizReturn.hidden = false;
    tryAgainButton.hidden = true;
    return;
  }

  quizResult.innerHTML = `<strong>Needs another try</strong><span>Score: ${score} out of ${quizTotal}</span><span>Pass mark: ${quizTotal} out of ${quizTotal}</span>`;
  quizReturn.hidden = true;
  tryAgainButton.hidden = false;
});

videoUploadInput?.addEventListener("change", (event) => {
  updateTrainingVideo(event.target.files[0]);
});

trainingVideoLink?.addEventListener("input", () => {
  const link = trainingVideoLink.value.trim();

  if (link) {
    pendingVideoFile = null;
    videoFileName.textContent = "Using video link.";
    renderVideoPlayer(videoUploadPreview, [{ src: link }], "Video link preview", "");
    return;
  }

  videoFileName.textContent = "No video selected.";
  renderEmptyVideoPreview(videoUploadPreview, "upload");
});

tryAgainButton?.addEventListener("click", resetQuiz);

window.addEventListener("beforeunload", () => {
  if (uploadedTrainingVideoUrl) {
    URL.revokeObjectURL(uploadedTrainingVideoUrl);
  }
});

renderModules();
renderAssignModuleOptions();
renderUploadedVideo(moduleVideoPreview);
syncQuizGate();
syncStaffDashboard();
routeTo(readRoute());
