import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.getElementById("signupBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const state = document.getElementById("state").value;
  const district = document.getElementById("district").value;

  if(state !== "Kerala"){ alert("Only Kerala users allowed"); return; }

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", cred.user.uid), {
    email, role, state, district, createdAt: new Date()
  });
  alert("Account created. You are a " + role + " from Kerala");
  window.location.href = role === "seller" ? "../seller/seller-dashboard.html" : "home.html";
}
