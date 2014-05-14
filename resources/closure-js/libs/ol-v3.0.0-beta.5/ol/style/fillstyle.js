goog.provide('ol.style.Fill');

goog.require('ol.color');



/**
 * @constructor
 * @param {olx.style.FillOptions=} opt_options Options.
 * @todo api
 */
ol.style.Fill = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};

  /**
   * @private
   * @type {ol.Color|string}
   */
  this.color_ = goog.isDef(options.color) ? options.color : null;
};


/**
 * @return {ol.Color|string} Color.
 * @todo api
 */
ol.style.Fill.prototype.getColor = function() {
  return this.color_;
};
