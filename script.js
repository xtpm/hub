const deployments = [
  {
    id: "hub",
    title: "hub.kuudere.cc",
    type: "hub",
    url: "https://hub.kuudere.cc",
    repo: "xtpm/hub",
    status: "live",
    group: "live",
    lastUpdated: "checking github...",
    previewImage: "./assets/previews/hub.png",
    tags: ["hub", "deployments", "directory"],
    description: "the deployment hub for every page living under kuudere.cc.",
    accent: "green",
  },
  {
    id: "main",
    title: "kuudere.cc",
    type: "main page",
    url: "https://kuudere.cc",
    repo: "xtpm/kitori",
    status: "live",
    group: "live",
    lastUpdated: "checking github...",
    previewImage: "./assets/previews/main.png",
    tags: ["main", "profile", "portfolio"],
    description: "the main kuudere page and personal web profile.",
    accent: "green",
  },
  {
    id: "desktop",
    title: "desktop.kuudere.cc",
    type: "desktop",
    url: "https://desktop.kuudere.cc",
    repo: "xtpm/senko",
    status: "live",
    group: "live",
    lastUpdated: "checking github...",
    previewImage: "./assets/previews/desktop.png",
    tags: ["desktop", "interactive", "windows"],
    description: "a desktop-style Kuudere page with windows, shortcuts, projects, and profile bits.",
    accent: "cyan",
  },
  {
    id: "aimcore",
    title: "aim.kuudere.cc",
    type: "aimcore",
    url: "https://aim.kuudere.cc",
    repo: "xtpm/aimcore",
    status: "live",
    group: "experiments",
    lastUpdated: "checking github...",
    previewImage: "./assets/previews/aimcore.png",
    tags: ["aimcore", "aim", "experiment"],
    description: "the aimcore deployment, kept as its own focused Kuudere page.",
    accent: "violet",
  },
];

const deploymentList = document.querySelector("#deploymentList");
const deploymentSearch = document.querySelector("#deploymentSearch");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const deployCount = document.querySelector("#deployCount");
const visibleCount = document.querySelector("#visibleCount");
const detailStatus = document.querySelector("#detailStatus");
const previewFrame = document.querySelector("#previewFrame");
const previewImage = document.querySelector("#previewImage");
const previewDomain = document.querySelector("#previewDomain");
const detailType = document.querySelector("#detailType");
const detailTitle = document.querySelector("#detailTitle");
const detailDescription = document.querySelector("#detailDescription");
const detailUrl = document.querySelector("#detailUrl");
const detailDeploy = document.querySelector("#detailDeploy");
const detailTags = document.querySelector("#detailTags");
const openDeployment = document.querySelector("#openDeployment");
const copyDeployment = document.querySelector("#copyDeployment");
const copyStatus = document.querySelector("#copyStatus");

let activeFilter = "all";
let selectedDeployment = deployments[0];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function matchesFilter(deployment) {
  if (activeFilter === "all") return true;
  return deployment.group === activeFilter || deployment.status === activeFilter;
}

function matchesSearch(deployment) {
  const query = deploymentSearch.value.trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    deployment.title,
    deployment.type,
    deployment.url,
    deployment.description,
    deployment.status,
    ...deployment.tags,
  ].join(" ").toLowerCase();
  return haystack.includes(query);
}

function visibleDeployments() {
  return deployments.filter((deployment) => matchesFilter(deployment) && matchesSearch(deployment));
}

function selectDeployment(deployment) {
  selectedDeployment = deployment;
  detailStatus.textContent = deployment.status;
  previewFrame.dataset.accent = deployment.accent;
  previewFrame.classList.toggle("has-image", Boolean(deployment.previewImage));
  previewImage.src = deployment.previewImage || "";
  previewImage.alt = `${deployment.title} preview`;
  previewDomain.textContent = deployment.title;
  detailType.textContent = deployment.type;
  detailTitle.textContent = deployment.title;
  detailDescription.textContent = deployment.description;
  detailUrl.textContent = deployment.url;
  detailDeploy.textContent = deployment.lastUpdated;
  detailTags.textContent = deployment.tags.join(" / ");
  openDeployment.href = deployment.url;
  copyStatus.textContent = "";

  document.querySelectorAll(".deployment-row").forEach((row) => {
    row.classList.toggle("selected", row.dataset.id === deployment.id);
  });
}

previewImage.addEventListener("error", () => {
  previewFrame.classList.remove("has-image");
});

previewImage.addEventListener("load", () => {
  if (previewImage.getAttribute("src")) {
    previewFrame.classList.add("has-image");
  }
});

function renderDeployments() {
  const items = visibleDeployments();
  visibleCount.textContent = `${items.length} shown`;
  deployCount.textContent = `${deployments.length} deployments`;

  if (!items.length) {
    deploymentList.innerHTML = `
      <div class="empty-state">
        <p>nothing matched.</p>
        <span>try another filter or search.</span>
      </div>
    `;
    return;
  }

  deploymentList.innerHTML = items.map((deployment) => `
    <article class="deployment-row ${deployment.id === selectedDeployment.id ? "selected" : ""}" data-id="${escapeHtml(deployment.id)}" tabindex="0">
      <div class="row-main">
        <span class="status-dot ${escapeHtml(deployment.status)}"></span>
        <div>
          <h3>${escapeHtml(deployment.title)}</h3>
          <p>${escapeHtml(deployment.description)}</p>
          <small class="row-updated">last updated: ${escapeHtml(deployment.lastUpdated)}</small>
        </div>
      </div>
      <div class="row-actions">
        <a href="${escapeHtml(deployment.url)}" target="_blank" rel="noreferrer" aria-label="Visit ${escapeHtml(deployment.title)}">visit site</a>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".deployment-row").forEach((row) => {
    const deployment = deployments.find((item) => item.id === row.dataset.id);
    row.addEventListener("mouseenter", () => selectDeployment(deployment));
    row.addEventListener("focus", () => selectDeployment(deployment));
    row.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      selectDeployment(deployment);
    });
  });
}

function formatUpdatedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

async function loadRepoUpdateTimes() {
  await Promise.allSettled(deployments.map(async (deployment) => {
    if (!deployment.repo) return;
    const response = await fetch(`https://api.github.com/repos/${deployment.repo}/commits?per_page=1`);
    if (!response.ok) throw new Error(`GitHub lookup failed for ${deployment.repo}`);
    const commits = await response.json();
    const updatedAt = commits?.[0]?.commit?.committer?.date || commits?.[0]?.commit?.author?.date;
    deployment.lastUpdated = formatUpdatedAt(updatedAt);
  }));

  deployments.forEach((deployment) => {
    if (deployment.lastUpdated === "checking github...") {
      deployment.lastUpdated = "github unavailable";
    }
  });

  renderDeployments();
  selectDeployment(selectedDeployment);
}

async function copyUrl(deployment = selectedDeployment) {
  try {
    await navigator.clipboard.writeText(deployment.url);
    copyStatus.textContent = `copied ${deployment.title}`;
  } catch (error) {
    copyStatus.textContent = deployment.url;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderDeployments();
  });
});

deploymentSearch.addEventListener("input", renderDeployments);
copyDeployment.addEventListener("click", () => copyUrl());

renderDeployments();
selectDeployment(selectedDeployment);
loadRepoUpdateTimes();
