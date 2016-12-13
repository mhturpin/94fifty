// Code from https://github.com/urish/web-lightbulb/blob/master/web/bulb.js

'use strict';

let ballWrite = null;
let ballNotify = null;
let turnedOn = false;

function onConnected() {
    document.querySelector('.connect-button').classList.add('hidden');
    document.querySelector('.color-buttons').classList.remove('hidden');
    document.querySelector('.mic-button').classList.remove('hidden');
    document.querySelector('.status-button').classList.remove('hidden');
    turnedOn = false;
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
            console.log('All ready!');
            onConnected();
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}

function getStatus() {
    let data = new Uint8Array([0x7e0005186305be04107e]);
    console.log(ballWrite);
    console.log(ballNotify);
    return ballWrite.writeValue(data)
        .catch(err => console.log('Error when sending status packet! ', err))
        .then(() => {
            ballNotify.readValue()
                .then(value => {
                    let results = value.getUint8(0);
                    console.log('> returned data is: ' + results);
                })
                .catch(error => {
                    console.log('Argh! ' + error);
                });
        });
}

function turnOn() {
    let data = new Uint8Array([0xcc, 0x23, 0x33]);
    return ledCharacteristic.writeValue(data)
        .catch(err => console.log('Error when turning on! ', err))
        .then(() => {
          turnedOn = true;
          toggleButtons();
        });
}

function turnOff() {
    let data = new Uint8Array([0xcc, 0x24, 0x33]);
    return ledCharacteristic.writeValue(data)
        .catch(err => console.log('Error when turning off! ', err))
        .then(() => {
          turnedOn = false;
          toggleButtons();
        });
}

function turnOnOff() {
    if (turnedOn) {
        turnOff();
    } else {
        turnOn();
    }
}

function toggleButtons() {
    Array.from(document.querySelectorAll('.color-buttons button')).forEach(function(colorButton) {
        colorButton.disabled = !turnedOn;
    });
    document.querySelector('.mic-button button').disabled = !turnedOn;
}

function setColor(red, green, blue) {
    let data = new Uint8Array([0x56, red, green, blue, 0x00, 0xf0, 0xaa]);
    return ledCharacteristic.writeValue(data)
        .catch(err => console.log('Error when writing value! ', err));
}

function red() {
    return setColor(255, 0, 0)
        .then(() => console.log('Color set to Red'));
}

function green() {
    return setColor(0, 255, 0)
        .then(() => console.log('Color set to Green'));
}

function blue() {
    return setColor(0, 0, 255)
        .then(() => console.log('Color set to Blue'));
}


/* Utils */

function getSupportedProperties(characteristic) {
    let supportedProperties = [];
    for (const p in characteristic.properties) {
        if (characteristic.properties[p] === true) {
            supportedProperties.push(p.toUpperCase());
        }
    }
    return '[' + supportedProperties.join(', ') + ']';
}
