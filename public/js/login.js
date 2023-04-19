import { signInGoogle, signOutGoogle } from "./googleAuth.js";

document.getElementById('signInButton').addEventListener('click', signInGoogle);
document.getElementById('signOutButton').addEventListener('click', signOutGoogle);
