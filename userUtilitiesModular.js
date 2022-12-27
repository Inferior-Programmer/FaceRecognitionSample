
import {getNumberOfFaces,writeUserData,getUserData,writeNumberOfFaces} from './firebase_connector.js'


var illegalChars = [".", "#", "$", "[", ,"]", "/", "\\", " " ]
var illegalChars2 = [" ", "//", "\\"]

function makeRandomString(length){
    var validchars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = ""; 
    for(let i = 0; i < length; i++){
        result += validchars.charAt(Math.floor(Math.random()*validchars.length));
    }
    return result;
}

async function hashing_funct(string) {
    const utf8s = new TextEncoder().encode(string);
    return crypto.subtle.digest('SHA-256', utf8s).then((buffer) => {
      const array = Array.from(new Uint8Array(buffer));
      const hashHex = array
        .map((bytess) => bytess.toString(16).padStart(2, '0'))
        .join('');
      return hashHex;
    });
  }


async function signup(){
    var username = document.getElementById("signupUser").value
    var password = document.getElementById("signupPassword").value

    document.getElementById("successful-message-signup").innerText = "";
    if(username.length < 5){
        document.getElementById("error-message-signup").innerText = "Username is too short must be at least 5 characters long"
        return;
    }
    if(username.length > 20){
        document.getElementById("error-message-signup").innerText = "Username is too long must be at most 20 characters"
        return;
    }
    
    for(let i = 0; i<illegalChars.length; i++){
        if(username.includes(illegalChars[i])){
            document.getElementById("error-message-signup").innerText = "Username contains a illegal character such as " + illegalChars.toString() + "or spaces"
            return; 
        }
    }

    if(password.length < 5){
        document.getElementById("error-message-signup").innerText =  "Password is too short must be at least 5 characters long"
        return; 
    }

    if(password.length > 20){
        document.getElementById("error-message-signup").innerText = "Password is too long must be at most 20 characters"
        return;
    }

    for(let i = 0; i<illegalChars2.length; i++){
        if(password.includes(illegalChars2[i])){
            document.getElementById("error-message-signup").innerText = "Password contains a illegal character such as " + illegalChars2.toString() + " or spaces"
            return; 
        }
    }

    var ab = await getUserData(username);

    if((typeof ab) !== 'undefined'){
        document.getElementById("error-message-signup").innerText = "Username is already taken";
        return;
    }

    try{
        var salt = makeRandomString(5); 
        password += salt; 
        var hashed_pass = await hashing_funct(password);
       
        writeUserData(username, salt, hashed_pass)
        document.getElementById("error-message-signup").innerText = "";
        document.getElementById("successful-message-signup").innerText = "Successful sign-up"; 
        document.getElementById("signupUser").value = "";
        document.getElementById("signupPassword").value = "";
    }
    catch{
        document.getElementById("error-message-signup").innerText = "Something went wrong";
    }
    
}


function showElement(id){
    document.getElementById(id).style.display = "block"



}

function hideElement(id){
    document.getElementById(id).style.display = "none"

}

function writeCookie(name, value, daysToExpire){
    var date = new Date(); 
    date.setTime(date.getTime() + (daysToExpire*1000*60*60*24))
    document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/"; 
}

function getCookie(name){
    var cookieToFind = name + "="; 

    var splitted = document.cookie.split(';'); 

    for(let i = 0; i < splitted.length; i++){
        if(splitted[i].includes(cookieToFind)){
            return splitted[i].substring(cookieToFind.length+1, splitted[i].length)
        }
    }
    return null; 
}

async function validateUser(username, password){
    if(password === null){
        return false; 
    }
    else{
        var ab = await getUserData(username);
        if((typeof ab) === 'undefined'){
            return false; 
        }
        else if(password !== ab.pass){
            return false; 
        }
    }
    return true;
}

async function login(){
    var username = document.getElementById("loginUser").value
    var password = document.getElementById("loginPassword").value
    if(username.length < 5 || username.length > 20){
        document.getElementById("error-message-login").innerText = "Username is invalid"
        return;
    }

    
    for(let i = 0; i<illegalChars.length; i++){
        if(username.includes(illegalChars[i])){
            document.getElementById("error-message-login").innerText = "Username is invalid"
            return; 
        }
    }

    if(password.length < 5 || password.length > 20){
        document.getElementById("error-message-login").innerText = "Username and password do not match";
        return;
    }

    var ab = await getUserData(username);

    if((typeof ab) === 'undefined'){
        document.getElementById("error-message-login").innerText = "Username and password do not match";
        return;
    }
    var saltings = ab.salting; 
    password += saltings; 

    var hashed_version = await hashing_funct(password); 
    
    if(hashed_version === ab.pass){
        document.getElementById("loginUser").value = ""; 
        document.getElementById("loginPassword").value = "";
        document.getElementById("error-message-login").innerText = "";
        
        writeCookie("username", username, 7); 
        writeCookie("password", hashed_version, 7);

        window.location.href = '/index.html';
    }
    else{
        document.getElementById("error-message-login").innerText = "Username and password do not match";
    }
    
}


