var io = require('socket.io-client');
exports.socket =io.connect(); // TIP: .connect with no args does auto-discovery

exports.success = function(text) {
  console.log("SUCCESS", text);
};

var error = exports.error = function(text) {
  console.log("ERROR", text);
};

exports.isDataOk = function(data) {
  if (typeof data !== "object") {
    error("data is not an object : " + (typeof data));
    return false;
  }
  else if (data.error) {
    error(data.error);
    return false;
  }
  return true;
};

exports.isArgumentsOk = function(args) {
  if (args.length === 0) {
    error("No data found");
    return false;
  }
  else if (args[0] === 'error') {
    error(args[1]);
    return false;
  }
  return true;
};
