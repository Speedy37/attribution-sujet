var crypto = require('crypto');
module.exports = {
  chars : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  generate : function(size, callback, chars) {
    chars = chars || module.exports.chars;
    crypto.randomBytes(size, function(ex, buf) {
      if (ex) throw ex;
      var password = "";
      for (var i = 0; i < buf.length ; i++) {
        password += chars[Math.floor(buf[i] * chars.length / 256)];
      }
      callback(password);
    });
  },
  generateSync : function(size, chars) {
    chars = chars || module.exports.chars;
    var buf = crypto.randomBytes(size);
    var password = "";
    for (var i = 0; i < buf.length ; i++) {
      password += chars[Math.floor(buf[i] * chars.length / 256)];
    }
    
    return password;
  }
};

