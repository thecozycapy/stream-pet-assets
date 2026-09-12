// Animated Event Ticker / Banner Logic
let followerName = "-";
let subscriberName = "-";
let tipName = "-";
let tipAmount = "";
let cheerName = "-";
let cheerAmount = "";

let bannerPosition = "top";
let textHexColor = "#ffffff";
let accentHexColor = "#e5a93b";
let scrollSpeedSeconds = 25;
let bannerHeightPx = 52;
let currencySymbol = "$";

// Customizable Emotes / Icons
let followIcon = "\uD83D\uDC3E"; // ??
let subIcon = "\u2B50";         // ?
let tipIcon = "\uD83D\uDCB0";    // ??
let cheerIcon = "\uD83D\uDC8E";  // ??

const DEFAULT_DOG_URL = "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/widgets/event-ticker/Dog.png";
const LOCAL_DOG_URL = "widgets/event-ticker/Dog.png";

// Helper function to extract username and amount from any StreamElements format
function parseEventEntry(entry) {
  if (!entry) return { name: "", amount: "" };
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    return { name: (trimmed === "-" || trimmed === "None") ? "" : trimmed, amount: "" };
  }
  if (typeof entry === "number") {
    return { name: "", amount: entry };
  }
  if (Array.isArray(entry) && entry.length > 0) {
    return parseEventEntry(entry[0]);
  }
  if (typeof entry === "object") {
    const rawName = entry.name || entry.displayName || entry.username || entry.user || entry.sender || "";
    const name = (typeof rawName === "string" ? rawName.trim() : "").replace(/^@/, "");
    
    let amount = "";
    if (entry.amount !== undefined && entry.amount !== null && entry.amount !== "") {
      amount = entry.amount;
    } else if (entry.count !== undefined) {
      amount = entry.count;
    }
    return { name: name, amount: amount };
  }
  return { name: "", amount: "" };
}

function formatTip(amount, symbol) {
  if (!amount && amount !== 0) return "";
  const sym = symbol || "$";
  if (typeof amount === "number") {
    return sym + amount.toFixed(2);
  }
  const str = amount.toString().trim();
  if (str.startsWith("$") || str.startsWith("?") || str.startsWith("?")) {
    return str;
  }
  const num = parseFloat(str.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? (sym + str) : (sym + num.toFixed(2));
}

function formatCheer(amount) {
  if (!amount && amount !== 0) return "";
  const str = amount.toString().trim();
  if (str.toLowerCase().indexOf("bit") !== -1) return str;
  return str + " bits";
}

function loadSessionData(detail) {
  if (!detail) return;
  const session = (detail.session && detail.session.data) ? detail.session.data : (detail.session || {});
  const recents = detail.recents || [];
  currencySymbol = (detail.currency && detail.currency.symbol) ? detail.currency.symbol : "$";

  // 1. Check Follower
  const followEntry = session["follower-latest"] || session["latest-follower"] || session["follower-recent"] || session["follower_latest"] || session["follower-week"] || session["follower-month"];
  const followParsed = parseEventEntry(followEntry);
  if (followParsed.name) {
    followerName = followParsed.name;
  }

  // 2. Check Subscriber
  const subEntry = session["subscriber-latest"] || session["latest-subscriber"] || session["subscriber-recent"] || session["subscriber_latest"] || session["sub-latest"] || session["subscriber-week"] || session["subscriber-month"];
  const subParsed = parseEventEntry(subEntry);
  if (subParsed.name) {
    subscriberName = subParsed.name;
  }

  // 3. Check Tip / Donation
  const tipEntry = session["tip-latest"] || session["latest-tip"] || session["tip-recent"] || session["tip_latest"] || session["donation-latest"] || session["tip-week"] || session["tip-month"];
  const tipParsed = parseEventEntry(tipEntry);
  if (tipParsed.name) {
    tipName = tipParsed.name;
    if (tipParsed.amount) {
      tipAmount = formatTip(tipParsed.amount, currencySymbol);
    }
  }

  // 4. Check Cheer / Bits
  const cheerEntry = session["cheer-latest"] || session["latest-cheer"] || session["cheer-recent"] || session["cheer_latest"] || session["bits-latest"] || session["cheer-week"] || session["cheer-month"];
  const cheerParsed = parseEventEntry(cheerEntry);
  if (cheerParsed.name) {
    cheerName = cheerParsed.name;
    if (cheerParsed.amount) {
      cheerAmount = formatCheer(cheerParsed.amount);
    }
  }

  // Fallback: Check against detail.recents array if anything was still empty
  if (Array.isArray(recents)) {
    for (let i = 0; i < recents.length; i++) {
      const item = recents[i];
      if (!item) continue;
      const type = (item.type || item.listener || "").toLowerCase();
      const parsed = parseEventEntry(item);
      if (!parsed.name) continue;

      if (followerName === "-" && type.indexOf("follow") !== -1) {
        followerName = parsed.name;
      }
      if (subscriberName === "-" && type.indexOf("sub") !== -1) {
        subscriberName = parsed.name;
      }
      if (tipName === "-" && (type.indexOf("tip") !== -1 || type.indexOf("donat") !== -1)) {
        tipName = parsed.name;
        if (parsed.amount) {
          tipAmount = formatTip(parsed.amount, currencySymbol);
        }
      }
      if (cheerName === "-" && (type.indexOf("cheer") !== -1 || type.indexOf("bit") !== -1)) {
        cheerName = parsed.name;
        if (parsed.amount) {
          cheerAmount = formatCheer(parsed.amount);
        }
      }
    }
  }
}

// Seamless multi-segment ticker update without breaking animation continuity
function updateTickerDisplay(updatedType) {
  const fIcon = (followIcon && followIcon.trim() !== "") ? followIcon : "\uD83D\uDC3E";
  const sIcon = (subIcon && subIcon.trim() !== "") ? subIcon : "\u2B50";
  const tIcon = (tipIcon && tipIcon.trim() !== "") ? tipIcon : "\uD83D\uDCB0";
  const cIcon = (cheerIcon && cheerIcon.trim() !== "") ? cheerIcon : "\uD83D\uDC8E";

  const tipVal = (tipName !== "-" && tipAmount) ? (tipName + " (" + tipAmount + ")") : tipName;
  const cheerVal = (cheerName !== "-" && cheerAmount) ? (cheerName + " (" + cheerAmount + ")") : cheerName;

  const item1 = '<div class="ticker-item">' +
    '<span class="ticker-icon">' + fIcon + '</span>' +
    '<span class="ticker-label">LATEST FOLLOW:</span>' +
    '<span class="ticker-value" data-type="follow">' + followerName + '</span>' +
  '</div>';

  const item2 = '<div class="ticker-item">' +
    '<span class="ticker-icon">' + sIcon + '</span>' +
    '<span class="ticker-label">LATEST SUB:</span>' +
    '<span class="ticker-value" data-type="sub">' + subscriberName + '</span>' +
  '</div>';

  const item3 = '<div class="ticker-item">' +
    '<span class="ticker-icon">' + tIcon + '</span>' +
    '<span class="ticker-label">LATEST TIP:</span>' +
    '<span class="ticker-value" data-type="tip">' + tipVal + '</span>' +
  '</div>';

  const item4 = '<div class="ticker-item">' +
    '<span class="ticker-icon">' + cIcon + '</span>' +
    '<span class="ticker-label">LATEST CHEER:</span>' +
    '<span class="ticker-value" data-type="cheer">' + cheerVal + '</span>' +
  '</div>';

  const groupHtml = item1 + item2 + item3 + item4;

  const allScrollers = document.querySelectorAll(".scroller-inner");
  allScrollers.forEach(function(scroller) {
    if (scroller.innerHTML !== groupHtml) {
      scroller.innerHTML = groupHtml;
    }
  });

  if (updatedType) {
    const updatedNodes = document.querySelectorAll('.ticker-value[data-type="' + updatedType + '"]');
    updatedNodes.forEach(function(node) {
      triggerItemFlash(node);
    });
  }
}

function triggerItemFlash(el) {
  if (!el) return;
  el.classList.remove("item-update-flash");
  void el.offsetWidth;
  el.classList.add("item-update-flash");
}

window.addEventListener("onWidgetLoad", function(obj) {
  const detail = (obj && obj.detail) ? obj.detail : {};
  const fields = detail.fieldData || {};
  
  bannerPosition = fields.bannerPosition || "top";
  bannerHeightPx = parseInt(fields.bannerHeight) || 52;
  textHexColor = fields.textColor || "#ffffff";
  accentHexColor = fields.accentColor || "#e5a93b";
  scrollSpeedSeconds = parseInt(fields.scrollSpeed) || 25;
  
  // Custom Emotes
  followIcon = (fields.followIcon !== undefined && fields.followIcon !== "") ? fields.followIcon : "\uD83D\uDC3E";
  subIcon = (fields.subIcon !== undefined && fields.subIcon !== "") ? fields.subIcon : "\u2B50";
  tipIcon = (fields.tipIcon !== undefined && fields.tipIcon !== "") ? fields.tipIcon : "\uD83D\uDCB0";
  cheerIcon = (fields.cheerIcon !== undefined && fields.cheerIcon !== "") ? fields.cheerIcon : "\uD83D\uDC8E";
  
  // Load real streamer metrics from StreamElements session
  loadSessionData(detail);

  // Dog image resolution (custom image, local file, or CDN fallback)
  const dogImgEl = document.getElementById("ticker-dog-img");
  if (dogImgEl) {
    if (fields.dogImage && fields.dogImage.trim() !== "") {
      dogImgEl.src = fields.dogImage.trim();
    } else {
      const testImg = new Image();
      testImg.onload = function() {
        dogImgEl.src = LOCAL_DOG_URL;
      };
      testImg.onerror = function() {
        dogImgEl.src = DEFAULT_DOG_URL;
      };
      testImg.src = LOCAL_DOG_URL;
    }
  }
  
  // Set custom CSS variables
  document.documentElement.style.setProperty("--banner-height", bannerHeightPx + "px");
  document.documentElement.style.setProperty("--text-color", textHexColor);
  document.documentElement.style.setProperty("--accent-color", accentHexColor);
  document.documentElement.style.setProperty("--scroll-speed", scrollSpeedSeconds + "s");
  
  // Calculate Background Color with Opacity
  const bgColor = fields.bgColor || "#201714";
  const bgOpacity = (parseInt(fields.bgOpacity) || 85) / 100;
  
  const r = parseInt(bgColor.slice(1, 3), 16) || 32;
  const g = parseInt(bgColor.slice(3, 5), 16) || 23;
  const b = parseInt(bgColor.slice(5, 7), 16) || 20;
  document.documentElement.style.setProperty("--banner-bg", "rgba(" + r + ", " + g + ", " + b + ", " + bgOpacity + ")");
  
  // Set position styling class
  const banner = document.getElementById("ticker-banner");
  if (banner) {
    if (bannerPosition === "top") {
      banner.className = "pos-top";
    } else if (bannerPosition === "fill" || bannerPosition === "center") {
      banner.className = "pos-fill";
    } else {
      banner.className = "pos-bottom";
    }
  }
  
  updateTickerDisplay();
});

// Live Session Updates from StreamElements
window.addEventListener("onSessionUpdate", function(obj) {
  if (!obj || !obj.detail) return;
  loadSessionData(obj.detail);
  updateTickerDisplay();
});

// Live Stream Alerts & Events (seamless, zero-glitch in-place updates)
window.addEventListener("onEventReceived", function(obj) {
  if (!obj || !obj.detail) return;
  const listener = obj.detail.listener;
  const event = obj.detail.event;
  if (!event) return;
  
  const parsed = parseEventEntry(event);
  const name = parsed.name || (event.data && parseEventEntry(event.data).name);
  
  if (listener === "follower-latest" || (event.type && event.type.indexOf("follow") !== -1)) {
    if (name) followerName = name;
    updateTickerDisplay("follow");
  } else if (listener === "subscriber-latest" || (event.type && event.type.indexOf("sub") !== -1)) {
    if (name) subscriberName = name;
    updateTickerDisplay("sub");
  } else if (listener === "tip-latest" || (event.type && event.type.indexOf("tip") !== -1) || (event.type && event.type.indexOf("donat") !== -1)) {
    if (name) tipName = name;
    const amt = (parsed.amount !== "" ? parsed.amount : (event.data && event.data.amount));
    if (amt !== undefined && amt !== "") {
      tipAmount = formatTip(amt, currencySymbol);
    }
    updateTickerDisplay("tip");
  } else if (listener === "cheer-latest" || (event.type && event.type.indexOf("cheer") !== -1) || (event.type && event.type.indexOf("bit") !== -1)) {
    if (name) cheerName = name;
    const amt = (parsed.amount !== "" ? parsed.amount : (event.data && event.data.amount));
    if (amt !== undefined && amt !== "") {
      cheerAmount = formatCheer(amt);
    }
    updateTickerDisplay("cheer");
  }
});