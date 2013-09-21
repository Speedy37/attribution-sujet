var MemoryStore = require("../memorystore");
var Layout = require('./layout');
var util = require('./util');
var Barrier = require('../barrier');
var socket = util.socket;
var users = new MemoryStore();
var getLocks = new MemoryStore();
var attributions = {};

module.exports = {
  get: function (user_id, callback) {
    var lock = getLocks.getSync(user_id);
    users.get(user_id, callback, function () {
      if (lock === null) {
        getLocks.setSync(user_id, lock = new Barrier(1));
        socket.emit('user', {
          user_id: user_id
        }, function (user) {
          lock.user = user;
          lock.decrement();
        });
      }
      lock.execute(function () {
        if (util.isDataOk(lock.user)) {
          callback(lock.user);
        }
      });
    });
  },
  attributions: {
    create: function (user_id, subject_id, priority) {
      if (!attributions[user_id]) {
        attributions[user_id] = [];
      }
      var userAttributions = attributions[user_id];
      var userAttribution = null;
      for (var i = 0; i < userAttributions.length; i++) {
        var tmp = userAttributions[i];
        if (tmp.priority === priority) {
          if (tmp.element) {
            $(tmp.element).remove();
            tmp.element = null;
          }
          userAttribution = tmp;
        }
        else if (tmp.subject_id === subject_id && subject_id !== null && tmp.element) {
          if (user_id === module.exports.current.id) {
            $(tmp.element).appendTo(Layout.attribution.my);
          }
          else {
            $(tmp.element).remove();
            tmp.element = null;
          }
        }
      }
      if (userAttribution === null) {
        userAttributions.push(userAttribution = {
          priority: priority,
          element: null
        });
      }
      userAttribution.subject_id = subject_id;
      if (subject_id === null && user_id !== module.exports.current.id) {
        return;
      }
      var DOMAttribution = userAttribution.element = document.createElement('div');
      if (user_id === module.exports.current.id) {
        DOMAttribution.className = "attribution attribution-draggable";
        DOMAttribution.textContent = "Choix " + (priority + 1);
        $(DOMAttribution).draggable({
          revert: "invalid"
        }).data('attribution', priority);
      }
      else {
        DOMAttribution.className = "attribution";
        DOMAttribution.textContent = user_id;
        module.exports.get(user_id, function (user) {
          DOMAttribution.textContent = user.nom + " " + user.prenom;
        });
      }
      if (subject_id === null) Layout.attribution.my.appendChild(DOMAttribution);
      else module.exports.Subject.get(subject_id).DOMEtudiants[priority].appendChild(DOMAttribution);
    }
  },
  current: null
};