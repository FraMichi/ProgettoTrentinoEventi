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

        // Controlla se sono stati resituiti messaggi di errore, come se l'utente è già esistente
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
* Funzione che viene chiamata premendo il bottone di logout quando l'utente è registrato.
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
* Controlla se l'utente è già loggato
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

            // Se l'utente è già loggato modifica i bottoni in alto a destra delle pagine
            if(data.success == true) {

                // Il bottone di "login" viene sostituito da quello di "logout"
                document.getElementById("topRightButton01").removeAttribute("href");
                document.getElementById("topRightButton01").setAttribute("onClick", 'logout()');
                document.getElementById("topRightButton01").innerHTML = "<div align='center' style='width: 100%; height:100%;'>Logout</div>"

                // Il bottone "iscriviti" viene cambiato con il nome dell'utente
                document.getElementById("topRightButton02").removeAttribute("href");
                document.getElementById("topRightButton02").setAttribute("href", '#');
                document.getElementById("topRightButton02").innerHTML = "<div align='center' style='width: 100%; height:100%;'>" + JSON.parse(getCookie("user")).name + "</div>"

                // I bottoni di creazione eventi ed alloggi vengono

            } else { // Se l'utente fa il logout i bottoni devono essere ripristinati come lo erano prima di fare il login

                // Il bottone di "logout" viene sostituito da quello di "login"
                document.getElementById("topRightButton01").removeAttribute("onClick");
                document.getElementById("topRightButton01").setAttribute("href", "/login.html");
                document.getElementById("topRightButton01").innerHTML = "<div align='center' style='width: 100%; height:100%;'>Login</div>"

                // Il bottone "iscriviti" viene cambiato con il nome dell'utente
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

    //estraggo l'id dell'utente autenticato da cookie
    var userCookie = decodeURIComponent(document.cookie);
    const myArray = userCookie.split("\"");
    var idUser = myArray[11];

    // Prende i dati dal form della creazione
    var name = document.getElementById("houseName").value;
    var description = document.getElementById("houseDescription").value;
    var dstart = document.getElementById("dStart").value;
    var dend = document.getElementById("dEnd").value;
    var address = document.getElementById("houseAddress").value;
    var city = document.getElementById("city").value;

    token = JSON.parse(getCookie("user")).token;

    fetch('../api/v1/authentication/checkIfLogged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { token: token } )
    })
    .then((resp) => resp.json()) // Trasforma i dati in formato JSON
    .then( function(data) {

      // Se l'utente non è loggato manda alla pagina di login
      if(data.success == false) {
        window.location.href = "/login.html";
      }
      else {
        // Se l'utente loggato è un gestore allora procede con la creazione dell'Evento
        fetch('../api/v1/authentication/checkIfGestore')
        .then((resp) => resp.json())
        .then(function(data){
            if(data.success == false) {
                document.getElementById("errorMsgCreate").innerHTML = data.message;
                window.location.href = "/index.html";
            }
            else {
            var tipoDiUser = data.category;
            }

            if(tipoDiUser == 'gestore') {
               fetch('../api/v1/accommodation/create', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify( { name: name, description: description, dstart: dstart, dend: dend, address: address, city: city, idUser: idUser } )
               })
               .then((resp) => resp.json()) // Trasforma i dati in formato JSON
               .then( function(data) {

                   // Controlla se sono stati resituiti messaggi di errore
                   if(data.success == false) {

                       // In caso affermativo mostra il messaggio
                       document.getElementById("errorMsgCreate").innerHTML = data.message;

                   } else {

                       //In caso negativo torna alla pagina in cui era prima
                       window.location.href = "/index.html";

                   }
               })
             }
             else {
                window.location.href = "/index.html";
            }
        })
        .catch( error => console.error(error) );
      }
    })
    .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
};

/*
* Funzione che viene chiamata premendo il bottone dalla schermata ?.
* Crea il nuovo alloggio e lo salva nel database
*/
function creaEvento() {

  var userCookie = decodeURIComponent(document.cookie);
  const myArray = userCookie.split("\"");
  var idUser = myArray[11];

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

    token = JSON.parse(getCookie("user")).token;
    userId = JSON.parse(getCookie("user")).id;

    fetch('../api/v1/authentication/checkIfLogged', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { token: token } )
    })
    .then((resp) => resp.json()) // Trasforma i dati in formato JSON
    .then( function(data) {
      // Se l'utente non è loggato manda alla pagina di login
      if(data.success == false) {
        window.location.href = "/login.html";
      }
      else {
          // Se l'utente loggato è un gestore allora procede con la creazione dell'Evento
          fetch('../api/v1/authentication/checkIfGestore', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify( { userId: userId } )
          })
          .then((resp) => resp.json())
          .then(function(data){
              if(data.success == false) {
                  document.getElementById("errorMsgCreate").innerHTML = data.message;
                  window.location.href = "/index.html";
              }
              else {
              var tipoDiUser = data.category;
              }

              if(tipoDiUser == 'gestore') {
                fetch('../api/v1/event/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify( { name: name, description: description, dstart: dstart, dend: dend, address: address, city: city, total: total, idCategoria: idCategoria, idUser: idUser} )
                })
                .then((resp) => resp.json()) // Trasforma i dati in formato JSON
                .then( function(data) {

                    // Controlla se sono stati resituiti messaggi di errore
                    if(data.success == false) {

                        // In caso affermativo mostra il messaggio
                        document.getElementById("errorMsgCreate").innerHTML = data.message;

                    } else {

                        //In caso negativo torna alla pagina in cui era prima
                        window.location.href = "/index.html";

                    }
                })
               }
               else {
                  window.location.href = "/index.html";
              }
          })
          .catch( error => console.error(error) );
      }
    })

    .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
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
