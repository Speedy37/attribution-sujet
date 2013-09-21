module.exports = {
  'debug' : true,
  'server' : {
    port : 3132,
    host : "127.0.0.1",
    url : "http://example.com"
  }, 
  'database': {
    username: '****',
    password: '****',
    database: '****',
    options: {
      dialect: 'mysql',
      logging: false
    }
  },
  'mail' : {
    sender : '"Admin example.com" <admin@example.com>'
  },
  'users' : [
    { "nom" : "NOM 1"	, prenom : "Prenom 1"	, num : "646465", "mail" : "etudiant1@example.com"},
    { "nom" : "NOM 2"	, prenom : "Prenom 2"	, num : "646466", "mail" : "etudiant2@example.com"}
  ],
  'subjects' : [
    {"encadrants" : "Superman", "nom" : "Analyse de performances d'algorithmes de routage"},
    {"encadrants" : "Tom et Jerry", "nom" : "Analyse de plans cadastraux à l’aide de graphes"}
  ]
};

