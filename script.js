const eyes = Array.from(document.querySelectorAll("[data-eye]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
};

const gaze = eyes.map(() => ({
  currentX: 0,
  currentY: 0,
  targetX: 0,
  targetY: 0,
}));

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateTargets(clientX, clientY) {
  pointer.x = clientX;
  pointer.y = clientY;
  document.documentElement.style.setProperty("--cursor-x", `${clientX}px`);
  document.documentElement.style.setProperty("--cursor-y", `${clientY}px`);

  eyes.forEach((eye, index) => {
    const rect = eye.getBoundingClientRect();
    const radiusX = rect.width * 0.23;
    const radiusY = rect.height * 0.2;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY) || 1;
    const pull = clamp(distance / Math.max(window.innerWidth, window.innerHeight), 0.18, 1);

    gaze[index].targetX = (deltaX / distance) * radiusX * pull;
    gaze[index].targetY = (deltaY / distance) * radiusY * pull;
  });
}

function renderGaze() {
  const easing = reduceMotion.matches ? 1 : 0.18;

  eyes.forEach((eye, index) => {
    const state = gaze[index];
    state.currentX += (state.targetX - state.currentX) * easing;
    state.currentY += (state.targetY - state.currentY) * easing;

    if (Math.abs(state.targetX - state.currentX) < 0.01) {
      state.currentX = state.targetX;
    }

    if (Math.abs(state.targetY - state.currentY) < 0.01) {
      state.currentY = state.targetY;
    }

    eye.style.setProperty("--pupil-x", `${state.currentX.toFixed(2)}px`);
    eye.style.setProperty("--pupil-y", `${state.currentY.toFixed(2)}px`);
  });

  requestAnimationFrame(renderGaze);
}

function centerGaze() {
  updateTargets(window.innerWidth / 2, window.innerHeight / 2);
}

window.addEventListener("pointermove", (event) => {
  updateTargets(event.clientX, event.clientY);
});

window.addEventListener("pointerdown", (event) => {
  updateTargets(event.clientX, event.clientY);
});

window.addEventListener("pointerleave", centerGaze);
window.addEventListener("resize", () => updateTargets(pointer.x, pointer.y));

centerGaze();
requestAnimationFrame(renderGaze);
