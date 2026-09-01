// Fetch the Bone Goal Logic
let goalTitle = "Follower Goal";
let goalTarget = 100;
let currentCount = 0;
let dogImage = "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/Dog.png";

function parseCleanNumber(val, fallback = 0) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : Math.floor(val);
  if (typeof val === 'string') {
    val = val.replace(/[^0-9]/g, '');
    if (val === '') return fallback;
  }
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
}

window.addEventListener('onWidgetLoad', function(obj) {
  const fields = (obj && obj.detail && obj.detail.fieldData) ? obj.detail.fieldData : {};
  
  goalTitle = fields.goalTitle || "Follower Goal";
  goalTarget = parseCleanNumber(fields.goalTarget, 100);
  currentCount = parseCleanNumber(fields.currentCount, 0);
  dogImage = fields.dogImage || "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/Dog.png";
  
  // Check if StreamElements session data has active follower goal data
  if (obj.detail && obj.detail.session && obj.detail.session.data) {
    const seGoal = obj.detail.session.data['follower-goal'] || obj.detail.session.data['follower-latest'];
    if (seGoal) {
      if (seGoal.amount !== undefined && seGoal.amount > 0) {
        currentCount = parseCleanNumber(seGoal.amount, currentCount);
      } else if (seGoal.current !== undefined && seGoal.current > 0) {
        currentCount = parseCleanNumber(seGoal.current, currentCount);
      } else if (seGoal.count !== undefined && seGoal.count > 0) {
        currentCount = parseCleanNumber(seGoal.count, currentCount);
      }
    }
  }
  
  // Set labels
  const labelEl = document.getElementById('goal-label');
  if (labelEl) labelEl.textContent = goalTitle;
  
  // Set dog image
  const dogImgEl = document.getElementById('doggo-img');
  if (dogImgEl) dogImgEl.src = dogImage;
  
  // Bind Colors to CSS Custom Properties
  document.documentElement.style.setProperty('--bar-color', fields.barColor || '#e5a93b');
  document.documentElement.style.setProperty('--bg-color', fields.bgColor || '#201714');
  document.documentElement.style.setProperty('--border-color', fields.borderColor || '#382a24');
  document.documentElement.style.setProperty('--label-color', fields.labelColor || '#d1c3b7');
  document.documentElement.style.setProperty('--values-color', fields.valuesColor || '#ffffff');
  document.documentElement.style.setProperty('--track-color', fields.trackColor || '#2e211d');
  document.documentElement.style.setProperty('--percentage-color', fields.percentageColor || '#e5a93b');
  
  updateGoalUI();
});

window.addEventListener('onEventReceived', function(obj) {
  if (!obj || !obj.detail) return;
  const listener = obj.detail.listener;
  const event = obj.detail.event;
  
  // Handle Follower events
  if (listener === 'follower-latest' || listener === 'follow' || listener === 'follower') {
    currentCount++;
    updateGoalUI();
  } 
  // Handle StreamElements Goal update events
  else if (listener === 'follower-goal' || listener === 'goal' || listener === 'goal-update') {
    if (event) {
      if (event.amount !== undefined && parseCleanNumber(event.amount) > currentCount) {
        currentCount = parseCleanNumber(event.amount, currentCount);
      } else if (event.current !== undefined && parseCleanNumber(event.current) > currentCount) {
        currentCount = parseCleanNumber(event.current, currentCount);
      } else if (event.count !== undefined && parseCleanNumber(event.count) > currentCount) {
        currentCount = parseCleanNumber(event.count, currentCount);
      } else {
        currentCount++;
      }
    } else {
      currentCount++;
    }
    updateGoalUI();
  } 
  // Handle Simulator events
  else if (listener === 'simulate-increment') {
    const amt = (event && event.amount) ? parseCleanNumber(event.amount, 1) : 1;
    currentCount += amt;
    updateGoalUI();
  } else if (listener === 'simulate-reset') {
    currentCount = 0;
    updateGoalUI();
  }
});

function updateGoalUI() {
  if (currentCount < 0) currentCount = 0;
  if (currentCount > goalTarget) currentCount = goalTarget;
  
  // Update progress texts (pure numbers, zero currency signs)
  const valuesText = document.getElementById('goal-values');
  const percentText = document.getElementById('goal-percentage');
  
  const displayCurrent = String(currentCount).replace(/[^0-9]/g, '');
  const displayTarget = String(goalTarget).replace(/[^0-9]/g, '');
  
  if (valuesText) {
    valuesText.textContent = `${displayCurrent} / ${displayTarget}`;
  }
  
  const percentage = goalTarget > 0 ? (currentCount / goalTarget) : 0;
  const percentageRounded = Math.min(100, Math.round(percentage * 100));
  if (percentText) {
    percentText.textContent = `${percentageRounded}%`;
  }
  
  // Update Progress fill and Dog position
  const fill = document.getElementById('progress-bar-fill');
  const dog = document.getElementById('doggo-runner');
  const bone = document.getElementById('target-bone');
  
  if (fill) fill.style.width = `${percentageRounded}%`;
  if (dog) dog.style.left = `calc(${percentageRounded}% - 16px)`;
  
  // If goal reached, start celebration animations
  const container = document.getElementById('goal-widget-container');
  if (percentageRounded >= 100) {
    if (bone) bone.classList.add('bone-celebrate');
    if (dog) dog.classList.add('dog-celebrate');
    if (container) container.classList.add('goal-celebrate');
  } else {
    if (bone) bone.classList.remove('bone-celebrate');
    if (dog) dog.classList.remove('dog-celebrate');
    if (container) container.classList.remove('goal-celebrate');
  }
}
