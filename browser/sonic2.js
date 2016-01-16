var sodaURI = "http://192.168.0.1/soda";

function makeRawRequest(postdata) {
  return fetch(sodaURI, {
    method: "POST",
    body: postdata
  });
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

function send_sms(to, message) {
  return makeSodaCall('/soda/sms/message', {action: 'create', params: {to: to, content: message}});
}
