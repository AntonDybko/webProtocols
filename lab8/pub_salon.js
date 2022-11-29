const mqtt = require('mqtt')

const salon  = mqtt.connect('mqtt://test.mosquitto.org')

salon.on('connect', function () {
    setInterval(()=>{
        let temperature = Math.floor(Math.random() * 100)
        console.log(temperature)
        salon.publish("temperature_salon", `Temperature in salon: ${temperature}`)
    }, 1000)
})