const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://test.mosquitto.org')

client.subscribe('temperature_salon', function (error, granted){
    if(error){
        console.log(error)
    }else{
        console.log(`conntected to ${granted[0].topic}`) 
    }
})

client.subscribe('temperature_sypialnia', function (error, granted){
    if(error){
        console.log(error)
    }else{
        console.log(`conntected to ${granted[0].topic}`) 
    }
})

client.on('message', function (topic, message) {
    if(topic.toString() == 'temperature_salon'){
        console.log(message.toString())
        let temperatureSalon = message.toString().split(' ')[3]
        console.log(temperatureSalon)
        if(temperatureSalon < 18){
            client.publish("ogrzewanie_in_salon", `TurnOn ${temperatureSalon}`)
        }
        if(temperatureSalon > 24){
            client.publish("ogrzewanie_in_salon", `TurnOff ${temperatureSalon}`)
        }
    }
    if(topic.toString() == 'temperature_sypialnia'){
        console.log(message.toString())
        let temperatureSypialnia = message.toString().split(' ')[3]
        console.log(temperatureSypialnia)
        if(temperatureSypialnia < 18){
            client.publish("ogrzewanie_in_sypialnia", `TurnOn ${temperatureSypialnia}`)
        }
        if(temperatureSypialnia > 24){
            client.publish("ogrzewanie_in_sypialnia", `TurnOff ${temperatureSypialnia}`)
        }
    }
  })

