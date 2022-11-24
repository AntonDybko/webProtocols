const mqtt = require('mqtt')

const client_salona = mqtt.connect('mqtt://localhost:1883/')

client_salona.on('connect', function () {
    console.log('Connected to salon')
})