const mqtt = require('mqtt')

const salon  = mqtt.connect('mqtt://localhost:1883/')

salon.on('connect', function () {
    setInterval(()=>{
        let temperature = Math.floor(Math.random() * max)
        console.log(temperature)
        salon.publish(`Temperature in salon: ${temperature} `)
    }, 1000)
})