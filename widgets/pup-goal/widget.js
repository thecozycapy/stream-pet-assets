// Fetch the Bone Goal Logic
let goalTitle = "Follower Goal";
let goalTarget = 100;
let currentCount = 0;
let followerTrackType = "session";
const DOG_IMAGE_URL = "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/Dog.png";

// Robust number sanitizer to strip dollar signs, currencies, and non-numeric characters
function parseCleanNumber(val, fallback = 0) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : Math.round(val);
  if (typeof val === 'string') {
    // Strip all currency symbols, dollar signs, and letters
    val = val.replace(/[^0-9]/g, '');
  }
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
}

window.addEventListener('onWidgetLoad', function(obj) {
  const fields = (obj && obj.detail && obj.detail.fieldData) ? obj.detail.fieldData : {};
  const session = (obj && obj.detail && obj.detail.session && obj.detail.session.data) ? obj.detail.session.data : {};
  
  goalTitle = fields.goalTitle || "Follower Goal";
  goalTarget = parseCleanNumber(fields.goalTarget, 100);
  followerTrackType = fields.followerTrackType || "session";
  currentCount = parseCleanNumber(fields.currentCount, 0);
  
  // If user triggered manual reset button in fields settings
  if (fields.resetGoal === "reset" || fields.resetGoal === "yes") {
    currentCount = 0;
  } 
  // Otherwise load from StreamElements session metrics if requested
  else if (followerTrackType === 'total' && session['follower-total']) {
    currentCount = parseCleanNumber(session['follower-total'].count, currentCount);
  } else if (followerTrackType === 'week' && session['follower-week']) {
    currentCount = parseCleanNumber(session['follower-week'].count, currentCount);
  } else if (followerTrackType === 'month' && session['follower-month']) {
    currentCount = parseCleanNumber(session['follower-month'].count, currentCount);
  } else if (session['follower-goal'] && session['follower-goal'].amount !== undefined && followerTrackType !== 'session') {
    currentCount = parseCleanNumber(session['follower-goal'].amount, currentCount);
  }
  
  // Set goal title
  const labelEl = document.getElementById('goal-label');
  if (labelEl) labelEl.textContent = goalTitle;
  
  // Set runner dog image source
  const dogImgEl = document.getElementById('doggo-img');
  if (dogImgEl) dogImgEl.src = DOG_IMAGE_URL;
  
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
  
  let isFollow = false;
  
  // 1. Native StreamElements follow event
  if (listener === 'follower-latest') {
    isFollow = true;
  }
  // 2. StreamElements Goal integration event
  else if (listener === 'follower-goal') {
    if (event && event.amount !== undefined) {
      currentCount = parseCleanNumber(event.amount, currentCount + 1);
      updateGoalUI();
      return;
    }
    isFollow = true;
  }
  // 3. StreamElements Emulate/Test event
  else if (listener === 'event:test') {
    if (event && (event.listener === 'follower-latest' || event.type === 'follower' || event.name)) {
      isFollow = true;
    }
  }
  // 4. Custom Simulator test triggers
  else if (listener === 'simulate-increment') {
    const amt = (event && event.amount) ? parseCleanNumber(event.amount, 1) : 1;
    currentCount += amt;
    updateGoalUI();
    return;
  }
  else if (listener === 'simulate-reset') {
    currentCount = 0;
    updateGoalUI();
    return;
  }
  // 5. Fallback check for event payload type
  else if (event && (event.type === 'follower' || event.listener === 'follower-latest')) {
    isFollow = true;
  }
  
  if (isFollow) {
    currentCount++;
    updateGoalUI();
  }
});

// Listen for live session metric updates from StreamElements
window.addEventListener('onSessionUpdate', function(obj) {
  if (!obj || !obj.detail || !obj.detail.session) return;
  const session = obj.detail.session;
  
  if (followerTrackType === 'total' && session['follower-total']) {
    currentCount = parseCleanNumber(session['follower-total'].count, currentCount);
    updateGoalUI();
  } else if (followerTrackType === 'week' && session['follower-week']) {
    currentCount = parseCleanNumber(session['follower-week'].count, currentCount);
    updateGoalUI();
  } else if (followerTrackType === 'month' && session['follower-month']) {
    currentCount = parseCleanNumber(session['follower-month'].count, currentCount);
    updateGoalUI();
  }
});

function updateGoalUI() {
  if (currentCount < 0) currentCount = 0;
  // Progress can exceed 100/100 to show extra followers
  
  // Format pure numbers without any dollar signs or currency symbols
  const cleanCount = parseCleanNumber(currentCount, 0);
  const cleanTarget = parseCleanNumber(goalTarget, 100);
  const valuesText = document.getElementById('goal-values');
  const percentText = document.getElementById('goal-percentage');
  
  if (valuesText) {
    valuesText.textContent = `${cleanCount} / ${cleanTarget}`;
  }
  
  const percentage = cleanTarget > 0 ? (cleanCount / cleanTarget) : 0;
  const percentageRounded = Math.round(percentage * 100);
  if (percentText) {
    percentText.textContent = `${percentageRounded}%`;
  }
  
  // Update Progress fill and Dog position (capped visually at 100% so dog remains next to target bone)
  const visualPercentage = Math.min(percentageRounded, 100);
  const fill = document.getElementById('progress-bar-fill');
  const dog = document.getElementById('doggo-runner');
  const bone = document.getElementById('target-bone');
  
  if (fill) fill.style.width = `${visualPercentage}%`;
  if (dog) dog.style.left = `calc(${visualPercentage}% - 16px)`;
  
  // If goal reached or exceeded, maintain celebration animations
  const container = document.getElementById('goal-widget-container');
  if (cleanCount >= cleanTarget && cleanTarget > 0) {
    if (bone) bone.classList.add('bone-celebrate');
    if (dog) dog.classList.add('dog-celebrate');
    if (container) container.classList.add('goal-celebrate');
  } else {
    if (bone) bone.classList.remove('bone-celebrate');
    if (dog) dog.classList.remove('dog-celebrate');
    if (container) container.classList.remove('goal-celebrate');
  }
}
