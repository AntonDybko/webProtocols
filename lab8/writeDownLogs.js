const mqtt = require('mqtt');
const fs = require("fs");
var logger = fs.createWriteStream('logs.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})

const client = mqtt.connect('mqtt://test.mosquitto.org')

client.subscribe('sypialnia_logi', function (error, granted){
    if(error){
        console.log(error)
    }else{
        console.log(`conntected to ${granted[0].topic}`) 
    }
})

client.subscribe('salon_logi', function (error, granted){
    if(error){
        console.log(error)
    }else{
        console.log(`conntected to ${granted[0].topic}`) 
    }
})

client.on('message', function (topic, message) {
    console.log(message.toString())
    let data = `${message.toString()}\n`
    logger.write(data)
})