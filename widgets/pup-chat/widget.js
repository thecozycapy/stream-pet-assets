// Cozy Pup Chat Logic
let maxMessages = 6;
let bubbleOpacity = 0.95;
let textOpacity = 1.0;
let textColor = '#2f2824';
let bubbleColor = '#fffbf2';
let showBadges = 'yes';
let fadeDuration = 15;

window.addEventListener('onWidgetLoad', function(obj) {
  const fields = obj.detail.fieldData;
  if (!fields) return;
  
  maxMessages = parseInt(fields.maxMessages) || 6;
  bubbleOpacity = (parseInt(fields.bubbleOpacity) || 95) / 100;
  textOpacity = (parseInt(fields.textOpacity) || 100) / 100;
  textColor = fields.textColor || '#2f2824';
  bubbleColor = fields.bubbleColor || '#fffbf2';
  showBadges = fields.showBadges || 'yes';
  fadeDuration = parseInt(fields.fadeDuration) !== undefined ? parseInt(fields.fadeDuration) : 15;
  
  // Set custom properties
  document.documentElement.style.setProperty('--bubble-opacity', bubbleOpacity);
  document.documentElement.style.setProperty('--text-opacity', textOpacity);
  document.documentElement.style.setProperty('--text-color', textColor);
});

window.addEventListener('onEventReceived', function(obj) {
  if (!obj || !obj.detail || obj.detail.listener !== 'chat-message') return;
  const event = obj.detail.event;
  if (!event) return;
  
  appendMessage(event.name, event.message, event.badges || []);
});

function appendMessage(name, message, badges) {
  const container = document.getElementById('chat-container');
  if (!container) return;
  
  const msgEl = document.createElement('div');
  msgEl.className = 'chat-message';
  
  // Choose random dog emoji prefix
  const dogEmojis = ['🐶', '🐕', '🐩', '🦮', '🐾', '🐕‍🦺'];
  const nameHash = name.charCodeAt(0) + name.length;
  const selectedEmoji = dogEmojis[nameHash % dogEmojis.length];
  
  // Custom username coloring based on warm tones
  const nameColors = ['#8d5b4c', '#e5a93b', '#c65135', '#a5603e', '#bd744c'];
  const usernameColor = nameColors[nameHash % nameColors.length];
  
  // Determine badge elements
  let badgesHTML = '';
  if (showBadges === 'yes' && badges.length > 0) {
    badgesHTML = badges.map(b => `<span class="badge badge-${b}">${b.slice(0,3)}</span>`).join('');
  }
  
  msgEl.innerHTML = `
    <div class="message-bubble">
      <!-- 9-Slice Dynamic SVG Dog Bone background shape -->
      <div class="bone-background"></div>
      
      <!-- Inner text content overlays the front -->
      <div class="bone-content">
        <div class="user-meta">
          ${badgesHTML}
          <span class="username" style="color: ${usernameColor}">${selectedEmoji} ${name}</span>
        </div>
        <div class="message-text">${message}</div>
      </div>
    </div>
  `;
  
  // Inject the dynamic 9-slice SVG background inline
  const boneBg = msgEl.querySelector('.bone-background');
  if (boneBg) {
    const fill = encodeURIComponent(bubbleColor);
    const stroke = encodeURIComponent(darkenColor(bubbleColor, 15));
    // SVG path represents a smooth, organic dog bone with inward curves on the shaft
    boneBg.style.borderImageSource = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60' viewBox='0 0 120 60'%3E%3Cpath d='M 30,8 C 50,11 70,11 90,8 C 98,8 105,3 110,10 C 115,18 110,28 106,30 C 110,32 115,42 110,50 C 105,57 98,52 90,52 C 70,49 50,49 30,52 C 22,52 15,57 10,50 C 5,42 10,32 14,30 C 10,28 5,18 10,10 C 15,3 22,8 30,8 Z' fill='${fill}' stroke='${stroke}' stroke-width='2.5' stroke-linejoin='round'/%3E%3C/svg%3E")`;
  }
  
  container.appendChild(msgEl);
  
  // Handle auto fade-out
  if (fadeDuration > 0) {
    setTimeout(() => {
      msgEl.classList.add('fade-out');
      setTimeout(() => {
        msgEl.remove();
      }, 550);
    }, fadeDuration * 1000);
  }
  
  // Prune list
  const messages = container.getElementsByClassName('chat-message');
  if (messages.length > maxMessages) {
    messages[0].remove();
  }
}

// Helper to darken a hex color for the bone outline border
function darkenColor(hex, percent) {
  let num = parseInt(hex.replace("#",""), 16),
      amt = Math.round(2.55 * percent),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 0 ? 0 : B) : 255)
  ).toString(16).slice(1);
}
