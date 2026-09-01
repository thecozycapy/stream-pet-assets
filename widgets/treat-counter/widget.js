// Dog Bowl Treat Counter Logic
let treatType = "mixed"; // mixed, bones, biscuits, hearts, stars
let gravity = 0.35;
let widgetScale = 1.0;

let canvas, ctx;
let particles = [];
let totalCount = 0;

// Animation loop request ID
let animFrameId = null;

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
  // Opening rim line of Dog bowl.png
  const bowlTargetY = canvas.height - 24 - (65 * widgetScale);
  
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    if (p.state === "falling") {
      p.vy += gravity * widgetScale;
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.angularVelocity;
      
      // When snack hits the bowl opening level
      if (p.y >= bowlTargetY) {
        p.state = "disappearing";
        totalCount++;
        updateCounterDisplay();
        triggerBowlPop();
      }
    } else if (p.state === "disappearing") {
      p.y += p.vy * 0.4;
      p.alpha -= 0.14;
      p.scale *= 0.82;
      
      // Once fully vanished, remove from particles array
      if (p.alpha <= 0 || p.scale <= 0.1) {
        particles.splice(i, 1);
        i--;
      }
    }
  }
}

function drawPhysics() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Render active falling & fading treats
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

// Drawing primitives scaled to widgetScale and particle fade scale
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
