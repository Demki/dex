// this whole thing is an ugly hack and needs to be refactored some day

const LEFT_MOUSE_BUTTON = 0;
const MIDDLE_MOUSE_BUTTON = 1;
const RIGHT_MOUSE_BUTTON = 2;

const MARK_1_BUTTON = LEFT_MOUSE_BUTTON;
const MARK_2_BUTTON = RIGHT_MOUSE_BUTTON;

function mark(v) {
  return (ev) => {
    m(ev.target);
    function m(target) {
      const mark = target.dataset.mark;
      const newMark = target.dataset.mark === v ? '0' : v;
      if (!target.classList.replace(`color${mark}`, `color${newMark}`)) {
        target.classList.add(`color${newMark}`);
      }
      target.dataset.mark = newMark;
    }
  }
}

let prev = null;
let nightMode = false;
let hiddenFairy = false;
let hiddenSteel = false;

const MARK_1_DEFAULT = "#da1b1b"
const MARK_2_DEFAULT = "#118d11"

let mark1Color = MARK_1_DEFAULT;
let mark2Color = MARK_2_DEFAULT;

function mousedown(ev) {
  if(ev.button === MIDDLE_MOUSE_BUTTON) ev.preventDefault(); // prevent scroll toggle with middle mouse button
  if(ev.target.classList.contains("item"))
    prev = ev.target;
}

function mouseup(ev) {
  const target = ev.target;
  if (ev.target.classList.contains("item") && target === prev) {
    if (ev.button === MARK_1_BUTTON) mark('1')(ev);
    if (ev.button === MARK_2_BUTTON) mark('2')(ev);
  }
  prev = null;
}
window.addEventListener("load", () => {
  document.getElementById("content").addEventListener("contextmenu", (ev) => { ev.preventDefault(); }, false);
  document.getElementById("content").addEventListener('mousedown', mousedown);
  document.getElementById("content").addEventListener('mouseup', mouseup);

  const nightBtn = document.getElementById("nightBtn");
  if (nightBtn) nightBtn.addEventListener("click", toggleNightMode);
  const toggleFairyBtn = document.getElementById("toggleFairyBtn");
  if (toggleFairyBtn) toggleFairyBtn.addEventListener("click", toggleFairy);
  const toggleSteelBtn = document.getElementById("toggleSteelBtn");
  if (toggleSteelBtn) toggleSteelBtn.addEventListener("click", toggleSteel);

  nightMode = localStorage.getItem("nightMode") === "true";
  hiddenFairy = localStorage.getItem("hiddenFairy") === "true";
  hiddenSteel = localStorage.getItem("hiddenSteel") === "true";

  if (nightMode) document.body.classList.add("nightMode");
  setHiddenFairy(hiddenFairy);
  setHiddenSteel(hiddenSteel);

  const contentDiv = document.getElementById("content");

  const contentSizeObserver = new MutationObserver(() => 
  {
    localStorage.setItem("contentWidth", contentDiv.style.width);
    localStorage.setItem("contentHeight", contentDiv.style.height);
  });

  contentSizeObserver.observe(contentDiv, {attributes: true, attributeFilter: ["style"]});

  if(localStorage.getItem("contentWidth") && localStorage.getItem("contentHeight"))
  {
    contentDiv.style.setProperty("width", localStorage.getItem("contentWidth"));
    contentDiv.style.setProperty("height", localStorage.getItem("contentHeight"));
  }
  
  if(localStorage.getItem("mark1Color"))
  {
    mark1Color = localStorage.getItem("mark1Color");
  }

  if(localStorage.getItem("mark2Color"))
  {
    mark2Color = localStorage.getItem("mark2Color");
  }

  const mark1ColorPicker = document.getElementById("mark1ColorPicker");
  const mark2ColorPicker = document.getElementById("mark2ColorPicker");
  const resetColorsBtn   = document.getElementById("resetColorsBtn");

  mark1ColorPicker.jscolor.fromString(mark1Color);
  document.body.style.setProperty("--color1BG", mark1Color);

  mark2ColorPicker.jscolor.fromString(mark2Color);
  document.body.style.setProperty("--color2BG", mark2Color);

  mark1ColorPicker.addEventListener("input", setMark1Color);
  mark2ColorPicker.addEventListener("input", setMark2Color);
  resetColorsBtn.addEventListener("click", resetColors);
});

function setMark1Color() {
  mark1Color = document.getElementById("mark1ColorPicker").jscolor.toHEXString();
  localStorage.setItem("mark1Color", mark1Color);
  document.body.style.setProperty("--color1BG", mark1Color);
}

function setMark2Color() {
  mark2Color = document.getElementById("mark2ColorPicker").jscolor.toHEXString();
  localStorage.setItem("mark2Color", mark2Color);
  document.body.style.setProperty("--color2BG", mark2Color);
}

function resetColors(mark1ColorPicker, mark2ColorPicker) { 
  document.getElementById("mark1ColorPicker").jscolor.fromString(MARK_1_DEFAULT);
  document.getElementById("mark2ColorPicker").jscolor.fromString(MARK_2_DEFAULT);
  setMark1Color();
  setMark2Color();
}

function toggleNightMode() {
  if (nightMode) {
    nightMode = false;
    localStorage.setItem("nightMode", nightMode);
    document.body.classList.remove("nightMode");
  }
  else {
    nightMode = true;
    localStorage.setItem("nightMode", nightMode);
    document.body.classList.add("nightMode");
  }
}

function setHiddenFairy(hFairy) {
  const fairy = document.getElementById("Fairy");
  if(hFairy)
  {
    fairy.classList.add("hidden");
    document.getElementById("toggleFairyBtn").value = "show Fairy";
  }
  else
  {
    fairy.classList.remove("hidden");
    document.getElementById("toggleFairyBtn").value = "hide Fairy";
  }
}

function toggleFairy() {
  if (hiddenFairy) {
    hiddenFairy = false;
    localStorage.setItem("hiddenFairy", hiddenFairy);
  }
  else {
    hiddenFairy = true;
    localStorage.setItem("hiddenFairy", hiddenFairy);
  }
  setHiddenFairy(hiddenFairy);
}

function setHiddenSteel(hSteel) {
  const steel = document.getElementById("Steel");
  if(hSteel)
  {
    steel.classList.add("hidden");
    document.getElementById("toggleSteelBtn").value = "show Steel";
  }
  else
  {
    steel.classList.remove("hidden");
    document.getElementById("toggleSteelBtn").value = "hide Steel";
  }
}

function toggleSteel() {
  if (hiddenSteel) {
    hiddenSteel = false;
    localStorage.setItem("hiddenSteel", hiddenSteel);
  }
  else {
    hiddenSteel = true;
    localStorage.setItem("hiddenSteel", hiddenSteel);
  }
  setHiddenSteel(hiddenSteel);
}