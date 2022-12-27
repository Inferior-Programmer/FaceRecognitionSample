// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
// These are the basic functions we need to get and set data in the database
import {
  getDatabase,
  ref,
  get,
  set,
  child,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Replace this with your config object from your firebase console
// Find yours under Project Settings > General > Your apps > SDK Setup and configuration
const firebaseConfig = {
    apiKey: "AIzaSyA-R2vAqJsQZNm60lBsWQfOr02R8w9iMWo",

    authDomain: "appdetection-7417c.firebaseapp.com",

    databaseURL: "https://appdetection-7417c-default-rtdb.firebaseio.com",

    projectId: "appdetection-7417c",

    storageBucket: "appdetection-7417c.appspot.com",

    messagingSenderId: "838883828979",

    appId: "1:838883828979:web:3add37df427704fbe18386",

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const day = 1000 * 60 * 24;



// Attach firebase to the window so we can access it from the browser console
async function getUserData(userId) {
    const dbRef = ref(getDatabase());
  
    var user = await get(child(dbRef, 'users/' + userId.toString())).then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      }  
        
      
    });
  
    return user;
  }
  
  function writeUserData(userId, salt, hashed_password) {
    const db = getDatabase();
    set(ref(db, "users/" + userId), {
      salting: salt, 
      pass: hashed_password,
    });
  }

  function writeNumberOfFaces(date,username, numFaces){
    set(ref(db, "data/"+username+'/'  + date.toString()), {
      numPeople: numFaces,
    });
  }


async function getNumberOfFaces(date,username){
    const dbRef = ref(getDatabase());
  
    var datas = await get(child(dbRef, 'data/'+username+'/' + date.toString())).then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      }  
    });
    return datas;
  }

  window.getUserData = getUserData;
  window.writeUserData = writeUserData;

  export{getNumberOfFaces,writeUserData,getUserData,writeNumberOfFaces}