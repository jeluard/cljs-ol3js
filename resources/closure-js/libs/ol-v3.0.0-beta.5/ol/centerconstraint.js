goog.provide('ol.CenterConstraint');
goog.provide('ol.CenterConstraintType');

goog.require('goog.math');


/**
 * @typedef {function((ol.Coordinate|undefined)): (ol.Coordinate|undefined)}
 * @todo api
 */
ol.CenterConstraintType;


/**
 * @param {ol.Extent} extent Extent.
 * @return {ol.CenterConstraintType}
 */
ol.CenterConstraint.createExtent = function(extent) {
  return (
      /**
       * @param {ol.Coordinate|undefined} center Center.
       * @return {ol.Coordinate|undefined} Center.
       */
      function(center) {
        if (goog.isDef(center)) {
          return [
            goog.math.clamp(center[0], extent[0], extent[2]),
            goog.math.clamp(center[1], extent[1], extent[3])
          ];
        } else {
          return undefined;
        }
      });
};


/**
 * @param {ol.Coordinate|undefined} center Center.
 * @return {ol.Coordinate|undefined} Center.
 */
ol.CenterConstraint.none = function(center) {
  return center;
};
