// Dog Bowl Treat Counter Logic
let treatType = "mixed"; // mixed, bones, biscuits, hearts, stars
let gravity = 0.35;
let widgetScale = 1.0;

let canvas, ctx;
let particles = [];
let totalCount = 0;

// Animation loop request ID
let animFrameId = null;

// Fixed relative coordinates for resting treats inside the bowl (layered progressively per 25 treats)
const RESTING_PILES = [
  // Layer 1 (0 to 25 treats: Bottom inner floor)
  { relX: -55, relY: -35, rot: -0.2, type: 'bone' },
  { relX: -25, relY: -32, rot: 0.3, type: 'biscuit' },
  { relX: 0, relY: -35, rot: -0.1, type: 'star' },
  { relX: 25, relY: -32, rot: 0.4, type: 'heart' },
  { relX: 55, relY: -35, rot: -0.3, type: 'bone' },

  // Layer 2 (26 to 50 treats: Mid-low pile level)
  { relX: -45, relY: -50, rot: 0.5, type: 'biscuit' },
  { relX: -18, relY: -48, rot: -0.4, type: 'bone' },
  { relX: 10, relY: -52, rot: 0.2, type: 'heart' },
  { relX: 42, relY: -49, rot: -0.2, type: 'star' },

  // Layer 3 (51 to 75 treats: Mid-high pile level)
  { relX: -35, relY: -65, rot: -0.3, type: 'heart' },
  { relX: -5, relY: -68, rot: 0.1, type: 'bone' },
  { relX: 28, relY: -66, rot: -0.5, type: 'biscuit' },

  // Layer 4 (76 to 100+ treats: Top rim brim level)
  { relX: -22, relY: -82, rot: 0.4, type: 'star' },
  { relX: 5, relY: -84, rot: -0.2, type: 'heart' },
  { relX: 25, relY: -80, rot: 0.3, type: 'bone' }
];

window.addEventListener('onWidgetLoad', function(obj) {
  const fields = (obj && obj.detail && obj.detail.fieldData) ? obj.detail.fieldData : {};
  
  treatType = fields.treatType || "mixed";
  gravity = (parseInt(fields.gravityPower) || 35) / 100;
  
  const scaleVal = fields.widgetScale !== undefined ? parseInt(fields.widgetScale) : 100;
  widgetScale = (scaleVal || 100) / 100;
  
  // Set custom CSS variables
  document.documentElement.style.setProperty('--widget-scale', widgetScale);
  if (fields.textColor) {
    document.documentElement.style.setProperty('--text-color', fields.textColor);
  }
  
  const bowlImg = document.getElementById('bowl-img');
  if (bowlImg) {
    const cdnUrl = "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/Dog%20bowl.png";
    const imgTest = new Image();
    imgTest.onload = function() {
      bowlImg.src = cdnUrl;
    };
    imgTest.onerror = function() {
      bowlImg.src = "Dog bowl.png";
    };
    imgTest.src = cdnUrl;
  }
  
  initPhysics();
});

window.addEventListener('onEventReceived', function(obj) {
  if (!obj || !obj.detail) return;
  const listener = obj.detail.listener;
  const event = obj.detail.event;
  
  if (listener === 'follower-latest') {
    spawnTreats(1);
  } else if (listener === 'subscriber-latest') {
    const amount = (event && event.amount) ? parseInt(event.amount) : 10;
    spawnTreats(amount);
  } else if (listener === 'cheer-latest') {
    spawnTreats(5);
  } else if (listener === 'tip-latest') {
    spawnTreats(5);
  } else if (listener === 'simulate-reset') {
    resetBowl();
  }
});

function initPhysics() {
  canvas = document.getElementById('physics-canvas');
  if (!canvas) return;
  
  ctx = canvas.getContext('2d');
  resizeCanvas();
  
  window.addEventListener('resize', resizeCanvas);
  
  if (!animFrameId) {
    physicsLoop();
  }
}

function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Resets/Empties the bowl
function resetBowl() {
  particles = [];
  totalCount = 0;
  updateCounterDisplay();
}

function updateCounterDisplay() {
  const numEl = document.getElementById('treat-count-number');
  if (numEl) {
    numEl.textContent = totalCount;
  }
}

// Spawns treats falling from top towards the bowl
function spawnTreats(count) {
  const centerX = canvas.width / 2;
  const baseRadius = 12 * widgetScale;
  
  for (let i = 0; i < count; i++) {
    // Choose treat design type
    let design = treatType;
    if (treatType === "mixed") {
      const types = ["bone", "biscuit", "star", "heart"];
      design = types[Math.floor(Math.random() * types.length)];
    }
    
    // Spawn centered above bowl with slight horizontal scatter and vertical delay
    particles.push({
      x: centerX + (Math.random() * (100 * widgetScale) - (50 * widgetScale)),
      y: -30 - (i * 28 * widgetScale),
      vx: (Math.random() * 2 - 1) * widgetScale,
      vy: (Math.random() * 2 + 3) * widgetScale,
      radius: baseRadius,
      angle: Math.random() * Math.PI * 2,
      angularVelocity: Math.random() * 0.1 - 0.05,
      type: design
    });
  }
}

function triggerBowlPop() {
  const bowlContainer = document.getElementById('foreground-bowl-container');
  if (bowlContainer) {
    bowlContainer.classList.remove('pop-alert');
    void bowlContainer.offsetWidth; // Trigger reflow
    bowlContainer.classList.add('pop-alert');
  }
}

// Animation & update loop
function physicsLoop() {
  updatePhysics();
  drawPhysics();
  animFrameId = requestAnimationFrame(physicsLoop);
}

function updatePhysics() {
  const centerX = canvas.width / 2;
  // Exact Y level of the treat counter number text in foreground
  const countTextY = canvas.height - 24 - (60 * widgetScale);
  
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    p.vy += gravity * widgetScale;
    p.x += p.vx;
    p.y += p.vy;
    p.angle += p.angularVelocity;
    
    // When snack hits the treat count text in the foreground, pop the number and vanish immediately
    if (p.y >= countTextY) {
      totalCount++;
      updateCounterDisplay();
      triggerBowlPop();
      
      particles.splice(i, 1);
      i--;
    }
  }
}

function drawRestingPile() {
  if (totalCount <= 0) return;
  
  const centerX = canvas.width / 2;
  const bowlBaseY = canvas.height - 24;
  
  // Progressively show more resting treats in the bowl per 25 treats milestone
  // 1-25 treats: fills Layer 1 (1-5 treats)
  // 26-50 treats: fills Layer 2 (6-9 treats)
  // 51-75 treats: fills Layer 3 (10-12 treats)
  // 76-100+ treats: fills Layer 4 (13-15 treats - full brim!)
  const visibleCount = Math.min(RESTING_PILES.length, Math.ceil(totalCount / 6.6));
  
  for (let i = 0; i < visibleCount; i++) {
    const item = RESTING_PILES[i];
    
    // Default or user-selected treat design
    let design = item.type;
    if (treatType !== "mixed") {
      design = treatType;
    }
    
    const p = {
      x: centerX + (item.relX * widgetScale),
      y: bowlBaseY + (item.relY * widgetScale),
      angle: item.rot,
      radius: 11 * widgetScale,
      type: design,
      scale: 1.0
    };
    
    ctx.save();
    ctx.globalAlpha = 0.95;
    if (p.type === "bone") drawBone(p);
    else if (p.type === "biscuit") drawBiscuit(p);
    else if (p.type === "star") drawStar(p);
    else if (p.type === "heart") drawHeart(p);
    ctx.restore();
  }
}

function drawPhysics() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 1. Render the accumulated resting treat pile inside the bowl
  drawRestingPile();
  
  // 2. Render active falling treats in foreground
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    ctx.save();
    ctx.globalAlpha = 1.0;
    
    if (p.type === "bone") {
      drawBone(p);
    } else if (p.type === "biscuit") {
      drawBiscuit(p);
    } else if (p.type === "star") {
      drawStar(p);
    } else if (p.type === "heart") {
      drawHeart(p);
    }
    
    ctx.restore();
  }
}

// Drawing primitives scaled to widgetScale
function drawBone(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  const s = (p.scale || 1) * (p.radius / 12);
  ctx.scale(s, s);
  
  ctx.fillStyle = "#fffbf2";
  ctx.strokeStyle = "#8d5b4c";
  ctx.lineWidth = 1.5;
  
  ctx.fillRect(-10, -3, 20, 6);
  ctx.strokeRect(-10, -3, 20, 6);
  
  ctx.beginPath();
  ctx.arc(-10, -3, 4, 0, Math.PI * 2);
  ctx.arc(-10, 3, 4, 0, Math.PI * 2);
  ctx.arc(10, -3, 4, 0, Math.PI * 2);
  ctx.arc(10, 3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();
}

function drawBiscuit(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  const s = (p.scale || 1) * (p.radius / 12);
  ctx.scale(s, s);
  
  ctx.fillStyle = "#cbb29b";
  ctx.strokeStyle = "#7e624c";
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.fillStyle = "#5c4033";
  ctx.beginPath();
  ctx.arc(-4, -3, 1.5, 0, Math.PI * 2);
  ctx.arc(4, -1, 1.5, 0, Math.PI * 2);
  ctx.arc(-1, 4, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawStar(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  const s = (p.scale || 1) * (p.radius / 12);
  ctx.scale(s, s);
  
  ctx.fillStyle = "#f5d142";
  ctx.strokeStyle = "#c29f1b";
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 12, Math.sin((18 + i * 72) * Math.PI / 180) * 12);
    ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 5.5, Math.sin((54 + i * 72) * Math.PI / 180) * 5.5);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();
}

function drawHeart(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  const s = (p.scale || 1) * (p.radius / 12);
  ctx.scale(s, s);
  
  ctx.fillStyle = "#ff6b8b";
  ctx.strokeStyle = "#d43d60";
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.bezierCurveTo(-5, -8, -10, -3, -10, 2);
  ctx.bezierCurveTo(-10, 7, -3, 10, 0, 13);
  ctx.bezierCurveTo(3, 10, 10, 7, 10, 2);
  ctx.bezierCurveTo(10, -3, 5, -8, 0, -3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();
}
