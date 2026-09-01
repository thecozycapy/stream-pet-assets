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
    val = val.replace(/[^0-9]/g, '');
  }
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
}

// Safely extract numeric count from any StreamElements session metric structure
function getMetricCount(session, keys) {
  if (!session) return null;
  for (const key of keys) {
    if (session[key] !== undefined && session[key] !== null) {
      const val = session[key];
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const p = parseCleanNumber(val, null);
        if (p !== null) return p;
      }
      if (typeof val === 'object') {
        if (val.count !== undefined) return parseCleanNumber(val.count, null);
        if (val.amount !== undefined) return parseCleanNumber(val.amount, null);
      }
    }
  }
  return null;
}

function resolveFollowerCount(sessionObj, trackType, fallbackCount) {
  if (!sessionObj) return fallbackCount;
  
  // Unpack session.data or session
  const session = (sessionObj && sessionObj.data) ? { ...sessionObj, ...sessionObj.data } : sessionObj;
  let count = null;
  
  if (trackType === 'total') {
    count = getMetricCount(session, ['follower-total', 'follower_total', 'followers-total', 'follower-all-time', 'total-followers']);
  } else if (trackType === 'week') {
    count = getMetricCount(session, ['follower-week', 'follower_week', 'followers-week', 'follower-7days', 'follower-week-count']);
  } else if (trackType === 'month') {
    count = getMetricCount(session, ['follower-month', 'follower_month', 'followers-month', 'follower-30days', 'follower-month-count']);
  } else if (trackType === 'session') {
    count = getMetricCount(session, ['follower-session', 'follower_session', 'followers-session']);
  }
  
  return (count !== null && !isNaN(count)) ? count : fallbackCount;
}

window.addEventListener('onWidgetLoad', function(obj) {
  const fields = (obj && obj.detail && obj.detail.fieldData) ? obj.detail.fieldData : {};
  const session = (obj && obj.detail && obj.detail.session) ? obj.detail.session : {};
  
  goalTitle = fields.goalTitle || "Follower Goal";
  goalTarget = parseCleanNumber(fields.goalTarget, 100);
  followerTrackType = fields.followerTrackType || "session";
  const manualCount = parseCleanNumber(fields.currentCount, 0);
  
  // If user triggered manual reset in fields settings
  if (fields.resetGoal === "yes" || fields.resetGoal === "reset") {
    currentCount = 0;
  } 
  // Otherwise resolve from StreamElements session metrics if requested
  else if (followerTrackType !== 'session') {
    currentCount = resolveFollowerCount(session, followerTrackType, manualCount);
  } else {
    currentCount = manualCount;
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
  
  // 1. StreamElements Field Button Click ("Reset Follower Goal" button)
  if (listener === 'widget-button') {
    if (event && (event.field === 'resetGoal' || event.name === 'resetGoal' || event.value === 'reset')) {
      currentCount = 0;
      updateGoalUI();
      return;
    }
  }
  
  let isFollow = false;
  
  // 2. Native StreamElements follow event
  if (listener === 'follower-latest') {
    isFollow = true;
  }
  // 3. StreamElements Goal integration event
  else if (listener === 'follower-goal') {
    if (event && event.amount !== undefined) {
      currentCount = parseCleanNumber(event.amount, currentCount + 1);
      updateGoalUI();
      return;
    }
    isFollow = true;
  }
  // 4. StreamElements Emulate/Test event
  else if (listener === 'event:test') {
    if (event && (event.listener === 'follower-latest' || event.type === 'follower' || event.name)) {
      isFollow = true;
    }
  }
  // 5. Custom Simulator test triggers
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
  // 6. Fallback check for event payload type
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
  if (!obj || !obj.detail) return;
  const session = (obj.detail.session && obj.detail.session.data) 
    ? obj.detail.session.data 
    : (obj.detail.session || {});
  
  if (followerTrackType !== 'session') {
    const updatedCount = resolveFollowerCount(session, followerTrackType, null);
    if (updatedCount !== null) {
      currentCount = updatedCount;
      updateGoalUI();
    }
  }
});

function updateGoalUI() {
  if (currentCount < 0) currentCount = 0;
  // Allows count to exceed goalTarget so over-goal followers (e.g. 115 / 100) are shown
  
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
  
  // Progress fill and dog runner position cap visually at 100% so they stay in track
  const visualFillPercent = Math.min(percentageRounded, 100);
  const fill = document.getElementById('progress-bar-fill');
  const dog = document.getElementById('doggo-runner');
  const bone = document.getElementById('target-bone');
  
  if (fill) fill.style.width = `${visualFillPercent}%`;
  if (dog) dog.style.left = `calc(${visualFillPercent}% - 16px)`;
  
  // If goal reached (100% or greater), activate celebration animations
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
