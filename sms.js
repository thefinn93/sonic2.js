var soda = require('./soda');

exports.send = function send(self, to, message) {
  return soda.makeSodaCall(self,'/soda/sms/message', {action: 'create', params: {to: to, content: message}});
};
