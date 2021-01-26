var firebaseConfig = {
    apiKey: "AIzaSyAEA8tkxIsFp6CtbZNLtEBMo0JwLQYMOUI",
    authDomain: "student-b195d.firebaseapp.com",
    databaseURL: "https://student-b195d.firebaseio.com",
    projectId: "student-b195d",
    storageBucket: "student-b195d.appspot.com",
    messagingSenderId: "892911260825",
    appId: "1:892911260825:web:9e91de3ebe02433cd6d408",
    measurementId: "G-1K9SZ5DZPL"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var provider = new firebase.auth.GoogleAuthProvider();


console.log("started the student js")
const signIn = () =>  {
    console.log("signIn button clicked..")
    firebase.auth()
    .signInWithPopup(provider)
    .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        
        var user = result.user;
        var info = {
            displayName : user.displayName,
            email : user.email,
            photoURL : user.photoURL,
            auth : true
        }

        var status = false;
        console.log(info)
        db.collection("student").get().then( (query) => {
            query.forEach( (doc) => {
                if(doc.id == info.email){
                    status = true
                }
            })
        }).then( () => {
            if(status){
                localStorage.setItem('user', info.email)
                localStorage.setItem('auth', true)
                
                window.location.replace("dashboard.html")
            }else{
                const newRef = db.collection("student").doc(info.email)
                newRef.set({
                    userInfo:info
                }).then( () => {
                    localStorage.setItem('user', info.email)
                    localStorage.setItem('auth', true)
                   window.location.replace("dashboard.html")
                })
            }
        })
        // ...
    }).catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(errorCode)
        console.log(errorMessage)
        console.log(email)
        console.log(credential)
        // ...
    });
}



function logOut() {
    // logout code.
    localStorage.setItem('auth',false)
    window.location.replace('index.html')
}

function submit() {
    let a = document.getElementById("form-roll-number").value
    let b = document.getElementById("form-yos").value
    let c = document.getElementById("form-doc-link").value
    let d = document.getElementById("form-copies").value
    if(a === "" || b==="" || c==="" || d===""){
        window.alert("Input cannot be empty")
    }else{
        var dateObj = new Date().toString()
        const obj = {
            email:document.getElementById("form-email").value,
            rollNo:document.getElementById("form-roll-number").value,
            name:document.getElementById("form-name").value,
            yos:document.getElementById("form-yos").value,
            docLink:document.getElementById("form-doc-link").value,
            copies:document.getElementById("form-copies").value,
            paperSide:document.getElementById("form-paper-side").value,
            paperSize:document.getElementById("form-paper-size").value,
            xeroxType:document.getElementById("form-xerox-type").value,
            reqStatus:"pending",
            date:dateObj.substr(0,15),
            time:dateObj.substr(15,9),
            reprography:document.getElementById('form-repro').value
        }
        db.collection('student').doc(localStorage.getItem('user')).collection('requests').doc().set(obj).then( () => {
            const adminRef = db.collection('admin')
            adminRef.get().then( (docLi) => {
                docLi.forEach( (ele) => {
                    var id = ele.id
                    let da = ele.data()
                    if( document.getElementById('form-repro').value === da.displayName ){
                        adminRef.doc(id).collection('requests').doc().set(obj)
                    }
                })
            }).then( () => {
                window.alert("the request is submitted successfully")
                document.getElementById("form-roll-number").value = ""
                document.getElementById("form-yos").value = ""
                document.getElementById("form-doc-link").value = ""
                document.getElementById("form-copies").value = ""
            })
            
        })
        
    }
    
}

function initDashboard() {
    if(localStorage.getItem('auth') === "false"){
        window.location.replace('index.html')
    }
    let userval = localStorage.getItem('user')
    

    let obj = null;
    console.log(userval)
    
    db.collection('admin').get().then((docLi) => {
        var ref = document.getElementById('form-repro')
        docLi.forEach( (ele) => {
            var tag = document.createElement('option')
            tag.attributes.value = ele.data().displayName
            tag.innerText = ele.data().displayName
            ref.append(tag)
        } )
    })
    db.collection('student').doc(userval).get().then( (doc) => {
        let data = doc.data().userInfo
        obj = data;
    }).then( () => {
        document.getElementById("user-photo").src = obj.photoURL
        document.getElementById('user-name').innerText = obj.displayName
        document.getElementById('form-name').value = obj.displayName
        document.getElementById("form-email").value = obj.email
    })
    
    db.collection('student').doc(userval).collection('requests').get().then( (docLi) => {
        let c = 0
        console.log("the count;")
        docLi.forEach(element => {
            c++;
            console.log(element.data())
        });
        document.getElementById('total-count').innerText = c
    })
}


function initCurrent () {
    if(localStorage.getItem('auth') === "false"){
        window.location.replace('index.html')
    }
    let userval = localStorage.getItem("user")

    let obj = null;
    console.log(userval)
    db.collection('student').doc(userval).get().then( (doc) => {
        let data = doc.data().userInfo
        obj = data;
    }).then( () => {
        document.getElementById("user-photo").src = obj.photoURL
        document.getElementById('user-name').innerText = obj.displayName
        
    })
    var tb = document.getElementById("my-table");
    
    db.collection('student').doc(userval).collection('requests').get().then( (docLi) => {
        
        docLi.forEach( ele => {
            var d = ele.data()
            if ( d.reqStatus == 'pending' ){
                var row = tb.insertRow(-1);
                var cell0 = row.insertCell(0);
                var cell1 = row.insertCell(1);
                cell1.style.color = "blue"
                var cell2 = row.insertCell(2);
                var cell3 = row.insertCell(3);
                var cell4 = row.insertCell(4);
                cell4.style.color = "green"
                
                cell0.innerHTML = d.reprography
                cell1.innerHTML = d.docLink
                cell2.innerHTML = d.date
                cell3.innerHTML = d.time
                cell4.innerHTML = d.reqStatus
                // <btn class="btn btn-success btousdfdf">accept
            }
        })
    })
}


    

function initHistory () {
    if(localStorage.getItem('auth') === "false"){
        window.location.replace('index.html')
    }
    let userval = localStorage.getItem("user")

    let obj = null;
    console.log(userval)
    db.collection('student').doc(userval).get().then( (doc) => {
        let data = doc.data().userInfo
        obj = data;
    }).then( () => {
        document.getElementById("user-photo").src = obj.photoURL
        document.getElementById('user-name').innerText = obj.displayName
        
    })
    var tb = document.getElementById("my-table");
    
    db.collection('student').doc(userval).collection('requests').get().then( (docLi) => {
        
        docLi.forEach( ele => {
            var d = ele.data()
            if ( d.reqStatus != 'pending' ){
                var row = tb.insertRow(-1);
                var cell0 = row.insertCell(0);
                var cell1 = row.insertCell(1);
                cell1.style.color = "blue"
                var cell2 = row.insertCell(2);
                var cell3 = row.insertCell(3);
                var cell4 = row.insertCell(4);
                cell4.style.color = "green"
                
                cell0.innerHTML = d.reprography
                
                cell1.innerHTML = d.docLink
                cell2.innerHTML = d.date
                cell3.innerHTML = d.time
                cell4.innerHTML = d.reqStatus
            }
        })
    })
}

function initProfile () {
    if(localStorage.getItem('auth') === "false"){
        window.location.replace('index.html')
    }
    let userval = localStorage.getItem("user")

    let obj = null;
    console.log(userval)
    db.collection('student').doc(userval).get().then( (doc) => {
        let data = doc.data().userInfo
        obj = data;
    }).then( () => {
        document.getElementById("user-photo").src = obj.photoURL
        document.getElementById("user-photo-0").src = obj.photoURL
        document.getElementById('user-name').innerText = obj.displayName
        document.getElementById('user-name-0').innerText = obj.displayName
        document.getElementById('user-email').innerText = obj.email
        document.getElementById('form-name').value = obj.displayName
        document.getElementById('form-email').value = obj.email
    })
}
function initHelp(){
    let userval = localStorage.getItem("user")

    let obj = null;
    console.log(userval)
    db.collection('student').doc(userval).get().then( (doc) => {
        let data = doc.data().userInfo
        obj = data;
    }).then( () => {
        document.getElementById("user-photo").src = obj.photoURL
        document.getElementById('user-name').innerText = obj.displayName
        
    })
    
}
    
   
    
    