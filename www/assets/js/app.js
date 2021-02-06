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



function logOut() {
    // logout code.
    localStorage.setItem('auth',false)
    window.location.replace('index.html')
}

const logIn = () =>  {
    var user = document.getElementById('form-user').value
    var pass = document.getElementById('form-pass').value
    if(user !== "" && pass !== ""){
        db.collection('admin').get().then( (docLi) =>  {
            var status = true   
            docLi.forEach(ele => {
                    var d = ele.data()
                    if(d.user === user && d.pass === pass){
                        status = false
                        console.log('success')
                        localStorage.setItem('auth',true)
                        localStorage.setItem('id',ele.id)
                        localStorage.setItem('user',d.displayName)
                        window.location.replace("dashboard.html")
                    }
               });
            if(status){
                window.alert("username or password is wrong")
            }
           })
    }else{
        window.alert("input fields cannot be empty")
    }
}

function initDashboard() {
    if(localStorage.getItem('auth') === "false"){
        window.location.replace('index.html')
    }
    var docId = localStorage.getItem('id')
    var user = localStorage.getItem('user')
    
    document.getElementById('user-name').innerText = user
    var tb = document.getElementById("my-table");
    
    db.collection('admin').doc(docId).collection('requests').get().then( (docLi) => {
        var c = 0
        var t = 0
        docLi.forEach( ele => {
            t++
            var d = ele.data()
            
            if ( d.reqStatus == 'pending' ){
                c++
                var row = tb.insertRow(-1);
                var cell0 = row.insertCell(0);
                var cell1 = row.insertCell(1);
                cell1.style.color = "blue"
                var cell2 = row.insertCell(2);
                var cell3 = row.insertCell(3);
                var cell4 = row.insertCell(4);
                cell4.style.color = "red"
                
                cell0.innerHTML = d.email

                var atag = document.createElement('a')
                atag.setAttribute('href',d.docLink)
                atag.setAttribute('target',"_blank")
                atag.innerHTML = d.docLink
                cell1.append(atag)

                cell2.innerHTML = d.date
                cell3.innerHTML = d.time
                var btn = document.createElement('div')
                btn.className = "btn btn-success"
                btn.setAttribute('onclick',`accept("${ele.id}")`)
                btn.innerText = 'accept'
                cell4.append(btn)
                
            }
        })
        localStorage.setItem('total',t)
        localStorage.setItem('pending',c)
        document.getElementById('total-req').innerText = t
        document.getElementById('pending-req').innerText = c
        
    })
}

function initHistory () {
    if(localStorage.getItem('auth') === "false"){
        window.location.replace('index.html')
    }
    var docId = localStorage.getItem('id')
    var user = localStorage.getItem('user')
    
    document.getElementById('user-name').innerText = user
    var tb = document.getElementById("my-table");
    
    db.collection('admin').doc(docId).collection('requests').get().then( (docLi) => {
        docLi.forEach( ele => {
            let d = ele.data()
            if ( d.reqStatus != 'pending' ){
                
                var row = tb.insertRow(-1);
                var cell0 = row.insertCell(0);
                var cell1 = row.insertCell(1);
                cell1.style.color = "blue"
                var cell2 = row.insertCell(2);
                var cell3 = row.insertCell(3);
                var cell4 = row.insertCell(4);
                cell4.style.color = "green"
                
                cell0.innerHTML = d.email
    
                var atag = document.createElement('a')
                atag.setAttribute('href',d.docLink)
                atag.setAttribute('target',"_blank")
                atag.innerHTML = d.docLink
                cell1.append(atag)
                cell2.innerHTML = d.date
                cell3.innerHTML = d.time
                cell4.innerHTML = "done"
            }
        })
    })
}


function accept(id) {
    console.log('accepted : ', id)
    var docId = localStorage.getItem('id')

    db.collection('admin').doc(docId).collection('requests').doc(id).get().then( obj => {
        var d = obj.data()
        var li = [
            'email','date','time','docLink','copies','paperSide','paperSize','xeroxType'
        ]
        var tb = document.getElementById('accept-table')
        li.forEach(ele => {
            var r = document.createElement('tr')
            var hd = document.createElement('th')
            hd.innerText = ele
            var dd = document.createElement('td')
            dd.innerText = d[ele]
            r.append(hd)
            r.append(dd)
            tb.append(r)
        });

        db.collection('admin').doc(docId).collection('requests').doc(id).update({
            reqStatus:"done"
        })
        db.collection('student').doc(d.email).collection('requests').get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                let dockId = doc.id
                let kk = doc.data()
                if(kk.date === d.date && kk.time === d.time && kk.reprography === d.reprography){
                    db.collection('student').doc(d.email).collection('requests').doc(dockId).update({
                        reqStatus : "done"
                    })
                }
            });
        })

    })
}

function forgetPass(){
    var user = window.prompt("username :");
    if(user !== null && user !== ""){
        db.collection('admin').get().then( (docLi) =>  {
            var status = true   
            docLi.forEach(ele => {
                    var d = ele.data()
                    if(d.user === user){
                        status = false
                        var newpass = window.prompt("new password : ");
                        if(newpass !== null && newpass !== ""){
                            db.collection('admin').doc(ele.id).update({
                                pass:newpass
                            }).then( () => {
                                window.alert(`the password for user [ ${ user } ] is changed successfully.`)
                            })
                        }
                    }
            });
            if(status){
                window.alert("username is not found.")
            }
        }) 
        
    }

    /** var user = document.getElementById('form-user').value
        var pass = document.getElementById('form-pass').value
        if(user !== "" && pass !== ""){
            db.collection('admin').get().then( (docLi) =>  {
                var status = true   
                docLi.forEach(ele => {
                        var d = ele.data()
                        if(d.user === user && d.pass === pass){
                            status = false
                            console.log('success')
                            localStorage.setItem('auth',true)
                            localStorage.setItem('id',ele.id)
                            localStorage.setItem('user',d.displayName)
                            window.location.replace("dashboard.html")
                        }
                });
                if(status){
                    window.alert("username or password is wrong")
                }
            })
        }else{
            window.alert("input fields cannot be empty")
        }
    **/
}