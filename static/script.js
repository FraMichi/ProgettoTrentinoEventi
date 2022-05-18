<<<<<<< HEAD
//Richiede lista eventi esistenti
function getEvents() {
    // Esegue la richiesta degli eventi all'api specifica
    fetch('../api/v1/visualizzazione/eventList')
    .then((resp) => resp.json())
    .then(function(data){
                var ul = document.getElementById("list");
                return data.map(function(item){
                    var li = document.createElement("li");
                    var a = document.createElement("a");
                    a.setAttribute("href", "/visualizzaEvento.html?eventId=" + item.id);
                    a.innerHTML = item.title
                    li.appendChild(a);
                    ul.appendChild(li);
                })
            })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
};

//Richiede lista alloggi esistenti
function getHousings() {
    // Esegue la richiesta degli alloggi all'api specifica
    fetch('../api/v1/visualizzazione/housingList')
    .then((resp) => resp.json())
    .then(function(data){
                var ul = document.getElementById("list");
                return data.map(function(item){
                    var li = document.createElement("li");
                    var a = document.createElement("a");
                    a.setAttribute("href", "/visualizzaAlloggio.html?housingId=" + item.id);
                    a.innerHTML = item.title
                    li.appendChild(a);
                    ul.appendChild(li);
                })
            })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
};

// Ottiene id evento da query URL ed esegue chiamata API per ottenere i dettagli dell'evento specifico
function getSpecificEvent() {
    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('eventId')){
        // Id evento
        var id = urlParams.get('eventId');

        // Chiamata api
        fetch('../api/v1/visualizzazione/event?id='+id)
        .then((resp) => resp.json())
        .then(function(data){
            let dataIni = new Date(data.initDate);
            let dataFin = new Date(data.finlDate);
            document.getElementById("title").innerHTML=data.title;
            document.getElementById("description").innerHTML=data.description;
            document.getElementById("initDate").innerHTML= dataIni.getFullYear()+'-'+(dataIni.getMonth()+1)+'-'+dataIni.getDay()+' '+(dataIni.getUTCHours()<10?'0':'')+dataIni.getUTCHours()+':'+(dataIni.getMinutes()<10?'0':'')+dataIni.getMinutes();
            document.getElementById("finlDate").innerHTML= dataFin.getFullYear()+'-'+(dataFin.getMonth()+1)+'-'+dataFin.getDay()+' '+(dataFin.getUTCHours()<10?'0':'')+dataFin.getUTCHours()+':'+(dataFin.getMinutes()<10?'0':'')+dataFin.getMinutes();
            document.getElementById("address").innerHTML=data.address;
            document.getElementById("city").innerHTML=data.city;
            document.getElementById("seats").innerHTML=data.seatsAvailable + "/" + data.seatsOccupied;
            document.getElementById("category").innerHTML=data.category;
            document.getElementById("creatorName").innerHTML=data.creatorName + " " + data.creatorSurname;
            document.getElementById("creatorEmail").innerHTML=data.creatorEmail;
        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
    } else {
        console.err("Attenzione: parametro 'eventId' non presente nella query");
    }
};

// Ottiene id alloggi da query URL ed esegue chiamata API per ottenere i dettagli dell'alloggio specifico
function getSpecificHousing() {
    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('housingId')){
        // Id evento
        var id = urlParams.get('housingId');

        // Chiamata api
        fetch('../api/v1/visualizzazione/housing?id='+id)
        .then((resp) => resp.json())
        .then(function(data){
            console.log(data);
            let dataIni = new Date(data.initDate);
            let dataFin = new Date(data.finlDate);
            document.getElementById("title").innerHTML=data.title;
            document.getElementById("description").innerHTML=data.description;
            document.getElementById("initDate").innerHTML= dataIni.getFullYear()+'-'+(dataIni.getMonth()+1)+'-'+dataIni.getDay();
            document.getElementById("finlDate").innerHTML= dataFin.getFullYear()+'-'+(dataFin.getMonth()+1)+'-'+dataFin.getDay();
            document.getElementById("address").innerHTML=data.address;
            document.getElementById("city").innerHTML=data.city;
            document.getElementById("creatorName").innerHTML=data.creatorName + " " + data.creatorSurname;
            document.getElementById("creatorEmail").innerHTML=data.creatorEmail;
        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
    } else {
        console.err("Attenzione: parametro 'housingId' non presente nella query");
    }
};
=======
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
>>>>>>> main
