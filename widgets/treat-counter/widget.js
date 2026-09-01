// Physics-Based Dog Bowl Treat Counter Logic
let bowlColor = "#e5a93b";
let treatType = "mixed"; // mixed, bones, biscuits, hearts, stars
let maxTreats = 50;
let gravity = 0.35;
let bounciness = 0.55;

let canvas, ctx;
let particles = [];
let totalCount = 0;

// Physics loop request ID
let animFrameId = null;

window.addEventListener('onWidgetLoad', function(obj) {
  const fields = obj.detail.fieldData;
  if (!fields) return;
  
  bowlColor = fields.bgColor || fields.bowlColor || "#e5a93b";
  treatType = fields.treatType || "mixed";
  maxTreats = parseInt(fields.maxTreats) || 50;
  gravity = (parseInt(fields.gravityPower) || 35) / 100;
  bounciness = (parseInt(fields.bounciness) || 55) / 100;
  
  // Set custom CSS variables
  document.documentElement.style.setProperty('--bowl-color', bowlColor);
  
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

// Spawns multiple treats falling from the top
function spawnTreats(count) {
  // Trigger bowl pop animation
  const bowlContainer = document.getElementById('foreground-bowl-container');
  if (bowlContainer) {
    bowlContainer.classList.remove('pop-alert');
    void bowlContainer.offsetWidth; // Trigger reflow
    bowlContainer.classList.add('pop-alert');
  }

  const centerX = canvas.width / 2;
  
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
    
    // Spawn centered above the bowl with random scatter
    particles.push({
      x: centerX + (Math.random() * 80 - 40),
      y: -20 - (i * 25), // stagger spawn heights if multi-spawning
      vx: Math.random() * 4 - 2,
      vy: Math.random() * 2 + 1,
      radius: 12,
      angle: Math.random() * Math.PI * 2,
      angularVelocity: Math.random() * 0.1 - 0.05,
      type: design
    });
    
    totalCount++;
  }
  
  updateCounterDisplay();
}

// Rigid boundary and circle-circle collision solver
function physicsLoop() {
  updatePhysics();
  drawPhysics();
  animFrameId = requestAnimationFrame(physicsLoop);
}

function updatePhysics() {
  const centerX = canvas.width / 2;
  const bowlY = canvas.height - 28;
  
  // Floor boundaries of the bowl
  const bowlFloorLeft = centerX - 85;
  const bowlFloorRight = centerX + 85;
  
  // Wall boundaries: slanted lines representing the sides of the bowl
  // Left wall: from (centerX-85, bowlY) to (centerX-120, bowlY-55)
  // Right wall: from (centerX+85, bowlY) to (centerX+120, bowlY-55)

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    
    // Apply gravity
    p.vy += gravity;
    p.vy *= 0.99; // slight damping/drag
    p.vx *= 0.99;
    
    // Update coordinates
    p.x += p.vx;
    p.y += p.vy;
    p.angle += p.angularVelocity;
    
    // 1. Collide with screen bottom boundary (for treats that miss the bowl entirely)
    const floorLimit = canvas.height - p.radius;
    if (p.y > floorLimit) {
      p.y = floorLimit;
      p.vy = -p.vy * bounciness;
      p.vx *= 0.8; // ground friction
      p.angularVelocity *= 0.8;
    }
    
    // Collide with screen walls (left/right)
    if (p.x < p.radius) {
      p.x = p.radius;
      p.vx = -p.vx * bounciness;
    } else if (p.x > canvas.width - p.radius) {
      p.x = canvas.width - p.radius;
      p.vx = -p.vx * bounciness;
    }
    
    // 2. Collide with Bowl Interior Cup Boundaries
    // Floor of the bowl
    if (p.y > bowlY - p.radius && p.x > bowlFloorLeft && p.x < bowlFloorRight) {
      p.y = bowlY - p.radius;
      p.vy = -p.vy * bounciness;
      p.vx *= 0.8;
      p.angularVelocity *= 0.8;
    }
    
    // Left slanted wall of the bowl
    // We compute simple line boundary intersection
    // Slanted line from (centerX-120, bowlY-55) to (centerX-85, bowlY)
    const x1 = centerX - 120;
    const y1 = bowlY - 55;
    const x2 = centerX - 85;
    const y2 = bowlY;
    
    // Simple box check first
    if (p.y > y1 - p.radius && p.y < y2 && p.x > x1 - p.radius && p.x < x2 + p.radius) {
      // Distance from circle center to slanted line
      const lineLen = Math.hypot(x2 - x1, y2 - y1);
      const nx = -(y2 - y1) / lineLen; // normal
      const ny = (x2 - x1) / lineLen;
      
      // Projection of vector from point 1 to ball center onto normal
      const dot = (p.x - x1) * nx + (p.y - y1) * ny;
      if (dot < p.radius) {
        // Collide and bounce off slanted left wall
        p.x += nx * (p.radius - dot);
        p.y += ny * (p.radius - dot);
        
        // Reflect velocity
        const vDot = p.vx * nx + p.vy * ny;
        p.vx -= 2 * vDot * nx * bounciness;
        p.vy -= 2 * vDot * ny * bounciness;
      }
    }
    
    // Right slanted wall of the bowl
    // Slanted line from (centerX+120, bowlY-55) to (centerX+85, bowlY)
    const rx1 = centerX + 120;
    const ry1 = bowlY - 55;
    const rx2 = centerX + 85;
    const ry2 = bowlY;
    
    if (p.y > ry1 - p.radius && p.y < ry2 && p.x > ry2 - p.radius && p.x < rx1 + p.radius) {
      const lineLen = Math.hypot(rx2 - rx1, ry2 - ry1);
      const rnx = (ry2 - ry1) / lineLen; // normal
      const rny = -(rx2 - rx1) / lineLen;
      
      const dot = (p.x - rx1) * rnx + (p.y - ry1) * rny;
      if (dot < p.radius) {
        // Collide and bounce off slanted right wall
        p.x += rnx * (p.radius - dot);
        p.y += rny * (p.radius - dot);
        
        const vDot = p.vx * rnx + p.vy * rny;
        p.vx -= 2 * vDot * rnx * bounciness;
        p.vy -= 2 * vDot * rny * bounciness;
      }
    }
  }
  
  // 3. Resolve Particle-to-Particle stack collisions
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      let p1 = particles[i];
      let p2 = particles[j];
      
      let dx = p2.x - p1.x;
      let dy = p2.y - p1.y;
      let dist = Math.hypot(dx, dy);
      let minDist = p1.radius + p2.radius;
      
      if (dist < minDist) {
        if (dist === 0) continue; // avoid division by zero
        
        // Push apart
        let overlap = minDist - dist;
        let nx = dx / dist;
        let ny = dy / dist;
        
        // Equal displacement
        p1.x -= nx * overlap * 0.5;
        p1.y -= ny * overlap * 0.5;
        p2.x += nx * overlap * 0.5;
        p2.y += ny * overlap * 0.5;
        
        // Elastic impulse bounce
        let kx = p1.vx - p2.vx;
        let ky = p1.vy - p2.vy;
        let pVal = 2 * (nx * kx + ny * ky) / 2; // mass = 1
        
        p1.vx -= nx * pVal * bounciness;
        p1.vy -= ny * pVal * bounciness;
        p2.vx += nx * pVal * bounciness;
        p2.vy += ny * pVal * bounciness;
        
        // Slightly transfer angular rotations on bump
        const temp = p1.angularVelocity;
        p1.angularVelocity = p2.angularVelocity * 0.5;
        p2.angularVelocity = temp * 0.5;
      }
    }
  }
}

function drawPhysics() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Render treats
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

// Drawing primitives for cartoon treats
function drawBone(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.angle);
  
  ctx.fillStyle = "#fffbf2";
  ctx.strokeStyle = "#8d5b4c";
  ctx.lineWidth = 1.5;
  
  // Center shaft
  ctx.fillRect(-10, -3, 20, 6);
  ctx.strokeRect(-10, -3, 20, 6);
  
  // End joints
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
  
  // Chocolate chips
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
