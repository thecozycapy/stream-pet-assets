// Fetch the Bone Goal Logic
let goalTitle = "Treat Goal";
let goalTarget = 100;
let currentCount = 0;
let dogImage = "Dog.png";

window.addEventListener('onWidgetLoad', function(obj) {
  const fields = obj.detail.fieldData;
  if (!fields) return;
  
  goalTitle = fields.goalTitle || "Treat Goal";
  goalTarget = parseInt(fields.goalTarget) || 100;
  currentCount = parseInt(fields.currentCount) || 0;
  dogImage = fields.dogImage || "Dog.png";
  
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
  
  if (listener === 'follower-latest') {
    currentCount++;
    updateGoalUI();
  } else if (listener === 'simulate-increment') {
    const amt = (event && event.amount) ? event.amount : 1;
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
  
  // Update progress texts
  const valuesText = document.getElementById('goal-values');
  const percentText = document.getElementById('goal-percentage');
  if (valuesText) valuesText.textContent = `${currentCount} / ${goalTarget}`;
  
  const percentage = goalTarget > 0 ? (currentCount / goalTarget) : 0;
  const percentageRounded = Math.round(percentage * 100);
  if (percentText) percentText.textContent = `${percentageRounded}%`;
  
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
