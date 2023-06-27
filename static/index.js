// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, child,get} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyBjUM5xHQUjBheTAOG9hWMTre8bn08COe0",
    authDomain: "cloudclass-44ac5.firebaseapp.com",
    databaseURL: "https://cloudclass-44ac5-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cloudclass-44ac5",
    storageBucket: "cloudclass-44ac5.appspot.com",
    messagingSenderId: "882138223340",
    appId: "1:882138223340:web:9e64b2c1205fd675c04bc9"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

const dbRef = ref(getDatabase());
get(child(dbRef, `Users/`)).then((snapshot) => {
  if (snapshot.exists()) {
    //TODO: CREATE TABLE
    let object = snapshot.val()
    let arr = []
    Object.entries(object).forEach(entry => {
      arr.push(entry[1])
    });
    let sorted = arr.sort((user1,user2) =>{
        return user2.highscore - user1.highscore; 
    })
    // console.log(sorted)
    let table = document.querySelector('tbody')
    // console.log(table.innerHTML)

    const HTML = sorted.map((user,index) =>{
        let currentRow = "<tr>"
        // console.log(user, index+1)
        let rowInfo ="";
        rowInfo += `<td>${index+1}</td>`
        + `<td>${user.nickname}</td>`
        + `<td>${user.highscore}</td>`
        currentRow+=rowInfo
        currentRow += "</tr>"
        return currentRow;
    }).join('')
    table.innerHTML+=HTML;

  } else {
    console.log("No data available");
  }
}).catch((error) => {
  console.error(error);
});

