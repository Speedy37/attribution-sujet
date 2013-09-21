var $ = require('jquery-browserify');
var MemoryStore = require("../memorystore");
var Layout = require('./layout');
var util = require('./util');
var socket = util.socket;
var users = require('./users');
var subjects = new MemoryStore();

/**
 * @class Subject
 * @module Subject
 * @private
 * @constructor
 * @param {Object} subject
 * @param {int} subject.id
 * @param {String} subject.nom
 */
var Subject = users.Subject = module.exports = function (subject) {
  subjects.setSync(subject.id, this);

  this.data = subject;

  var DOMRow = this.DOMRow = Layout.attribution.table.insertRow(Layout.attribution.table.rows.length);
  this.DOMNom = this.DOMRow.insertCell(0);
  this.DOMEncadrants = this.DOMRow.insertCell(1);
  this.DOMEtudiants = [];
  for (var i = 0; i < 5; i++) {
    this.DOMEtudiants[i] = this.DOMRow.insertCell(2 + i);
  }
  this.DOMNom.textContent = this.nom;
  this.DOMEncadrants.textContent = this.encadrants;

  DOMRow.className = "attribution-droppable";
  $(DOMRow).droppable({
    accept: ".attribution-draggable",
    activeClass: "ui-state-hover",
    hoverClass: "ui-state-active",
    drop: function (event, ui) {
      socket.emit('attribution', {
        priority: $(ui.draggable).data('attribution'),
        subject_id: subject.id
      }, function (data) {
        if (!util.isDataOk(data)) {
          $(ui.draggable).css({
            top: 0,
            left: 0
          }).appendTo(Layout.attribution.my);
        }
        else {
          util.success("Attribution effectué");
        }
      });
    }
  });

  this.updateAttributions();
};

/**
 * @method get
 * @public
 * @static
 * @param {int} id
 * @return {Subject}
 */
Subject.get = function (id) {
  return subjects.getSync(id);
};

/**
 * @method set
 * @public
 * @static
 * @param {Object} subjectData
 * @return {Subject}
 */
Subject.set = function (subjectData) {
  var subject = subjects.getSync(subjectData.id);
  if (subject === null) {
    subject = new Subject(subjectData);
  }
  else {
    subject.update(subjectData);
  }
  return subject;
};

Subject.prototype = {
  update: function (subjectData) {
    this.data = subjectData;
    this.updateAttributions();
  },
  updateAttributions: function () {
    this.attributions.forEach(function (attribution) {
      users.attributions.create(attribution.user_id, attribution.subject_id, attribution.priority);
    });
  },
  get id() {
    return this.data.id;
  },
  get nom() {
    return this.data.nom;
  },
  get encadrants() {
    return this.data.encadrants;
  },
  get description() {
    return this.data.description;
  },
  get attributions() {
    return this.data.attributions;
  }
};