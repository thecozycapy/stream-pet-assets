const WIDGETS_DATA = [
  {
    id: "bark-alert",
    title: "Bark! Alert Box",
    category: "alerts",
    tags: ["Puppy", "Paws", "Bouncy", "Alerts"],
    description: "A cute pet-themed alert box shaped like a dog bone overlapping the follower's Twitch profile picture, displaying alert text inside the bone shaft.",
    image: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="300" height="180" fill="%230c0d14"/><circle cx="150" cy="72" r="32" fill="%23201715" stroke="%23e5a93b" stroke-width="2.5"/><text x="150" y="78" fill="%23e5a93b" font-family="'Outfit', sans-serif" font-weight="bold" font-size="16" text-anchor="middle">🐶</text><g filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.4))"><circle cx="82" cy="105" r="8" fill="%23fffbf2"/><circle cx="82" cy="119" r="8" fill="%23fffbf2"/><circle cx="218" cy="105" r="8" fill="%23fffbf2"/><circle cx="218" cy="119" r="8" fill="%23fffbf2"/><rect x="82" y="105" width="136" height="14" fill="%23fffbf2"/><text x="150" y="116" fill="%232c1b18" font-family="'Outfit', sans-serif" font-weight="800" font-size="8" text-anchor="middle">BARK ALERT</text></g></svg>`,
    events: [
      { id: "follower", label: "Adopt Follower", listener: "follower-latest", data: { name: "PupLover", avatar: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150&h=150" } },
      { id: "subscriber", label: "Treat Subscriber", listener: "subscriber-latest", data: { name: "BarkMaster", avatar: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=150&h=150" } },
      { id: "cheer", label: "Bark Cheer (100 barks)", listener: "cheer-latest", data: { name: "TailWagger", amount: 100, avatar: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&q=80&w=150&h=150" } },
      { id: "tip", label: "Puppy Tip ($5.00)", listener: "tip-latest", data: { name: "TreatGiver", amount: "$5.00", avatar: "https://images.unsplash.com/photo-1477884213984-b97121226ff6?auto=format&fit=crop&q=80&w=150&h=150" } }
    ]
  },
  {
    id: "pup-chat",
    title: "Pup Bubble Chat",
    category: "chat",
    tags: ["Chat", "Pups", "Cozy", "Dog Lover"],
    description: "A cozy streaming chat overlay that organizes chat feeds into soft, bone-white message bubbles featuring paw-print tags and custom username badges.",
    image: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="300" height="180" fill="%230c0d14"/><rect x="25" y="25" width="220" height="42" rx="14" fill="%23fffbf2" stroke="%23e5a93b" stroke-width="1.5"/><rect x="45" y="82" width="230" height="42" rx="14" fill="%23fffbf2" stroke="%23ff85a2" stroke-width="1.5"/><text x="40" y="49" fill="%23e5a93b" font-family="'Outfit', sans-serif" font-weight="700" font-size="11">🐾 ShibaLover</text><text x="110" y="49" fill="%232f2824" font-family="'Inter', sans-serif" font-size="11">Much cozy, wow!</text><text x="60" y="106" fill="%23ff85a2" font-family="'Outfit', sans-serif" font-weight="700" font-size="11">🐾 PoodleFan</text><text x="135" y="106" fill="%232f2824" font-family="'Inter', sans-serif" font-size="11">Cutest overlay ever!</text></svg>`,
    events: [
      { id: "msg1", label: "Bark Chat 1", listener: "chat-message", data: { name: "xQ_Pup", message: "Is that a bone-shaped bubble? Incredible!", badges: ["moderator"] } },
      { id: "msg2", label: "Bark Chat 2", listener: "chat-message", data: { name: "Shiba_Inu", message: "Cozy stream vibes! 🐾🐶", badges: ["subscriber"] } },
      { id: "msg3", label: "Bark Chat 3", listener: "chat-message", data: { name: "TailWagger", message: "woof woof!", badges: [] } }
    ]
  },
  {
    id: "pup-goal",
    title: "Fetch the Bone Goal",
    category: "goals",
    tags: ["Goal", "Doggo", "Progress", "Fetch"],
    description: "An interactive, linear tracker where a cute dog runner image slides across the progress bar closer to a bone target as you hit follow milestones.",
    image: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="300" height="180" fill="%230c0d14"/><rect x="35" y="75" width="210" height="12" rx="6" fill="rgba(255,255,255,0.06)"/><rect x="35" y="75" width="130" height="12" rx="6" fill="%23e5a93b"/><text x="145" y="70" font-size="20">🐶</text><text x="245" y="87" font-size="18">🦴</text><text x="150" y="116" fill="%23fff" font-family="'Outfit', sans-serif" font-weight="bold" font-size="13" text-anchor="middle">Treat Goal: 120 / 200</text></svg>`,
    events: [
      { id: "inc1", label: "Simulate Follower (+1)", listener: "follower-latest", data: { name: "BellyRuber" } },
      { id: "inc5", label: "Simulate (+5 Followers)", listener: "simulate-increment", data: { amount: 5 } },
      { id: "resetGoal", label: "Reset Follower Goal", listener: "simulate-reset", data: {} }
    ]
  },
  {
    id: "stream-pet",
    title: "Interactive Stream Pet",
    category: "chat",
    tags: ["Pet", "Animated", "Interactive", "Twitch Bot"],
    description: "A cozy custom animated overlay dog that responds live to chat commands (like !pet, !treat, and !bark) with head pats and food catching.",
    image: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="300" height="180" fill="%230c0d14"/><rect x="75" y="120" width="150" height="25" rx="12" fill="%238d5b4c"/><path d="M 120,90 C 120,80 135,80 135,90 C 135,100 120,100 120,90 Z" fill="%23fffbf2"/><circle cx="150" cy="100" r="22" fill="%23fffbf2"/><circle cx="142" cy="95" r="2.5" fill="%230c0d14"/><circle cx="158" cy="95" r="2.5" fill="%230c0d14"/><path d="M 147,102 Q 150,106 153,102" fill="none" stroke="%238d5b4c" stroke-width="1.5"/><text x="150" y="55" fill="%23e5a93b" font-family="'Outfit', sans-serif" font-weight="bold" font-size="12" text-anchor="middle">💤 Z Z z...</text></svg>`,
    events: [
      { id: "cmdPet", label: "Simulate !pet", listener: "chat-message", data: { name: "PupLover", message: "!pet" } },
      { id: "cmdTreat", label: "Simulate !treat", listener: "chat-message", data: { name: "BonesFan", message: "!treat" } },
      { id: "cmdBark", label: "Simulate !bark", listener: "chat-message", data: { name: "TailWag", message: "!bark" } }
    ]
  },
  {
    id: "treat-counter",
    title: "Physics Dog Bowl",
    category: "alerts",
    tags: ["Physics", "Treats", "Dog Bowl", "Bouncy"],
    description: "A digital dog bowl on screen where biscuits or bones fall from the top of the stream and bounce into the bowl whenever someone bits, subs, or follows.",
    image: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="300" height="180" fill="%230c0d14"/><path d="M 80,140 Q 150,180 220,140 L 200,105 Q 150,120 100,105 Z" fill="%23e5a93b"/><text x="150" y="145" fill="%23fff" font-family="'Outfit', sans-serif" font-weight="bold" font-size="12" text-anchor="middle">🦴 18 TREATS</text><circle cx="110" cy="60" r="8" fill="%23fffbf2"/><circle cx="180" cy="70" r="8" fill="%23fffbf2"/><circle cx="145" cy="45" r="8" fill="%23fffbf2"/></svg>`,
    events: [
      { id: "followTreat", label: "Follow (1 treat)", listener: "follower-latest", data: { name: "BiscuitFan" } },
      { id: "subTreat", label: "Subscriber (10 treats)", listener: "subscriber-latest", data: { name: "TreatChampion", amount: 10 } },
      { id: "cheerTreat", label: "Cheer (5 treats)", listener: "cheer-latest", data: { name: "BarkCheer", amount: 500 } },
      { id: "resetBowl", label: "Empty Bowl", listener: "simulate-reset", data: {} }
    ]
  },
  {
    id: "event-ticker",
    title: "Walking Dog Ticker",
    category: "alerts",
    tags: ["Ticker", "Scrolling", "Alerts", "Event Ticker"],
    description: "A scrolling event ticker banner featuring a animated walking/running dog that moves alongside dynamic sliding follower, sub, and tip summaries.",
    image: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180"><rect width="300" height="180" fill="%230c0d14"/><rect x="20" y="65" width="260" height="50" rx="10" fill="rgba(255,255,255,0.05)" stroke="%23e5a93b" stroke-width="1.5"/><text x="40" y="95" fill="%23fff" font-family="'Outfit', sans-serif" font-size="11">🐕</text><text x="75" y="95" fill="%23fff" font-family="'Outfit', sans-serif" font-weight="bold" font-size="11">NEW FOLLOWER:</text><text x="175" y="95" fill="%23e5a93b" font-family="'Outfit', sans-serif" font-weight="bold" font-size="11">TailWagger 🐾</text></svg>`,
    events: [
      { id: "newFollower", label: "Follow Alert", listener: "follower-latest", data: { name: "HappyBarker" } },
      { id: "newSub", label: "Sub Alert", listener: "subscriber-latest", data: { name: "CushionSitter" } },
      { id: "newTip", label: "Tip Alert ($5.00)", listener: "tip-latest", data: { name: "TreatMaster", amount: "$5.00" } }
    ]
  }
];
