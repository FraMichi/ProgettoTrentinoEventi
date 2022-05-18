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
    var 
    var idUser = 0; //id del gestore che sta creando l'evento

    fetch('../api/v1/accommodation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { name: name, description: description, dstart: dstart, dend: dend, address: address, city: city , idUser: idUser} )
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
    var idUser = 0; //id del gestore che sta creando l'evento

    fetch('../api/v1/accommodation/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { name: name, description: description, dstart: dstart, dend: dend, address: address, city: city , idUser: idUser} )
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
