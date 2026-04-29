const desktop = document.querySelector(".desktop");
const startButton = document.querySelector("#startButton");
const startMenu = document.querySelector("#startMenu");
const contextMenu = document.querySelector("#contextMenu");
const timeEl = document.querySelector("#time");
const dateEl = document.querySelector("#date");
const windows = [...document.querySelectorAll(".window")];
const taskButtons = [...document.querySelectorAll(".task-icon[data-open]")];
const openButtons = [...document.querySelectorAll("[data-open]")];
const lanyardAvatar = document.querySelector("#lanyardAvatar");
const lanyardName = document.querySelector("#lanyardName");
const lanyardStatus = document.querySelector("#lanyardStatus");
const lanyardDot = document.querySelector("#lanyardDot");
const lanyardDetail = document.querySelector("#lanyardDetail");
const lanyardActivity = document.querySelector("#lanyardActivity");

const DISCORD_USER_ID = "1177326138926837884";

let topZ = 10;
let dragState = null;

function updateClock() {
  const now = new Date();
  timeEl.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  dateEl.textContent = now.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" });
}

function setPresenceStatus(status, label) {
  lanyardStatus.className = `presence-status ${status || "unknown"}`;
  lanyardDot.className = `status-dot ${status || "unknown"}`;
  lanyardStatus.textContent = label || status || "Unknown";
}

function formatActivity(data) {
  if (data.spotify) {
    return `Listening to ${data.spotify.song} by ${data.spotify.artist}`;
  }

  const activity = data.activities?.find((item) => item.type !== 4);
  if (!activity) return "No current activity";

  const detail = activity.details || activity.state;
  return detail ? `${activity.name}: ${detail}` : activity.name;
}

function setAvatar(user) {
  if (!user?.avatar) {
    lanyardAvatar.textContent = "?";
    return;
  }

  const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
  lanyardAvatar.innerHTML = `<img src="${avatarUrl}" alt="" draggable="false" />`;
}

async function updateLanyard() {
  if (!lanyardAvatar || DISCORD_USER_ID === "YOUR_DISCORD_USER_ID") {
    setPresenceStatus("unknown", "Not configured");
    lanyardDetail.textContent = "Set DISCORD_USER_ID in script.js to your Discord user ID.";
    lanyardActivity.textContent = "Join the Lanyard Discord server first so the API can see your presence.";
    return;
  }

  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
    if (!response.ok) throw new Error("Lanyard request failed");
    const payload = await response.json();
    if (!payload.success) throw new Error("Lanyard returned an error");

    const data = payload.data;
    const user = data.discord_user;
    const displayName = user.global_name || user.username || "Discord user";

    lanyardName.textContent = displayName;
    setAvatar(user);
    setPresenceStatus(data.discord_status, data.discord_status);
    lanyardDetail.textContent = user.username ? `@${user.username}` : "Discord presence";
    lanyardActivity.textContent = formatActivity(data);
  } catch (error) {
    setPresenceStatus("offline", "Unavailable");
    lanyardDetail.textContent = "Could not load Lanyard right now.";
    lanyardActivity.textContent = "Check the Discord user ID and Lanyard setup.";
  }
}

function getWindow(id) {
  return document.getElementById(id);
}

function syncTaskbar() {
  taskButtons.forEach((button) => {
    const target = getWindow(button.dataset.open);
    button.classList.toggle("running", target?.classList.contains("active"));
    button.classList.toggle("active", target?.classList.contains("focused"));
  });
}

function focusWindow(win) {
  if (!win) return;
  windows.forEach((item) => item.classList.remove("focused"));
  win.classList.add("focused", "active");
  win.style.zIndex = String(++topZ);
  syncTaskbar();
}

function openWindow(id) {
  const win = getWindow(id === "documents" || id === "bin" ? "explorer" : id);
  if (!win) return;
  win.classList.add("active");
  focusWindow(win);
  startMenu.classList.remove("open");
}

function closeWindow(id) {
  const win = getWindow(id);
  if (!win) return;
  win.classList.remove("active", "focused");
  syncTaskbar();
}

function toggleMaximize(id) {
  const win = getWindow(id);
  if (!win) return;
  win.classList.toggle("maximized");
  focusWindow(win);
}

function beginDrag(event, win) {
  if (win.classList.contains("maximized") || event.target.closest(".window-controls")) return;
  const rect = win.getBoundingClientRect();
  dragState = {
    win,
    pointerId: event.pointerId,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
  };
  win.setPointerCapture(event.pointerId);
  focusWindow(win);
}

function dragWindow(event) {
  if (!dragState) return;
  const { win, offsetX, offsetY } = dragState;
  const maxLeft = window.innerWidth - win.offsetWidth;
  const maxTop = window.innerHeight - win.offsetHeight - 40;
  const nextLeft = Math.max(0, Math.min(maxLeft, event.clientX - offsetX));
  const nextTop = Math.max(0, Math.min(maxTop, event.clientY - offsetY));
  win.style.left = `${nextLeft}px`;
  win.style.top = `${nextTop}px`;
}

function endDrag(event) {
  if (!dragState) return;
  dragState.win.releasePointerCapture(dragState.pointerId);
  dragState = null;
}

function showContextMenu(event) {
  if (event.target.closest(".window, .taskbar, .start-menu")) return;
  event.preventDefault();
  contextMenu.style.left = `${Math.min(event.clientX, window.innerWidth - 204)}px`;
  contextMenu.style.top = `${Math.min(event.clientY, window.innerHeight - 210)}px`;
  contextMenu.classList.add("open");
  startMenu.classList.remove("open");
}

startButton.addEventListener("click", (event) => {
  event.stopPropagation();
  startMenu.classList.toggle("open");
  contextMenu.classList.remove("open");
});

openButtons.forEach((button) => {
  button.addEventListener("click", () => openWindow(button.dataset.open));
});

windows.forEach((win) => {
  win.addEventListener("pointerdown", () => focusWindow(win));
  win.querySelector("[data-drag-handle]").addEventListener("pointerdown", (event) => beginDrag(event, win));
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => closeWindow(button.dataset.close));
});

document.querySelectorAll("[data-minimize]").forEach((button) => {
  button.addEventListener("click", () => closeWindow(button.dataset.minimize));
});

document.querySelectorAll("[data-maximize]").forEach((button) => {
  button.addEventListener("click", () => toggleMaximize(button.dataset.maximize));
});

document.addEventListener("pointermove", dragWindow);
document.addEventListener("pointerup", endDrag);
desktop.addEventListener("contextmenu", showContextMenu);

document.addEventListener("click", (event) => {
  if (!event.target.closest(".start-menu, #startButton")) {
    startMenu.classList.remove("open");
  }
  if (!event.target.closest(".context-menu")) {
    contextMenu.classList.remove("open");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    startMenu.classList.remove("open");
    contextMenu.classList.remove("open");
  }
});

updateClock();
window.setInterval(updateClock, 1000);
focusWindow(getWindow("about"));
syncTaskbar();
updateLanyard();
window.setInterval(updateLanyard, 60000);
