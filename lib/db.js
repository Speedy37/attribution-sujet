var Sequelize = require("sequelize");
var bcrypt = require('bcrypt');
var dbConfig = require('../config').database;

var sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig.options);

var Users = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: Sequelize.STRING,
    allowNull: false
  },
  prenom: {
    type: Sequelize.STRING,
    allowNull: false
  },
  num: {
    type: Sequelize.STRING,
    allowNull: false
  },
  mail: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password_hash: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  setterMethods: {
    password: function (password) {
      var salt = bcrypt.genSaltSync(10);
      this.setDataValue('password_hash', bcrypt.hashSync(password, salt));
    }
  },
  instanceMethods: {
    checkPassword: function (password) {
      return bcrypt.compareSync(password, this.password_hash);
    }
  }
});

var Sessions = sequelize.define('Session', {
  key: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  user_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    references: "Users",
    referencesKey: "id"
  }
});

var Projects = sequelize.define('Project', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

var Subjects = sequelize.define('Subject', {
  id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  project_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false,
    references: "Projects",
    referencesKey: "id"
  },
  nom: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: false,
    defaultValue: ''
  },
  encadrants: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

var Attributions = sequelize.define('Attribution', {
  user_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    references: "Users",
    referencesKey: "id"
  },
  subject_id: {
    type: Sequelize.INTEGER.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    references: "Subject",
    referencesKey: "id"
  },
  priority: {
    type: Sequelize.INTEGER.UNSIGNED,
    allowNull: false
  }
});

Users.hasMany(Sessions, {
  foreignKey: 'user_id'
});
Sessions.belongsTo(Users, {
  foreignKey: 'user_id'
});

Attributions.belongsTo(Users, {
  foreignKey: 'user_id'
});
Attributions.belongsTo(Subjects, {
  foreignKey: 'subject_id'
});
Subjects.hasMany(Attributions, {
  foreignKey: 'subject_id'
});
Users.hasMany(Attributions, {
  foreignKey: 'user_id'
});

Projects.hasMany(Subjects, {
  foreignKey: 'project_id'
});
Subjects.belongsTo(Projects, {
  foreignKey: 'project_id'
});

exports.QueryChainer = Sequelize.Utils.QueryChainer;
exports.tables = [Users, Sessions, Projects, Subjects, Attributions];
exports.users = Users;
exports.sessions = Sessions;
exports.projects = Projects;
exports.subjects = Subjects;
exports.attributions = Attributions;
exports.sequelize = sequelize;
