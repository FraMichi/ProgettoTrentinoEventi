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
    Controlla se ?? possibile iscriversi/si ?? gi?? iscritti ad un evento specifico
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
            biscuit = JSON.parse(biscuit);
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

            if(data.message == "UserSubscribed") {
                document.getElementById("prenotationText").innerHTML = "Sei gia iscritto a questo evento! Vuoi disiscriverti? Premi <a href=\"javascript:deleteSubscriptionEvent('"+id+"')\">qui</a>!";
            }
            else if(data.message == "UserNotSubscribed") {
                document.getElementById("prenotationText").innerHTML = "Vuoi iscriverti a questo evento? Premi <a href=\"javascript:subscribeToEvent('"+id+"')\">qui</a>!";
            }
            else {
                document.getElementById("prenotationText").innerHTML = "Vuoi poterti iscrivere agli eventi? Esegui prima il login.";
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
        biscuit = JSON.parse(biscuit);
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
            document.getElementById("prenotationText").innerHTML = "Sei gia iscritto a questo evento!";
        } else if (data.message == 'UserSubscribed'){
            document.getElementById("prenotationText").innerHTML = "Sei stato iscritto a questo evento!";
        } else if (data.message == 'UserNotLogged'){
            document.getElementById("prenotationText").innerHTML = "Ooops! Non sei loggato, oppure il tuo login ?? scaduto. Riesegui il login!";
        } else if (data.message == 'NoFreeSeats'){
            document.getElementById("prenotationText").innerHTML = "Ooops! Sei arrivato tardi, posti finiti!";
        } else {
            alert(data.message);
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
            // In caso negativo creo il cookie
            let expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + data.expireTime * 1000);

            document.cookie = 'user=' + JSON.stringify({name: data.name, token: data.token, id: data.id}) + '; expires=' + expireDate.toUTCString();

            // Torna alla pagina in cui era prima di fare il login
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

        // Controlla se sono stati resituiti messaggi di errore, come se l'utente ?? gi?? esistente
        if(data.success == false) {
            // In caso affermativo mostra il messaggio
            document.getElementById("errorMsgSub").innerHTML = data.message;
        } else {
            // In caso negativo creo il cookie
            let expireDate = new Date();
            expireDate.setTime(expireDate.getTime() + data.expireTime * 1000);

            document.cookie = 'user=' + JSON.stringify({name: data.name, token: data.token, id: data.id}) + '; expires=' + expireDate.toUTCString();

            // Torna alla pagina in cui era prima di fare la registrazione
            window.location.href = "/index.html";
        }
    })
    .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
};

/*
* Funzione che viene chiamata premendo il bottone di logout quando l'utente ?? registrato.
* Fa il logout dell'utente.
*/
function logout() {

    let date = new Date();
    date.setTime(date.getTime() - 999999999);
    document.cookie = 'user=; expires=' + date.toUTCString();

    // Torna alla pagina in cui era prima di fare il logout
    window.location.href = "/index.html";

    alert("Sei stato sloggato correttamente");
};

/*
* Funzione che viene chiamata al caricamento delle pagine.
* Controlla se l'utente ?? gi?? loggato
*/
function checkIfLogged() {

    // Controllo che il cookie non sia 'undefined'
    if(getCookie("user")) {
        // Prendo il token dal cookie
        token = JSON.parse(getCookie("user")).token;

        fetch('../api/v1/authentication/checkIfLogged', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { token: token } )
        })
        .then((resp) => resp.json()) // Trasforma i dati in formato JSON
        .then( function(data) {

            // Se l'utente ?? gi?? loggato modifica i bottoni in alto a destra delle pagine
            if(data.success == true) {
                // Il bottone di "login" viene sostituito da quello di "logout"
                document.getElementById("topRightButton01").removeAttribute("href");
                document.getElementById("topRightButton01").setAttribute("onClick", 'logout()');
                document.getElementById("topRightButton01").innerHTML = "<div align='center' style='width: 100%; height:100%;'>Logout</div>"

                // Il bottone "iscriviti" viene cambiato con il nome dell'utente
                document.getElementById("topRightButton02").removeAttribute("href");
                document.getElementById("topRightButton02").setAttribute("href", 'profile.html');
                document.getElementById("topRightButton02").innerHTML = "<div align='center' style='width: 100%; height:100%;'>" + JSON.parse(getCookie("user")).name + "</div>"
            } else { // Se l'utente fa il logout i bottoni devono essere ripristinati come lo erano prima di fare il login

                // Il bottone di "logout" viene sostituito da quello di "login"
                document.getElementById("topRightButton01").removeAttribute("onClick");
                document.getElementById("topRightButton01").setAttribute("href", "/login.html");
                document.getElementById("topRightButton01").innerHTML = "<div align='center' style='width: 100%; height:100%;'>Login</div>"

                // Il bottone con il nome dell'utente viene cambiato con il bottone "Iscriviti"
                document.getElementById("topRightButton02").removeAttribute("href");
                document.getElementById("topRightButton02").setAttribute("href", "/subscribe.html");
                document.getElementById("topRightButton02").innerHTML = "<div align='center' style='width: 100%; height:100%;'>Iscriviti</div>"

                // I bottoni di creazione eventi ed alloggi vengono disabilitati
                document.getElementById("createHousingButton").style.pointerEvents = "none";
                document.getElementById("createEventButton").style.pointerEvents = "none";
            }
        })
        .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
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

    if(getCookie("user")) {
        token = JSON.parse(getCookie("user")).token;
        userId = JSON.parse(getCookie("user")).id;

        fetch('../api/v2/accommodation/create', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify( {
               name: name, description: description, dstart: dstart, dend: dend, address: address,
               city: city, userId: userId, token: token
           } )
        })
        .then((resp) => resp.json()) // Trasforma i dati in formato JSON
        .then( function(data) {

            // Controlla se sono stati resituiti messaggi di errore
            if(data.success == false) {
                // In caso affermativo mostra il messaggio
                document.getElementById("errorMsgHouse").innerHTML = data.message;
            } else {
                //In caso negativo torna alla pagina iniziale
                alert("Alloggio creato correttamente");
                window.location.href = "/index.html";
            }
        })
    } else {
        alert("Effettua il login");
        window.location.href = "/index.html";
    }
};

/*
* Funzione che viene chiamata premendo il bottone dalla schermata ?.
* Crea il nuovo alloggio e lo salva nel database
*/
function creaEvento() {

    // Prende i dati dal form della creazione
    var name = document.getElementById("eventName").value;
    var description = document.getElementById("eventDescription").value;
    var dstart = document.getElementById("dStart").value;
    var dend = document.getElementById("dEnd").value;
    var address = document.getElementById("eventAddress").value;
    var city = document.getElementById("city").value;
    var total = document.getElementById("total").value;
    var select = document.getElementById("list");
    var idCategoria = select.options[select.selectedIndex].value;

    if(getCookie("user")) {
        token = JSON.parse(getCookie("user")).token;
        userId = JSON.parse(getCookie("user")).id;

        fetch('../api/v2/event/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {
                name: name, description: description, dstart: dstart, dend: dend, address: address,
                city: city, total: total, idCategoria: idCategoria, userId: userId, token: token
            } )
        })
        .then((resp) => resp.json()) // Trasforma i dati in formato JSON
        .then( function(data) {

            // Controlla se sono stati resituiti messaggi di errore
            if(data.success == false) {
                // In caso affermativo mostra il messaggio
                document.getElementById("errorMsgEvent").innerHTML = data.message;
            } else {
                //In caso negativo torna alla pagina iniziale
                alert("Evento creato correttamente");
                window.location.href = "/index.html";
            }
        })
    } else {
        alert("Effettua il login");
        window.location.href = "/login.html";
    }
};

/*
    Richiede lista delle categorie esistenti
*/
function getCategory() {
    // Esegue la richiesta degli eventi all'api specifica
    fetch('../api/v1/event/category')
    .then((resp) => resp.json())
    .then(function(data){
                var select = document.getElementById("list");
                return data.map(function(item){

                    var option = document.createElement("option");
                    option.innerHTML = item.title;
                    option.setAttribute("value", item.id);
                    select.appendChild(option);
                })
            })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
};

/*
    Richiede lista delle categorie esistenti per i filtri
*/
function getCategoryFilter() {
    // Esegue la richiesta degli eventi all'api specifica
    fetch('../api/v1/event/category')
    .then((resp) => resp.json())
    .then(function(data){
                var select = document.getElementById("filterList");
                return data.map(function(item){

                    var option = document.createElement("option");
                    option.innerHTML = item.title;
                    option.setAttribute("value", item.id);
                    select.appendChild(option);
                })
            })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
};

/*
    Controlla le prenotazioni dell'alloggio specifico
*/
function checkHousingPrenotation() {
    let urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('housingId')){
        let biscuit = getCookie('user');
        let token;
        if(biscuit != undefined){
            biscuit = JSON.parse(biscuit);
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
            data.forEach((item, i) => {
                let row = table.insertRow(-1);
                let cell1 = row.insertCell(0);
                let cell2 = row.insertCell(1);
                let cell3 = row.insertCell(2);
                let dataInit = new Date(item.init);
                let dataFinl = new Date(item.finl);
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
                        cell3.innerHTML = "Hai gia prenotato questo slot. Annulla <a href=\"javascript:deleteHousingSubscription('"+urlParams.get('housingId')+"')\">qui</a>!";
                    } else {
                        cell3.innerHTML = "Questo slot ?? gi?? prenotato";
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
        biscuit = JSON.parse(biscuit);
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
            //401 TokenNotValid
            alert("TokenNotValid");
        }else if (data.message == "HousingNotFound") {
            //400 HousingNotFound
            alert("HousingNotFound");
        }else if (data.message == "BadDateOffset") {
            //400 BadDateOffset
            alert("BadDateOffset");
        }else if (data.message == "DateSlotOverlap") {
            //400 DateSlotOverlap
            alert("DateSlotOverlap");
        }else if (data.message == "UserSubscribed") {
            //400 UserSubscribed
            alert("UserSubscribed");
            window.location.href = "./index.html";
        } else {
            alert("MisteryError");
        }
    })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.

}

/*
    Richiede lista eventi ai quali l'utente si ?? iscritto
*/
function getSubEvents() {

    // Leggi il cookie e convertilo in JSON per poter estrarre il token
    let biscuit = getCookie('user');
    let token;
    if(biscuit != undefined){
        biscuit = JSON.parse(biscuit);
        //token dell'utente
        token = biscuit.token;

        // Esegue la richiesta degli eventi all'api specifica
        fetch('../api/v2/visualizzazione/eventListSubscribed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {token: token} )
        })
        .then((resp) => resp.json())
        .then(function(data){

            // Controlla se sono stati resituiti messaggi di errore
            if(data.success == false) {
                // In caso affermativo mostra il messaggio
                document.getElementById("errorMsgSubEvent").innerHTML = data.message;
            } else {
                var ulF = document.getElementById("listFuture");
                var ulP = document.getElementById("listPast");
                return data.map(function(item){
                    fetch('../api/v1/visualizzazione/event?id=' + item.idEvento)
                    .then((resp) => resp.json())
                    .then(function(data){

                        let title = data.title;
                        var li = document.createElement("li");
                        var a = document.createElement("a");
                        let today = new Date();
                        let dataFin = new Date(data.finlDate);

                        if (dataFin < today) {
                            //Evento passato
                            a.setAttribute("href", "/visualizzaEvento.html?eventId=" + item.idEvento);
                            a.innerHTML = title;
                            li.appendChild(a);
                            ulP.appendChild(li);
                        } else {
                            // Evento futuro
                            a.setAttribute("href", "/visualizzaEvento.html?eventId=" + item.idEvento);
                            a.innerHTML = title;
                            li.appendChild(a);
                            ulF.appendChild(li);
                        }
                    })
                    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
                })
            }
        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
    }


};

/*
    Richiede lista alloggi che l'utente ha prenotato
*/
function getSubHousings() {

    // Leggi il cookie e convertilo in JSON per poter estrarre il token
    let biscuit = getCookie('user');
    let token;
    if(biscuit != undefined){
        biscuit = JSON.parse(biscuit);
        //token dell'utente
        token = biscuit.token;

        // Esegue la richiesta degli eventi all'api specifica
        fetch('../api/v2/visualizzazione/houseListSubscribed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {token: token} )
        })
        .then((resp) => resp.json())
        .then(function(data){

            // Controlla se sono stati resituiti messaggi di errore
            if(data.success == false) {
                // In caso affermativo mostra il messaggio
                document.getElementById("errorMsgSubHouse").innerHTML = data.message;
            } else {
                var ulF = document.getElementById("listFuture");
                var ulP = document.getElementById("listPast");
                return data.map(function(item){
                    fetch('../api/v1/visualizzazione/housing?id=' + item.idAlloggio)
                    .then((resp) => resp.json())
                    .then(function(data){

                        let title = data.title;
                        var li = document.createElement("li");
                        var a = document.createElement("a");
                        let today = new Date();
                        let dataFin = new Date(data.finlDate);

                        if (dataFin < today) {
                            //Alloggio passato
                            a.setAttribute("href", "/visualizzaAlloggio.html?housingId=" + item.idAlloggio);
                            a.innerHTML = title;
                            li.appendChild(a);
                            ulP.appendChild(li);
                        } else {
                            // Evento futuro
                            a.setAttribute("href", "/visualizzaAlloggio.html?housingId=" + item.idAlloggio);
                            a.innerHTML = title;
                            li.appendChild(a);
                            ulF.appendChild(li);
                        }
                    })
                    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
                })
            }
        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
    }
};

/*
    Richiede lista eventi creati dall'utente
*/
function getCreatedEvents() {

    // Ottieni token utente
    let biscuit = getCookie('user');
    let token;                          // Token dell'utente qualora presente
    if(biscuit != undefined){
        biscuit = JSON.parse(biscuit);
        //token dell'utente
        token = biscuit.token;
    }

    // Esegue la richiesta degli eventi all'api specifica
    fetch('../api/v2/getCreatedEntries/getCreatedEvents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {token: token} )
    })
    .then((resp) => resp.json())
    .then(function(data){
        if(data.message != undefined){
            alert(data.message);
            // Torna alla pagina in cui era prima di fare il login
            window.location.href = "/index.html";
        } else {
            var ul = document.getElementById("list");
            return data.map(function(item){
                var li = document.createElement("li");
                var a = document.createElement("a");
                var a2 = document.createElement("a");
                var a3 = document.createElement("a");
                var a4 = document.createElement("a");
                a.innerHTML = item.title + ": visualizza ";
                a2.setAttribute("href", "/visualizzaEvento.html?eventId=" + item.id);
                a2.innerHTML = "  evento ";
                a3.innerHTML = ", visualizza ";
                a4.setAttribute("href", "/visualizzaIscrittiEvento.html?eventId=" + item.id);
                a4.innerHTML = "iscritti";
                li.appendChild(a);
                li.appendChild(a2);
                li.appendChild(a3);
                li.appendChild(a4);
                ul.appendChild(li);
            });
        }

    })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
};

/*
    Richiede lista eventi creati dall'utente
*/
function getCreatedHousings() {

    // Ottieni token utente
    let biscuit = getCookie('user');
    let token;                          // Token dell'utente qualora presente
    if(biscuit != undefined){
        biscuit = JSON.parse(biscuit);
        //token dell'utente
        token = biscuit.token;
    }

    // Esegue la richiesta degli eventi all'api specifica
    fetch('../api/v2/getCreatedEntries/getCreatedHousings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {token: token} )
    })
    .then((resp) => resp.json())
    .then(function(data){
        if(data.message != undefined){
            alert(data.message);
            // Torna alla pagina in cui era prima di fare il login
            window.location.href = "/index.html";
        } else {
            var ul = document.getElementById("list");
            return data.map(function(item){
                var li = document.createElement("li");
                var a = document.createElement("a");
                var a2 = document.createElement("a");
                var a3 = document.createElement("a");
                var a4 = document.createElement("a");
                a.innerHTML = item.title + ": visualizza ";
                a2.setAttribute("href", "/visualizzaAlloggio.html?housingId=" + item.id);
                a2.innerHTML = " dettagli";
                a3.innerHTML = ", visualizza ";
                a4.setAttribute("href", "/visualizzaIscrittiAlloggio.html?housingId=" + item.id);
                a4.innerHTML = "iscritti";
                li.appendChild(a);
                li.appendChild(a2);
                li.appendChild(a3);
                li.appendChild(a4);
                ul.appendChild(li);
            });
        }

    })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
}

// Funzione che imposta l'attributo 'href' del bottone per l'eliminazione dell'evento
function setDeleteEventButton() {

    // Prende l'id dell'evento dall'URL
    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('eventId')){

        var id = urlParams.get('eventId');
    }

    // Modifica il contenuto dell'elemento
    document.getElementById('deleteEvent').innerHTML = 'Elimina evento';

    // Imposta l'attributo 'href' dell'elemento
    document.getElementById('deleteEvent').setAttribute('href', 'javascript:deleteEvent("' + id +'")');
};

// Funzione che imposta l'attributo 'href' del bottone per l'eliminazione dell'alloggio
function setDeleteHousingButton() {

    // Prende l'id dell'alloggio dall'URL
    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('housingId')){

        var id = urlParams.get('housingId');
    }

    // Modifica il contenuto dell'elemento
    document.getElementById('deleteHousing').innerHTML = 'Elimina alloggio';

    // Imposta l'attributo 'href' dell'elemento
    document.getElementById('deleteHousing').setAttribute('href', 'javascript:deleteHousing("' + id +'")');
};

/*
 * Funzione che viene chiamata premendo sul link nella pagina di visualizzazione di un evento specifico.
 * Manda la richiesta all'API per l'eliminazione dell'evento
 */
function deleteEvent(id) {

    // Se c'?? il cookie dell'utente prende i suoi elementi
    if(getCookie("user")) {
        token = JSON.parse(getCookie("user")).token;

        fetch('../api/v2/elimination/deleteEvent', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { token: token, eventId: id} )
        })
        .then((resp) => resp.json()) // Trasforma i dati in formato JSON
        .then( function(data) {
            alert(data.message);
            window.location.href = "/index.html";
        })
        .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
    } else {
        alert("Effettua il login");
    }

};

/*
 * Funzione che viene chiamata premendo sul link nella pagina di visualizzazione di un alloggio specifico.
 * Manda la richiesta all'API per l'eliminazione dell'alloggio
 */
function deleteHousing(id) {

    // Se c'?? il cookie dell'utente prende i suoi elementi
    if(getCookie("user")) {
        token = JSON.parse(getCookie("user")).token;

        fetch('../api/v2/elimination/deleteHousing', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { token: token, housingId: id} )
        })
        .then((resp) => resp.json()) // Trasforma i dati in formato JSON
        .then( function(data) {
            alert(data.message);
            window.location.href = "/index.html";
        })
        .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
    } else {
        alert("Effettua il login");
    }

};

/*
    Richiede lista iscritti all'evento specifico
*/
function getIscrittiEvento() {
    var urlParams = new URLSearchParams(window.location.search);

    // Se eventId presente nella query
    if(urlParams.has('eventId')){
        // Id evento
        var eventId = urlParams.get('eventId');
        let biscuit = getCookie('user');
        let token;
        let userId;
        if(biscuit != undefined){
            biscuit = JSON.parse(biscuit);
            token = biscuit.token;
            userId = biscuit.id;
        }

        // Chiamata api per dettagli evento
        fetch('../api/v1/visualizzazione/event?id='+eventId)
        .then((resp) => resp.json())
        .then(function(data){
            document.getElementById("title").innerHTML=data.title;
            document.getElementById("description").innerHTML=data.description;
            document.getElementById("seats").innerHTML=data.seatsAvailable + "/" + data.seatsOccupied;
        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.

        // Esegue la richiesta delle iscrizioni all'evento all'api specifica
        fetch('../api/v2/visualizzazione/eventSubscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {token: token, userId: userId, eventId: eventId} )
        })
        .then((resp) => resp.json())
        .then(function(data){
            if(data.message != undefined){
                alert(data.message);
                // Torna alla home page
                window.location.href = "/index.html";
            } else {
                let table = document.getElementById("list");
                data.map(function(item){
                    console.log(item);
                    let dataN = new Date(item.dataDiNascita);
                    let row = table.insertRow(-1);
                    let cell1 = row.insertCell(0);
                    let cell2 = row.insertCell(1);
                    let cell3 = row.insertCell(2);
                    let cell4 = row.insertCell(3);
                    let newText = document.createTextNode(item.nome);
                    cell1.appendChild(newText);
                    newText = document.createTextNode(item.cognome);
                    cell2.appendChild(newText);
                    newText = document.createTextNode(dataN.toISOString().split('T')[0]);
                    cell3.appendChild(newText);
                    newText = document.createTextNode(item.email);
                    cell4.appendChild(newText);
                });
            }
        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
    } else {
        console.error("Attenzione: parametro 'eventId' non presente nella query");
    }
};

/*
    Richiede lista prenotati all'alloggio specifico
*/
function getIscrittiAlloggio() {
    var urlParams = new URLSearchParams(window.location.search);

    // Se housingId presente nella query
    if(urlParams.has('housingId')){
        // Id alloggio
        var housingId = urlParams.get('housingId');
        let biscuit = getCookie('user');
        let token;
        let userId;
        if(biscuit != undefined){
            biscuit = JSON.parse(biscuit);
            token = biscuit.token;
            userId = biscuit.id;
        }

        // Chiamata api per dettagli alloggio
        fetch('../api/v1/visualizzazione/housing?id='+housingId)
        .then((resp) => resp.json())
        .then(function(data){
            let dataInit = new Date(data.initDate);
            let dataFinl = new Date(data.finlDate);
            document.getElementById("title").innerHTML=data.title;
            document.getElementById("init").innerHTML=dataInit.toISOString().split('T')[0];
            document.getElementById("finl").innerHTML=dataFinl.toISOString().split('T')[0];
        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.

        // Esegue la richiesta delle iscrizioni all'evento all'api specifica
        fetch('../api/v2/visualizzazione/housingSubscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {token: token, userId: userId, housingId: housingId} )
        })
        .then((resp) => resp.json())
        .then(function(data){
            if(data.message != undefined){
                alert(data.message);
                // Torna alla home page
                window.location.href = "/index.html";
            } else {
                let table = document.getElementById("list");
                data.map(function(item){
                    if (item.sub) {
                        let row = table.insertRow(-1);
                        let cell1 = row.insertCell(0);
                        let cell2 = row.insertCell(1);
                        let cell3 = row.insertCell(2);
                        let cell4 = row.insertCell(3);
                        let cell5 = row.insertCell(4);
                        let cell6 = row.insertCell(5);
                        let dataN = new Date(item.dataDiNascita);
                        let dataInit = new Date(item.init);
                        let dataFinl = new Date(item.finl);
                        cell1.innerHTML = dataInit.toISOString().split('T')[0];
                        cell2.innerHTML = dataFinl.toISOString().split('T')[0];
                        let newText = document.createTextNode(item.nome);
                        cell3.appendChild(newText);
                        newText = document.createTextNode(item.cognome);
                        cell4.appendChild(newText);
                        newText = document.createTextNode(dataN.toISOString().split('T')[0]);
                        cell5.appendChild(newText);
                        newText = document.createTextNode(item.email);
                        cell6.appendChild(newText);
                    }
                    else {
                        let row = table.insertRow(-1);
                        let cell1 = row.insertCell(0);
                        let cell2 = row.insertCell(1);
                        let cell3 = row.insertCell(2);
                        let dataInit = new Date(item.init);
                        let dataFinl = new Date(item.finl);
                        cell1.innerHTML = dataInit.toISOString().split('T')[0];
                        cell2.innerHTML = dataFinl.toISOString().split('T')[0];
                        let newText = document.createTextNode(item.nome);
                        cell3.innerHTML="Nessuna prenotazione";
                        cell3.setAttribute("colspan", "4");
                    }
                });
            }
        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
    } else {
        console.error("Attenzione: parametro 'housingId' non presente nella query");
    }
};

/*
 *  Richiede lista eventi filtrati
*/
function getEventsFiltered() {

    // Prende i valori inseriti nei filtri

    var city = document.getElementById('filterCitta').value;
    var startDate = document.getElementById('filterStartDate').value;
    var endDate = document.getElementById('filterEndDate').value;
    var filterCategory = document.getElementById('filterList').value;

    // Manda la richiesta all'api
    fetch('../api/v2/visualizzazioneFiltrata/getFilterEvents?city=' + city + '&startDate=' + startDate + '&endDate=' + endDate + '&filterCategory=' + filterCategory, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then((resp) => resp.json())
    .then(function(data){

        // Prende la lista dall'HTML in cui inserire gli eventi
        var ul = document.getElementById("list");

        // Rimuove tutti gli eventi gi?? nella lista
        while(ul.hasChildNodes()) {
            ul.removeChild(ul.childNodes[0]);
        }

        for (var i in data.eventsList) {

            // Crea gli elementi necessari per la lista
            var li = document.createElement("li");
            var a = document.createElement("a");

            a.setAttribute("href", "/visualizzaEvento.html?eventId=" + data.eventsList[i].id);
            a.innerHTML = data.eventsList[i].title;

            // Li aggiunge alla lista
            li.appendChild(a);
            ul.appendChild(li);

        }

        if(data.success == false)
        {
            document.getElementById('errorMessage').innerHTML = data.message;
        }
    })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
};

/*
 *  Richiede lista eventi filtrati
*/
function getHousingsFiltered() {

    // Prende i valori inseriti nei filtri
    var city = document.getElementById('filterCitta').value;
    var startDate = document.getElementById('filterStartDate').value;
    var endDate = document.getElementById('filterEndDate').value;

    // Manda la richiesta all'api
    fetch('../api/v2/visualizzazioneFiltrata/getFilterHousings?city=' + city + '&startDate=' + startDate + '&endDate=' + endDate, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json'}
    })
    .then((resp) => resp.json())
    .then(function(data){

        // Prende la lista dall'HTML in cui inserire gli alloggi
        var ul = document.getElementById("list");

        // Rimuove tutti gli alloggi gi?? nella lista
        while(ul.hasChildNodes()) {
            ul.removeChild(ul.childNodes[0]);
        }

        for (var i in data.housingsList) {

            // Crea gli elementi necessari per la lista
            var li = document.createElement("li");
            var a = document.createElement("a");

            a.setAttribute("href", "/visualizzaAlloggio.html?housingId=" + data.housingsList[i].id);
            a.innerHTML = data.housingsList[i].title;

            // Li aggiunge alla lista
            li.appendChild(a);
            ul.appendChild(li);

        }

        if(data.success == false)
        {
            document.getElementById('errorMessage').innerHTML = data.message;
        }
    })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
};

/*
* Funzione che viene chiamata premendo il bottone dalla schermata dell'evento.
* Crea una recensione per un evento e la salva nel database
*/
function createEventReview(id) {
  // Prende l'id dell'evento dall'URL
  var urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('eventId')){

      var eventId = urlParams.get('eventId');
  }

  // Prendo la Recensione
  var review = document.getElementById("eventReview").value;

  if(getCookie("user")) {
      token = JSON.parse(getCookie("user")).token;
      userId = JSON.parse(getCookie("user")).id;

  // Se l'utente loggato ?? un gestore allora procede con la creazione della recensione all'evento
                      fetch('../api/v2/review/createEventReview', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify( { idEvento: eventId, review: review,token: token } )
                      })
                      .then((resp) => resp.json()) // Trasforma i dati in formato JSON
                      .then( function(data) {

                          // Controlla se sono stati resituiti messaggi di errore
                          if(data.success == false) {
                              // In caso affermativo mostra il messaggio
                              alert(data.message);
                              window.location.href = "/index.html";
                          } else {
                            //In caso negativo torna alla pagina di visualizzazione
                            window.location.href = "/index.html";
                            alert("Recensione evento inviata");
                        }
                    })
                 .catch( error => console.error(error) );
    }
  };


/*
* Funzione che viene chiamata premendo il bottone dalla schermata ?.
* Crea una recensione per un alloggio e la salva nel database
*/
function createHousingReview(id) {

  // Prende l'id dell'alloggio dall'URL
  var urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('housingId')){

      var housingId = urlParams.get('housingId');
  }

  // Prendo la Recensione
  var review = document.getElementById("housingReview").value;

    if(getCookie("user")) {
        token = JSON.parse(getCookie("user")).token;
        userId = JSON.parse(getCookie("user")).id;

        // Se l'utente loggato ?? un gestore allora procede con la creazione della recensione all'alloggio
                        fetch('../api/v2/review/createHousingReview', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify( { idAlloggio: housingId, review: review,token: token } )
                        })
                        .then((resp) => resp.json()) // Trasforma i dati in formato JSON
                        .then( function(data) {

                            // Controlla se sono stati resituiti messaggi di errore
                            if(data.success == false) {
                                // In caso affermativo mostra il messaggio
                                alert(data.message);
                                window.location.href = "/index.html";
                            } else {
                              //In caso negativo torna alla pagina di visualizzazione
                              window.location.href = "/index.html";
                              alert("Recensione alloggio inviata");
                          }
                      })
                   .catch( error => console.error(error) );
      }
  };

/*
 * Funzione che viene chiamata premendo sul link nella pagina di visualizzazione di un evento specifico.
 * Manda la richiesta all'API per l'eliminazione della recensione di un evento
 */
function deleteEventReview(id) {

    // Se c'?? il cookie dell'utente prende i suoi elementi
    if(getCookie("user")) {
        token = JSON.parse(getCookie("user")).token;

        fetch('../api/v2/deletereview/deleteEventReview', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { eventId: id , token: token} )
        })
        .then((resp) => resp.json()) // Trasforma i dati in formato JSON
        .then( function() {
            window.location.href = "/visualizzaEvento.html?eventId="+id;
        })
        .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
    }

};

/*
 * Funzione che viene chiamata premendo sul link nella pagina di visualizzazione di un alloggio specifico.
 * Manda la richiesta all'API per l'eliminazione di una recensione di un alloggio
 */
function deleteHousingReview(id) {

    // Se c'?? il cookie dell'utente prende i suoi elementi
    if(getCookie("user")) {
        token = JSON.parse(getCookie("user")).token;

        fetch('../api/v2/deletereview/deleteHousingReview', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { housingId: id, token: token } )
        })
        .then((resp) => resp.json()) // Trasforma i dati in formato JSON
        .then( function() {

            window.location.href = "/visualizzaAlloggio.html?housingId="+id;
        })
        .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
    }

};

/*
    Ottiene id evento da query URL ed esegue chiamata API per ottenere le recensioni dell'evento specifico
*/
function eventReview() {

    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('eventId')){
        // Id evento
        var id = urlParams.get('eventId');

        // Chiamata api
        fetch('../api/v2/visualizzazioneReview/eventReview?id='+id)
        .then((resp) => resp.json())
        .then(function(data){

            var table = document.getElementById("tabellaEventReview");
            data.forEach((review, i) => {
              var trreview = document.createElement("tr");
              var tdreview = document.createElement("td");

              var tddelete = document.createElement("td");
              var tddescrizione = document.createElement("td");

              tddescrizione.innerHTML = "Descrizione";
              tdreview.innerHTML = review.recensione;

              trreview.appendChild(tddescrizione);
              trreview.appendChild(tdreview);
              trreview.appendChild(tddelete);
              table.appendChild(trreview);

              var transwer = document.createElement("tr");
              var tdanswer = document.createElement("td");
              var tdrisposta = document.createElement("td");
              tdrisposta.innerHTML = "Risposta";
              tdanswer.innerHTML = "Inserisci <a href=\"createAnswerEventReview.html?reviewId="+review.reviewId+"&eventId="+id+"\">qui</a> la risposta!";

              if (review.risposta) {
                tdanswer.innerHTML = review.risposta;
              }

              transwer.appendChild(tdrisposta);
              transwer.appendChild(tdanswer);
              table.appendChild(transwer);
        })
        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
    } else {
        console.err("Attenzione: parametro 'eventId' non presente nella query");
    }
};

/*
    Ottiene id alloggi da query URL ed esegue chiamata API per ottenere le recensioni dell'alloggio specifico
*/
function housingReview() {

    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('housingId')){
        // Id alloggio
        var id = urlParams.get('housingId');

        // Chiamata api
        fetch('../api/v2/visualizzazioneReview/housingReview?id='+id)
        .then((resp) => resp.json())
        .then(function(data){

          var table = document.getElementById("tabellaHousingReview");
          data.forEach((review, i) => {
              var trreview = document.createElement("tr");
              var tdreview = document.createElement("td");
              var tddescrizione = document.createElement("td");

              tddescrizione.innerHTML = "Descrizione";
              tdreview.innerHTML = review.recensione;

              trreview.appendChild(tddescrizione);
              trreview.appendChild(tdreview);
              table.appendChild(trreview);

              var transwer = document.createElement("tr");
              var tdanswer = document.createElement("td");
              var tdrisposta = document.createElement("td");
              tdrisposta.innerHTML = "Risposta";
              tdanswer.innerHTML = "Inserisci <a href=\"createAnswerHousingReview.html?reviewId="+review.reviewId+"&housingId="+id+"\">qui</a> la risposta!";

              if (review.risposta) {
                              tdanswer.innerHTML = review.risposta;
                            }

            transwer.appendChild(tdrisposta);
            transwer.appendChild(tdanswer);
            table.appendChild(transwer);
        })
        })
        .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
} else {
    console.err("Attenzione: parametro 'housingId' non presente nella query");
}
};

/*
 * Funzione che viene chiamata premendo sul link nella pagina di visualizzazione di un evento specifico, di annullamento iscrizione.
 * Manda la richiesta all'API per l'eliminazione dell'iscrizione all'evento
 */
function deleteSubscriptionEvent(id) {

    // Se c'?? il cookie dell'utente prende i suoi elementi
    if(getCookie("user")) {
        token = JSON.parse(getCookie("user")).token;

        fetch('../api/v2/elimination/deleteSubscriptionEvent', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { token: token, eventId: id} )
        })
        .then((resp) => resp.json()) // Trasforma i dati in formato JSON
        .then( function() {
            window.location.href = "/visualizzaEvento.html?eventId="+id;
        })
        .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
    }

};

/*
 * Funzione che viene chiamata premendo sul link nella pagina di prenotazione di un alloggio specifico.
 * Manda la richiesta all'API per l'eliminazione della prenotazione di un alloggio
 */
function deleteHousingSubscription(id) {

    // Se c'?? il cookie dell'utente prende i suoi elementi
    if(getCookie("user")) {
        token = JSON.parse(getCookie("user")).token;

        fetch('../api/v2/elimination/deleteHousingSubscription', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( { token: token, housingId: id} )
        })
        .then((resp) => resp.json()) // Trasforma i dati in formato JSON
        .then( function() {
            window.location.href = "/visualizzaAlloggio.html?housingId="+id;
        })
        .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
    } else {
        alert("Effettua il login");
    }

};

function setAnswerEventButton(){
  // Prende l'id della recensione dall'URL
  var urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('reviewId')){

      var reviewId = urlParams.get('reviewId');
  }

  var button = document.getElementById("answerButton");
  button.setAttribute("onclick", "createAnswerEventReview('"+reviewId+"')");
  button.innerHTML = "Inserisci risposta";

};

function setAnswerHousingButton(){
  // Prende l'id della recensione dall'URL
  var urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('reviewId')){

      var reviewId = urlParams.get('reviewId');
  }

  var button = document.getElementById("answerButton");
  button.setAttribute("onclick", "createAnswerHousingReview('"+reviewId+"')");
  button.innerHTML = "Inserisci risposta";

};

/*
* Funzione che viene chiamata premendo il bottone dalla schermata dell'evento.
* Crea una risposta alla recensione per un evento e la salva nel database
*/
function createAnswerEventReview(id) {

  var answer = document.getElementById("answerReview").value;

  // Prende l'id dell'evento dall'URL
  var urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('eventId')){

      var eventId = urlParams.get('eventId');
  }

  if(getCookie("user")) {
       token = JSON.parse(getCookie("user")).token;
       userId = JSON.parse(getCookie("user")).id;
       fetch('../api/v2/answerReview/createAnswerEventReview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify( { reviewId: id, token: token, answer: answer, eventId: eventId} )
       })
       .then((resp) => resp.json()) // Trasforma i dati in formato JSON
       .then( function(data) {
         alert(data.message);
         window.location.href = "/index.html";
      })
      .catch( error => console.error(error) );
   }
};

/*
* Funzione che viene chiamata premendo il bottone dalla schermata dell'evento.
* Crea una risposta alla recensione per un evento e la salva nel database
*/
function createAnswerHousingReview(id) {

  var answer = document.getElementById("answerReview").value;

  // Prende l'id dell'evento dall'URL
  var urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('housingId')){

      var housingId = urlParams.get('housingId');
  }

  if(getCookie("user")) {
       token = JSON.parse(getCookie("user")).token;
       userId = JSON.parse(getCookie("user")).id;
       fetch('../api/v2/answerReview/createAnswerHousingReview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify( { reviewId: id, token: token, answer: answer, housingId: housingId} )
       })
       .then((resp) => resp.json()) // Trasforma i dati in formato JSON
       .then( function(data) {
         alert(data.message);
         window.location.href = "/index.html";
      })
      .catch( error => console.error(error) );
   }
};
