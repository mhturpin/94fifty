// Code from https://github.com/urish/web-lightbulb/blob/master/web/bulb.js

'use strict';

let ledCharacteristic = null;
let turnedOn = false;

function onConnected() {
    document.querySelector('.connect-button').classList.add('hidden');
    document.querySelector('.color-buttons').classList.remove('hidden');
    document.querySelector('.mic-button').classList.remove('hidden');
    document.querySelector('.power-button').classList.remove('hidden');
    turnedOn = false;
}

function connect() {
    console.log('Requesting Bluetooth Device...');
    navigator.bluetooth.requestDevice(
        {
            filters: [{ namePrefix: ['B'] }]
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
            //b69bc590-59d9-49209552-defcc31651fe
        })
        .then(service => {
            console.log('Getting Characteristic 0xffe9 - Light control...');
            return service.getCharacteristic(0x2A00);
        })
        .then(characteristic => {
            console.log('All ready!');
            ledCharacteristic = characteristic;
            onConnected();
        })
        .catch(error => {
            console.log('Argh! ' + error);
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
