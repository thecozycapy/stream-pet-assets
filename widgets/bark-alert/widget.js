// Bark Alert Box Logic
let followerText = "{name} gave a belly rub!";
let subscriberText = "{name} adopted a puppy!";
let cheerText = "{name} sent {amount} barks!";
let tipText = "{name} bought {amount} treats!";
let alertTimeout = null;
let previewMode = "yes";
let alwaysShowOverlay = "no";
let showDefaultText = "yes";
let defaultMessage = "Awaiting adoption...";

window.addEventListener('onWidgetLoad', function (obj) {
  const fieldData = obj.detail.fieldData;
  if (!fieldData) return;
  
  followerText = fieldData.followerMessage || "{name} gave a belly rub!";
  subscriberText = fieldData.subMessage || "{name} adopted a puppy!";
  cheerText = fieldData.cheerMessage || "{name} sent {amount} barks!";
  tipText = fieldData.tipMessage || "{name} bought {amount} treats!";
  previewMode = fieldData.previewMode || "yes";
  alwaysShowOverlay = fieldData.alwaysShowOverlay || "no";
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
  
  // Set Default Text or Clear it on Load
  if (!alertTimeout) {
    const textEl = document.getElementById('alert-message-text');
    const pfpImg = document.getElementById('alert-pfp');
    if (showDefaultText === "yes") {
      textEl.textContent = defaultMessage;
      if (pfpImg) pfpImg.src = 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517ad-def8-437d-9a4e-c27c02511a3c-profile_image-70x70.png';
      container.className = 'alert-visible';
    } else {
      textEl.textContent = "";
      if (pfpImg) pfpImg.src = 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517ad-def8-437d-9a4e-c27c02511a3c-profile_image-70x70.png';
      // If preview mode or always show mode is on, show the skeleton shape; otherwise keep hidden
      if (previewMode === "yes" || alwaysShowOverlay === "yes") {
        container.className = 'alert-visible';
      } else {
        container.className = 'alert-hidden';
      }
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
  
  msgText.textContent = msg;
  pfpImg.src = avatar;
  
  // Reset active classes
  container.className = 'alert-visible';
  
  if (alertTimeout) clearTimeout(alertTimeout);
  
  const shouldHide = (previewMode === "no" && alwaysShowOverlay === "no");
  const duration = parseFloat(document.documentElement.style.getPropertyValue('--duration') || '5') * 1000;
  
  if (shouldHide) {
    alertTimeout = setTimeout(() => {
      container.className = 'alert-exit';
      alertTimeout = null;
      
      // If showDefaultText is off, clear text after alert fades out
      setTimeout(() => {
        if (!alertTimeout && showDefaultText === "no") {
          msgText.textContent = "";
        }
      }, 700); // Wait for exit animation to finish
    }, duration);
  } else {
    // If always showing, stay visible and transition back to default resting state after duration
    alertTimeout = setTimeout(() => {
      alertTimeout = null;
      msgText.textContent = showDefaultText === "yes" ? defaultMessage : "";
      pfpImg.src = 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517ad-def8-437d-9a4e-c27c02511a3c-profile_image-70x70.png';
    }, duration);
  }
}
