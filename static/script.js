/*
* Funzione che viene chiamata premendo il bottone dalla schermata di login.
* Fa l'autenticazione dell'utente.
*/
function login() {

    // Prende i dati inseriti nella form di login
    var email = document.getElementById("emailLogin").value;
    var password = document.getElementById("passwordLogin").value;

    fetch('../api/v1/authentication/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { email: email, password: password } )
    })
    .then((resp) => resp.json()) // Trasforma i dati in formato JSON
    .then( function(data) {

        // Controlla se sono stati resituiti messaggi di errore, come se i dati inseriti nella form sono sbagliati
        if(data.success == false) {

            // In caso affermativo mostra il messaggio
            document.getElementById("errorMsgLogin").innerHTML = data.message;

        } else {

            // In caso negativo torna alla pagina in cui era prima di fare il login
            window.location.href = "/index.html";

        }
    })
    .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
};

/*
* Funzione che viene chiamata premendo il bottone dalla schermata di registrazione.
* Crea il nuovo utente se non esiste, lo salva nel database e fa l'autenticazione
*/
function subscribe() {

    // Prende i dati dalla form di iscrizione
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
    .then((resp) => resp.json()) // Trasforma i dati in formato JSON
    .then( function(data) {

        // Controlla se sono stati resituiti messaggi di errore, come se l'utente è già esistente
        if(data.success == false) {

            // In caso affermativo mostra il messaggio
            document.getElementById("errorMsgSub").innerHTML = data.message;

        } else {

            // In caso negativo torna alla pagina in cui era prima di fare la registrazione
            window.location.href = "/index.html";

        }
    })
    .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
};

/*
* Funzione che viene chiamata al caricamento delle pagine.
* Controlla se l'utente è già loggato.
*/
function checkIfLogged() {

    fetch('../api/v1/authentication/checkIfLogged')
    .then((resp) => resp.json()) // Trasforma i dati in formato JSON
    .then( function(data) {

        // Se l'utente è già loggato modifica i bottoni in alto a destra delle pagine
        if(data.success == true) {

            // Il bottone di "login" viene disabilitato
            document.getElementById("topRightButton01").style.pointerEvents = "none";

            // Il bottone "iscriviti" viene cambiato con il nome dell'utente
            document.getElementById("topRightButton02").removeAttribute("href");
            document.getElementById("topRightButton02").setAttribute("href", '#');
            document.getElementById("topRightButton02").innerHTML = "<div align='center' style='width: 100%; height:100%;'>" + data.name + "</div>"
        }
    })
    .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
}
/*
* Funzione che viene chiamata premendo il bottone dalla schermata ?.
* Crea il nuovo alloggio e lo salva nel database
*/
function createHouse() {

    // Prende i dati dal form della creazione
    var name = document.getElementById("houseName").value;
    var description = document.getElementById("houseDescription").value;
    var dstart = document.getElementById("dStart").value;
    var dend = document.getElementById("dEnd").value;
    var address = document.getElementById("houseAddress").value;
    var city = document.getElementById("city").value;

    fetch('../api/v1/accommodation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { name: name, description: description, dstart: dstart, dend: dend, address: address, city: city} )
    })
    .then((resp) => resp.json()) // Trasforma i dati in formato JSON
    .then( function(data) {

        // Controlla se sono stati resituiti messaggi di errore
        if(data.success == false) {

            // In caso affermativo mostra il messaggio
            document.getElementById("errorMsgCreate").innerHTML = data.message;

        } else {

            // In caso negativo torna alla pagina in cui era prima di fare la registrazione
            window.location.href = "/index.html";

        }
    })
    .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
};

/*
* Funzione che viene chiamata premendo il bottone dalla schermata ?.
* Crea il nuovo alloggio e lo salva nel database
*/
function createEvent() {

    // Prende i dati dal form della creazione
    var name = document.getElementById("eventName").value;
    var description = document.getElementById("eventDescription").value;
    var dstart = document.getElementById("dStart").value;
    var dend = document.getElementById("dEnd").value;
    var address = document.getElementById("eventAddress").value;
    var city = document.getElementById("city").value;
    var available = document.getElementById("available").value;
    var total = document.getElementById("total").value;
    var idCategoria = document.getElementById("idCategoria").value;

    fetch('../api/v1/event/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { name: name, description: description, dstart: dstart, dend: dend, address: address, city: city, available: available, total: total, idCategoria:idCategoria} )
    })
    .then((resp) => resp.json()) // Trasforma i dati in formato JSON
    .then( function(data) {

        // Controlla se sono stati resituiti messaggi di errore
        if(data.success == false) {

            // In caso affermativo mostra il messaggio
            document.getElementById("errorMsgCreate").innerHTML = data.message;

        } else {

            // In caso negativo torna alla pagina in cui era prima di fare la registrazione
            window.location.href = "/index.html";

        }
    })
    .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
};
