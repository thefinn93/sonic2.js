#!/usr/bin/env node
process.on('uncaughtException', function (err) {
    console.log(err.stack || err);
});

var Mifi = require('./sonic2.js');

var mifi = new Mifi();
if(process.env.TEST_NUMBER) {
  console.log('Sending message to', process.env.TEST_NUMBER);
  mifi.send_sms(process.env.TEST_NUMBER, 'testing').then(function(result) {
    console.dir(result);
  }).catch(function(e) {
    console.log(e.stack || e);
  });
}



mifi.on('poll-event', function(event, data) {
  console.log("Got event", event, data);
  console.dir(data, {depth: 100});
});

mifi.poll();
