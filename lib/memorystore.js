/**
 * @class MemoryStore
 * @module memorystore
 * @constructor
 */
function MemoryStore() {
  this._content = {};
}

/**
 * Test if the given key correspond to some data
 * 
 * @method contains
 * @public
 * @param {string} key Key to test
 * @param {function} true_callback
 * @param {function} false_callback
 */
MemoryStore.prototype.contains = function(key, true_callback, false_callback) {
  if (this._content.hasOwnProperty(key)) {
    if (typeof true_callback === "function") {
      true_callback();
    }
  }
  else if (typeof false_callback === "function") {
    false_callback();
  }
};

/**
 * Get data represented by the given key
 * 
 * @method get
 * @public
 * @param {string} key Key to retrieve
 * @param {function} true_callback
 * @param {function} false_callback
 * @param {function} error_callback
 */
MemoryStore.prototype.get = function(key, success_callback, notfound_callback, error_callback) {
  if (this._content.hasOwnProperty(key)) {
    success_callback(this._content[key]);
  }
  else if (typeof notfound_callback === "function") {
    notfound_callback();
  }
};

/**
 * Get data represented by the given key in a syncronized way
 * 
 * @method getSync
 * @public
 * @param {string} key Key to retrieve
 * @return {Object|null}
 */
MemoryStore.prototype.getSync = function (key) {
  if (this._content.hasOwnProperty(key)) {
    return this._content[key];
  }
  return null;
};


/**
 * Set value for the given key
 * 
 * @method set
 * @public
 * @param {string} key Key to set
 * @param {string} value Value to set
 * @param {function} success_callback
 * @param {function} error_callback
 */
MemoryStore.prototype.set = function(key, value, success_callback, error_callback) {
  this._content[key] = value;
  if(typeof success_callback === "function")
    success_callback(value);
};

/**
 * Set value for the the given key in a syncronized way
 * 
 * @method getSync
 * @public
 * @param {string} key Key to retrieve
 * @param {string} value Value to set
 */
MemoryStore.prototype.setSync = function (key, value) {
  this._content[key] = value;
};

/**
 * Remove key from the store
 * 
 * @method remove
 * @public
 * @param {string} key Key to remove
 * @param {function} success_callback
 * @param {function} error_callback
 */
MemoryStore.prototype.remove = function(key, success_callback, error_callback) {
  if (delete this._content[key]) {
    if (typeof success_callback === "function") {
      success_callback();
    }
  }
  else if (typeof error_callback === "function") {
    error_callback();
  }
};


/**
 * Remove key from the store in a syncronized way
 * 
 * @method removeSync
 * @public
 * @param {string} key Key to remove
 * @return {true|false}
 */
MemoryStore.prototype.removeSync = function(key) {
  if (delete this._content[key]) {
    return true;
  }
  return false;
};

module.exports = MemoryStore;