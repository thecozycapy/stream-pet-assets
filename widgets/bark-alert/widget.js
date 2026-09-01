// Bark Alert Box Logic
let followerText = "{name} gave a belly rub!";
let subscriberText = "{name} adopted a puppy!";
let cheerText = "{name} sent {amount} barks!";
let tipText = "{name} bought {amount} treats!";
let alertTimeout = null;
let previewMode = "always_show";
let showDefaultText = "yes";
let defaultMessage = "Awaiting adoption...";

window.addEventListener('onWidgetLoad', function (obj) {
  const fieldData = obj.detail.fieldData;
  if (!fieldData) return;
  
  followerText = fieldData.followerMessage || "{name} gave a belly rub!";
  subscriberText = fieldData.subMessage || "{name} adopted a puppy!";
  cheerText = fieldData.cheerMessage || "{name} sent {amount} barks!";
  tipText = fieldData.tipMessage || "{name} bought {amount} treats!";
  previewMode = fieldData.previewMode || "always_show";
  showDefaultText = fieldData.showDefaultText || "yes";
  defaultMessage = fieldData.defaultMessage || "Awaiting adoption...";
  
  // Set custom properties
  document.documentElement.style.setProperty('--theme-color', fieldData.themeColor || '#e5a93b');
  document.documentElement.style.setProperty('--accent-color', fieldData.accentColor || '#ff85a2');
  document.documentElement.style.setProperty('--collar-color', fieldData.collarColor || '#ff85a2');
  document.documentElement.style.setProperty('--bone-color', fieldData.boneColor || '#fffbf2');
  document.documentElement.style.setProperty('--text-color', fieldData.textColor || '#2c1b18');
  document.documentElement.style.setProperty('--font-size', (fieldData.fontSize || 12) + 'px');
  document.documentElement.style.setProperty('--duration', (fieldData.alertDuration || 5) + 's');

  // Toggle Visibility of Avatar and Collar (Collar is hidden if Avatar is off)
  const pfp = document.querySelector('.pfp-container');
  const collar = document.querySelector('.collar-wrapper');
  const showAvatar = (fieldData.showAvatar || "yes") === "yes";
  const showCollar = (fieldData.showCollar || "yes") === "yes";
  if (pfp) pfp.style.display = showAvatar ? "block" : "none";
  if (collar) collar.style.display = (showAvatar && showCollar) ? "flex" : "none";

  const container = document.getElementById('alert-container');
  
  // Set Initial Visibility State
  if (!alertTimeout) {
    const textEl = document.getElementById('alert-message-text');
    const pfpImg = document.getElementById('alert-pfp');
    
    const isAlwaysShow = (previewMode === "always_show" || previewMode === "yes");
    
    if (isAlwaysShow) {
      if (textEl) textEl.textContent = (showDefaultText === "yes") ? defaultMessage : "";
      if (pfpImg) pfpImg.src = 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517ad-def8-437d-9a4e-c27c02511a3c-profile_image-70x70.png';
      if (container) container.className = 'alert-visible';
    } else {
      // Hide After Alert mode: completely hidden before and after alerts
      if (textEl) textEl.textContent = "";
      if (container) container.className = 'alert-hidden';
    }
  }
});

window.addEventListener('onEventReceived', function (obj) {
  if (!obj || !obj.detail) return;
  const event = obj.detail.event;
  const listener = obj.detail.listener;
  
  if (!event) return;
  
  let message = "";
  const avatar = event.avatar || 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517ad-def8-437d-9a4e-c27c02511a3c-profile_image-70x70.png';
  
  if (listener === 'follower-latest') {
    message = followerText.replace('{name}', event.name);
  } else if (listener === 'subscriber-latest') {
    message = subscriberText.replace('{name}', event.name);
  } else if (listener === 'cheer-latest') {
    message = cheerText.replace('{name}', event.name).replace('{amount}', event.amount || 0);
  } else if (listener === 'tip-latest') {
    message = tipText.replace('{name}', event.name).replace('{amount}', event.amount || 0);
  } else {
    return;
  }
  
  triggerAlert(message, avatar);
});

function triggerAlert(msg, avatar) {
  const container = document.getElementById('alert-container');
  const msgText = document.getElementById('alert-message-text');
  const pfpImg = document.getElementById('alert-pfp');
  
  if (msgText) msgText.textContent = msg;
  if (pfpImg) pfpImg.src = avatar;
  
  // Trigger entry animation and show
  if (container) container.className = 'alert-visible';
  
  if (alertTimeout) clearTimeout(alertTimeout);
  
  const isAlwaysShow = (previewMode === "always_show" || previewMode === "yes");
  const duration = parseFloat(document.documentElement.style.getPropertyValue('--duration') || '5') * 1000;
  
  if (!isAlwaysShow) {
    // Hide after alert mode: play exit animation, then hide completely
    alertTimeout = setTimeout(() => {
      if (container) container.className = 'alert-exit';
      alertTimeout = null;
      
      setTimeout(() => {
        if (!alertTimeout && !isAlwaysShow) {
          if (container) container.className = 'alert-hidden';
          if (msgText) msgText.textContent = "";
        }
      }, 700); // Wait for exit animation to complete
    }, duration);
  } else {
    // Always show mode: return to default resting state
    alertTimeout = setTimeout(() => {
      alertTimeout = null;
      if (msgText) msgText.textContent = (showDefaultText === "yes") ? defaultMessage : "";
      if (pfpImg) pfpImg.src = 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517ad-def8-437d-9a4e-c27c02511a3c-profile_image-70x70.png';
      if (container) container.className = 'alert-visible';
    }, duration);
  }
}
