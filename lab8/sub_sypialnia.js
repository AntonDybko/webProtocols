const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://localhost:1883/')

client.subscribe('temperature_sypialnia', function (error, granted){
    if(error){
        console.log(error)
    }else{
        console.log(`conntected to ${granted[0].topic}`) 
    }
})

client.on('message', function (topic, message) {
    console.log(message.toString())
  })

