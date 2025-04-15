
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  databaseURL: "YOUR_DATABASE_URL",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let currentUser = null;
let room = "default";
let stats = { hunger: 100, energy: 100, happiness: 100 };

const hungerEl = document.getElementById("hunger");
const energyEl = document.getElementById("energy");
const happinessEl = document.getElementById("happiness");
const moodEl = document.getElementById("mood");

document.getElementById("feedBtn").onclick = () => updateStats({ hunger: +10 });
document.getElementById("playBtn").onclick = () => updateStats({ happiness: +10, energy: -5 });
document.getElementById("sleepBtn").onclick = () => updateStats({ energy: +15 });

document.getElementById("joinRoomBtn").onclick = () => {
  const input = document.getElementById("roomInput").value.trim();
  if (input) {
    room = input;
    listenToRoom();
    document.getElementById("roomDisplay").textContent = "Joined Room: " + room;
  }
};

document.getElementById("createRoomBtn").onclick = () => {
  room = Math.random().toString(36).substring(2, 8).toUpperCase();
  set(ref(db, "rooms/" + room), stats);
  listenToRoom();
  document.getElementById("roomDisplay").textContent = "Created Room: " + room;
};

document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
};

document.getElementById("signInBtn").onclick = () => {
  signInWithPopup(auth, provider)
    .then(result => {
      currentUser = result.user;
      updateUserUI();
    });
};

document.getElementById("signOutBtn").onclick = () => {
  signOut(auth).then(() => {
    currentUser = null;
    updateUserUI();
  });
};

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  updateUserUI();
});

function updateUserUI() {
  const info = document.getElementById("userInfo");
  const signOutBtn = document.getElementById("signOutBtn");
  if (currentUser) {
    info.textContent = "Hi, " + currentUser.displayName;
    signOutBtn.style.display = "inline-block";
  } else {
    info.textContent = "";
    signOutBtn.style.display = "none";
  }
}

function updateStats(changes) {
  for (const key in changes) {
    stats[key] = Math.min(100, Math.max(0, stats[key] + changes[key]));
  }
  set(ref(db, "rooms/" + room), stats);
  updateMood();
}

function listenToRoom() {
  const statsRef = ref(db, "rooms/" + room);
  onValue(statsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      stats = data;
      updateUI();
    }
  });
}

function updateUI() {
  hungerEl.textContent = stats.hunger;
  energyEl.textContent = stats.energy;
  happinessEl.textContent = stats.happiness;
  updateMood();
}

function updateMood() {
  const { hunger, energy, happiness } = stats;
  let mood = "Happy";
  if (hunger < 30 || energy < 30 || happiness < 30) mood = "Sad";
  if (hunger < 10 || energy < 10 || happiness < 10) mood = "Sick";
  moodEl.textContent = mood;
}

listenToRoom();
