//Funzione che viene chiamata premendo il bottone dalla schermata di login.
//Fa l'autenticazione dell'utente.
function login() {

    //Prende i dati inseriti nella form di login
    var email = document.getElementById("emailLogin").value;
    var password = document.getElementById("passwordLogin").value;

    fetch('../api/v1/authentication/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { email: email, password: password } )
    })
    .then( () => {
        window.location.href = "/index.html";
    })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
};

//Funzione che viene chiamata premendo il bottone dalla schermata di registrazione
function subscribe() {

    //Prende i dati dalla form di iscrizione
    var name = document.getElementById("subName").value;
    var surname = document.getElementById("subSurname").value;
    var birthdate = document.getElementById("subBirthdate").value;
    var userType = document.getElementById("subUsertype").value;
    var email = document.getElementById("subEmail").value;
    var password = document.getElementById("subPassword").value;

    fetch('../api/v1/authentication/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { name: name, surname: surname, birthdate: birthdate, userType: userType, email: email, password: password } )
    })
    .then( () => {
        window.location.href = "/index.html";
    })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
};

function checkIfLogged() {

    fetch('../api/v1/authentication')
    .then((resp) => resp.json()) // Trasforma i dati in formato JSON
    .then( function(data) {
        if(data.result == 'True') {
            document.getElementById("topRightButton01").style.pointerEvents = "none";
            document.getElementById("topRightButton02").removeAttribute("href");
            document.getElementById("topRightButton02").setAttribute("href", '#');
            document.getElementById("topRightButton02").innerHTML = "<div align='center' style='width: 100%; height:100%;'>" + data.name + "</div>"
        }
    })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
}
