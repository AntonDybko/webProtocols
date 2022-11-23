window.addEventListener("load", function (event) {
 console.log("Ten napis pojawi się w konsoli interfejsu programistycznego (skrót F12 w przeglądarce)");
});

function sendData(name, surname){
    if(Cookies.get(`${name};${surname}`) == null){
        Cookies.set(`${name};${surname}`, 1);
    }else{
        Cookies.set(`${name};${surname}`, parseInt(Cookies.get(`${name};${surname}`))+1);
    }
    console.log(document.cookie)
    alert(`Witaj ${name} ${surname}, odwiedziłeś naszą stronę ${Cookies.get(`${name};${surname}`)} razy.` );
}

function reset(){
    Object.keys(Cookies.get()).forEach(cookie => {
        //console.log(cookie)
        Cookies.remove(cookie)
    });
}


