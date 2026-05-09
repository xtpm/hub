const deployments = [
  {
    id: "main",
    title: "kuudere.cc",
    type: "main page",
    url: "https://kuudere.cc",
    status: "live",
    group: "live",
    lastDeploy: "active",
    tags: ["main", "profile", "portfolio"],
    description: "the main kuudere page and personal web profile.",
    accent: "green",
  },
  {
    id: "desktop",
    title: "desktop.kuudere.cc",
    type: "desktop",
    url: "https://desktop.kuudere.cc",
    status: "live",
    group: "live",
    lastDeploy: "active",
    tags: ["desktop", "interactive", "windows"],
    description: "a desktop-style Kuudere page with windows, shortcuts, projects, and profile bits.",
    accent: "cyan",
  },
  {
    id: "aimcore",
    title: "aim.kuudere.cc",
    type: "aimcore",
    url: "https://aim.kuudere.cc",
    status: "live",
    group: "experiments",
    lastDeploy: "active",
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
  previewDomain.textContent = deployment.title;
  detailType.textContent = deployment.type;
  detailTitle.textContent = deployment.title;
  detailDescription.textContent = deployment.description;
  detailUrl.textContent = deployment.url;
  detailDeploy.textContent = deployment.lastDeploy;
  detailTags.textContent = deployment.tags.join(" / ");
  openDeployment.href = deployment.url;
  copyStatus.textContent = "";

  document.querySelectorAll(".deployment-row").forEach((row) => {
    row.classList.toggle("selected", row.dataset.id === deployment.id);
  });
}

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
        </div>
      </div>
      <div class="row-meta">
        <span>${escapeHtml(deployment.type)}</span>
        <span>${escapeHtml(deployment.lastDeploy)}</span>
      </div>
      <div class="row-actions">
        <a href="${escapeHtml(deployment.url)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(deployment.title)}">open</a>
        <button type="button" data-copy="${escapeHtml(deployment.id)}" aria-label="Copy ${escapeHtml(deployment.title)} URL">copy</button>
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

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => {
      const deployment = deployments.find((item) => item.id === button.dataset.copy);
      copyUrl(deployment);
    });
  });
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
