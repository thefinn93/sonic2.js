var http = require('http');
var Q = require('q');

function makeRawRequest(self, postdata) {
  var deferred = Q.defer();
  var options = self.requestBase;

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

exports.makeRawRequest = makeRawRequest;

function makeSodaCall(self, uri, args) {
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
  return makeRawRequest(self, postdata);
}

exports.makeSodaCall = makeSodaCall;
