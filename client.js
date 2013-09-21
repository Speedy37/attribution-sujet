var $ = require('./lib/client/jquery-ui');
var users = require('./lib/client/users');
var storage = require('./lib/client/storage');
var Subject = require('./lib/client/subject');
var Layout = require('./lib/client/layout');
var util = require('./lib/client/util');
var socket = util.socket;

socket.on('connecting', function () {
  console.log('connecting');
});
socket.on('connect_failed', function () {
  console.log('connect_failed');
});
socket.on('reconnect', function () {
  var session = storage.getItem("session");
  if (session !== null) {
    socket.emit('session-login', session, function (data) {
      if (util.isDataOk(data)) {
        logged(data);
      }
    });
  }
});
socket.on('reconnecting', function () {
  console.log('reconnecting');
});
socket.on('reconnect_failed', function () {
  console.log('reconnect_failed');
});
socket.on('disconnect', function () {
  console.log('disconnect');
});
socket.on('connect', function () {
  console.log('connect');
});

socket.on('new-attribution', function (attribution) {
  if (util.isDataOk(attribution)) {
    users.attributions.create(attribution.user_id, attribution.subject_id, attribution.priority);
  }
});


function logged(userInfo) {
  users.current = userInfo;
  $("#main-userspace").text(userInfo.nom+" "+userInfo.prenom);
  $("#main").fadeIn();
  var DOMMy = Layout.attribution.my;
  $(DOMMy).empty();
  for (var i = 0; i < 5; i++) {
    users.attributions.create(userInfo.id, null, i);
  }
  socket.emit("subjects", {
    'project_id': 1
  }, function (subjects) {
    if (util.isDataOk(subjects)) {
      subjects.forEach(function (subjectData) {
        Subject.set(subjectData);
      });
    }
  });
}

$(function () {

  $("#attribution-my").droppable({
    accept: ".attribution-draggable",
    activeClass: "ui-state-hover",
    hoverClass: "ui-state-active",
    drop: function (event, ui) {
      var $parent = $(ui.draggable).parent();
      $(ui.draggable).appendTo(Layout.attribution.my).css({
        top: 0,
        left: 0
      });
      socket.emit('attribution', {
        priority: $(ui.draggable).data('attribution'),
        subject_id: null
      }, function (data) {
        if (!util.isDataOk(data)) {
          $(ui.draggable).appendTo($parent);
        }
        else {
          util.success("Déattribution effectué");
        }
      });
    }
  });

  $('#logout').click(function () {
    socket.emit("logout");
    storage.removeItem("session");
    $("#main").fadeOut(function () {
      $("#login").fadeIn();
    });
  });
  $('#login-submit').click(function () {
    socket.emit("login", {
      'num': $("#login-num").val(),
      'password': $("#login-password").val()
    }, function (data) {
      if (util.isDataOk(data)) {
        if (data.session) {
          storage.setItem("session", data.session);
          $("#login").fadeOut(function () {
            logged(data);
          });
        }
      }
    });
  });

  var session = storage.getItem("session");
  if (session === null) {
    $("#login").fadeIn();
  }
  else {
    socket.emit('session-login', session, function (data) {
      if (util.isDataOk(data)) {
        logged(data);
      }
      else {
        storage.removeItem("session");
        $("#login").fadeIn();
      }
    });
  }

});