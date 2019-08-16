///// Taken from this answer https://stackoverflow.com/a/47593316/8491228 on Stack overflow /////

// generating the seed
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for(let i = 0; i < str.length; i++)
  {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = h << 13 | h >>> 19;
  }
  return function() {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return (h ^= h >>> 16) >>> 0;
  }
}

// the PRNG
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
    let t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

///// And this one https://stackoverflow.com/a/27747377/8491228 /////


function generateId (len) {
  var arr = new Uint8Array(Math.ceil((len || 40) * 3 / 4));
  window.crypto.getRandomValues(arr);
  return base64js.fromByteArray(arr).substring(0,len);
}

function shuffle(rand, a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}