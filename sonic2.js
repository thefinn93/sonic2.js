var util = require('util');
var EventEmitter = require('events');
var url = require('url');

var soda = require('./soda');
var sms = require('./sms');

function Mifi() {
  var options = {
    url: "http://192.168.0.1/soda",
    events: {
      battery: "standard",
      dm: "standard",
      hotspot: "basic",
      settings: "basic",
      sms: "standard",
      wwan: "basic"
    }
  };

  var self = this;
  var clientid = 0;
  self.requestBase = url.parse(options.url);

  EventEmitter.call(this);

  function processPoll(result) {
    if(result.soda) {
      if(result.soda['client-id'] !== undefined && result.soda['client-id'] != clientid) {
        // Our client ID has been changed (or, most likely assigned)
        clientid = result.soda['client-id'];
      }

      var nonEventFields = ['long-polling', 'message-id', 'error-string', 'error'];
      for(var e in result.soda) {
        if(result.soda.hasOwnProperty(e) && nonEventFields.indexOf(e) == -1) {
          self.emit('poll-event', e, result.soda[e]);
          self.emit("raw-" + e, result.soda[e]);
        }
      }

      // Shows up after the initial request
      if(result.soda['long-polling']) {
        var params = {
          'client-id': clientid,
          params: options.events
        };
        self.emit('connect', clientid);
        return soda.makeSodaCall(self, '/soda/notify', params).then(processPoll);
      } else {
        return self.poll();
      }
    }
  }

  this.poll = function poll() {
    return soda.makeSodaCall(self, '/soda/notify', {'client-id': clientid}).then(processPoll);
  };

  this.send_sms = function send_sms(to, message) {
      return sms.send(self, to, message);
  };

}

util.inherits(Mifi, EventEmitter);

module.exports = Mifi;
