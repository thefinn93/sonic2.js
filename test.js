#!/usr/bin/env node
process.on('uncaughtException', function (err) {
    console.log(err.stack || err);
});

var Mifi = require('./sonic2.js');

var mifi = new Mifi();
if(process.env.TEST_NUMBER) {
  console.log('Sending message to', TEST_NUMBER);
  mifi.send_sms(process.env.TEST_NUMBER, 'testing').then(function(result) {
    console.dir(result);
  }).catch(function(e) {
    console.log(e.stack || e);
  });
}



function log(e) {
  console.dir(e, {depth: 100});
}

mifi.on('connect', log);
mifi.on('battery', log);
mifi.on('dm', log);
mifi.on('hotspot', log);
mifi.on('settings', log);
mifi.on('sms', log);
mifi.on('wwan', log);

mifi.poll();
