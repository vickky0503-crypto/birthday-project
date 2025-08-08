
let audio;
let audioMuted = false;

function playMusic(file) {
  try {
    if (audio) { audio.pause(); audio = null; }
    audio = new Audio(file);
    audio.loop = true;
    if (!audioMuted) audio.play().catch(()=>{});
    updateMuteLabel();
  } catch(e){ console.warn(e); }
}

function toggleMute(){
  audioMuted = !audioMuted;
  if(audio){
    if(audioMuted) audio.pause();
    else audio.play().catch(()=>{});
  }
  updateMuteLabel();
}
function updateMuteLabel(){
  const m = document.getElementById('muteBtn');
  if(m) m.textContent = audioMuted ? 'เปิดเสียง' : 'ปิดเสียง';
}

/* Modal image viewer */
function openImage(src){
  const modal = document.getElementById('imageModal');
  const img = document.getElementById('modalImage');
  if(!modal || !img) return;
  img.src = src;
  modal.style.display = 'flex';
}
function closeImage(){
  const modal = document.getElementById('imageModal');
  if(modal) modal.style.display = 'none';
}

/* Subtle star canvas (background) */
function startStars(){
  const canvas = document.getElementById('starCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize(); window.addEventListener('resize', resize);
  const stars = Array.from({length:140}).map(()=> ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: Math.random()*1.5 + 0.2,
    vy: Math.random()*0.3 + 0.05,
    a: Math.random()*0.6 + 0.2
  }));
  (function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const s of stars){
      s.y += s.vy;
      if(s.y>canvas.height+6){ s.y=-6; s.x=Math.random()*canvas.width; }
      ctx.globalAlpha = s.a;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  })();
}

/* ==== Image extension resolver for only-b/1..84 with mixed extensions ==== */
function imageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

async function resolveImagePath(dir, index, exts = ['jpg','jpeg','png','webp']) {
  for (const ext of exts) {
    const candidate = `${dir}/${index}.${ext}`;
    if (await imageExists(candidate)) return candidate;
  }
  return null;
}

/* Photo-star field for universe page */
async function initPhotoUniverse(){
  const field = document.getElementById('universeField');
  if(!field) return;
  const EXTS = ['jpg','jpeg','png','webp'];
  const images = [];
  for(let i=1;i<=88;i++){
    const src = await resolveImagePath('only-b', i, EXTS);
    if(src) images.push(src);
    else console.warn(`รูปไม่พบ: only-b/${i}.[${EXTS.join('|')}]`);
  }
  createPhotoStars(field, images);
  startStars();
}

function createPhotoStars(container, images){
  const W = container.clientWidth;
  const H = container.clientHeight;
  const nodes = [];
  images.forEach(src=>{
    const d=document.createElement('div');
    d.className='star-photo';
    d.style.backgroundImage=`url('${src}')`;
    const x = Math.random()*(W-80), y=Math.random()*(H-80);
    d.style.left = x+'px'; d.style.top = y+'px';
    d.addEventListener('click', ()=>openImage(src));
    container.appendChild(d);
    nodes.push({ el:d, x, y, vx:(Math.random()*0.6-0.3), vy:(Math.random()*0.6-0.1), w:68, h:68 });
  });
  (function step(){
    const Wn = container.clientWidth, Hn = container.clientHeight;
    nodes.forEach(n=>{
      n.x += n.vx; n.y += n.vy;
      if(n.x<-n.w) n.x = Wn;
      if(n.x> Wn)  n.x = -n.w;
      if(n.y<-n.h) n.y = Hn;
      if(n.y> Hn)  n.y = -n.h;
      n.el.style.left = n.x+'px';
      n.el.style.top  = n.y+'px';
    });
    requestAnimationFrame(step);
  })();
}
