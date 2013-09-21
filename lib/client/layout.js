var $ = require('jquery-browserify');

/**
 * @class Layout
 * @module layout
 * @static
 */

$(function () {
  /**
   * @property main
   * @type DOMElement
   * @public
   * @static
   * @readonly
   */
  exports.main = document.getElementById('main');
  
  /**
   * @property attributionTable
   * @type Array
   * @public
   * @static
   * @readonly
   */
  exports.attribution = {
    table : document.getElementById('attribution-table'),
    my : document.getElementById('attribution-my')
  };
  
  /**
   * @property content
   * @type DOMElement
   * @public
   * @static
   * @readonly
   */
  exports.content = document.getElementById('main-content');
});