var http = require('http');
var util = require('util');
var EventEmitter = require('events');
var url = require('url');
var Q = require('q');

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
  var requestBase = url.parse(options.url);

  EventEmitter.call(this);

  function makeRawRequest(postdata) {
    var deferred = Q.defer();
    var options = requestBase;

    options.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postdata.length
    };

    options.method = 'POST';
    var req = http.request(options, function(res) {
      res.setEncoding('utf8');
      var response = "";
      res.on('data', function(chunk) {
        response += chunk;
      });
      res.on('end', function() {
        try {
          deferred.resolve(JSON.parse(response));
        } catch(e) {
          deferred.reject({
            error: "Failed to parse response as JSON",
            "response": response
          });
        }
      });
    });

    req.on('error', function(e) {
      deferred.reject(e);
    });

    req.write(postdata);
    req.end();

    return deferred.promise;
  }

  function makeSodaCall(uri, args) {
    var sodamsg = {
      'message-id': 0,
      uri: uri
    };
    for(var arg in args) {
      if(args.hasOwnProperty(arg)) {
        sodamsg[arg] = args[arg];
      }
    }
    var postdata = JSON.stringify({soda: sodamsg});
    return makeRawRequest(postdata);
  }

  function processPoll(result) {
    if(result.soda) {
      if(result.soda['client-id'] !== undefined && result.soda['client-id'] != clientid) {
        // Our client ID has been changed (or, most likely assigned)
        clientid = result.soda['client-id'];
      }

      for(var eventType in options.events) {
        if(result.soda.hasOwnProperty(eventType)) {
          self.emit(eventType, result.soda[eventType]);
        }
      }

      // Shows up after the initial request
      if(result.soda['long-polling']) {
        var params = {
          'client-id': clientid,
          params: options.events
        };
        self.emit('connected', clientid);
        return makeSodaCall('/soda/notify', params).then(processPoll);
      } else {
        return self.poll();
      }
    }
  }

  this.send_sms = function send_sms(to, message) {
      return makeSodaCall('/soda/sms/message', {action: 'create', params: {to: to, content: message}});
  };

  this.poll = function poll() {
    return makeSodaCall('/soda/notify', {'client-id': clientid}).then(processPoll);
  };
}

util.inherits(Mifi, EventEmitter);

module.exports = Mifi;
