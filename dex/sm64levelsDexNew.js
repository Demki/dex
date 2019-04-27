function mark(v) {
  return (ev) => {
    m(ev.target);
    if ('for' in ev.target.dataset) {
      m(document.getElementById(ev.target.dataset.for));
    } else if ('copy' in ev.target.dataset) {
      m(document.getElementById(ev.target.dataset.copy));
    }
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

function createLine(ev) {
  const startX = ev.layerX - ev.offsetX + ev.target.offsetWidth / 2;
  const startY = ev.layerY - ev.offsetY + ev.target.offsetHeight / 2;
  const gEl = document.getElementById('connectingLine');

  dragLine.startX = startX;
  dragLine.startY = startY;
  gEl.innerHTML = `<path/>`
  dragLine.element = gEl.children[0];
  updateLine(ev);
}

function updateLine(ev) {
  if (dragLine.element) {
    dragLine.endX = ev.layerX;
    dragLine.endY = ev.layerY;
    dragLine.element.setAttribute('d', `M${dragLine.startX},${dragLine.startY} L${dragLine.endX},${dragLine.endY}`);
  }
}

function removeLine() {
  dragLine.element.remove();
  dragLine = {};
}

function mousedown(ev) {
  if (ev.target.classList.contains("item")) {
    prev = 'for' in ev.target.dataset ? document.getElementById(ev.target.dataset.for) : ev.target;
    if (((ev.button === 0 && ev.shiftKey) || (ev.button === 1)) && !ev.target.classList.contains('nocon')) {
      state = 'connecting';
      createLine(ev);
    }
  }
}

function mousemove(ev) {
  if (state === 'connecting') {
    updateLine(ev);
  }
}

function mouseup(ev) {
  let prevState = state;
  state = 'none';
  const target = 'for' in ev.target.dataset ? document.getElementById(ev.target.dataset.for) : ev.target;
  if (prevState === 'connecting') {
    removeLine();
    if (ev.button !== 1 && !ev.shiftKey) prevState = 'none';
    if (target.classList.contains('nocon')) prevState = 'none';
  }
  if (target.classList.contains("item")) {
    if (prevState !== 'connecting' && target === prev) {
      if (ev.button === 0) mark('1')(ev);
      if (ev.button === 2) mark('2')(ev);
    }
    else if (prevState === 'connecting') {

      //...put the elements in a corresponding path
      const startInd = Number.parseInt(prev.dataset.pathInd);
      const endInd = Number.parseInt(target.dataset.pathInd);

      if (startInd !== -1) {
        if (endInd !== -1) {
          if (prev.parentElement === target.parentElement) {

          } else {
            const currentStartPath = prev.parentElement;
            currentStartPath.dataset.looping = "no";
            const endPath = target.parentElement;
            endPath.dataset.looping = "no";
            let newPath = document.createElement("div");
            newPath.classList.add("path");
            newPath.dataset.looping = "no";
            newPath.append(...Array.from(currentStartPath.children).slice(startInd + 1));
            if (newPath.children.length <= 1) {
              Array.from(newPath.children).forEach((x) => x.dataset.pathInd = -1);

              document.getElementById("list").append(...newPath.children);
              newPath.remove();
              newPath = null;
            } else {
              Array.from(newPath.children).forEach((x, i) => x.dataset.pathInd = i);
            }
            if (newPath) document.getElementById("content").insertBefore(newPath, currentStartPath);

            currentStartPath.append(...Array.from(endPath.children).slice(endInd));
            Array.from(currentStartPath.children).forEach((x, i) => x.dataset.pathInd = i);
            if (endPath.children.length <= 1) {
              Array.from(endPath.children).forEach((x) => x.dataset.pathInd = -1);

              document.getElementById("list").append(...endPath.children);
              endPath.remove();
            }
          }
        } else {
          const currentStartPath = prev.parentElement;
          currentStartPath.dataset.looping = "no";
          if (currentStartPath.children.length > startInd + 1) {
            let newPath = document.createElement("div");
            newPath.classList.add("path");
            newPath.dataset.looping = "no";
            newPath.append(...Array.from(currentStartPath.children).slice(startInd + 1));
            if (newPath.children.length <= 1) {
              Array.from(newPath.children).forEach((x) => x.dataset.pathInd = -1);

              document.getElementById("list").append(...newPath.children);
              newPath.remove();
              newPath = null;
            } else {
              Array.from(newPath.children).forEach((x, i) => x.dataset.pathInd = i);
            }
            if (newPath) currentStartPath.parentElement.insertBefore(newPath, currentStartPath);
          }
          currentStartPath.append(target);
          target.dataset.pathInd = currentStartPath.children.length - 1;
        }
      }
      else {
        if (target === prev) {

        } else if (endInd !== -1) {
          const endPath = target.parentElement;
          endPath.dataset.looping = "no";
          let newPath = document.createElement("div");
          newPath.classList.add("path");
          newPath.dataset.looping = "no";
          newPath.append(...Array.from(endPath.children).slice(0, endInd));
          endPath.insertBefore(prev, target);
          Array.from(endPath.children).forEach((x, i) => x.dataset.pathInd = i);

          if (newPath.children.length <= 1) {
            Array.from(newPath.children).forEach((x) => x.dataset.pathInd = -1);

            document.getElementById("list").append(...newPath.children);
            newPath.remove();
            newPath = null;
          } else {
            Array.from(newPath.children).forEach((x, i) => x.dataset.pathInd = i);
          }
          if (newPath) endPath.parentElement.insertBefore(newPath, endPath);
        } else {
          const listEl = prev.parentElement;
          const newPath = document.createElement("div");
          newPath.classList.add("path");
          newPath.dataset.looping = "no";
          newPath.append(prev, target);
          Array.from(newPath.children).forEach((x, i) => x.dataset.pathInd = i);
          listEl.parentElement.insertBefore(newPath, listEl);
        }
      }
    }
  }
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

  const copyEl = document.getElementById("copy");
  let i = 0;
  for (const child of document.getElementById("list").children) {
    child.classList.add("item");
    child.classList.add("color0");
    const copy = child.cloneNode(true);
    child.id = child.innerText + i;
    copy.id = child.id + 'copy';
    i++;
    child.dataset.mark = '0';
    child.dataset.pathInd = '-1';
    copy.dataset.for = child.id;
    child.dataset.copy = copy.id;
    copyEl.append(copy);
  }

  for (const child of document.getElementById("others").children) {
    child.classList.add("nocon");
    child.classList.add("item");
    child.classList.add("color0");
    const copy = child.cloneNode(true);
    child.id = child.innerText + i;
    copy.id = child.id + 'copy';
    i++;
    child.dataset.mark = '0';
    child.dataset.pathInd = '-1';
    copy.dataset.for = child.id;
    child.dataset.copy = copy.id;
    copyEl.append(copy);
  }
});