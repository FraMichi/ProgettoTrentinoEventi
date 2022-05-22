/*
    Richiede lista eventi esistenti
*/
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

/*
    Richiede lista alloggi esistenti
*/
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

/*
    Ottiene id evento da query URL ed esegue chiamata API per ottenere i dettagli dell'evento specifico
*/
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
            document.getElementById("initDate").innerHTML=dataIni.toISOString().split('T')[0];
            document.getElementById("finlDate").innerHTML=dataFin.toISOString().split('T')[0];
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

/*
    Ottiene id alloggi da query URL ed esegue chiamata API per ottenere i dettagli dell'alloggio specifico
*/
function getSpecificHousing() {
    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('housingId')){
        // Id evento
        var id = urlParams.get('housingId');

        // Chiamata api
        fetch('../api/v1/visualizzazione/housing?id='+id)
        .then((resp) => resp.json())
        .then(function(data){
            let dataIni = new Date(data.initDate);
            let dataFin = new Date(data.finlDate);
            document.getElementById("title").innerHTML=data.title;
            document.getElementById("description").innerHTML=data.description;
            document.getElementById("initDate").innerHTML=dataIni.toISOString().split('T')[0];
            document.getElementById("finlDate").innerHTML=dataFin.toISOString().split('T')[0];
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

/*
    Controlla se è possibile iscriversi/si è già iscritti ad un evento specifico
*/
function checkEventSubscription(){
    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('eventId')){
        // Id evento
        var id = urlParams.get('eventId');
        // Token utente
        // Leggi il cookie e convertilo in JSON per poter estrarre il token
        let biscuit = getCookie('user');
        let token;
        if(biscuit != undefined){
            biscuit = JSON.parse(biscuit.slice(2));
            //token dell'utente
            token = biscuit.token;
        }

        // Chiamata api
        fetch('../api/v1/eventSubscription/eventSubcribable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { event: id, token: token} )
        })
        .then((resp) => resp.json())
        .then(function(data){
            if(data.message=="UserSubscribed")
            {
                document.getElementById("prenotationText").innerHTML="Sei gia iscritto a questo evento!";
            }
            else if(data.message=="UserNotSubscribed") {
                document.getElementById("prenotationText").innerHTML="Vuoi iscriverti a questo evento? Premi <a href=\"javascript:subscribeToEvent('"+id+"')\">qui</a>!";
            }
            else{
                document.getElementById("prenotationText").innerHTML="Vuoi poterti iscrivere agli eventi? Esegui prima il login.";
            }
        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
    } else {
        console.err("Attenzione: parametro 'eventId' non presente nella query");
    }
}

/*
    Effettua iscrizione ad evento specifico
*/
function subscribeToEvent(event){
    // Leggi il cookie e convertilo in JSON per poter estrarre il token
    let biscuit = getCookie('user');
    let token;
    if(biscuit != undefined){
        biscuit = JSON.parse(biscuit.slice(2));
        //token dell'utente
        token = biscuit.token;
    }
    //id evento
    let evntId = event;

    fetch('../api/v1/eventSubscription/createSubscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { event: evntId, token: token} )
    })
    .then((resp) => resp.json()) // Trasforma i dati in formato JSON
    .then( function(data) {
        if(data.message == 'UserAlreadySubscribed'){
            document.getElementById("prenotationText").innerHTML="Sei gia iscritto a questo evento!";
        } else if (data.message == 'UserSubscribed'){
            document.getElementById("prenotationText").innerHTML="Sei stato iscritto a questo evento!";
        } else if (data.message == 'UserNotLogged'){
            document.getElementById("prenotationText").innerHTML="Ooops! Non sei loggato, oppure il tuo login è scaduto. Riesegui il login!";
        } else if (data.message == 'NoFreeSeats'){
            document.getElementById("prenotationText").innerHTML="Ooops! Sei arrivato tardi, posti finiti!";
        }
    })
    .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
}

/*
    Funzione generica per ottenere il valore di uno specifico cookie
*/
function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res
}

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
* Funzione che viene chiamata premendo il bottone di logout quando l'utente è registrato.
* Fa il logout dell'utente.
*/
function logout() {
    fetch('../api/v1/authentication/logout')
    .then( function() {

        // Torna alla pagina in cui era prima di fare il logout
        window.location.href = "/index.html";

        alert("Sei stato sloggato correttamente");
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

            // Il bottone di "login" viene sostituito da quello di "logout"
            document.getElementById("topRightButton01").removeAttribute("href");
            document.getElementById("topRightButton01").setAttribute("onClick", 'logout()');
            document.getElementById("topRightButton01").innerHTML = "<div align='center' style='width: 100%; height:100%;'>Logout</div>"

            // Il bottone "iscriviti" viene cambiato con il nome dell'utente
            document.getElementById("topRightButton02").removeAttribute("href");
            document.getElementById("topRightButton02").setAttribute("href", '#');
            document.getElementById("topRightButton02").innerHTML = "<div align='center' style='width: 100%; height:100%;'>" + data.name + "</div>"

        } else { // Se l'utente fa il logout i bottoni devono essere ripristinati come lo erano prima di fare il login

            // Il bottone di "logout" viene sostituito da quello di "login"
            document.getElementById("topRightButton01").removeAttribute("onClick");
            document.getElementById("topRightButton01").setAttribute("href", "/login.html");
            document.getElementById("topRightButton01").innerHTML = "<div align='center' style='width: 100%; height:100%;'>Login</div>"

            // Il bottone "iscriviti" viene cambiato con il nome dell'utente
            document.getElementById("topRightButton02").removeAttribute("href");
            document.getElementById("topRightButton02").setAttribute("href", "/subscribe.html");
            document.getElementById("topRightButton02").innerHTML = "<div align='center' style='width: 100%; height:100%;'>Iscriviti</div>"
        }
    })
    .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
}

/*
    Contreolla le prenotazioni dell'alloggio specifico
*/
function checkHousingPrenotation() {
    let urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('housingId')){
        let biscuit = getCookie('user');
        let token;
        if(biscuit != undefined){
            biscuit = JSON.parse(biscuit.slice(2));
            //token dell'utente
            token = biscuit.token;
        }
        // Chiamata api
        fetch('../api/v1/housingSubscription/getHousingSlots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { id: urlParams.get('housingId'), token: token} )
        })
        .then((resp) => resp.json())
        .then(function(data){

            // Altrimenti inserisci i dati ricevuti in una tabella
            let table = document.getElementById("prenotationTable");
            JSON.parse(data).forEach((item, i) => {
                let row = table.insertRow(-1);
                let cell1 = row.insertCell(0);
                let cell2 = row.insertCell(1);
                let cell3 = row.insertCell(2);
                let dataInit = new Date(item.init);
                let dataFinl = new Date(item.finl);
                console.log(dataInit.toISOString())
                console.log(dataFinl.toISOString())
                cell1.innerHTML = dataInit.toISOString().split('T')[0];
                cell2.innerHTML = dataFinl.toISOString().split('T')[0];

                if(item.free) {
                    if(biscuit != undefined) {
                        cell3.innerHTML = "Lo slot e prenotabile, premi <a href='\prenotaAlloggio.html?slot="+JSON.stringify(item)+"&housingId="+ urlParams.get('housingId') +"'>qui</a> per effettuare una prenotazione";
                    } else {
                        cell3.innerHTML = "Lo slot e prenotabile, esegui il login per poter prenotare lo slot";
                    }

                } else {
                    if(item.ofUser) {
                        cell3.innerHTML = "Hai gia prenotato questo slot";
                    } else {
                        cell3.innerHTML = "Questo slot è già prenotato";
                    }
                }

            });


        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
    }
}

/*
    Inizializza la pagina di inserimento delle date per lo slot di prenotazione dell'alloggio
 */
function initHousingPrenotation(){
    const params = new URLSearchParams(window.location.search);

    // Ottieni le info riguardanti lo slot
    let slot = params.get("slot");
    slot = JSON.parse(slot);
    let initDate = new Date(slot.init);     // Data iniziale
    let finalDate = new Date(slot.finl);    // Data finale

    // Imposta il formato delle date in modo che corrisponda a quello dei campi "type=date" di HTML
    initDate = initDate.toISOString().split('T')[0];
    finalDate = finalDate.toISOString().split('T')[0];

    // Imposta i valori dei campi del form
    document.getElementById("dateI").setAttribute("value", initDate);
    document.getElementById("dateF").setAttribute("value", initDate);

    // Imposta le date minime nei campi della form
    document.getElementById("dateI").setAttribute("min", initDate);
    document.getElementById("dateF").setAttribute("min", initDate);

    // Imposta le date massime nei campi della form
    document.getElementById("dateI").setAttribute("max", finalDate);
    document.getElementById("dateF").setAttribute("max", finalDate);

    // Imposta l'Id dell'alloggio
    document.getElementById("housingId").setAttribute("value", params.get('housingId'));
}

/*
    Esegui la chiamata per creare la prenotazione dell'alloggio e mostra la risposta del server
 */
function createHousingSubscription(){
    // Ottieni tutti i parametri necessari
    let housingId = document.getElementById("housingId").value; // Id alloggio
    let initDate = document.getElementById("dateI").value;      // Data iniziale dello slot da prenotare
    let finlDate = document.getElementById("dateF").value;      // Data finale dello slot da prenotare

    // Ottieni token utente
    let biscuit = getCookie('user');
    let token;                          // Token dell'utente qualora presente
    if(biscuit != undefined){
        biscuit = JSON.parse(biscuit.slice(2));
        //token dell'utente
        token = biscuit.token;
    }

    // Chiamata api
    fetch('../api/v1/housingSubscription/subscribeHousing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {initDate: initDate, finlDate: finlDate, housingId: housingId, token: token} )
    })
    .then((resp) => resp.json())
    .then(function(data){
        if(data.message == "BadDateOrder"){
            //200 BadDateOrder
            alert("BadDateOrder");
        } else if (data.message == "MongoDBFormatException") {
            //400 MongoDBFormatException
            alert("MongoDBFormatException");
        } else if (data.message == "TokenNotValid") {
            //400 MongoDBFormatException
            alert("TokenNotValid");
        }else if (data.message == "HousingNotFound") {
            //400 MongoDBFormatException
            alert("HousingNotFound");
        }else if (data.message == "BadDateOffset") {
            //400 MongoDBFormatException
            alert("BadDateOffset");
        }else if (data.message == "DateSlotOverlap") {
            //400 MongoDBFormatException
            alert("DateSlotOverlap");
        }else if (data.message == "UserSubscribed") {
            //400 MongoDBFormatException
            alert("UserSubscribed");
        } else {
            alert("MisteryError");
        }
    })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.

}
