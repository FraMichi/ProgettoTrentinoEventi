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
* Controlla se l'utente è già loggato
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
        else {
            document.getElementById("createHousingButton").style.pointerEvents = "none";
            document.getElementById("createEventButton").style.pointerEvents = "none";
        }
    })
    .catch( error => console.error(error) ); // Cattura gli errori, se presenti, e li mostra nella console.
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

    fetch('../api/v1/authentication/checkIfLogged')
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
    var idCategoria = document.getElementById("idCategoria").value;

    fetch('../api/v1/authentication/checkIfLogged')
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
                    select.appendChild(option);
                })
            })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
};
