// Animated Event Ticker / Banner Logic
let followerName = "HappyFollower";
let subscriberName = "BarkChampion";
let tipName = "TreatLord";
let tipAmount = "$5.00";
let cheerName = "BitsPup";
let cheerAmount = "200 bits";

let bannerPosition = "bottom";
let textHexColor = "#ffffff";
let accentHexColor = "#e5a93b";
let scrollSpeedSeconds = 20;

window.addEventListener('onWidgetLoad', function(obj) {
  const fields = obj.detail.fieldData;
  if (!fields) return;
  
  bannerPosition = fields.bannerPosition || "bottom";
  textHexColor = fields.textColor || "#ffffff";
  accentHexColor = fields.accentColor || "#e5a93b";
  scrollSpeedSeconds = parseInt(fields.scrollSpeed) || 20;
  
  // Set custom CSS variables
  document.documentElement.style.setProperty('--text-color', textHexColor);
  document.documentElement.style.setProperty('--accent-color', accentHexColor);
  document.documentElement.style.setProperty('--scroll-speed', scrollSpeedSeconds + 's');
  
  // Calculate Background Color with Opacity
  const bgColor = fields.bgColor || "#201714";
  const bgOpacity = (parseInt(fields.bgOpacity) || 85) / 100;
  
  // Convert HEX to RGB
  const r = parseInt(bgColor.slice(1, 3), 16) || 32;
  const g = parseInt(bgColor.slice(3, 5), 16) || 23;
  const b = parseInt(bgColor.slice(5, 7), 16) || 20;
  document.documentElement.style.setProperty('--banner-bg', `rgba(${r}, ${g}, ${b}, ${bgOpacity})`);
  
  // Set position styling class
  const banner = document.getElementById('ticker-banner');
  if (banner) {
    banner.className = bannerPosition === "top" ? "pos-top" : "pos-bottom";
  }
  
  repopulateTicker();
});

window.addEventListener('onEventReceived', function(obj) {
  if (!obj || !obj.detail) return;
  const listener = obj.detail.listener;
  const event = obj.detail.event;
  
  if (listener === 'follower-latest') {
    followerName = event.name || "NewFollower";
    repopulateTicker();
  } else if (listener === 'subscriber-latest') {
    subscriberName = event.name || "BarkChamp";
    repopulateTicker();
  } else if (listener === 'tip-latest') {
    tipName = event.name || "TipGiver";
    tipAmount = event.amount || "$5.00";
    repopulateTicker();
  } else if (listener === 'cheer-latest') {
    cheerName = event.name || "BitsCheer";
    cheerAmount = (event.amount || "100") + " bits";
    repopulateTicker();
  }
});

function repopulateTicker() {
  const scroller1 = document.getElementById('scroller-1');
  const scroller2 = document.getElementById('scroller-2');
  if (!scroller1 || !scroller2) return;
  
  // Build scrolling summary segments
  const htmlContent = `
    <div class="ticker-item">
      <span class="ticker-icon">🐾</span>
      <span class="ticker-label">LATEST FOLLOW:</span>
      <span class="ticker-value">${followerName}</span>
    </div>
    <div class="ticker-item">
      <span class="ticker-icon">⭐</span>
      <span class="ticker-label">LATEST SUB:</span>
      <span class="ticker-value">${subscriberName}</span>
    </div>
    <div class="ticker-item">
      <span class="ticker-icon">💰</span>
      <span class="ticker-label">LATEST TIP:</span>
      <span class="ticker-value">${tipName} (${tipAmount})</span>
    </div>
    <div class="ticker-item">
      <span class="ticker-icon">💎</span>
      <span class="ticker-label">LATEST CHEER:</span>
      <span class="ticker-value">${cheerName} (${cheerAmount})</span>
    </div>
  `;
  
  // Apply to both list layers to enable seamless wrapping
  scroller1.innerHTML = htmlContent;
  scroller2.innerHTML = htmlContent;
}
