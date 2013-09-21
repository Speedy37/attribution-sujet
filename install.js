var db = require("./lib/db");
var config = require('./config');
var Password = require('./lib/password');
var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport("Sendmail", "/usr/sbin/sendmail");

var chainer = new db.QueryChainer();

for (var i = db.tables.length - 1; i >= 0; --i) {
  chainer.add(db.tables[i], 'drop', []);
}

for (var i = 0, j = db.tables.length; i < j; ++i) {
  chainer.add(db.tables[i], 'sync', []);
}

chainer.add(db.projects, 'create', [{
  name: "PFE DI5 2013-2014"
}]);

for (var i = 0, j = config.subjects.length; i < j; ++i) {
  var subject = config.subjects[i];
  subject.project_id = 1;
  chainer.add(db.subjects, 'create', [subject]);
}

function sendMail(user) {
  var message = {

    // sender info
    from: config.mail.sender,

    // Comma separated list of recipients
    to: '"'+user.prenom+' '+user.nom+'" <'+user.mail+'>',

    // Subject of the message
    subject: 'Attribution des PFE', //

    // plaintext body
    text: 'Bonjour\n\n'
    +'Le site pour permettre de simplifier l\'attribution des sujets est en ligne : '+config.server.url+'\n'
    +'Voici vos identifiants : \n'
    +'Numéro étudiant : '+user.num+'\n'
    +'Password : '+password,

    // HTML body
    html: 'Bonjour<br/><br/>'
    +'<p>Le site pour permettre de simplifier l\'attribution des sujets est en ligne : <a href="'+config.server.url+'">'+config.server.url+'</a></p>'
    +'<p>Voici vos identifiants : <br/>'
    +'Numéro étudiant : '+user.num+'<br/>'
    +'Password : '+password+'</p>'

  };
  transport.sendMail(message, function (error) {
    if (error) {
      console.log('Error occured for '+message.to);
      console.log(error.message);
      return;
    }
    console.log('Message sent successfully to '+message.to);
  });
}

function prepName(name) {
  return name.replace(/ /g, '-').replace(/[éèêë]/g, 'e').replace(/[ïî]/g, 'i').toLowerCase();
}

for (var i = 0, j = config.users.length; i < j; ++i) {
  var user = config.users[i];
  var password = user.password = Password.generateSync(6);
  chainer.add(db.users, 'create', [user]);
  sendMail(user, password);
}

chainer.runSerially({
  skipOnError: true
}).success(function () {
  console.log("Install done");
}).error(function (err) {
  console.log("Install failed : " + err);
});
