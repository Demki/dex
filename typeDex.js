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
let hiddenX = {
  "Fairy": false,
  "Steel": false,
  "Normal": false,
  "Dark": false,
}

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
  if (toggleFairyBtn) toggleFairyBtn.addEventListener("click", toggleX("Fairy"));
  const toggleSteelBtn = document.getElementById("toggleSteelBtn");
  if (toggleSteelBtn) toggleSteelBtn.addEventListener("click", toggleX("Steel"));
  const toggleNormalBtn = document.getElementById("toggleNormalBtn");
  if (toggleNormalBtn) toggleNormalBtn.addEventListener("click", toggleX("Normal"));
  const toggleDarkBtn = document.getElementById("toggleDarkBtn");
  if (toggleDarkBtn) toggleDarkBtn.addEventListener("click", toggleX("Dark"));

  nightMode = localStorage.getItem("typedex-nightMode") === "true";
  hiddenX["Fairy"] = localStorage.getItem("typedex-hiddenFairy") === "true";
  hiddenX["Steel"] = localStorage.getItem("typedex-hiddenSteel") === "true";
  hiddenX["Normal"] = localStorage.getItem("typedex-hiddenNormal") === "true";
  hiddenX["Dark"] = localStorage.getItem("typedex-hiddenDark") === "true";

  if (nightMode) document.body.classList.add("nightMode");
  setHiddenX(hiddenX["Fairy"],"Fairy");
  setHiddenX(hiddenX["Steel"],"Steel");
  setHiddenX(hiddenX["Normal"],"Normal");
  setHiddenX(hiddenX["Dark"],"Dark");

  const contentDiv = document.getElementById("content");

  const widthInput = document.getElementById("widthInput");
  const heightInput = document.getElementById("heightInput");

  const contentSizeObserver = new MutationObserver(() => 
  {
    setStoredSize(contentDiv.style.width, contentDiv.style.height);
    setInputSize(contentDiv.style.width, contentDiv.style.height, widthInput, heightInput);
  });

  contentSizeObserver.observe(contentDiv, {attributes: true, attributeFilter: ["style"]});

  if(localStorage.getItem("typedex-contentWidth") && localStorage.getItem("typedex-contentHeight"))
  {
    setSize(localStorage.getItem("typedex-contentWidth"), localStorage.getItem("typedex-contentHeight"), contentDiv);
  }
  
  if(localStorage.getItem("typedex-mark1Color"))
  {
    mark1Color = localStorage.getItem("typedex-mark1Color");
  }

  if(localStorage.getItem("typedex-mark2Color"))
  {
    mark2Color = localStorage.getItem("typedex-mark2Color");
  }

  const mark1ColorPicker = document.getElementById("mark1ColorPicker");
  const mark2ColorPicker = document.getElementById("mark2ColorPicker");
  const resetColorsBtn   = document.getElementById("resetColorsBtn");


  widthInput.addEventListener("change", (ev) => {
    const width = !widthInput.value ? "" : widthInput.value + "px";
    const height = !heightInput.value ? "" : heightInput.value + "px";
    setSize(width, height, contentDiv);  
  })
  heightInput.addEventListener("change", (ev) => {
    const width = !widthInput.value ? "" : widthInput.value + "px";
    const height = !heightInput.value ? "" : heightInput.value + "px";
    setSize(width, height, contentDiv);  
  })

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
  localStorage.setItem("typedex-mark1Color", mark1Color);
  document.body.style.setProperty("--color1BG", mark1Color);
}

function setMark2Color() {
  mark2Color = document.getElementById("mark2ColorPicker").jscolor.toHEXString();
  localStorage.setItem("typedex-mark2Color", mark2Color);
  document.body.style.setProperty("--color2BG", mark2Color);
}

function resetColors() { 
  document.getElementById("mark1ColorPicker").jscolor.fromString(MARK_1_DEFAULT);
  document.getElementById("mark2ColorPicker").jscolor.fromString(MARK_2_DEFAULT);
  setMark1Color();
  setMark2Color();
}

function toggleNightMode() {
  if (nightMode) {
    nightMode = false;
    localStorage.setItem("typedex-nightMode", nightMode);
    document.body.classList.remove("nightMode");
  }
  else {
    nightMode = true;
    localStorage.setItem("typedex-nightMode", nightMode);
    document.body.classList.add("nightMode");
  }
}

function setHiddenX(hVal, x) {
  const el = document.getElementById(x);
  if(hVal)
  {
    el.classList.add("hidden");
    document.getElementById(`toggle${x}Btn`).value = `show ${x}`;
  }
  else
  {
    el.classList.remove("hidden");
    document.getElementById(`toggle${x}Btn`).value = `hide ${x}`;
  }
}

function toggleX(x) {
  return () => {
    if (hiddenX[x]) {
      hiddenX[x] = false;
      localStorage.setItem(`typedex-hidden${x}`, hiddenX[x]);
    }
    else {
      hiddenX[x] = true;
      localStorage.setItem(`typedex-hidden${x}`, hiddenX[x]);
    }
    setHiddenX(hiddenX[x], x);
  }
}

function setStoredSize(width, height) {
  localStorage.setItem("typedex-contentWidth", width);
  localStorage.setItem("typedex-contentHeight", height);
}

function setSize(width, height, div) {
  div.style.setProperty("width", width);
  div.style.setProperty("height", height);
  if(!width)
  {
    div.style.removeProperty("width");
  }
  if(!height)
  {
    div.style.removeProperty("height");
  }
}

function setInputSize(width, height, widthInput, heightInput) {
  widthInput.value = Number.parseFloat(width);
  heightInput.value = Number.parseFloat(height);
}