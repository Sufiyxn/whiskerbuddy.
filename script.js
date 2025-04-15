
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqbY5dfw8vPWuWt5mrkCL9tMs9PO25M2s",
  authDomain: "petapp-7465c.firebaseapp.com",
  projectId: "petapp-7465c",
  storageBucket: "petapp-7465c.firebasestorage.app",
  messagingSenderId: "473047245691",
  appId: "1:473047245691:web:a4482cd12c91bc927053de",
  measurementId: "G-XVHYWGYTT6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const userName = document.getElementById("userName");
const petName = document.getElementById("petName");
const setPetBtn = document.getElementById("setPetBtn");

const adminBanner = document.createElement("p");
adminBanner.style.color = "red";
adminBanner.textContent = "You are signed in as an ADMIN.";

const adminPanel = document.createElement("div");
adminPanel.id = "adminPanel";
adminPanel.innerHTML = "<h3>Admin Panel</h3><div id='userList'></div>";

loginBtn.onclick = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    userName.textContent = "Hello, " + user.displayName;

    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    userInfo.style.display = "block";
    loadUserPet(user.uid);

    if (user.email === "sufiyxnn@gmail.com") {
      userInfo.appendChild(adminBanner);
      userInfo.appendChild(adminPanel);
      loadAllPets();
    }
  } catch (error) {
    console.error("Login error:", error);
  }
};

logoutBtn.onclick = async () => {
  await signOut(auth);
  userName.textContent = "";
  petName.textContent = "None";
  loginBtn.style.display = "inline";
  logoutBtn.style.display = "none";
  userInfo.style.display = "none";
  if (userInfo.contains(adminBanner)) {
    userInfo.removeChild(adminBanner);
  }
  if (userInfo.contains(adminPanel)) {
    userInfo.removeChild(adminPanel);
  }
};

setPetBtn.onclick = async () => {
  const user = auth.currentUser;
  if (user) {
    const pet = prompt("Enter your pet's name:");
    if (pet) {
      await setDoc(doc(db, "pets", user.uid), { petName: pet, email: user.email, name: user.displayName || user.email });
      petName.textContent = pet;
    }
  }
};

async function loadUserPet(uid) {
  const docRef = doc(db, "pets", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    petName.textContent = docSnap.data().petName;
  } else {
    petName.textContent = "None";
  }
}

async function loadAllPets() {
  const userList = document.getElementById("userList");
  userList.innerHTML = "<p>Loading all users with pets...</p>";
  const querySnapshot = await getDocs(collection(db, "pets"));
  let html = "<table border='1'><tr><th>Name</th><th>Email</th><th>Pet</th><th>Actions</th></tr>";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    html += `<tr>
      <td>\${data.name}</td>
      <td>\${data.email}</td>
      <td id="pet-\${docSnap.id}">\${data.petName}</td>
      <td>
        <button onclick="editPet('\${docSnap.id}', '\${data.petName}')">Edit</button>
        <button onclick="deletePet('\${docSnap.id}')">Delete</button>
      </td>
    </tr>`;
  });

  html += "</table>";
  userList.innerHTML = html;
}

window.editPet = async (uid, currentPet) => {
  const newPet = prompt("Enter new pet name:", currentPet);
  if (newPet) {
    await setDoc(doc(db, "pets", uid), { petName: newPet }, { merge: true });
    document.getElementById("pet-" + uid).textContent = newPet;
  }
}

window.deletePet = async (uid) => {
  const confirmDelete = confirm("Are you sure you want to delete this pet?");
  if (confirmDelete) {
    await deleteDoc(doc(db, "pets", uid));
    loadAllPets();
  }
}
