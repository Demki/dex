function mark(v) {
  return (ev) => {
    const target = ev.target;
    const mark = target.dataset.mark;
    const newMark = target.dataset.mark === v ? '0' : v;
    if (!target.classList.replace(`color${mark}`, `color${newMark}`)) {
      target.classList.add(`color${newMark}`);
    }
    target.dataset.mark = newMark;
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
    prev = ev.target;
    if (ev.button === 0 && ev.shiftKey) {
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
  if (state === 'connecting') {
    removeLine();
    if (!ev.shiftKey) state = 'none';
  }
  if (ev.target.classList.contains("item")) {
    if (state !== 'connecting' && ev.target === prev) {
      if (ev.button === 0) mark('1')(ev);
      if (ev.button === 2) mark('2')(ev);
    }
    else if (state === 'connecting') {
      state = 'none';

      //...put the elements in a corresponding path
      const startInd = Number.parseInt(prev.dataset.pathInd);
      const endInd = Number.parseInt(ev.target.dataset.pathInd);

      if (startInd !== -1) {
        // if (ev.target === prev) {
        //   // unmark current path as looping if it is and fix it, move element to a new path, mark that path as looping
        //   const currentStartPath = prev.parentElement;
        //   const newPath = document.createElement("div");
        //   newPath.classList.add("path");
        //   if (currentStartPath.dataset.looping === "looping") {
        //     for (let i = currentStartPath.children.length - 1; i > startInd; --i) {
        //       currentStartPath.insertBefore(currentStartPath.children[i], currentStartPath.children[0]);
        //     }
        //     newPath.dataset.looping = "looping";
        //     newPath.append(prev);
        //     document.getElementById("content").insertBefore(currentStartPath, newPath);
        //     currentStartPath.dataset.looping = "no";
        //   } else {
        //     newPath.dataset.looping = "no";
        //     newPath.append(Array.from(currentStartPath.children).slice(startInd+1));
        //     document.getElementById("content").insertBefore(currentStartPath, newPath);
        //     const otherNewPath = document.createElement("div");
        //     otherNewPath.dataset.looping = "looping";
        //     otherNewPath.classList.add("path");
        //     otherNewPath.append(prev);
        //     prev.pathInd = 0;
        //     document.getElementById("content").insertBefore(currentStartPath, otherNewPath);
        //     currentStartPath.dataset.looping = "no";
        //     fixIndices(currentStartPath);
        //   }

        // } 
        if (endInd !== -1) {
          
        } else {
          const currentStartPath = prev.parentElement;
          currentStartPath.dataset.looping = "no";
          if (currentStartPath.children.length > startInd + 1) {
            let newPath = document.createElement("div");
            newPath.classList.add("path");
            newPath.dataset.looping = "no";
            newPath.append(...Array.from(currentStartPath.children).slice(startInd + 1));
            if (newPath.children.length === 1) {
              const child = newPath.children[0];
              child.dataset.pathInd = -1;
              document.getElementById("list").append(newPath.children[0]);
              newPath.remove();
              newPath = null;
            }
            else {
              Array.from(newPath.children).forEach((x, i) => x.dataset.pathInd = i);
            }
            if(newPath) document.getElementById("content").insertBefore(newPath, currentStartPath);
          }
          currentStartPath.append(ev.target);
          ev.target.dataset.pathInd = currentStartPath.children.length - 1;
        }
      }
      else {
        if (ev.target === prev) {

        } else if (endInd !== -1) {

        } else {
          const listEl = prev.parentElement;
          const newPath = document.createElement("div");
          newPath.classList.add("path");
          newPath.dataset.looping = "no";
          newPath.append(prev, ev.target);
          Array.from(newPath.children).forEach((x, i) => x.dataset.pathInd = i);
          document.getElementById("content").insertBefore(newPath, listEl);
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

  for (const child of document.getElementById("list").children) {
    child.classList.add("item");
    child.classList.add("color0");
    child.dataset.mark = '0';
    child.dataset.pathInd = '-1';
  }
});