// this whole thing is an ugly hack and needs to be refactored some day

const LEFT_MOUSE_BUTTON   = 0;
const MIDDLE_MOUSE_BUTTON = 1;
const RIGHT_MOUSE_BUTTON  = 2;

const CONNECT_BUTTON = LEFT_MOUSE_BUTTON;
const MARK_1_BUTTON  = RIGHT_MOUSE_BUTTON;
const MARK_2_BUTTON  = MIDDLE_MOUSE_BUTTON;

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

let dWindow = null;
let state = 'none';
let prev = null;
let dragLine = {};
let nightMode = false;
let shortMode = false;

function createLine({layerX, layerY, offsetX, offsetY, target: {offsetWidth, offsetHeight}}) {
  const startX = layerX - offsetX + offsetWidth / 2;
  const startY = layerY - offsetY + offsetHeight / 2;
  const gEl = document.getElementById('connectingLine');

  dragLine.startX = startX;
  dragLine.startY = startY;
  gEl.innerHTML = `<path/>`;
  dragLine.element = gEl.children[0];
  updateLine(layerX, layerY);
}

function updateLine(x,y) {
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
  if (ev.target.classList.contains("item")) {
    prev = ev.target;
    if ((ev.shiftKey || (ev.button === CONNECT_BUTTON)) && !ev.target.classList.contains('nocon')) {
      state = 'connecting';
      createLine(ev);
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
    if (ev.button !== CONNECT_BUTTON && !ev.shiftKey) prevState = 'none';
    if (target.classList.contains('nocon')) prevState = 'none';
  }
  if (target.classList.contains("item")) {
    if (ev.ctrlKey && target === prev && !isPath(target.parentElement) && !target.classList.contains('nocon')) {
      let newPath = document.createElement("div");
      newPath.classList.add("path");
      newPath.dataset.looping = "yes";
      document.getElementById("main").insertBefore(newPath, prev.parentElement);
      newPath.append(prev);
    }
    else if (prevState !== 'connecting' && target === prev) {
      if (ev.button === MARK_1_BUTTON) mark('1')(ev);
      if (ev.button === MARK_2_BUTTON) mark('2')(ev);
    }
    else if (prevState === 'connecting' && target !== prev) {
      connect(target);
    }
  }
  updateWindow();
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

function connect(target) {

  let prevPath = prev.parentElement;
  const targetPath = target.parentElement;

  if(prevPath === targetPath && isPath(prevPath))
  {
    if(prev.nextElementSibling === null && target.previousElementSibling === null) 
    {
      prevPath.dataset.looping = "yes";
    }
    return;
  }

  if(!isPath(prevPath)) {
    prevPath = createPath(null, prev);
  }

  prevPath.dataset.looping = "no";

  if(prev.nextElementSibling !== null) {
    const afterPrev = [...dropUntilExc(x => x === prev, prevPath.children)];
    if(afterPrev.length > 1) {
      createPath(prevPath, ...afterPrev);
    }
    else {
      dumpToList(...afterPrev);
    }
  }

  if(!isPath(targetPath)) {
    prevPath.append(target);
    return;
  }

  targetPath.dataset.looping = "no";

  if(target.previousElementSibling !== null) {
    const beforeTarget = [...takeUntilExc(x => x === target, targetPath.children)];
    if(beforeTarget.length <= 1) {
      dumpToList(...beforeTarget);
    }
  }

  prevPath.append(...dropUntilInc(x => x === target, targetPath.children));

  if(targetPath.children.length === 0) targetPath.remove();
  if(prevPath.children.length === 0) {
    prevPath.remove();
  } else {
    addPath(prevPath, null);
  }
}

function updateWindow() {
  if (dWindow && !dWindow.closed) {
    dWindow.document.body.innerHTML = "<div style='overflow-wrap: break-word'>" +
     Array.from(document.getElementById("main").children).filter(x => x.classList.contains("path")).map((p) => {
      let result = Array.from(p.children).map(c => c.dataset.short + (c.dataset.mark === '1' ? '*' : c.dataset.mark === '2' ? '(*)' : '')).join("<wbr>→<wbr>");
      if (p.dataset.looping === "yes") result += "↩";
      return result;
    }).join(" | ")
    + "</div>";
  }
}

function openWindow() {
  if (!dWindow || dWindow.closed) {
    dWindow = window.open("", "display window", "width=300,height=300");
  }
  else {
    dWindow.focus();
  }
  updateWindow();
}

window.addEventListener("load", () => {
  document.getElementById("content").addEventListener("contextmenu", (ev) => { ev.preventDefault(); }, false);
  document.getElementById("content").addEventListener('mousedown', mousedown);
  document.getElementById("content").addEventListener('mousemove', mousemove);
  document.getElementById("content").addEventListener('mouseup', mouseup);
  window.addEventListener('keyup', (ev) => {
    if (ev.key === 'Shift' && state === 'connecting') {
      state = 'none';
      removeLine();
    }
  });

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
  if(displayBtn) displayBtn.addEventListener("click", openWindow);
  const nightBtn = document.getElementById("nightBtn");
  if(nightBtn) nightBtn.addEventListener("click", toggleNightMode);
  const shortBtn = document.getElementById("shortBtn");
  if(shortBtn) shortBtn.addEventListener("click", toggleShort);

  nightMode = localStorage.getItem("nightMode") === "true";
  shortMode = localStorage.getItem("shortMode") === "true";
  if(nightMode) document.body.classList.add("nightMode");
  setShort(shortMode);
});

function toggleNightMode() {
  if(nightMode) {
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

function setShort(sm) {
  
  for (const child of [...document.getElementById("main").children].filter(x => !x.id.startsWith("count")).flatMap(x => [...x.children])) {
    if(!("long" in child.dataset)) {
      child.dataset.long = child.innerText;
    }
    if(!("short" in child.dataset)) {
      child.dataset.short = child.innerText;
    }
    if(sm) {
      child.innerText = child.dataset.short;
      document.body.style.setProperty("--minItemWidth", "100px");
    } else {
      child.innerText = child.dataset.long;
      document.body.style.setProperty("--minItemWidth", "200px");
    }  
  }
}

function toggleShort() {
  if(shortMode) {
    shortMode = false;
    localStorage.setItem("shortMode", shortMode);
  }
  else {
    shortMode = true;
    localStorage.setItem("shortMode", shortMode);
  }
  setShort(shortMode);
}
