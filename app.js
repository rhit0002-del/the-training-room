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
  ],
  video: {
    type: "cloudinary",
    url: "https://res.cloudinary.com/dgmh2tuhu/video/upload/v1778725474/tropical_smoothie_demo_small.mp4_s2xnrr.mov",
    secureUrl: "https://res.cloudinary.com/dgmh2tuhu/video/upload/v1778725474/tropical_smoothie_demo_small.mp4_s2xnrr.mov",
    publicId: "tropical_smoothie_demo_small.mp4_s2xnrr",
    fileName: "tropical_smoothie_demo_small.mov",
    resourceType: "video",
    format: "mov"
  }
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
const videoUploadStatus = document.querySelector("#videoUploadStatus");
const videoUploadPreview = document.querySelector("#videoUploadPreview");
const moduleVideoPreview = document.querySelector("#moduleVideoPreview");
const moduleDetailTitle = document.querySelector("#moduleDetailTitle");
const moduleDetailCategory = document.querySelector("#moduleDetailCategory");
const moduleDetailTime = document.querySelector("#moduleDetailTime");
const moduleDetailDescription = document.querySelector("#moduleDetailDescription");
const moduleDetailSteps = document.querySelector("#moduleDetailSteps");
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
// Replace this placeholder with your Cloudinary cloud name. Never add an API secret here.
const cloudinaryCloudName = "dgmh2tuhu";
const cloudinaryUploadPreset = "training_room_uploads";
const quizAnswers = {
  q1: "A",
  q2: "C",
  q3: "B",
  q4: "A"
};
const quizTotal = Object.keys(quizAnswers).length;
const memoryFlags = {};
let savedModules = loadSavedModules();
let activeModuleId = defaultModule.id;
let uploadedCloudinaryVideo = null;

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
      const videoLabel = getVideoUrl(module) ? "Video uploaded" : "No video yet";
      const action = module.id === defaultModule.id
        ? `<button class="button secondary module-view-button" type="button" data-module-id="${module.id}">View</button>`
        : `
          <div class="module-card-actions">
            <button class="button secondary module-view-button" type="button" data-module-id="${module.id}">View</button>
            <button class="button secondary module-edit-button" type="button" data-module-id="${module.id}">Edit</button>
          </div>
        `;

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

  moduleGrid.querySelectorAll(".module-view-button").forEach((button) => {
    button.addEventListener("click", () => {
      activeModuleId = button.dataset.moduleId || defaultModule.id;
      renderModuleDetail(activeModuleId);
      goToRoute("staff-module");
    });
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
      ? "Upload a training video in Create Module to display it here."
      : "Your uploaded video will appear here before saving.";

  container.innerHTML = `
    <span class="play-button" aria-hidden="true"></span>
    <div>
      <h${variant === "module" ? "2" : "3"}>${title}</h${variant === "module" ? "2" : "3"}>
      <p>${copy}</p>
    </div>
  `;
}

function renderVideoPlayer(container, src, name, heading = "") {
  if (!src) {
    renderEmptyVideoPreview(container, container === moduleVideoPreview ? "module" : "upload");
    return;
  }

  const media = document.createElement("video");
  media.className = "uploaded-video";
  media.controls = true;
  media.playsInline = true;
  media.preload = "metadata";
  media.src = src;
  container.classList.remove("video-embed-card");

  if (container === moduleVideoPreview) {
    media.addEventListener("ended", markTrainingVideoComplete);
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

function getVideoUrl(module) {
  return module?.video?.url || module?.video?.secureUrl || "";
}

function getModuleById(id) {
  return getAllModules().find((module) => module.id === id) || defaultModule;
}

function renderModuleDetail(id = activeModuleId) {
  const module = getModuleById(id);
  activeModuleId = module.id;

  if (moduleDetailTitle) moduleDetailTitle.textContent = module.title;
  if (moduleDetailCategory) moduleDetailCategory.textContent = module.category || "General";
  if (moduleDetailTime) moduleDetailTime.textContent = module.time || "No time set";
  if (moduleDetailDescription) moduleDetailDescription.textContent = module.description || "";

  if (moduleDetailSteps) {
    moduleDetailSteps.replaceChildren(
      ...(module.steps?.length ? module.steps : defaultModule.steps).map((step) => {
        const item = document.createElement("li");
        item.textContent = step;
        return item;
      })
    );
  }

  const videoUrl = getVideoUrl(module);

  if (videoUrl) {
    renderVideoPlayer(moduleVideoPreview, videoUrl, "", "Training video");
  } else {
    renderEmptyVideoPreview(moduleVideoPreview, "module");
  }
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

function getVideoFromForm() {
  return uploadedCloudinaryVideo;
}

function setVideoUploadStatus(message, type = "") {
  if (!videoUploadStatus) return;
  videoUploadStatus.textContent = message;
  videoUploadStatus.className = `form-message ${type}`.trim();
}

function isCloudinaryConfigured() {
  return Boolean(cloudinaryCloudName);
}

function isAcceptedVideoFile(file) {
  if (!file) return false;

  const acceptedTypes = new Set(["video/mp4", "video/quicktime", "video/webm"]);
  const acceptedExtensions = [".mp4", ".mov", ".webm"];
  const fileName = file.name.toLowerCase();

  return acceptedTypes.has(file.type) || acceptedExtensions.some((extension) => fileName.endsWith(extension));
}

async function uploadVideoToCloudinary(file) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Add your Cloudinary cloud name in app.js before uploading.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryUploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/video/upload`, {
    method: "POST",
    body: formData
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Cloudinary upload failed.");
  }

  return {
    type: "cloudinary",
    url: result.secure_url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    fileName: file.name,
    resourceType: result.resource_type,
    format: result.format
  };
}

async function handleVideoFileSelected(file) {
  uploadedCloudinaryVideo = null;

  if (!file) return;

  if (!isAcceptedVideoFile(file)) {
    videoFileName.textContent = "Please choose a video file.";
    setVideoUploadStatus("Please choose a valid video file.", "error");
    renderEmptyVideoPreview(videoUploadPreview, "upload");
    return;
  }

  videoFileName.textContent = file.name;
  setVideoUploadStatus("Uploading video to Cloudinary...", "");
  renderEmptyVideoPreview(videoUploadPreview, "upload");

  try {
    uploadedCloudinaryVideo = await uploadVideoToCloudinary(file);
    setVideoUploadStatus("Video uploaded. You can now save the module.", "success");
    renderVideoPlayer(videoUploadPreview, uploadedCloudinaryVideo.url, file.name, "");
  } catch (error) {
    setVideoUploadStatus(error.message, "error");
  }
}

function makeModuleId() {
  return `module-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildModuleFromForm() {
  return {
    id: moduleForm.dataset.editingId || makeModuleId(),
    title: moduleTitle.value.trim(),
    description: moduleDescription.value.trim(),
    category: moduleCategory.value.trim(),
    time: moduleTime.value.trim(),
    status: "Live",
    steps: getModuleStepsFromForm(),
    quiz: getQuizFromForm(),
    video: getVideoFromForm(),
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
  uploadedCloudinaryVideo = module.video || null;
  videoFileName.textContent = module.video?.fileName || "No video selected.";
  setVideoUploadStatus(module.video ? "Existing uploaded video loaded." : "", module.video ? "success" : "");

  const videoUrl = getVideoUrl(module);

  if (videoUrl) {
    renderVideoPlayer(videoUploadPreview, videoUrl, module.video?.fileName || "Uploaded video", "");
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
  moduleSteps.value = defaultModule.steps.join("\n");
  moduleSaveMessage.textContent = "";
  uploadedCloudinaryVideo = null;
  videoFileName.textContent = "No video selected.";
  setVideoUploadStatus("", "");

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

moduleForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!moduleForm.checkValidity()) {
    moduleForm.reportValidity();
    return;
  }

  moduleSaveMessage.textContent = "Saving module...";
  moduleSaveMessage.className = "form-message";

  if (!uploadedCloudinaryVideo?.url) {
    moduleSaveMessage.textContent = "Please upload a training video before saving.";
    moduleSaveMessage.className = "form-message error";
    return;
  }

  const module = buildModuleFromForm();
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
    moduleSaveMessage.textContent = "The browser could not save this module. Try shortening the content.";
    moduleSaveMessage.className = "form-message error";
    return;
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
  handleVideoFileSelected(event.target.files[0]);
});

tryAgainButton?.addEventListener("click", resetQuiz);

renderModules();
renderAssignModuleOptions();
renderModuleDetail(activeModuleId);
syncQuizGate();
syncStaffDashboard();
routeTo(readRoute());
