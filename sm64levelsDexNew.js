// this whole thing is an ugly hack and needs to be refactored some day

const LEFT_MOUSE_BUTTON = 0;
const MIDDLE_MOUSE_BUTTON = 1;
const RIGHT_MOUSE_BUTTON = 2;

const CONNECT_BUTTON = LEFT_MOUSE_BUTTON;
const MARK_1_BUTTON = RIGHT_MOUSE_BUTTON;
const MARK_2_BUTTON = MIDDLE_MOUSE_BUTTON;

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

let state = 'none';
let prev = null;
let dragLine = {};
let nightMode = false;
let shortMode = false;
let hiddenBitS = false;
let hiddenOthers = false;
let shownTips = false;

const MARK_1_DEFAULT = "#da1b1b"
const MARK_2_DEFAULT = "#118d11"

let mark1Color = MARK_1_DEFAULT;
let mark2Color = MARK_2_DEFAULT;

function createLine({ layerX, layerY, offsetX, offsetY, target: { offsetWidth, offsetHeight } }) {
  const startX = layerX - offsetX + offsetWidth / 2;
  const startY = layerY - offsetY + offsetHeight / 2;
  const gEl = document.getElementById('connectingLine');

  dragLine.startX = startX;
  dragLine.startY = startY;
  gEl.innerHTML = `<path/>`;
  dragLine.element = gEl.children[0];
  updateLine(layerX, layerY);
}

function updateLine(x, y) {
  if (dragLine.element) {
    dragLine.endX = x;
    dragLine.endY = y;
    dragLine.element.setAttribute('d', `M${dragLine.startX},${dragLine.startY} L${dragLine.endX},${dragLine.endY}`);
  }
}

function removeLine() {
  dragLine.element.remove();
  dragLine = {};
}

function mousedown(ev) {
  if(ev.button === MIDDLE_MOUSE_BUTTON) ev.preventDefault(); // prevent scroll toggle with middle mouse button
  if (ev.target.classList.contains("item")) {
    prev = ev.target;
    if (!ev.target.classList.contains('nocon')) {
      switch (ev.button) {
        case CONNECT_BUTTON:
          state = 'connecting';
          createLine(ev);
          break;
      }
    }
  }
}

function mousemove(ev) {
  if (state === 'connecting') {
    updateLine(ev.layerX, ev.layerY);
  }
}

function mouseup(ev) {
  let prevState = state;
  state = 'none';
  const target = ev.target;
  if (prevState === 'connecting') {
    removeLine();
    if (target.classList.contains('nocon')) prevState = 'none';
  }
  if (target.classList.contains("item")) {
    if (ev.ctrlKey && prevState === 'connecting' && target === prev && !isPath(target.parentElement) && !target.classList.contains('nocon')) {
      let newPath = document.createElement("div");
      newPath.classList.add("path");
      newPath.dataset.looping = "yes";
      document.getElementById("main").insertBefore(newPath, prev.parentElement);
      newPath.append(prev);
    }
    else if (prevState !== 'connecting' && target === prev) {
      if (ev.button === MARK_1_BUTTON) mark('1')(ev);
      if (ev.button === MARK_2_BUTTON) {
        if (ev.ctrlKey) {
          disconnect(target);
        }
        else {
          mark('2')(ev);
        }
      }
    }
    else if (prevState === 'connecting' && target !== prev) {
      connect(target);
    }
  }
  updateWindow();
  prev = null;
}

function isPath(p) {
  return p.classList.contains("path");
}

function createPath(startPath, ...ls) {
  const newPath = document.createElement("div");
  newPath.classList.add("path");
  newPath.dataset.looping = "no";
  newPath.append(...ls);
  addPath(newPath, startPath);
  return newPath;
}

function addPath(newPath, startPath) {
  const main = document.getElementById("main");
  const before = startPath ? startPath : document.getElementById("list");
  main.insertBefore(newPath, before);
}

function dumpToList(...ls) {
  document.getElementById("list").append(...ls);
}

function disconnect(target) {
  const targetPath = target.parentElement;
  if (!isPath(targetPath)) return;
  targetPath.looping = "no";
  if (prev.nextElementSibling !== null) {
    const afterTarget = [...dropUntilExc(x => x === target, targetPath.children)];
    if (afterTarget.length > 1) {
      createPath(targetPath, ...afterTarget);
    }
    else {
      dumpToList(...afterTarget);
    }
  }
  if (targetPath.children.length <= 1) {
    dumpToList(...targetPath.children);
    targetPath.remove();
  }
}

function connect(target) {

  let prevPath = prev.parentElement;
  const targetPath = target.parentElement;

  if (prevPath === targetPath && isPath(prevPath)) {
    if (prev.nextElementSibling === null && target.previousElementSibling === null) {
      prevPath.dataset.looping = "yes";
    }
    return;
  }

  if (!isPath(prevPath)) {
    prevPath = createPath(null, prev);
  }

  prevPath.dataset.looping = "no";

  if (prev.nextElementSibling !== null) {
    const afterPrev = [...dropUntilExc(x => x === prev, prevPath.children)];
    if (afterPrev.length > 1) {
      createPath(prevPath, ...afterPrev);
    }
    else {
      dumpToList(...afterPrev);
    }
  }

  if (!isPath(targetPath)) {
    prevPath.append(target);
    return;
  }

  targetPath.dataset.looping = "no";

  if (target.previousElementSibling !== null) {
    const beforeTarget = [...takeUntilExc(x => x === target, targetPath.children)];
    if (beforeTarget.length <= 1) {
      dumpToList(...beforeTarget);
    }
  }

  prevPath.append(...dropUntilInc(x => x === target, targetPath.children));

  if (targetPath.children.length === 0) targetPath.remove();
  if (prevPath.children.length === 0) {
    prevPath.remove();
  } else {
    addPath(prevPath, null);
  }
}

function updateWindow() {
  const dWindow = document.getElementById("display");
  dWindow.innerHTML = "<div style='overflow-wrap: break-word'>" +
      Array.from(document.getElementById("main").children).filter(x => x.classList.contains("path")).map((p) => {
        let result = Array.from(p.children).map(c => c.dataset.short + (c.dataset.mark === '1' ? '*' : c.dataset.mark === '2' ? '(*)' : '')).join("<wbr>→<wbr>");
        if (p.dataset.looping === "yes") result += "↩";
        return `<div class="dpath">${result}</div>`
      }).join(" ")
      + "</div>";
}

function toggleDisplay() {
  const clist = document.getElementById("display").classList;
  clist.toggle("hidden");
  localStorage.setItem("displayVisible", !clist.contains("hidden"));
}

window.addEventListener("load", () => {
  document.getElementById("content").addEventListener("contextmenu", (ev) => { ev.preventDefault(); }, false);
  document.getElementById("content").addEventListener('mousedown', mousedown);
  document.getElementById("content").addEventListener('mousemove', mousemove);
  document.getElementById("content").addEventListener('mouseup', mouseup);

  let i = 0;
  for (const child of document.getElementById("list").children) {
    child.classList.add("item");
    child.classList.add("color0");
    child.id = "item" + i;
    i++;
    child.dataset.mark = '0';
  }

  for (const child of document.getElementById("others").children) {
    child.classList.add("nocon");
    child.classList.add("item");
    child.classList.add("color0");
    child.id = "item" + i;
    i++;
    child.dataset.mark = '0';
  }
  const displayBtn = document.getElementById("displayBtn");
  if (displayBtn) displayBtn.addEventListener("click", toggleDisplay);
  const nightBtn = document.getElementById("nightBtn");
  if (nightBtn) nightBtn.addEventListener("click", toggleNightMode);
  const shortBtn = document.getElementById("shortBtn");
  if (shortBtn) shortBtn.addEventListener("click", toggleShort);
  const toggleOthersBtn = document.getElementById("toggleOthersBtn");
  if (toggleOthersBtn) toggleOthersBtn.addEventListener("click", toggleOthers);
  const toggleBitSBtn = document.getElementById("toggleBitSBtn");
  if (toggleBitSBtn) toggleBitSBtn.addEventListener("click", toggleBitS);
  const toggleTipsBtn = document.getElementById("toggleTipsBtn");
  if (toggleTipsBtn) toggleTipsBtn.addEventListener("click", toggleTips);

  nightMode = localStorage.getItem("nightMode") === "true";
  shortMode = localStorage.getItem("shortMode") === "true";
  hiddenBitS = localStorage.getItem("hiddenBitS") === "true";
  hiddenOthers = localStorage.getItem("hiddenOthers") === "true";
  shownTips = localStorage.getItem("shownTips") === "true";
  if (nightMode) document.body.classList.add("nightMode");
  setShort(shortMode);
  setHiddenBitS(hiddenBitS);
  setHiddenOthers(hiddenOthers);
  setShownTips(shownTips);

  if(JSON.parse(localStorage.getItem("displayVisible"))) toggleDisplay();

  const displayDiv = document.getElementById("display");
  const contentDiv = document.getElementById("content");

  const displaySizeObserver = new MutationObserver(() => 
  {
    localStorage.setItem("displayWidth", displayDiv.style.width);
    localStorage.setItem("displayHeight", displayDiv.style.height);
  });

  const contentSizeObserver = new MutationObserver(() => 
  {
    localStorage.setItem("contentWidth", contentDiv.style.width);
    localStorage.setItem("contentHeight", contentDiv.style.height);
  });

  displaySizeObserver.observe(displayDiv, {attributes: true, attributeFilter: ["style"]});

  contentSizeObserver.observe(contentDiv, {attributes: true, attributeFilter: ["style"]});

  if(localStorage.getItem("displayWidth") && localStorage.getItem("displayHeight"))
  {
    displayDiv.style.setProperty("width", localStorage.getItem("displayWidth"));
    displayDiv.style.setProperty("height", localStorage.getItem("displayHeight"));
  }
  
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
  updateWindow();
}

function setShort(sm) {

  for (const child of [...document.getElementById("main").children].filter(x => !x.id.startsWith("count")).flatMap(x => [...x.children])) {
    if (!("long" in child.dataset)) {
      child.dataset.long = child.innerText;
    }
    if (!("short" in child.dataset)) {
      child.dataset.short = child.innerText;
    }
    if (sm) {
      child.innerText = child.dataset.short;
      document.body.style.setProperty("--minItemWidth", "100px");
    } else {
      child.innerText = child.dataset.long;
      document.body.style.setProperty("--minItemWidth", "200px");
    }
  }
}

function toggleShort() {
  if (shortMode) {
    shortMode = false;
    localStorage.setItem("shortMode", shortMode);
  }
  else {
    shortMode = true;
    localStorage.setItem("shortMode", shortMode);
  }
  setShort(shortMode);
}

function setHiddenBitS(hBS) {
  const bitS = document.querySelector("div[data-short=BitS]");
  if(hBS)
  {
    bitS.classList.add("hidden");
    document.getElementById("toggleBitSBtn").value = "show BitS";
  }
  else
  {
    bitS.classList.remove("hidden");
    document.getElementById("toggleBitSBtn").value = "hide BitS";
  }
}

function setHiddenOthers(hOthers) {
  const others = document.getElementById("others");
  if(hOthers)
  {
    others.classList.add("hidden");
    document.getElementById("toggleOthersBtn").value = "show Toads and Mips";
  }
  else
  {
    others.classList.remove("hidden");
    document.getElementById("toggleOthersBtn").value = "hide Toads and Mips";
  }
}

function toggleBitS() {
  if (hiddenBitS) {
    hiddenBitS = false;
    localStorage.setItem("hiddenBitS", hiddenBitS);
  }
  else {
    hiddenBitS = true;
    localStorage.setItem("hiddenBitS", hiddenBitS);
  }
  setHiddenBitS(hiddenBitS);
}

function toggleOthers() {
  if (hiddenOthers) {
    hiddenOthers = false;
    localStorage.setItem("hiddenOthers", hiddenOthers);
  }
  else {
    hiddenOthers = true;
    localStorage.setItem("hiddenOthers", hiddenOthers);
  }
  setHiddenOthers(hiddenOthers);
}

function setShownTips(sTips) {
  const tips = document.getElementById("tooltips");
  if(!sTips)
  {
    tips.classList.add("hidden");
    document.getElementById("toggleTipsBtn").value = "show controls";
  }
  else
  {
    tips.classList.remove("hidden");
    document.getElementById("toggleTipsBtn").value = "hide controls";
  }
}

function toggleTips() {
  if (shownTips) {
    shownTips = false;
    localStorage.setItem("shownTips", shownTips);
  }
  else {
    shownTips = true;
    localStorage.setItem("shownTips", shownTips);
  }
  setShownTips(shownTips);
}