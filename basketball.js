// Code from https://github.com/urish/web-lightbulb/blob/master/web/bulb.js

'use strict';

let ballWrite = null;
let ballNotify = null;

$(document).ready(function(){
    $('data_field').keypress(function(e){
        if(e.keyCode == 13 || e.which == 13) {
            getStatus();
        }
    });
});

function onConnected() {
    document.querySelector('.connect-button').classList.add('hidden');
    document.querySelector('.user_data').classList.remove('hidden');
}

function connect() {
    console.log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice(
        {
            filters: [{ namePrefix: ['B'] }],
            optionalServices: ['b69bc590-59d9-4920-9552-defcc31651fe']
        })
        .then(device => {
            console.log('> Found ' + device.name);
            console.log('Connecting to GATT Server...');
            return device.gatt.connect();
        })
        .then(server => {
            console.log('Getting Service b69bc590-59d9-4920-9552-defcc31651fe...');
            return server.getPrimaryService('b69bc590-59d9-4920-9552-defcc31651fe');
        })
        .then(service => {
            console.log('Getting Characteristics...');
            service.getCharacteristic('8b00ace7-eb0b-49b0-bbe9-9aee0a26e1a3')
            .then(characteristic => {
                ballWrite = characteristic
            })
            service.getCharacteristic('0734594a-a8e7-4b1a-a6b1-cd5243059a57')
            .then(characteristic => {
                ballNotify = characteristic
            })
                .then(() => {
                    ballNotify.startNotifications().then(_ => {
                            console.log('> Notifications started');
                            ballNotify.addEventListener('characteristicvaluechanged',
                                    handleNotifications);
                        })
                        .catch(error => {
                            console.log('Argh! ' + error);
                        });
                });
            console.log('All ready!');
            onConnected();
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}

function getStatus() {
    let val = $('data_field').val();
    console.log('Sending status packet (' + val + ')...');
    let data = new Uint8Array([val]);
    return ballWrite.writeValue(data)
        .catch(err => console.log('Error when sending status packet! ', err))
}



/*
 * From: https://googlechrome.github.io/samples/web-bluetooth/
 */

function handleNotifications(event) {
    let value = event.target.value;
    console.log('> ' + value);
}
