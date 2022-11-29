const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://test.mosquitto.org')

let ogrzewanie = false

client.subscribe('ogrzewanie_in_sypialnia', function (error, granted){
    if(error){
        console.log(error)
    }else{
        console.log(`conntected to ${granted[0].topic}`) 
    }
})

client.on('message', function (topic, message) {
    console.log(message.toString())
    let changeStatus = message.toString().split(' ')[0]
    let temperature = message.toString().split(' ')[1]
    if(changeStatus === "TurnOn"){
        ogrzewanie = true
    }else{
        ogrzewanie = false
    }
    client.publish("sypialnia_logi", `Sypialnia: temperature = ${temperature}, status ogrzewania = ${ogrzewanie}`)
})

