/**
 * @module user
 */

var db = require("./db");
var MemoryStore = require("./memorystore");
var crypto = require("crypto");
var Barrier = require('./barrier');
var sockets = [];


/*
 * Map of currently connected users : id -> User
 * @type MemoryStore
 */
var users = new MemoryStore();

/**
 * Contructor of a newly connected user
 *  - Create connections to mailboxes
 * 
 * @class User
 * @public
 */
function User(dbUser) {

  /**
   * @property id
   * @readOnly
   * @public
   * @type int
   */
  this.id = dbUser.id;
  this.dbUser = dbUser;
  this.nbConnections = 0;

  users.set(dbUser.id, this);
}

/**
 * Login a user from it's username and password
 * 
 * @method login
 * @for User
 * @static
 * @public
 * @param {string} username
 * @param {string} password
 * @param {Socket} socket Socket to use for communication between server and client
 * @param {function} callback Called with an object as first argument once login is done
 */
User.login = function (num, password, socket, callback) {
  db.users.find({
    where: {
      num: num
    }
  }).success(function (dbUser) {
    if (dbUser === null) {
      callback({
        'error': "bad-num"
      });
    }
    else if (dbUser.checkPassword(password)) {
      users.get(dbUser.id, function (user) {
        user._login(socket, callback);
      }, function () {
        var user = new User(dbUser);
        user._login(socket, callback);
      });
    }
    else {
      callback({
        'error': "bad-password"
      });
    }
  }).error(function (reason) {
    callback({
      'exception': reason,
      'error': "users-login-query-failed"
    });
  });
};

/**
 * Link a socket to the user using the authentication_key
 * 
 * @method sessionLogin
 * @for User
 * @static
 * @param {string} session
 * @param {Socket} socket Socket to use for communication between server and client
 * @param {function} callback Called with an object as first argument once login is done
 * @public
 */
User.sessionLogin = function (session, socket, callback) {
  db.sessions.find({
    where: {
      key: session
    },
    include: [db.users]
  }).success(function (dbSession) {
    if (dbSession === null) {
      callback({
        'error': "bad-session"
      });
    }
    else {
      users.get(dbSession.user.id, function (user) {
        user._sessionLogin(socket, callback);
      }, function () {
        var user = new User(dbSession.user);
        user._sessionLogin(socket, callback);
      });
    }
  }).error(function (reason) {
    callback({
      'exception': reason,
      'error': "users-login-query-failed"
    });
  });
};

User.prototype.disconnect = function () {
  users.remove(this.dbUser.id);
  console.log('disconnect user', this.id);
};

User.prototype.removeConnection = function (socket, events) {
  console.log('removeConnection', this.id);
  
  for(var event in events) {
    socket.removeListener(event, events[event]);
  }

  if (--this.nbConnections) {
    this.disconnect();
  }

  for (var i = 0, j = sockets.length; i < j; ++i) {
    if (sockets[i] === socket) {
      sockets.splice(i, 1);
      return;
    }
  }
};

User.prototype.attribution = function (subject_id, priority, callback) {
  var self = this;
  if(subject_id !== null) {
    db.attributions.findAll({
      where: ['user_id = ? AND ( subject_id = ? OR priority = ?)', this.id, subject_id, priority]
    }).success(function (dbAttributions) {
      var barrier = new Barrier(dbAttributions.length);
      dbAttributions.forEach(function (dbAttribution) {
        dbAttribution.destroy().success(function () {
          barrier.decrement();
        }).error(function () {
          if ('function' === typeof callback) {
            callback({
              'error': "attribution-delete-failed"
            });
            callback = null;
          }
        });
      });
  
      barrier.execute(function () {
        db.attributions.create({
          subject_id: subject_id,
          user_id: self.id,
          priority: priority
        }).success(function () {
          callback({
            'attribution': 'ok'
          });
          User.emit('new-attribution', {
            subject_id: subject_id,
            user_id: self.id,
            priority: priority
          });
        }).error(function () {
          callback({
            'error': "attribution-create-failed"
          });
        });
      });
    }).error(function () {
      callback({
        'error': "attribution-findall-failed"
      });
    });
  } else {
    db.attributions.findAll({
      where: {
        user_id : this.id, 
        priority :priority
      }
    }).success(function (dbAttributions) {
      var barrier = new Barrier(dbAttributions.length);
      dbAttributions.forEach(function (dbAttribution) {
        dbAttribution.destroy().success(function () {
          barrier.decrement();
        }).error(function () {
          if ('function' === typeof callback) {
            callback({
              'error': "attribution-delete-failed"
            });
            callback = null;
          }
        });
      });
  
      barrier.execute(function () {
        callback({
          'attribution': 'ok'
        });
        User.emit('new-attribution', {
          subject_id: subject_id,
          user_id: self.id,
          priority: priority
        });
      });
    }).error(function () {
      callback({
        'error': "attribution-findall-failed"
      });
    });
  }
};

/**
 * Add socket to connection list and register it for some events
 * 
 * @method addConnection
 * @public
 * @param {Socket} socket
 */
User.prototype.addConnection = function (socket) {
  var self = this;
  var events = {};
  ++this.nbConnections;
  sockets.push(socket);

  socket.on('attribution', events['attribution'] = function (info, callback) {
    if (info.subject_id !== null && typeof info.subject_id !== "number") {
      callback({
        'error': "bad-subject_id-format"
      });
    }
    else if (typeof info.priority !== "number" || info.priority < 0 || info.priority >= 5) {
      callback({
        'error': "bad-priority-format"
      });
    }
    else {
      self.attribution(info.subject_id, info.priority, callback);
    }
  });

  socket.on('subjects', events['subjects'] = function (req, callback) {
    if (typeof req.project_id !== "number") {
      callback({
        'error': "bad-project_id-format"
      });
    }
    else {
      db.subjects.findAll({
        where: {
          project_id: 1 // TODO make project id dynamic
        },
        order: 'nom ASC',
        include: [db.attributions]
      }).success(function (dbSubjects) {
        callback(dbSubjects);
      });
    }
  });

  socket.on('user', events['user'] = function (req, callback) {
    if (typeof req.user_id !== "number") {
      callback({
        'error': "bad-user_id-format"
      });
    }
    else {
      db.users.find({
        where: {
          id: req.user_id
        },
        attributes: ['id', 'nom', 'prenom']
      }).success(function (dbUser) {
        callback(dbUser);
      });
    }
  });

  socket.once('logout', events['logout'] = function() {
    self.removeConnection(socket, events);
  });

  socket.once('disconnect', events['disconnect'] = function () {
    self.removeConnection(socket, events);
  });
};

/**
 * Add socket to connection list and do post session login things
 * 
 * @method _sessionLogin
 * @private
 * @param {Socket} socket
 * @param {function} callback
 */
User.prototype._sessionLogin = function (socket, callback) {
  this.addConnection(socket);
  this._logged(callback, {});
};


/**
 * Add socket to connection list and do post login things
 * 
 * @method _login
 * @private
 * @param {Socket} socket
 * @param {function} callback
 */
User.prototype._login = function (socket, callback) {
  var self = this;

  crypto.randomBytes(64, function (ex, buf) {
    if (ex) {
      callback({
        "error": "sessionid-generation-failed"
      });
    }
    else {
      var session = buf.toString("base64");
      db.sessions.create({
        key: session,
        user_id: self.id
      });
      self.addConnection(socket);
      self._logged(callback, {
        session: session
      });
    }
  });
};

User.prototype._logged = function (callback, info) {

  info.nom = this.dbUser.nom;
  info.prenom = this.dbUser.prenom;
  info.id = this.id,

  callback(info);
};

/**
 * Notifiy all connected clients of this user about something
 * 
 * @method emit
 * @public
 * @param {string} event_name
 * @param {Object} data
 */
User.emit = function (event_name, data) {
  for (var i = 0, j = sockets.length; i < j; ++i) {
    var socket = sockets[i];
    socket.emit(event_name, data);
  }
};

module.exports = User;