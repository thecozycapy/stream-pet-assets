// Dog Bowl Treat Counter Logic
let treatType = "mixed"; // mixed, bone, biscuit, heart, star
let maxTreats = 50;
let gravity = 0.35;
let bounciness = 0.55;
let widgetScale = 1.0;

let canvas, ctx;
let particles = [];
let totalCount = 0;

// Physics loop request ID
let animFrameId = null;

window.addEventListener('onWidgetLoad', function(obj) {
  const fields = (obj && obj.detail && obj.detail.fieldData) ? obj.detail.fieldData : {};
  
  treatType = fields.treatType || "mixed";
  maxTreats = parseInt(fields.maxTreats) || 50;
  gravity = (parseInt(fields.gravityPower) || 35) / 100;
  bounciness = (parseInt(fields.bounciness) || 55) / 100;
  widgetScale = (parseInt(fields.widgetScale) || 100) / 100;
  
  // Set custom CSS variables
  document.documentElement.style.setProperty('--widget-scale', widgetScale);
  
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
  
  // Start loop if not running
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

// Spawns multiple treats falling from the top directly into the bowl
function spawnTreats(count) {
  // Trigger bowl pop animation
  const bowlContainer = document.getElementById('foreground-bowl-container');
  if (bowlContainer) {
    bowlContainer.classList.remove('pop-alert');
    void bowlContainer.offsetWidth; // Trigger reflow
    bowlContainer.classList.add('pop-alert');
  }

  const centerX = canvas ? (canvas.width / 2) : (window.innerWidth / 2);
  
  for (let i = 0; i < count; i++) {
    if (particles.length >= maxTreats) {
      // Prune oldest particle to avoid overflow lag
      particles.shift();
    }
    
    // Choose treat design type
    let design = treatType;
    if (treatType === "mixed") {
      const types = ["bone", "biscuit", "star", "heart"];
      design = types[Math.floor(Math.random() * types.length)];
    }
    
    // Spawn centered above the bowl with random scatter so they drop INTO the bowl
    particles.push({
      x: centerX + (Math.random() * 60 - 30),
      y: -20 - (i * 25), // stagger spawn heights if multi-spawning
      vx: Math.random() * 3 - 1.5,
      vy: Math.random() * 2 + 1,
      radius: 11,
      angle: Math.random() * Math.PI * 2,
      angularVelocity: Math.random() * 0.1 - 0.05,
      type: design
    });
    
    totalCount++;
  }
  
  updateCounterDisplay();
}

// Rigid boundary and circle-circle collision solver for Dog Bowl
function physicsLoop() {
  updatePhysics();
  drawPhysics();
  animFrameId = requestAnimationFrame(physicsLoop);
}

function updatePhysics() {
  if (!canvas) return;
  
  const centerX = canvas.width / 2;
  const bowlY = canvas.height - 45;
  
  // Floor boundaries of the dog bowl opening
  const bowlFloorLeft = centerX - 75;
  const bowlFloorRight = centerX + 75;
  
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    // Apply gravity
    p.vy += gravity;
    p.vy *= 0.99; // drag
    p.vx *= 0.99;
    
    // Update coordinates
    p.x += p.vx;
    p.y += p.vy;
    p.angle += p.angularVelocity;
    
    // 1. Collide with Bowl Interior Floor
    if (p.y > bowlY - p.radius && p.x > bowlFloorLeft && p.x < bowlFloorRight) {
      p.y = bowlY - p.radius;
      p.vy = -p.vy * bounciness;
      p.vx *= 0.8;
      p.angularVelocity *= 0.8;
    }
    
    // 2. Collide with Slanted Left Wall of the Dog Bowl
    const lx1 = centerX - 115;
    const ly1 = bowlY - 60;
    const lx2 = centerX - 75;
    const ly2 = bowlY;
    
    if (p.y > ly1 - p.radius && p.y < ly2 && p.x > lx1 - p.radius && p.x < lx2 + p.radius) {
      const lineLen = Math.hypot(lx2 - lx1, ly2 - ly1);
      const nx = -(ly2 - ly1) / lineLen;
      const ny = (lx2 - lx1) / lineLen;
      const dot = (p.x - lx1) * nx + (p.y - ly1) * ny;
      if (dot < p.radius) {
        p.x += nx * (p.radius - dot);
        p.y += ny * (p.radius - dot);
        const vDot = p.vx * nx + p.vy * ny;
        p.vx -= 2 * vDot * nx * bounciness;
        p.vy -= 2 * vDot * ny * bounciness;
      }
    }
    
    // 3. Collide with Slanted Right Wall of the Dog Bowl
    const rx1 = centerX + 115;
    const ry1 = bowlY - 60;
    const rx2 = centerX + 75;
    const ry2 = bowlY;
    
    if (p.y > ry1 - p.radius && p.y < ry2 && p.x > rx2 - p.radius && p.x < rx1 + p.radius) {
      const lineLen = Math.hypot(rx2 - rx1, ry2 - ry1);
      const rnx = (ry2 - ry1) / lineLen;
      const rny = -(rx2 - rx1) / lineLen;
      const dot = (p.x - rx1) * rnx + (p.y - ry1) * rny;
      if (dot < p.radius) {
        p.x += rnx * (p.radius - dot);
        p.y += rny * (p.radius - dot);
        const vDot = p.vx * rnx + p.vy * rny;
        p.vx -= 2 * vDot * rnx * bounciness;
        p.vy -= 2 * vDot * rny * bounciness;
      }
    }
    
    // 4. Fallback screen bottom collision
    const floorLimit = canvas.height - p.radius;
    if (p.y > floorLimit) {
      p.y = floorLimit;
      p.vy = -p.vy * bounciness;
      p.vx *= 0.8;
      p.angularVelocity *= 0.8;
    }
    
    // Screen side boundaries
    if (p.x < p.radius) {
      p.x = p.radius;
      p.vx = -p.vx * bounciness;
    } else if (p.x > canvas.width - p.radius) {
      p.x = canvas.width - p.radius;
      p.vx = -p.vx * bounciness;
    }
  }
  
  // 5. Resolve Particle-to-Particle collisions inside the bowl
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      let p1 = particles[i];
      let p2 = particles[j];
      
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let dist = Math.hypot(dx, dy);
      let minDist = p1.radius + p2.radius;
      
      if (dist < minDist) {
        if (dist === 0) continue;
        
        let overlap = minDist - dist;
        let nx = dx / dist;
        let ny = dy / dist;
        
        p1.x -= nx * overlap * 0.5;
        p1.y -= ny * overlap * 0.5;
        p2.x += nx * overlap * 0.5;
        p2.y += ny * overlap * 0.5;
        
        let kx = p1.vx - p2.vx;
        let ky = p1.vy - p2.vy;
        let pVal = 2 * (nx * kx + ny * ky) / 2;
        
        p1.vx -= nx * pVal * bounciness;
        p1.vy -= ny * pVal * bounciness;
        p2.vx += nx * pVal * bounciness;
        p2.vy += ny * pVal * bounciness;
        
        const temp = p1.angularVelocity;
        p1.angularVelocity = p2.angularVelocity * 0.5;
        p2.angularVelocity = temp * 0.5;
      }
    }
  }
}

function drawPhysics() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    if (p.type === "bone") {
      drawBone(p);
    } else if (p.type === "biscuit") {
      drawBiscuit(p);
    } else if (p.type === "star") {
      drawStar(p);
    } else if (p.type === "heart") {
      drawHeart(p);
    }
  }
}

function drawBone(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  
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
  
  ctx.fillStyle = "#cbb29b";
  ctx.strokeStyle = "#7e624c";
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
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
  
  ctx.fillStyle = "#f5d142";
  ctx.strokeStyle = "#c29f1b";
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * p.radius, Math.sin((18 + i * 72) * Math.PI / 180) * p.radius);
    ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (p.radius / 2.2), Math.sin((54 + i * 72) * Math.PI / 180) * (p.radius / 2.2));
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
