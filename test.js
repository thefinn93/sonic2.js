#!/usr/bin/env node
var Mifi = require('./mifi.js');

var mifi = new Mifi();
mifi.send_sms(process.env.TEST_NUMBER, 'testing!').then(function(result) {
  console.dir(result);
}).catch(function(e) {
  console.log(e.stack || e);
});
