const mqtt = require('mqtt')

const sypialnia  = mqtt.connect('mqtt://localhost:1883/')

sypialnia.on('connect', function () {
    setInterval(()=>{
        let temperature = Math.floor(Math.random() * 100)
        console.log(temperature)
        sypialnia.publish("temperature_sypialnia", `Temperature in sypialnia: ${temperature}`)
    }, 1000)
})