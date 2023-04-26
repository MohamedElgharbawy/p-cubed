import { signInGoogle, signOutGoogle } from "./auth.js";

$('#signInButton').on('click', signInGoogle);
$('signOutButton').on('click', signOutGoogle);
