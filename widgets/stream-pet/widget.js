// Interactive On-Screen Stream Pet Logic
let petName = "Rusty";
let idleAnimation = "yes";
let petState = "idle"; // idle, busy

window.addEventListener('onWidgetLoad', function(obj) {
  const fields = obj.detail.fieldData;
  if (!fields) return;
  
  petName = fields.petName || "Rusty";
  idleAnimation = fields.idleAnimation || "yes";
  const dogYOffset = fields.dogYOffset !== undefined ? parseInt(fields.dogYOffset) : 10;
  const dogXOffset = fields.dogXOffset !== undefined ? parseInt(fields.dogXOffset) : 0;
  const tagNameScale = fields.tagNameScale !== undefined ? parseInt(fields.tagNameScale) : 5;
  const tagXOffset = fields.tagXOffset !== undefined ? parseInt(fields.tagXOffset) : 11;
  const tagYOffset = fields.tagYOffset !== undefined ? parseInt(fields.tagYOffset) : 25;
  const tagRotate = fields.tagRotate !== undefined ? parseInt(fields.tagRotate) : -5;
  const tagTextColor = fields.tagTextColor || "#3c2415";
  const bubbleTextColor = fields.bubbleTextColor || "#ffffff";
  const bubbleBgColor = fields.bubbleBgColor || "#201714";
  const bubbleBorderColor = fields.bubbleBorderColor || "#e5a93b";
  const widgetScale = (parseInt(fields.widgetScale) || 100) / 100;
  
  // Set custom CSS properties
  document.documentElement.style.setProperty('--dog-y-offset', dogYOffset + 'px');
  document.documentElement.style.setProperty('--dog-x-offset', dogXOffset + 'px');
  document.documentElement.style.setProperty('--tag-name-scale', tagNameScale + 'px');
  document.documentElement.style.setProperty('--tag-x-offset', tagXOffset + 'px');
  document.documentElement.style.setProperty('--tag-y-offset', tagYOffset + 'px');
  document.documentElement.style.setProperty('--tag-rotate', tagRotate + 'deg');
  document.documentElement.style.setProperty('--tag-text-color', tagTextColor);
  document.documentElement.style.setProperty('--bubble-text-color', bubbleTextColor);
  document.documentElement.style.setProperty('--bubble-bg-color', bubbleBgColor);
  document.documentElement.style.setProperty('--bubble-border-color', bubbleBorderColor);
  document.documentElement.style.setProperty('--widget-scale', widgetScale);
  
  // Set bed image source and dynamic name tag
  const bedImg = document.getElementById('bed-img');
  if (bedImg) {
    bedImg.src = "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/Dog%20bed.png";
  }
  const bedNameText = document.getElementById('bed-name-text');
  if (bedNameText) {
    bedNameText.textContent = petName;
  }
  
  // Set initial state
  const pet = document.getElementById('pet-character');
  if (pet) {
    pet.className = idleAnimation === "yes" ? "idle-breath" : "";
  }
  
  // Breed asset mapping
  const DOG_BREED_ASSETS = {
    "Dog 1": "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/Dog%201.png",
    "Dog 2": "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/Dog%202.png",
    "Dog 3": "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/Dog%203.png",
    "Dog 4": "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/Dog%204.png",
    "Dog 5": "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/Dog%205.png"
  };

  // Set image source and description
  const dogSelection = fields.selectedDog || "Dog 1";
  const dogImageUrl = DOG_BREED_ASSETS[dogSelection] || (dogSelection.startsWith('http') ? dogSelection : `${dogSelection}.png`) || DOG_BREED_ASSETS["Dog 1"];
  const petImg = document.getElementById('pet-img');
  if (petImg) {
    petImg.src = dogImageUrl;
    petImg.alt = petName;
  }
});

window.addEventListener('onEventReceived', function(obj) {
  if (!obj || !obj.detail) return;
  const listener = obj.detail.listener;
  const event = obj.detail.event;
  
  // 1. Respond to Chat Messages/Commands
  if (listener === 'chat-message') {
    const msg = event.message.trim().toLowerCase();
    
    if (msg.startsWith('!pet')) {
      triggerPat();
    } else if (msg.startsWith('!treat')) {
      triggerTreat();
    } else if (msg.startsWith('!bark')) {
      triggerBark();
    }
  }
  // 2. Respond to Event Alerts (follows, subs, cheers, tips)
  else if (listener === 'follower-latest') {
    triggerAlertReaction(`Thanks for follow, ${event.name}! 🐾`, "jump");
  } else if (listener === 'subscriber-latest') {
    triggerAlertReaction(`Treat Alert! Thanks ${event.name}! 🦴`, "super");
  } else if (listener === 'cheer-latest') {
    triggerAlertReaction(`Cheer Bark! Thanks ${event.name}! ⭐`, "bark");
  } else if (listener === 'tip-latest') {
    triggerAlertReaction(`Tip Wiggle! Thanks ${event.name}! 💰`, "jump");
  }
});

// Triggers Head Pat Animation (!pet)
function triggerPat() {
  if (petState !== "idle") return;
  
  petState = "busy";
  const pet = document.getElementById('pet-character');
  const hand = document.getElementById('pat-hand');
  
  if (pet) {
    pet.className = 'wiggle-pat';
  }
  
  if (hand) {
    hand.src = "https://cdn.jsdelivr.net/gh/thecozycapy/stream-pet-assets@main/hand.png";
    hand.classList.add('active');
    setTimeout(() => {
      hand.classList.remove('active');
    }, 1600);
  }
  
  // Spawn heart particles
  for (let i = 0; i < 5; i++) {
    setTimeout(spawnHeart, i * 100);
  }
  
  setTimeout(returnToIdle, 1600);
}

// Triggers Bone Toss Action (!treat)
function triggerTreat() {
  if (petState !== "idle") return;
  
  petState = "busy";
  const treat = document.getElementById('falling-treat');
  const pet = document.getElementById('pet-character');
  
  if (treat) {
    treat.classList.add('active');
  }
  
  // Sync jump to catch the falling bone
  setTimeout(() => {
    if (pet) pet.className = 'jump-active';
  }, 200);
  
  // Remove bone, spawn nom particles (No speech bubble text balloon)
  setTimeout(() => {
    if (treat) treat.classList.remove('active');
    for (let i = 0; i < 3; i++) {
      setTimeout(spawnNomNom, i * 150);
    }
  }, 550);
  
  setTimeout(returnToIdle, 2200);
}

// Triggers Bark Command (!bark)
function triggerBark() {
  if (petState !== "idle") return;
  
  petState = "busy";
  const pet = document.getElementById('pet-character');
  if (pet) {
    pet.className = 'bark-active';
  }
  
  // Spawn bark text particles (No speech bubble text balloon)
  for (let i = 0; i < 4; i++) {
    setTimeout(spawnBarkText, i * 200);
  }
  
  setTimeout(returnToIdle, 1000);
}

// Triggers alert response reactions
function triggerAlertReaction(message, type) {
  petState = "busy";
  
  const pet = document.getElementById('pet-character');
  showStatusBubble(message, 3000);
  
  if (type === "super") {
    // Rain of bones
    if (pet) pet.className = "jump-active";
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        spawnAlertBone();
      }, i * 200);
    }
  } else if (type === "bark") {
    if (pet) pet.className = "bark-active";
    for (let i = 0; i < 4; i++) {
      setTimeout(spawnBarkText, i * 250);
    }
  } else { // jump
    if (pet) pet.className = "jump-active";
  }
  
  setTimeout(returnToIdle, 3200);
}

// Helper: resets pet to idle status
function returnToIdle() {
  petState = "idle";
  const pet = document.getElementById('pet-character');
  if (pet) {
    pet.className = idleAnimation === "yes" ? "idle-breath" : "";
  }
}

// Show Action Status Bubble
function showStatusBubble(text, duration) {
  const bubble = document.getElementById('speech-bubble');
  const bubbleText = document.getElementById('speech-text');
  
  if (bubble && bubbleText) {
    bubbleText.textContent = text;
    bubble.classList.add('active');
    
    setTimeout(() => {
      // Only remove if text matches (prevents overlapping speech triggers clipping)
      if (bubbleText.textContent === text) {
        bubble.classList.remove('active');
      }
    }, duration);
  }
}

// Spawns heart particles for pet wiggles
function spawnHeart() {
  const wrapper = document.getElementById('pet-wrapper');
  if (!wrapper) return;
  
  const heart = document.createElement('div');
  heart.className = 'heart-particle';
  heart.textContent = '❤️';
  
  // Random variables for CSS keyframe floats
  const dx = (Math.random() * 80 - 40) + 'px';
  const dy = (-100 - (Math.random() * 50)) + 'px';
  const dr = (Math.random() * 180 - 90) + 'deg';
  
  heart.style.setProperty('--dx', dx);
  heart.style.setProperty('--dy', dy);
  heart.style.setProperty('--dr', dr);
  
  heart.style.left = `${35 + Math.random() * 30}%`;
  heart.style.bottom = '40px';
  
  wrapper.appendChild(heart);
  
  setTimeout(() => {
    heart.remove();
  }, 1200);
}

// Helper to spawn a bone treat particle raining down
function spawnAlertBone() {
  const wrapper = document.getElementById('pet-widget-container');
  if (!wrapper) return;
  
  const bone = document.createElement('div');
  bone.className = 'heart-particle'; // reuse same keyframe floats
  bone.textContent = '🦴';
  bone.style.fontSize = '1.3rem';
  
  const dx = (Math.random() * 120 - 60) + 'px';
  const dy = '150px';
  const dr = (Math.random() * 360) + 'deg';
  
  bone.style.setProperty('--dx', dx);
  bone.style.setProperty('--dy', dy);
  bone.style.setProperty('--dr', dr);
  
  bone.style.left = `${30 + Math.random() * 40}%`;
  bone.style.top = '-20px';
  bone.style.animationName = 'float-heart'; // Float it
  
  wrapper.appendChild(bone);
  
  setTimeout(() => {
    bone.remove();
  }, 1200);
}

// Spawns "Nom Nom Nom" floating text particles when the treat is caught
function spawnNomNom() {
  const wrapper = document.getElementById('pet-wrapper');
  if (!wrapper) return;
  
  const nom = document.createElement('div');
  nom.className = 'nom-particle';
  nom.textContent = Math.random() > 0.5 ? 'Nom!' : 'Nom Nom Nom!';
  
  // Random variables for CSS keyframe floats
  const dx = (Math.random() * 80 - 40) + 'px';
  const dy = (-70 - (Math.random() * 30)) + 'px';
  const dr = (Math.random() * 40 - 20) + 'deg';
  
  nom.style.setProperty('--dx', dx);
  nom.style.setProperty('--dy', dy);
  nom.style.setProperty('--dr', dr);
  
  nom.style.left = `${30 + Math.random() * 40}%`;
  nom.style.bottom = '100px'; // Spawns near the dog's head/mouth level
  
  wrapper.appendChild(nom);
  
  setTimeout(() => {
    nom.remove();
  }, 1200);
}

// Spawns "Woof!" / "Bark!" floating text particles when the pet barks
function spawnBarkText() {
  const wrapper = document.getElementById('pet-wrapper');
  if (!wrapper) return;
  
  const bark = document.createElement('div');
  bark.className = 'bark-particle';
  const barkWords = ['Woof!', 'Bark!', 'Arf!', 'Yip!'];
  bark.textContent = barkWords[Math.floor(Math.random() * barkWords.length)];
  
  // Random variables for CSS keyframe floats
  const dx = (Math.random() * 120 - 60) + 'px';
  const dy = (-80 - (Math.random() * 45)) + 'px';
  const dr = (Math.random() * 40 - 20) + 'deg';
  
  bark.style.setProperty('--dx', dx);
  bark.style.setProperty('--dy', dy);
  bark.style.setProperty('--dr', dr);
  
  bark.style.left = `${30 + Math.random() * 40}%`;
  bark.style.bottom = '110px'; // Spawns near the dog's mouth level
  
  wrapper.appendChild(bark);
  
  setTimeout(() => {
    bark.remove();
  }, 1000);
}
