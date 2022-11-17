

window.addEventListener("load", function (event) {
 console.log("Ten napis pojawi się w konsoli interfejsu programistycznego (skrót F12 w przeglądarce)");
});

function sendData(name, value){
    Cookies.set(name, value)
    alert(name, value)
}


/*window.addEventListener("sendData", function(event){
    Cookies.set(event.name, event.value)
});*/


