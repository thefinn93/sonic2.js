var http = require('http');
var url = require('url');
var Q = require('q');

function Mifi(options) {
  options = options || {};
  this.requestBase = url.parse(options.url || "http://192.168.0.1/soda");
}

Mifi.prototype.makeRawRequest = function(postdata) {
  var deferred = Q.defer();
  var options = this.requestBase;

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
};

Mifi.prototype.makeSodaCall = function(uri, action, params) {
  var postdata = JSON.stringify({
    soda: {
      'message-id': 0,
      uri: uri,
      action: action,
      params: params
    }
  });
  return this.makeRawRequest(postdata);
};

Mifi.prototype.send_sms = function(to, message) {
    return this.makeSodaCall('/soda/sms/message', 'create', {to: to, message: message});
};

module.exports = Mifi;
