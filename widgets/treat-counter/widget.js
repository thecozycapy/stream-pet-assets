// Dog Bowl Treat Counter Logic
let treatType = "mixed"; // mixed, bones, biscuits, hearts, stars
let gravity = 0.35;
let widgetScale = 1.0;
let treatGoal = 100;
let startingTreats = 0;
let autoResetSession = "yes";
let isFirstLoad = true;

let followerTreats = 1;
let subTreats = 10;
let cheerTreats = 5;
let tipTreats = 5;

let canvas, ctx;
let particles = [];
let totalCount = 0;

// Animation loop request ID
let animFrameId = null;

window.addEventListener('onWidgetLoad', function(obj) {
  const fields = (obj && obj.detail && obj.detail.fieldData) ? obj.detail.fieldData : {};
  
  treatType = fields.treatType || "mixed";
  gravity = (parseInt(fields.gravityPower) || 35) / 100;
  treatGoal = parseInt(fields.treatGoal) || 100;
  startingTreats = fields.startingTreats !== undefined ? parseInt(fields.startingTreats) : 0;
  autoResetSession = fields.autoResetSession || "yes";
  
  followerTreats = fields.followerTreats !== undefined ? parseInt(fields.followerTreats) : 1;
  subTreats = fields.subTreats !== undefined ? parseInt(fields.subTreats) : 5;
  cheerTreats = fields.cheerTreats !== undefined ? parseInt(fields.cheerTreats) : 5;
  tipTreats = fields.tipTreats !== undefined ? parseInt(fields.tipTreats) : 5;
  
  const scaleVal = fields.widgetScale !== undefined ? parseInt(fields.widgetScale) : 100;
  widgetScale = (scaleVal || 100) / 100;
  
  // Initialize starting treat count on initial session load
  if (isFirstLoad) {
    if (autoResetSession === "yes") {
      totalCount = startingTreats;
    } else {
      totalCount = Math.max(totalCount, startingTreats);
    }
    isFirstLoad = false;
  }
  
  // Set custom CSS variables
  document.documentElement.style.setProperty('--widget-scale', widgetScale);
  if (fields.textColor) {
    document.documentElement.style.setProperty('--text-color', fields.textColor);
  }
  
  // Preserve current count and update bowl image & display on setting changes
  updateBowlImage();
  updateCounterDisplay();
  initPhysics();
});

window.addEventListener('onEventReceived', function(obj) {
  if (!obj || !obj.detail) return;
  const listener = obj.detail.listener;
  const event = obj.detail.event;
  const fieldData = obj.detail.fieldData || {};
  
  // Read reward variables dynamically if updated
  if (fieldData.followerTreats !== undefined) followerTreats = parseInt(fieldData.followerTreats);
  if (fieldData.subTreats !== undefined) subTreats = parseInt(fieldData.subTreats);
  if (fieldData.cheerTreats !== undefined) cheerTreats = parseInt(fieldData.cheerTreats);
  if (fieldData.tipTreats !== undefined) tipTreats = parseInt(fieldData.tipTreats);
  
  // Reset button trigger handler
  if (listener === 'widget-button' || listener === 'simulate-reset' || (event && (event.field === 'resetBowl' || event.name === 'resetBowl'))) {
    resetBowl();
    return;
  }
  
  if (listener === 'follower-latest') {
    spawnTreats(followerTreats);
  } else if (listener === 'subscriber-latest') {
    spawnTreats(subTreats);
  } else if (listener === 'cheer-latest') {
    const bits = (event && event.amount) ? parseInt(event.amount) : 100;
    const mult = Math.max(1, Math.floor(bits / 100));
    spawnTreats(mult * cheerTreats);
  } else if (listener === 'tip-latest') {
    const tipAmt = (event && event.amount) ? parseFloat(event.amount) : 1;
    const mult = Math.max(1, Math.floor(tipAmt));
    spawnTreats(mult * tipTreats);
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
  totalCount = startingTreats;
  updateCounterDisplay();
}

function updateCounterDisplay() {
  const numEl = document.getElementById('treat-count-number');
  if (numEl) {
    numEl.textContent = totalCount;
  }
  updateBowlImage();
}

// Dynamic bowl image progression based on % of treat goal reached
function updateBowlImage() {
  const bowlImg = document.getElementById('bowl-img');
  if (!bowlImg) return;
  
  const percentage = treatGoal > 0 ? (totalCount / treatGoal) * 100 : 0;
  let targetImageName = "Dog bowl.png";
  let targetCdnName = "Dog%20bowl.png";
  
  if (percentage >= 100) {
    targetImageName = "bowl 100.png";
    targetCdnName = "bowl%20100.png";
  } else if (percentage >= 75) {
    targetImageName = "bowl 75.png";
    targetCdnName = "bowl%2075.png";
  } else if (percentage >= 50) {
    targetImageName = "bowl 50.png";
    targetCdnName = "bowl%2050.png";
  } else if (percentage >= 25) {
    targetImageName = "bowl 25.png";
    targetCdnName = "bowl%2025.png";
  }
  
  // Resilient multi-source fallback sequence:
  // 1. Local path relative to portfolio web server: widgets/treat-counter/bowl 25.png
  // 2. Direct local root/relative path: bowl 25.png
  // 3. CDN root URL: https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/bowl%2025.png
  // 4. CDN widgets subfolder URL: https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/widgets/treat-counter/bowl%2025.png
  const sources = [
    `widgets/treat-counter/${encodeURIComponent(targetImageName)}`,
    targetImageName,
    `https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/${targetCdnName}`,
    `https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/widgets/treat-counter/${targetCdnName}`
  ];

  let currentSourceIndex = 0;
  function tryNextSource() {
    if (currentSourceIndex >= sources.length) return;
    const src = sources[currentSourceIndex++];
    const testImg = new Image();
    testImg.onload = function() {
      bowlImg.src = src;
    };
    testImg.onerror = function() {
      tryNextSource();
    };
    testImg.src = src;
  }

  tryNextSource();
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
      type: design,
      state: "falling",
      alpha: 1.0,
      scale: 1.0
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

function drawPhysics() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Render active falling treats
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
    
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
  const s = p.scale * (p.radius / 12);
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
  const s = p.scale * (p.radius / 12);
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
  const s = p.scale * (p.radius / 12);
  ctx.scale(s, s);
  
  ctx.fillStyle = "#f5d142";
  ctx.strokeStyle = "#c29f1b";
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 12, Math.sin((18 + i * 72) * Math.PI / 180) * 12);
    ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 5.5, Math.sin((54 + i * 72) * Math.PI / 180) * (5.5));
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
  const s = p.scale * (p.radius / 12);
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
