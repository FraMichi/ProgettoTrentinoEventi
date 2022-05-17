//Richiede lista eventi esistenti
function getEvents() {
    // Esegue la richiesta degli eventi all'api specifica
    fetch('../api/v1/visualizzazione/eventList')
    .then((resp) => resp.json())
    .then(function(data){
                console.log(data);
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
            document.getElementById("title").innerHTML=data.title;
            document.getElementById("description").innerHTML=data.description;
            document.getElementById("initDate").innerHTML=data.initDate;
            document.getElementById("finlDate").innerHTML=data.finlDate;
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
