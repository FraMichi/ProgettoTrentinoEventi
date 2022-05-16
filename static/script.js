//Richiede lista eventi esistenti
function login() {

    //Prende i dati inseriti nella form di login
    fetch('../api/v1/visualizzazione/eventi')
    .then( () => {
        window.location.href = "/index.html";
    })
    .catch( error => console.error(error) ); //Cattura gli errori, se presenti, e li mostra nella console.
};
