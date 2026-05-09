const authScreen = document.querySelector("#authScreen");
const startScreen = document.querySelector("#startScreen");
const battleScreen = document.querySelector("#battleScreen");
const showSigninButton = document.querySelector("#showSigninButton");
const showSignupButton = document.querySelector("#showSignupButton");
const signinForm = document.querySelector("#signinForm");
const signupForm = document.querySelector("#signupForm");
const loginInput = document.querySelector("#loginInput");
const usernameInput = document.querySelector("#usernameInput");
const emailInput = document.querySelector("#emailInput");
const passwordInput = document.querySelector("#passwordInput");
const signinPasswordInput = document.querySelector("#signinPasswordInput");
const signinButton = document.querySelector("#signinButton");
const signupButton = document.querySelector("#signupButton");
const guestButton = document.querySelector("#guestButton");
const guestButtonSignup = document.querySelector("#guestButtonSignup");
const authMessage = document.querySelector("#authMessage");
const playerName = document.querySelector("#playerName");
const playerLevel = document.querySelector("#playerLevel");
const signoutButton = document.querySelector("#signoutButton");
const adminToggleButton = document.querySelector("#adminToggleButton");
const notesInput = document.querySelector("#notesInput");
const fileInput = document.querySelector("#fileInput");
const demoButton = document.querySelector("#demoButton");
const openShopButton = document.querySelector("#openShopButton");
const openAvatarShopButton = document.querySelector("#openAvatarShopButton");
const multiplayerButton = document.querySelector("#multiplayerButton");
const multiplayerPanel = document.querySelector("#multiplayerPanel");
const showHostButton = document.querySelector("#showHostButton");
const showJoinButton = document.querySelector("#showJoinButton");
const hostPanel = document.querySelector("#hostPanel");
const joinPanel = document.querySelector("#joinPanel");
const multiQuestionCountInput = document.querySelector("#multiQuestionCountInput");
const multiPlayerHpInput = document.querySelector("#multiPlayerHpInput");
const multiBossHpInput = document.querySelector("#multiBossHpInput");
const hostRoomButton = document.querySelector("#hostRoomButton");
const roomCodeInput = document.querySelector("#roomCodeInput");
const joinRoomButton = document.querySelector("#joinRoomButton");
const multiplayerMessage = document.querySelector("#multiplayerMessage");
const homeShopPanel = document.querySelector("#homeShopPanel");
const homeShopCopy = document.querySelector("#homeShopCopy");
const homeShopItems = document.querySelector("#homeShopItems");
const avatarShopPanel = document.querySelector("#avatarShopPanel");
const avatarShopCopy = document.querySelector("#avatarShopCopy");
const avatarShopItems = document.querySelector("#avatarShopItems");
const miniAvatar = document.querySelector("#miniAvatar");
const avatarDisplay = document.querySelector("#avatarDisplay");
const avatarColorOptions = document.querySelector("#avatarColorOptions");
const avatarClassOptions = document.querySelector("#avatarClassOptions");
const adminPanel = document.querySelector("#adminPanel");
const adminAddCoinsButton = document.querySelector("#adminAddCoinsButton");
const adminMaxDamageButton = document.querySelector("#adminMaxDamageButton");
const adminFillDemoButton = document.querySelector("#adminFillDemoButton");
const adminResetButton = document.querySelector("#adminResetButton");
const adminMessage = document.querySelector("#adminMessage");
const summonButton = document.querySelector("#summonButton");
const battleSetupPanel = document.querySelector("#battleSetupPanel");
const questionCountInput = document.querySelector("#questionCountInput");
const playerHpInput = document.querySelector("#playerHpInput");
const bossHpInput = document.querySelector("#bossHpInput");
const startBattleButton = document.querySelector("#startBattleButton");
const errorMessage = document.querySelector("#errorMessage");
const backButton = document.querySelector("#backButton");
const bossName = document.querySelector("#bossName");
const bossTitle = document.querySelector("#bossTitle");
const healthText = document.querySelector("#healthText");
const healthFill = document.querySelector("#healthFill");
const playerHealthText = document.querySelector("#playerHealthText");
const playerHealthDetail = document.querySelector("#playerHealthDetail");
const playerHealthFill = document.querySelector("#playerHealthFill");
const roundText = document.querySelector("#roundText");
const topicText = document.querySelector("#topicText");
const battleBanner = document.querySelector("#battleBanner");
const questionText = document.querySelector("#questionText");
const answerOptions = document.querySelector("#answerOptions");
const typedAnswer = document.querySelector("#typedAnswer");
const submitButton = document.querySelector("#submitButton");
const nextButton = document.querySelector("#nextButton");
const hintButton = document.querySelector("#hintButton");
const feedbackText = document.querySelector("#feedbackText");
const multiplayerRoomPanel = document.querySelector("#multiplayerRoomPanel");
const roomCodeText = document.querySelector("#roomCodeText");
const roomPlayers = document.querySelector("#roomPlayers");
const chatLog = document.querySelector("#chatLog");
const chatInput = document.querySelector("#chatInput");
const sendChatButton = document.querySelector("#sendChatButton");
const damagePop = document.querySelector("#damagePop");
const attackPop = document.querySelector("#attackPop");
const bossSprite = document.querySelector("#bossSprite");
const heroSprite = document.querySelector("#heroSprite");
const partyLineup = document.querySelector("#partyLineup");
const devBattleControls = document.querySelector("#devBattleControls");
const devCorrectButton = document.querySelector("#devCorrectButton");
const devWrongButton = document.querySelector("#devWrongButton");
const xpValue = document.querySelector("#xpValue");
const coinValue = document.querySelector("#coinValue");
const resultsPanel = document.querySelector("#resultsPanel");
const resultTitle = document.querySelector("#resultTitle");
const resultCopy = document.querySelector("#resultCopy");
const weakList = document.querySelector("#weakList");
const earnedCoins = document.querySelector("#earnedCoins");
const boostValue = document.querySelector("#boostValue");
const shopCopy = document.querySelector("#shopCopy");
const resultShopItems = document.querySelector("#resultShopItems");
const rematchButton = document.querySelector("#rematchButton");

const demoNotes = `Photosynthesis is the process plants use to turn sunlight, carbon dioxide, and water into glucose and oxygen.
The chloroplast is the part of a plant cell where photosynthesis happens.
Chlorophyll is a green pigment that absorbs light energy.
The light dependent reactions happen in the thylakoid membrane and produce ATP and NADPH.
The Calvin cycle uses carbon dioxide, ATP, and NADPH to make glucose.
Cellular respiration breaks down glucose to release energy stored as ATP.
Mitochondria are the organelles where most cellular respiration happens.`;

const defaultAvatar = { color: "#52d1a8", heroClass: "knight", accessory: "none" };
const freeAvatarColors = ["#52d1a8", "#2d8cff", "#f5c451", "#ff5f6d", "#b987ff", "#ff8f3d", "#ffffff", "#111111"];
const avatarClasses = ["knight", "mage", "rogue", "tank"];
const avatarAccessories = ["none", "crown", "headband", "star", "wizardHat", "halo", "visor", "laurel", "spark"];

let game = {
  boss: "",
  questions: [],
  current: 0,
  maxHealth: 100,
  health: 100,
  maxPlayerHealth: 100,
  playerHealth: 100,
  xp: 0,
  selectedAnswer: "",
  locked: false,
  misses: []
};

const allowLocalAccountFallback = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);
let activeProfile = localStorage.getItem("studyBossActiveProfile") || "";
let player = loadPlayer(activeProfile);
let serverBackedProfile = Boolean(activeProfile && activeProfile !== "guest" && !allowLocalAccountFallback);
let pendingNotes = "";
let multiplayerState = {
  active: false,
  isHost: false,
  code: "",
  playerId: "",
  pollTimer: null,
  current: -1,
  status: "",
};

const stopwords = new Set([
  "the", "and", "that", "this", "with", "from", "into", "where", "when", "what",
  "which", "their", "there", "because", "about", "would", "could", "should",
  "have", "has", "are", "was", "were", "they", "them", "then", "than", "for",
  "use", "uses", "used", "using", "your", "you", "can", "will", "more", "most"
]);

function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function profileKey(username) {
  return username ? `studyBossPlayer:${username}` : "studyBossPlayer:guest";
}

function accountKey(username) {
  return `studyBossAccount:${username.toLowerCase()}`;
}

function loadPlayer(username) {
  try {
    const legacy = JSON.parse(localStorage.getItem("studyBossPlayer") || "{}");
    const saved = JSON.parse(localStorage.getItem(profileKey(username)) || "{}");
    return {
      username: username || "Guest",
      xp: Number(saved.xp ?? legacy.xp) || 0,
      coins: Number(saved.coins ?? legacy.coins) || 0,
      damageBoost: Number(saved.damageBoost ?? legacy.damageBoost) || 0,
      coinBoost: Number(saved.coinBoost ?? legacy.coinBoost) || 0,
      shieldBoost: Number(saved.shieldBoost ?? legacy.shieldBoost) || 0,
      bossesDefeated: Number(saved.bossesDefeated) || 0,
      avatar: { ...defaultAvatar, ...(saved.avatar || legacy.avatar || {}) },
      unlockedAvatarColors: saved.unlockedAvatarColors || legacy.unlockedAvatarColors || [...freeAvatarColors],
      unlockedAccessories: saved.unlockedAccessories || legacy.unlockedAccessories || ["none"]
    };
  } catch {
    return {
      username: username || "Guest",
      xp: 0,
      coins: 0,
      damageBoost: 0,
      coinBoost: 0,
      shieldBoost: 0,
      bossesDefeated: 0,
      avatar: { ...defaultAvatar },
      unlockedAvatarColors: [...freeAvatarColors],
      unlockedAccessories: ["none"]
    };
  }
}

function savePlayer() {
  localStorage.setItem(profileKey(activeProfile), JSON.stringify(player));
  const shouldSaveToServer = activeProfile && activeProfile !== "guest" && (serverBackedProfile || !allowLocalAccountFallback);
  if (shouldSaveToServer) {
    fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: activeProfile, player })
    }).then((response) => {
      if (!response.ok) {
        console.warn("Study Boss save failed", response.status);
      }
    }).catch(() => {
      console.warn("Study Boss could not reach the save server.");
      localStorage.setItem(profileKey(activeProfile), JSON.stringify(player));
    });
  }
}

async function hashPassword(password, username) {
  const salted = `${username.toLowerCase()}:study-boss:${password}`;
  if (!window.crypto?.subtle) {
    return btoa(salted);
  }
  const data = new TextEncoder().encode(salted);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function showStartScreen() {
  stopMultiplayerPolling();
  playerName.textContent = player.username;
  authScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  battleScreen.classList.add("hidden");
  multiplayerRoomPanel.classList.add("hidden");
  partyLineup.classList.add("hidden");
  updatePlayerHud();
}

function showAuthScreen(message = "") {
  stopMultiplayerPolling();
  authMessage.textContent = message;
  authScreen.classList.remove("hidden");
  startScreen.classList.add("hidden");
  battleScreen.classList.add("hidden");
  multiplayerRoomPanel.classList.add("hidden");
  partyLineup.classList.add("hidden");
}

function setAuthMode(mode) {
  const signup = mode === "signup";
  signupForm.classList.toggle("hidden", !signup);
  signinForm.classList.toggle("hidden", signup);
  showSignupButton.classList.toggle("active", signup);
  showSigninButton.classList.toggle("active", !signup);
  authMessage.textContent = "";
}

async function signIn() {
  const login = cleanText(loginInput.value);
  const password = signinPasswordInput.value;
  if (login.length < 3) {
    authMessage.textContent = "Enter your username or email.";
    return;
  }
  if (password.length < 4) {
    authMessage.textContent = "Enter your password.";
    return;
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });
    const result = await response.json();
    if (!result.ok) {
      authMessage.textContent = result.error || "Could not sign in.";
      return;
    }
    activeProfile = result.player.username;
    serverBackedProfile = true;
    localStorage.setItem("studyBossActiveProfile", activeProfile);
    player = result.player;
    localStorage.setItem(profileKey(activeProfile), JSON.stringify(player));
    signinPasswordInput.value = "";
    showStartScreen();
  } catch {
    if (!allowLocalAccountFallback) {
      authMessage.textContent = "Could not reach the account server. Try again in a minute.";
      return;
    }
    const key = accountKey(login);
    const existing = JSON.parse(localStorage.getItem(key) || "null");
    if (!existing) {
      authMessage.textContent = "No local account found. Start the server or sign up first.";
      return;
    }
    const passwordHash = await hashPassword(password, existing.username || login);
    if (existing.passwordHash !== passwordHash) {
      authMessage.textContent = "Password did not match.";
      return;
    }

    activeProfile = existing.username || login;
    serverBackedProfile = false;
    localStorage.setItem("studyBossActiveProfile", activeProfile);
    player = loadPlayer(activeProfile);
    player.username = activeProfile;
    savePlayer();
    signinPasswordInput.value = "";
    showStartScreen();
  }
}

async function signUp() {
  const username = cleanText(usernameInput.value).replace(/\s+/g, "-");
  const email = cleanText(emailInput.value);
  const password = passwordInput.value;
  if (username.length < 3) {
    authMessage.textContent = "Pick a username with at least 3 characters.";
    return;
  }
  if (password.length < 4) {
    authMessage.textContent = "Use at least 4 characters for the password.";
    return;
  }

  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const result = await response.json();
    if (!result.ok) {
      authMessage.textContent = result.error || "Could not sign up.";
      return;
    }
    activeProfile = result.player.username;
    serverBackedProfile = true;
    localStorage.setItem("studyBossActiveProfile", activeProfile);
    player = result.player;
    localStorage.setItem(profileKey(activeProfile), JSON.stringify(player));
    passwordInput.value = "";
    showStartScreen();
  } catch {
    if (!allowLocalAccountFallback) {
      authMessage.textContent = "Could not reach the account server. Try again in a minute.";
      return;
    }
    const key = accountKey(username);
    if (localStorage.getItem(key)) {
      authMessage.textContent = "That username already exists locally. Sign in instead.";
      return;
    }
    const passwordHash = await hashPassword(password, username);
    localStorage.setItem(key, JSON.stringify({ username, email, passwordHash, createdAt: Date.now() }));
    activeProfile = username;
    serverBackedProfile = false;
    localStorage.setItem("studyBossActiveProfile", activeProfile);
    player = loadPlayer(activeProfile);
    player.username = username;
    savePlayer();
    passwordInput.value = "";
    showStartScreen();
  }
}

function playAsGuest() {
  activeProfile = "guest";
  serverBackedProfile = false;
  localStorage.setItem("studyBossActiveProfile", activeProfile);
  player = loadPlayer(activeProfile);
  player.username = "Guest";
  savePlayer();
  showStartScreen();
}

function signOut() {
  localStorage.removeItem("studyBossActiveProfile");
  activeProfile = "";
  serverBackedProfile = false;
  player = loadPlayer(activeProfile);
  usernameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
  loginInput.value = "";
  signinPasswordInput.value = "";
  showAuthScreen("Signed out. Your saved heroes are still on this browser.");
}

const shopItems = [
  {
    id: "damageBoost",
    name: "Recall Blade",
    description: "+5 damage on every attack.",
    levelText: (value) => `Damage +${value}`,
    cost: (value) => 30 + value * 6,
    buy: () => {
      player.damageBoost += 5;
    }
  },
  {
    id: "shieldBoost",
    name: "Block Charm",
    description: "Boss attacks deal 2 less damage.",
    levelText: (value) => `Block -${value}`,
    cost: (value) => 40 + value * 12,
    buy: () => {
      player.shieldBoost += 2;
    }
  },
  {
    id: "coinBoost",
    name: "Lucky Pouch",
    description: "+10% coin rewards per level.",
    levelText: (value) => `Coins +${value * 10}%`,
    cost: (value) => 45 + value * 30,
    buy: () => {
      player.coinBoost += 1;
    }
  }
];

const avatarStoreItems = [
  { type: "accessory", id: "none", name: "No Accessory", description: "Keep your avatar clean and simple.", cost: 0 },
  { type: "accessory", id: "crown", name: "Crown", description: "A golden crown for your hero.", cost: 75 },
  { type: "accessory", id: "headband", name: "Headband", description: "A battle headband.", cost: 45 },
  { type: "accessory", id: "star", name: "Star Pin", description: "A bright star accessory.", cost: 55 },
  { type: "accessory", id: "wizardHat", name: "Wizard Hat", description: "A tall study-mage hat.", cost: 80 },
  { type: "accessory", id: "halo", name: "Halo", description: "A glowing ring for perfect recall.", cost: 90 },
  { type: "accessory", id: "visor", name: "Battle Visor", description: "A sharp visor for boss fights.", cost: 65 },
  { type: "accessory", id: "laurel", name: "Laurel", description: "Champion leaves for win streaks.", cost: 70 },
  { type: "accessory", id: "spark", name: "Spark Aura", description: "A little flash of answer power.", cost: 95 }
];

function levelForXp(xp) {
  return Math.floor((Number(xp) || 0) / 100) + 1;
}

function xpForNextLevel(xp) {
  return levelForXp(xp) * 100 - (Number(xp) || 0);
}

function upgradeCost(item) {
  return item.cost(Number(player[item.id]) || 0);
}

function updatePlayerHud() {
  player.avatar = { ...defaultAvatar, ...(player.avatar || {}) };
  playerName.textContent = player.username || "Guest";
  playerLevel.textContent = `Level ${levelForXp(player.xp)}`;
  coinValue.textContent = String(player.coins);
  boostValue.textContent = `+${player.damageBoost}`;
  const cheapestUpgrade = Math.min(...shopItems.map((item) => upgradeCost(item)));
  shopCopy.textContent = player.coins < cheapestUpgrade
    ? `You have ${player.coins} coins and ${player.bossesDefeated} boss wins. Beat bosses to afford the next upgrade.`
    : `You have ${player.coins} coins. Choose an upgrade for your next fight.`;
  homeShopCopy.textContent = shopCopy.textContent;
  renderShopItems(homeShopItems);
  renderShopItems(resultShopItems);
  renderAvatarShopItems();
  adminToggleButton.classList.toggle("hidden", !isOwner());
  if (!isOwner()) {
    adminPanel.classList.add("hidden");
  }
  devBattleControls.classList.toggle("hidden", !isOwner());
  renderAvatar();
}

function renderShopItems(container) {
  container.innerHTML = "";
  shopItems.forEach((item) => {
    const value = Number(player[item.id]) || 0;
    const cost = upgradeCost(item);
    const card = document.createElement("div");
    card.className = "shop-item";

    const title = document.createElement("strong");
    title.textContent = item.name;
    const level = document.createElement("span");
    level.textContent = item.levelText(value);
    const description = document.createElement("p");
    description.textContent = item.description;
    const button = document.createElement("button");
    button.className = "secondary-button";
    button.type = "button";
    button.textContent = `Buy (${cost})`;
    button.disabled = player.coins < cost;
    button.addEventListener("click", () => buyUpgrade(item));

    card.append(title, level, description, button);
    container.append(card);
  });
}

function renderAvatarShopItems() {
  avatarShopItems.innerHTML = "";
  avatarShopCopy.textContent = `Accessories only. Colors stay free in the avatar editor. Level ${levelForXp(player.xp)}. ${xpForNextLevel(player.xp)} XP to next level.`;
  avatarStoreItems.forEach((item) => {
    const unlocked = player.unlockedAccessories.includes(item.id);
    const card = document.createElement("div");
    card.className = "shop-item";

    const title = document.createElement("strong");
    title.textContent = item.name;
    const detail = document.createElement("span");
    detail.textContent = unlocked ? "Unlocked" : `${item.cost} coins`;
    const description = document.createElement("p");
    description.textContent = item.description;
    const button = document.createElement("button");
    button.className = "secondary-button";
    button.type = "button";
    button.textContent = unlocked ? "Use" : `Buy (${item.cost})`;
    button.disabled = !unlocked && player.coins < item.cost;
    button.addEventListener("click", () => handleAvatarShopItem(item, unlocked));

    card.append(title, detail, description, button);
    avatarShopItems.append(card);
  });
}

function handleAvatarShopItem(item, unlocked) {
  if (!unlocked) {
    if (player.coins < item.cost) return;
    player.coins -= item.cost;
    player.unlockedAccessories.push(item.id);
  }
  player.avatar = { ...defaultAvatar, ...(player.avatar || {}), accessory: item.id };
  savePlayer();
  updatePlayerHud();
}

function isOwner() {
  return (player.username || "").toLowerCase() === "owner";
}

function renderAvatar() {
  const avatar = { ...defaultAvatar, ...(player.avatar || {}) };
  [miniAvatar, avatarDisplay, heroSprite].forEach((element) => {
    applyAvatarClasses(element, avatar);
  });

  avatarColorOptions.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.color === avatar.color);
  });
  avatarClassOptions.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.heroClass === avatar.heroClass);
  });
}

function buildAvatarOptions() {
  freeAvatarColors.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "avatar-option avatar-swatch";
    button.dataset.color = color;
    button.style.setProperty("--swatch", color);
    button.title = color;
    button.addEventListener("click", () => {
      player.avatar = { ...defaultAvatar, ...(player.avatar || {}), color };
      savePlayer();
      renderAvatar();
    });
    avatarColorOptions.append(button);
  });

  avatarClasses.forEach((heroClass) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "avatar-option";
    button.dataset.heroClass = heroClass;
    button.textContent = titleCase(heroClass);
    button.addEventListener("click", () => {
      player.avatar = { ...defaultAvatar, ...(player.avatar || {}), heroClass };
      savePlayer();
      renderAvatar();
    });
    avatarClassOptions.append(button);
  });
}

function buyUpgrade(item) {
  const cost = upgradeCost(item);
  if (player.coins < cost) return;
  player.coins -= cost;
  item.buy();
  savePlayer();
  updatePlayerHud();
}

function setAdminMessage(message) {
  adminMessage.textContent = message;
  window.clearTimeout(setAdminMessage.timer);
  setAdminMessage.timer = window.setTimeout(() => {
    adminMessage.textContent = "";
  }, 2200);
}

function requireOwner() {
  if (isOwner()) return true;
  adminPanel.classList.add("hidden");
  return false;
}

function splitSentences(text) {
  return cleanText(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 28);
}

function importantWords(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopwords.has(word));

  const counts = new Map();
  words.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([word]) => word);
}

function titleCase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function makeBossName(words) {
  const core = words[0] ? titleCase(words[0]) : "Homework";
  const forms = ["Wyrm", "Colossus", "Specter", "Titan", "Golem", "Hydra"];
  const form = forms[Math.floor(Math.random() * forms.length)];
  return `The ${core} ${form}`;
}

function pickAnswer(sentence) {
  const phrases = sentence.match(/\b[A-Z][a-z]+(?:\s+[A-Z]?[a-z]+){0,2}\b/g) || [];
  const candidates = [
    ...phrases,
    ...importantWords(sentence).slice(0, 4)
  ].filter((item) => item && item.length > 3);

  return candidates.sort((a, b) => b.length - a.length)[0] || sentence.split(" ")[0];
}

function tidyAnswer(text) {
  return cleanText(text)
    .replace(/^[,.;:\s]+|[,.;:\s]+$/g, "")
    .replace(/\.$/, "");
}

function shortAnswer(text, maxWords = 10) {
  const words = tidyAnswer(text).split(/\s+/);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(" ")}...` : words.join(" ");
}

function formatSubject(text) {
  return tidyAnswer(text).replace(/^the\s+/i, "");
}

function extractFact(sentence) {
  const text = tidyAnswer(sentence);
  const patterns = [
    {
      kind: "location",
      regex: /^(.+?)\s+(?:happens|occurs|takes place)\s+(?:in|inside|at|on)\s+(.+?)\s+and\s+(?:produces|produce|creates|create|makes|make)\s+(.+)$/i,
      prompt: (subject) => `Where should ${subject} go in your mental map of the notes?`,
      answerPart: 2
    },
    {
      kind: "definition",
      regex: /^(.+?)\s+(?:is|are|means|refers to)\s+(.+)$/i,
      prompt: (subject) => `Which answer best explains ${subject}?`
    },
    {
      kind: "location",
      regex: /^(.+?)\s+(?:happens|occurs|takes place|is found|are found)\s+(?:in|inside|at|on)\s+(.+)$/i,
      prompt: (subject) => `Where do your notes place ${subject}?`
    },
    {
      kind: "function",
      regex: /^(.+?)\s+(?:uses|use)\s+(.+?)\s+to\s+(.+)$/i,
      prompt: (subject, object) => `What job is ${subject} doing with ${object}?`
    },
    {
      kind: "output",
      regex: /^(.+?)\s+(?:produces|produce|creates|create|makes|make)\s+(.+)$/i,
      prompt: (subject) => `What comes out of ${subject}?`
    },
    {
      kind: "purpose",
      regex: /^(.+?)\s+(?:breaks down|converts|turns)\s+(.+?)\s+(?:to|into)\s+(.+)$/i,
      prompt: (subject, object) => `What is ${subject} trying to get from ${object}?`
    }
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern.regex);
    if (!match) continue;
    const subject = formatSubject(match[1]);
    const object = tidyAnswer(match[2] || "");
    const answer = tidyAnswer(match[pattern.answerPart || 3] || match[2]);
    if (subject.length > 2 && answer.length > 2) {
      return {
        kind: pattern.kind,
        subject,
        answer: shortAnswer(answer, 12),
        prompt: pattern.prompt(subject, object),
        source: text
      };
    }
  }

  const answer = pickAnswer(text);
  return {
    kind: "recall",
    subject: answer,
    answer: text,
    prompt: `In your own words, what should you remember about ${answer}?`,
    source: text
  };
}

function makeDistractors(answer, allFacts, allWords, index) {
  const answerKey = normalize(answer);
  const factAnswers = allFacts
    .map((fact) => shortAnswer(fact.answer, 8))
    .filter((item) => normalize(item) !== answerKey);
  const wordAnswers = allWords
    .map(titleCase)
    .filter((item) => normalize(item) !== answerKey);
  return shuffle([...factAnswers, ...wordAnswers, "None of these"]).slice(index % 3, index % 3 + 3);
}

function makeTrueFalseQuestion(fact, allFacts, index) {
  const replacement = allFacts.find((item) => normalize(item.answer) !== normalize(fact.answer));
  const useTrap = Boolean(replacement) && index % 2 === 1;
  const statementAnswer = useTrap ? replacement.answer : fact.answer;
  return {
    type: "choice",
    prompt: `Quick check: do your notes support this? ${fact.subject} -> "${statementAnswer}".`,
    answer: useTrap ? "False" : "True",
    options: ["True", "False"],
    source: fact.source,
    hint: `Check the original idea about ${fact.subject}.`,
    topic: titleCase(importantWords(`${fact.subject} ${fact.answer}`)[0] || fact.subject)
  };
}

function makeFactQuestion(fact, allFacts, allWords, index) {
  const options = shuffle([
    fact.answer,
    ...makeDistractors(fact.answer, allFacts, allWords, index)
  ]).slice(0, 4);

  return {
    type: "choice",
    prompt: fact.prompt,
    answer: fact.answer,
    options: options.length >= 2 ? options : [fact.answer, "A process", "A location", "A result"],
    source: fact.source,
    hint: `Think about ${fact.subject}.`,
    topic: titleCase(importantWords(`${fact.subject} ${fact.answer}`)[0] || fact.subject)
  };
}

function makeReverseQuestion(fact, allFacts, allWords, index) {
  const prompt = `This clue points to which topic? "${fact.answer}"`;
  const options = shuffle([
    fact.subject,
    ...allFacts
      .map((item) => item.subject)
      .filter((subject) => normalize(subject) !== normalize(fact.subject)),
    ...allWords.map(titleCase)
  ]).slice(0, 4);

  return {
    type: "choice",
    prompt,
    answer: fact.subject,
    options: options.length >= 2 ? options : [fact.subject, "A process", "A location", "A result"],
    source: fact.source,
    hint: `Match the clue back to the right term.`,
    topic: titleCase(importantWords(`${fact.subject} ${fact.answer}`)[0] || fact.subject)
  };
}

function makeApplicationQuestion(fact) {
  return {
    type: "typed",
    prompt: `Explain ${fact.subject} in your own words. What should you remember?`,
    answer: fact.answer,
    source: fact.source,
    hint: `Use the idea: ${fact.answer}`,
    topic: titleCase(importantWords(`${fact.subject} ${fact.answer}`)[0] || fact.subject)
  };
}

function makeQuestion(fact, allFacts, allWords, index) {
  const cycle = index % 5;
  if (cycle === 3) {
    return makeTrueFalseQuestion(fact, allFacts, index);
  }

  if (cycle === 4) {
    return makeReverseQuestion(fact, allFacts, allWords, index);
  }

  if (fact.kind === "recall" || cycle === 2) {
    return {
      type: "typed",
      prompt: fact.kind === "recall" ? fact.prompt : `No copying from the notes: ${fact.prompt}`,
      answer: fact.answer,
      source: fact.source,
      hint: `Think about ${fact.subject}.`,
      topic: titleCase(importantWords(`${fact.subject} ${fact.answer}`)[0] || fact.subject)
    };
  }

  if (cycle === 1) {
    return makeApplicationQuestion(fact);
  }

  return makeFactQuestion(fact, allFacts, allWords, index);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function readNumber(input, fallback, min, max) {
  const value = Number.parseInt(input.value, 10);
  if (Number.isNaN(value)) return fallback;
  if (max === Infinity) return Math.max(min, value);
  return Math.min(max, Math.max(min, value));
}

function buildQuestions(notes, count = 15) {
  const sentences = splitSentences(notes);
  const words = importantWords(notes);
  const source = sentences.length ? sentences : [cleanText(notes)];
  const facts = source.map(extractFact);
  const questions = [];
  const usedPrompts = new Set();
  for (let pass = 0; questions.length < count && pass < 5; pass += 1) {
    facts.forEach((fact, factIndex) => {
      if (questions.length >= count) return;
      const index = pass * facts.length + factIndex;
      const question = makeQuestion(fact, facts, words, index);
      const key = normalize(`${question.prompt} ${question.answer}`);
      if (usedPrompts.has(key)) return;
      usedPrompts.add(key);
      questions.push(question);
    });
  }
  return questions;
}

async function buildQuestionsWithAi(notes, count) {
  const response = await fetch("/api/generate-questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes, count })
  });
  if (!response.ok) {
    throw new Error("AI question generation failed.");
  }
  const result = await response.json();
  if (!result.ok || !Array.isArray(result.questions)) {
    throw new Error("AI returned an invalid quiz.");
  }
  return result.questions;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Request failed.");
  }
  return result;
}

function setMultiplayerMode(mode) {
  const hosting = mode === "host";
  hostPanel.classList.toggle("hidden", !hosting);
  joinPanel.classList.toggle("hidden", hosting);
  showHostButton.classList.toggle("active", hosting);
  showJoinButton.classList.toggle("active", !hosting);
  multiplayerMessage.textContent = "";
}

function playerDisplayName() {
  return player.username && player.username !== "Guest" ? player.username : "Guest";
}

function currentAvatar() {
  return { ...defaultAvatar, ...(player.avatar || {}) };
}

function applyAvatarClasses(element, avatar) {
  const cleanAvatar = { ...defaultAvatar, ...(avatar || {}) };
  const darkAvatar = normalize(cleanAvatar.color) === "111111";
  element.style.setProperty("--avatar-color", cleanAvatar.color);
  element.classList.toggle("dark-avatar", darkAvatar);
  element.classList.remove(...avatarClasses);
  element.classList.remove(...avatarAccessories);
  element.classList.add(cleanAvatar.heroClass);
  element.classList.add(cleanAvatar.accessory);
}

function stopMultiplayerPolling() {
  if (multiplayerState.pollTimer) {
    window.clearInterval(multiplayerState.pollTimer);
  }
  multiplayerState = {
    active: false,
    isHost: false,
    code: "",
    playerId: "",
    pollTimer: null,
    current: -1,
    status: "",
  };
}

async function hostMultiplayerRoom() {
  const notes = cleanText(notesInput.value);
  if (notes.length < 80) {
    multiplayerMessage.textContent = "Add notes first so the raid boss can be generated.";
    return;
  }
  hostRoomButton.disabled = true;
  hostRoomButton.textContent = "Creating room...";
  try {
    const result = await postJson("/api/multiplayer/host", {
      name: playerDisplayName(),
      avatar: currentAvatar(),
      notes,
      count: readNumber(multiQuestionCountInput, 15, 1, 40),
      playerHp: readNumber(multiPlayerHpInput, 100, 1, Infinity),
      bossHp: readNumber(multiBossHpInput, 600, 1, 20000),
    });
    enterMultiplayerRoom(result.room);
  } catch (error) {
    multiplayerMessage.textContent = error.message || "Could not host a room.";
  } finally {
    hostRoomButton.disabled = false;
    hostRoomButton.textContent = "Host Room";
  }
}

async function joinMultiplayerRoom() {
  const code = cleanText(roomCodeInput.value).toUpperCase();
  if (code.length < 4) {
    multiplayerMessage.textContent = "Enter the room code.";
    return;
  }
  joinRoomButton.disabled = true;
  joinRoomButton.textContent = "Joining...";
  try {
    const result = await postJson("/api/multiplayer/join", {
      code,
      name: playerDisplayName(),
      avatar: currentAvatar(),
    });
    enterMultiplayerRoom(result.room);
  } catch (error) {
    multiplayerMessage.textContent = error.message || "Could not join that room.";
  } finally {
    joinRoomButton.disabled = false;
    joinRoomButton.textContent = "Join Room";
  }
}

function enterMultiplayerRoom(room) {
  stopMultiplayerPolling();
  multiplayerState.active = true;
  multiplayerState.isHost = room.isHost;
  multiplayerState.code = room.code;
  multiplayerState.playerId = room.playerId;
  multiplayerState.current = -1;
  multiplayerState.status = room.status;
  startScreen.classList.add("hidden");
  battleScreen.classList.remove("hidden");
  resultsPanel.classList.add("hidden");
  document.querySelector(".battle-grid").classList.remove("hidden");
  multiplayerRoomPanel.classList.remove("hidden");
  partyLineup.classList.remove("hidden");
  heroSprite.classList.add("hidden");
  updateMultiplayerRoom(room);
  multiplayerState.pollTimer = window.setInterval(pollMultiplayerRoom, 1800);
}

async function pollMultiplayerRoom() {
  if (!multiplayerState.active) return;
  try {
    const result = await postJson("/api/multiplayer/state", {
      code: multiplayerState.code,
      playerId: multiplayerState.playerId,
    });
    updateMultiplayerRoom(result.room);
  } catch (error) {
    battleBanner.textContent = error.message || "Lost connection to the room.";
    stopMultiplayerPolling();
  }
}

function updateMultiplayerRoom(room) {
  multiplayerState.isHost = room.isHost;
  multiplayerState.status = room.status;
  roomCodeText.textContent = room.code;
  game.boss = room.boss;
  game.questions = room.question ? [room.question] : [];
  game.current = 0;
  game.maxHealth = room.maxHealth;
  game.health = room.health;
  const me = room.players.find((item) => item.id === room.playerId) || room.players[0] || { hp: 0, maxHp: 1 };
  game.maxPlayerHealth = me.maxHp;
  game.playerHealth = me.hp;
  bossName.textContent = room.boss;
  bossTitle.textContent = room.boss;
  xpValue.textContent = "Co-op";
  coinValue.textContent = room.players.length;
  renderMultiplayerPlayers(room.players);
  renderPartyLineup(room.players, room.playerId);
  renderMultiplayerChat(room.chat);
  if (room.status !== "battle") {
    questionText.textContent = room.status === "won" ? "Raid boss defeated." : room.status === "lost" ? "Your team was knocked back." : "The boss escaped.";
    answerOptions.innerHTML = "";
    typedAnswer.classList.add("hidden");
    submitButton.classList.add("hidden");
    nextButton.classList.add("hidden");
    hintButton.disabled = true;
    battleBanner.textContent = room.status === "won" ? "Victory. Your team won the raid." : "The co-op battle is over.";
    feedbackText.textContent = room.lastFeedback || "";
    updateHealth();
    return;
  }
  const changedQuestion = multiplayerState.current !== room.current;
  multiplayerState.current = room.current;
  if (changedQuestion) {
    renderQuestion();
  } else {
    updateHealth();
  }
  roundText.textContent = `Raid question ${room.current + 1} of ${room.questionCount}`;
  battleBanner.textContent = room.lastFeedback || "Work together. Any teammate can attack.";
  nextButton.classList.add("hidden");
}

function renderPartyLineup(players, currentPlayerId) {
  partyLineup.innerHTML = "";
  partyLineup.classList.toggle("hidden", !multiplayerState.active);
  players.slice(0, 6).forEach((roomPlayer) => {
    const card = document.createElement("div");
    card.className = "party-member";
    if (roomPlayer.id === currentPlayerId) {
      card.classList.add("current");
    }
    if (roomPlayer.hp <= 0) {
      card.classList.add("down");
    }

    const name = document.createElement("span");
    name.className = "party-name";
    name.textContent = roomPlayer.name;

    const avatar = document.createElement("div");
    avatar.className = "party-avatar";
    avatar.innerHTML = `
      <div class="avatar-accessory"></div>
      <div class="avatar-head">
        <div class="hero-eye hero-eye-a"></div>
        <div class="hero-eye hero-eye-b"></div>
        <div class="hero-mouth"></div>
      </div>
      <div class="avatar-body"></div>
      <div class="hero-sword"></div>
    `;
    applyAvatarClasses(avatar, roomPlayer.avatar);

    const hp = document.createElement("strong");
    hp.className = "party-hp";
    hp.textContent = `${roomPlayer.hp}/${roomPlayer.maxHp}`;
    card.append(name, avatar, hp);
    partyLineup.append(card);
  });
}

function renderMultiplayerPlayers(players) {
  roomPlayers.innerHTML = "";
  players.forEach((roomPlayer) => {
    const row = document.createElement("div");
    row.className = "room-player";
    const label = document.createElement("span");
    label.textContent = `${roomPlayer.name}${roomPlayer.isHost ? " (host)" : ""}`;
    const hp = document.createElement("strong");
    hp.textContent = `${roomPlayer.hp}/${roomPlayer.maxHp} HP`;
    row.append(label, hp);
    if (multiplayerState.isHost && !roomPlayer.isHost) {
      const kick = document.createElement("button");
      kick.className = "secondary-button danger-button";
      kick.type = "button";
      kick.textContent = "Kick";
      kick.addEventListener("click", () => kickMultiplayerPlayer(roomPlayer.id));
      row.append(kick);
    }
    roomPlayers.append(row);
  });
}

function renderMultiplayerChat(messages) {
  chatLog.innerHTML = "";
  messages.forEach((message) => {
    const line = document.createElement("div");
    line.className = message.system ? "chat-message system" : "chat-message";
    line.textContent = message.system ? message.text : `${message.sender}: ${message.text}`;
    chatLog.append(line);
  });
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function sendMultiplayerChat() {
  const message = cleanText(chatInput.value);
  if (!message || !multiplayerState.active) return;
  chatInput.value = "";
  const result = await postJson("/api/multiplayer/chat", {
    code: multiplayerState.code,
    playerId: multiplayerState.playerId,
    message,
  });
  updateMultiplayerRoom(result.room);
}

async function kickMultiplayerPlayer(targetId) {
  const result = await postJson("/api/multiplayer/kick", {
    code: multiplayerState.code,
    playerId: multiplayerState.playerId,
    targetId,
  });
  updateMultiplayerRoom(result.room);
}

async function submitMultiplayerAttack(question, userAnswer) {
  submitButton.disabled = true;
  submitButton.textContent = question.type === "typed" ? "AI grading..." : "Attack";
  try {
    const result = await postJson("/api/multiplayer/answer", {
      code: multiplayerState.code,
      playerId: multiplayerState.playerId,
      answer: userAnswer,
    });
    updateMultiplayerRoom(result.room);
  } catch (error) {
    feedbackText.textContent = error.message || "Could not attack in this room.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Attack";
  }
}

function prepareBattle() {
  const notes = cleanText(notesInput.value);
  if (notes.length < 80) {
    errorMessage.textContent = "Add a little more notes first so the boss has something to fight with.";
    return;
  }

  pendingNotes = notes;
  battleSetupPanel.classList.remove("hidden");
  errorMessage.textContent = "";
}

async function startBattle() {
  stopMultiplayerPolling();
  multiplayerRoomPanel.classList.add("hidden");
  partyLineup.classList.add("hidden");
  heroSprite.classList.remove("hidden");
  const notes = pendingNotes || cleanText(notesInput.value);
  const questionCount = readNumber(questionCountInput, 15, 1, 50);
  const playerHp = readNumber(playerHpInput, 100, 1, Infinity);
  const bossHp = readNumber(bossHpInput, 200, 1, 9999);
  startBattleButton.disabled = true;
  startBattleButton.textContent = "Building questions...";
  let questions;
  try {
    questions = await buildQuestionsWithAi(notes, questionCount);
    battleBanner.textContent = "A wild study boss appears. Choose your attack.";
  } catch (error) {
    errorMessage.textContent = "AI question generation could not finish. Check your API key or try again.";
    console.error(error);
    return;
  } finally {
    startBattleButton.disabled = false;
    startBattleButton.textContent = "Start Battle";
  }
  if (!questions.length) {
    errorMessage.textContent = "I could not find enough study facts. Try pasting complete sentences.";
    return;
  }

  const words = importantWords(notes);
  game = {
    boss: makeBossName(words),
    questions,
    current: 0,
    maxHealth: bossHp,
    health: bossHp,
    maxPlayerHealth: playerHp,
    playerHealth: playerHp,
    xp: 0,
    selectedAnswer: "",
    locked: false,
    misses: []
  };

  bossName.textContent = game.boss;
  bossTitle.textContent = game.boss;
  xpValue.textContent = "0";
  updatePlayerHud();
  errorMessage.textContent = "";
  battleSetupPanel.classList.add("hidden");
  startScreen.classList.add("hidden");
  battleScreen.classList.remove("hidden");
  resultsPanel.classList.add("hidden");
  renderQuestion();
}

function renderQuestion() {
  const question = game.questions[game.current];
  game.selectedAnswer = "";
  game.locked = false;
  feedbackText.textContent = "";
  answerOptions.innerHTML = "";
  typedAnswer.value = "";
  typedAnswer.classList.toggle("hidden", question.type !== "typed");
  nextButton.classList.add("hidden");
  submitButton.classList.remove("hidden");
  hintButton.disabled = false;

  roundText.textContent = `Round ${game.current + 1} of ${game.questions.length}`;
  topicText.textContent = question.topic;
  questionText.textContent = question.prompt;
  updateHealth();

  if (question.type === "choice") {
    question.options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "answer-option";
      button.type = "button";
      button.textContent = option;
      button.addEventListener("click", () => {
        if (game.locked) return;
        document.querySelectorAll(".answer-option").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
        game.selectedAnswer = option;
      });
      answerOptions.append(button);
    });
  }
}

function updateHealth() {
  healthText.textContent = `${Math.max(game.health, 0)} / ${game.maxHealth}`;
  healthFill.style.width = `${Math.max(0, (game.health / game.maxHealth) * 100)}%`;
  playerHealthText.textContent = String(Math.max(game.playerHealth, 0));
  playerHealthDetail.textContent = `${Math.max(game.playerHealth, 0)} / ${game.maxPlayerHealth}`;
  playerHealthFill.style.width = `${Math.max(0, (game.playerHealth / game.maxPlayerHealth) * 100)}%`;
}

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsIdea(answer, idea) {
  return new RegExp(`\\b${escapeRegExp(idea)}\\b`).test(answer);
}

function scoreTyped(userAnswer, answer, source) {
  const normalized = normalize(userAnswer);
  if (normalized.length < 3) {
    return {
      score: 0,
      hit: [],
      missed: importantWords(answer).slice(0, 4)
    };
  }

  const keyIdeas = [...new Set([
    ...importantWords(answer).slice(0, 6),
    ...importantWords(source).slice(0, 4)
  ])].filter(Boolean);

  if (!keyIdeas.length) {
    const close = normalize(answer) && normalized.includes(normalize(answer));
    return {
      score: close ? 1 : 0,
      hit: close ? [answer] : [],
      missed: close ? [] : [answer]
    };
  }

  const hit = keyIdeas.filter((word) => containsIdea(normalized, word));
  const missed = keyIdeas.filter((word) => !containsIdea(normalized, word));
  const coverage = hit.length / keyIdeas.length;
  const directMatch = normalize(answer) && normalized.includes(normalize(answer));
  return {
    score: directMatch ? 1 : coverage,
    hit,
    missed
  };
}

async function gradeTypedAnswerWithAi(question, userAnswer) {
  const response = await fetch("/api/grade-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, answer: userAnswer })
  });
  if (!response.ok) {
    throw new Error("AI grading failed.");
  }
  const result = await response.json();
  if (!result.ok || !result.grade) {
    throw new Error("AI returned an invalid grade.");
  }
  const grade = result.grade;
  const matched = Array.isArray(grade.matchedIdeas) && grade.matchedIdeas.length
    ? ` You nailed: ${grade.matchedIdeas.slice(0, 3).join(", ")}.`
    : "";
  const missing = Array.isArray(grade.missingIdeas) && grade.missingIdeas.length
    ? ` Review: ${grade.missingIdeas.slice(0, 3).join(", ")}.`
    : "";
  return {
    score: Math.min(1, Math.max(0, Number(grade.score) || 0)),
    summary: `${grade.summary || "AI graded your answer."}${matched}${missing}`
  };
}

async function gradeAnswer(question, userAnswer) {
  if (question.type === "choice") {
    const correct = normalize(userAnswer) === normalize(question.answer);
    return {
      score: correct ? 1 : 0,
      summary: correct
        ? "Spot on. You picked the best answer."
        : `Missed it. The best answer was "${question.answer}".`
    };
  }

  return gradeTypedAnswerWithAi(question, userAnswer);
}

function damageForScore(score) {
  if (score <= 0) return 0;
  return Math.max(3, Math.round((20 + player.damageBoost) * score));
}

function bossDamageForScore(score) {
  let damage = 18;
  if (score >= 0.9) damage = 0;
  else if (score >= 0.65) damage = 4;
  else if (score >= 0.35) damage = 9;
  else if (score > 0) damage = 13;
  return Math.max(0, damage - (Number(player.shieldBoost) || 0));
}

async function submitAttack() {
  const question = game.questions[game.current];
  if (game.locked) return;

  const userAnswer = question.type === "choice" ? game.selectedAnswer : typedAnswer.value;
  if (!cleanText(userAnswer)) {
    feedbackText.textContent = "Choose or type an answer before you attack.";
    return;
  }

  if (multiplayerState.active) {
    await submitMultiplayerAttack(question, userAnswer);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = question.type === "typed" ? "AI grading..." : "Attack";
  try {
    const grade = await gradeAnswer(question, userAnswer);
    applyAttack(grade);
  } catch (error) {
    feedbackText.textContent = "AI grading could not finish. Try attacking again in a second.";
    console.error(error);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Attack";
  }
}

function applyAttack(grade) {
  const question = game.questions[game.current];
  const damage = damageForScore(grade.score);
  const bossDamage = bossDamageForScore(grade.score);

  game.locked = true;
  hintButton.disabled = true;
  submitButton.classList.add("hidden");
  nextButton.classList.remove("hidden");

  if (damage > 0) {
    game.health -= damage;
    game.playerHealth -= bossDamage;
    game.xp += Math.max(3, Math.round(15 * grade.score));
    if (grade.score < 0.65) {
      game.misses.push(question);
    }
    xpValue.textContent = String(game.xp);
    battleBanner.textContent = bossDamage
      ? `You hit for ${damage}. The boss countered for ${bossDamage}.`
      : `Critical recall. You hit for ${damage} and dodged the counter.`;
    feedbackText.textContent = `${grade.summary} Model answer: "${question.answer}".`;
    showHeroAttack(`-${damage}`);
  } else {
    game.misses.push(question);
    game.playerHealth -= bossDamage;
    game.xp += 3;
    xpValue.textContent = String(game.xp);
    battleBanner.textContent = `The boss blocked it and hit you for ${bossDamage}.`;
    feedbackText.textContent = `${grade.summary} Source: ${question.source}`;
    showDamage("Blocked");
  }

  if (bossDamage > 0) {
    showBossAttack(`-${bossDamage} HP`);
  }
  updateHealth();
  if (game.health <= 0 || game.playerHealth <= 0 || game.current === game.questions.length - 1) {
    nextButton.textContent = "Results";
  } else {
    nextButton.textContent = "Next";
  }
}

function forceDevAnswer(score) {
  if (!isOwner() || !game.questions.length || game.locked) return;
  const question = game.questions[game.current];
  applyAttack({
    score,
    summary: score > 0
      ? `Developer tool forced this question right.`
      : `Developer tool forced this question wrong. Best answer: "${question.answer}".`
  });
}

function clearBossActionClasses() {
  bossSprite.classList.remove("hit");
  bossSprite.classList.remove("attack");
  bossSprite.classList.remove("hurt");
}

function clearHeroActionClasses() {
  heroSprite.classList.remove("attack");
  heroSprite.classList.remove("hurt");
}

function showDamage(text) {
  damagePop.textContent = text;
  damagePop.classList.remove("show");
  clearBossActionClasses();
  bossSprite.classList.remove("hurt-face");
  requestAnimationFrame(() => {
    damagePop.classList.add("show");
    bossSprite.classList.add("hit");
  });
  window.setTimeout(() => {
    bossSprite.classList.remove("hit");
  }, 360);
}

function showHeroAttack(text) {
  damagePop.textContent = text;
  damagePop.classList.remove("show");
  clearHeroActionClasses();
  heroSprite.classList.remove("angry");
  heroSprite.classList.remove("hurt-face");
  clearBossActionClasses();
  bossSprite.classList.remove("hurt-face");
  requestAnimationFrame(() => {
    heroSprite.classList.add("attack");
    heroSprite.classList.add("angry");
    bossSprite.classList.add("hurt");
    bossSprite.classList.add("hurt-face");
    damagePop.classList.add("show");
  });
  window.setTimeout(() => {
    heroSprite.classList.remove("attack");
    heroSprite.classList.remove("angry");
    bossSprite.classList.remove("hurt");
    bossSprite.classList.remove("hurt-face");
  }, 720);
}

function showBossAttack(text) {
  attackPop.textContent = text;
  attackPop.classList.remove("show");
  clearBossActionClasses();
  bossSprite.classList.remove("angry");
  clearHeroActionClasses();
  heroSprite.classList.remove("hurt-face");
  requestAnimationFrame(() => {
    attackPop.classList.add("show");
    bossSprite.classList.add("attack");
    bossSprite.classList.add("angry");
    heroSprite.classList.add("hurt");
    heroSprite.classList.add("hurt-face");
  });
  window.setTimeout(() => {
    bossSprite.classList.remove("attack");
    bossSprite.classList.remove("angry");
    heroSprite.classList.remove("hurt");
    heroSprite.classList.remove("hurt-face");
  }, 720);
}

function nextRound() {
  if (game.health <= 0 || game.playerHealth <= 0 || game.current === game.questions.length - 1) {
    showResults();
    return;
  }
  game.current += 1;
  renderQuestion();
}

function showResults() {
  resultsPanel.classList.remove("hidden");
  document.querySelector(".battle-grid").classList.add("hidden");
  const won = game.health <= 0;
  const survived = game.playerHealth > 0;
  const baseCoinReward = Math.max(8, Math.round(game.xp / 2)) + (won ? 25 : survived ? 8 : 3);
  const coinReward = Math.round(baseCoinReward * (1 + (Number(player.coinBoost) || 0) * 0.1));
  player.xp += game.xp;
  player.coins += coinReward;
  if (won) {
    player.bossesDefeated += 1;
  }
  savePlayer();
  resultTitle.textContent = won ? `${game.boss} defeated` : survived ? `${game.boss} escaped` : "You were knocked back";
  resultCopy.textContent = won
    ? `Victory. You earned ${game.xp} XP and looted coins for your next upgrade.`
    : survived
      ? `You survived the encounter, earned ${game.xp} XP, and revealed the boss's weak spots.`
      : `The boss won this round, but you still earned ${game.xp} XP and kept your loot.`;
  earnedCoins.textContent = `+${coinReward}`;
  updatePlayerHud();

  weakList.innerHTML = "";
  const weakItems = game.misses.length ? game.misses : game.questions.slice(0, 3);
  weakItems.slice(0, 6).forEach((item) => {
    const chip = document.createElement("div");
    chip.className = "weak-chip";
    chip.innerHTML = `<strong>${item.topic}</strong><br>${item.answer}`;
    weakList.append(chip);
  });
}

function returnToNotes() {
  stopMultiplayerPolling();
  multiplayerRoomPanel.classList.add("hidden");
  partyLineup.classList.add("hidden");
  heroSprite.classList.remove("hidden");
  battleScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
  document.querySelector(".battle-grid").classList.remove("hidden");
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;
  notesInput.value = await file.text();
});

showSigninButton.addEventListener("click", () => setAuthMode("signin"));
showSignupButton.addEventListener("click", () => setAuthMode("signup"));
signinButton.addEventListener("click", signIn);
signupButton.addEventListener("click", signUp);
guestButton.addEventListener("click", playAsGuest);
guestButtonSignup.addEventListener("click", playAsGuest);
signoutButton.addEventListener("click", signOut);
signinPasswordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    signIn();
  }
});
passwordInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    signUp();
  }
});
demoButton.addEventListener("click", () => {
  notesInput.value = demoNotes;
  battleSetupPanel.classList.add("hidden");
  errorMessage.textContent = "";
});

multiplayerButton.addEventListener("click", () => {
  multiplayerPanel.classList.toggle("hidden");
  multiplayerMessage.textContent = "";
});
showHostButton.addEventListener("click", () => setMultiplayerMode("host"));
showJoinButton.addEventListener("click", () => setMultiplayerMode("join"));
hostRoomButton.addEventListener("click", hostMultiplayerRoom);
joinRoomButton.addEventListener("click", joinMultiplayerRoom);
sendChatButton.addEventListener("click", sendMultiplayerChat);
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    sendMultiplayerChat();
  }
});

summonButton.addEventListener("click", prepareBattle);
startBattleButton.addEventListener("click", startBattle);
submitButton.addEventListener("click", submitAttack);
nextButton.addEventListener("click", nextRound);
backButton.addEventListener("click", returnToNotes);
rematchButton.addEventListener("click", () => {
  document.querySelector(".battle-grid").classList.remove("hidden");
  startBattle();
});
openShopButton.addEventListener("click", () => {
  homeShopPanel.classList.toggle("hidden");
});
openAvatarShopButton.addEventListener("click", () => {
  avatarShopPanel.classList.toggle("hidden");
});
adminToggleButton.addEventListener("click", () => {
  if (!requireOwner()) return;
  adminPanel.classList.toggle("hidden");
});
adminAddCoinsButton.addEventListener("click", () => {
  if (!requireOwner()) return;
  player.coins += 250;
  savePlayer();
  updatePlayerHud();
  setAdminMessage("Added 250 coins.");
});
adminMaxDamageButton.addEventListener("click", () => {
  if (!requireOwner()) return;
  player.damageBoost = 100;
  player.shieldBoost = 12;
  player.coinBoost = 5;
  savePlayer();
  updatePlayerHud();
  setAdminMessage("Owner upgrades maxed for testing.");
});
adminFillDemoButton.addEventListener("click", () => {
  if (!requireOwner()) return;
  notesInput.value = demoNotes;
  errorMessage.textContent = "";
  setAdminMessage("Demo notes loaded.");
});
adminResetButton.addEventListener("click", () => {
  if (!requireOwner()) return;
  player.coins = 0;
  player.damageBoost = 0;
  player.shieldBoost = 0;
  player.coinBoost = 0;
  player.bossesDefeated = 0;
  savePlayer();
  updatePlayerHud();
  setAdminMessage("Owner progress reset.");
});
devCorrectButton.addEventListener("click", () => forceDevAnswer(1));
devWrongButton.addEventListener("click", () => forceDevAnswer(0));
hintButton.addEventListener("click", () => {
  const question = game.questions[game.current];
  feedbackText.textContent = `Hint: ${question.hint}`;
});

buildAvatarOptions();
if (activeProfile) {
  showStartScreen();
} else {
  showAuthScreen();
}
