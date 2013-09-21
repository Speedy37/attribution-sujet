/**
 * Create a Barrier object
 * 
 * @class Barrier
 * @module barrier
 * @constructor
 * @param int nb_waiting
 * @public
 */
var Barrier = module.exports = function (counter) {
  this.actions = [];
  this.nb_waiting = counter > 0 ? counter : 0;
};

/**
 * Increment the barrier counter of 1
 * 
 * @method execute
 * @param {function} action
 * @public
 */
Barrier.prototype.execute = function (action) {
  if(this.nb_waiting === 0) {
    action();
  } else {
    this.actions.push(action);
  }
};

/**
 * Increment the barrier counter of 1
 * 
 * @method increment
 * @public
 */
Barrier.prototype.increment = function () {
  ++this.nb_waiting;
};

/**
 * Decrement the barrier counter of 1.
 * If counter reach 0, then barrier action is executed.
 * Counter can't go under 0.
 * 
 * @method decrement
 * @public
 */
Barrier.prototype.decrement = function () {
  if (this.nb_waiting > 0 && (--this.nb_waiting) === 0) {
    for(var i = 0; i < this.actions.length; i++) {
      (this.actions[i])();
    }
    this.actions = [];
  }
};