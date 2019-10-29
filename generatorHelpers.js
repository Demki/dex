function* dropUntilInc(f, xs) {
  let b = false;
  for(const x of xs) 
  {
    if(!b && f(x)) {
      b = true;
    }
    if(b) {
      yield x;
    }
  }
}

function* dropUntilExc(f, xs) {
  let b = false;
  for(const x of xs) 
  {
    if(b) {
      yield x;
    }
    if(!b && f(x)) {
      b = true;
    }
  }
}

function* takeUntilExc(f, xs) {
  let b = false;
  for(const x of xs) 
  {
    if(f(x)) {
      break;
    }
    yield x;
  }
}

function* takeUntilInc(f, xs) {
  let b = false;
  for(const x of xs) 
  {
    yield x;
    if(f(x)) {
      break;
    }
  }
}