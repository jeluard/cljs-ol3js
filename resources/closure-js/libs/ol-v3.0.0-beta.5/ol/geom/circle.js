goog.provide('ol.geom.Circle');

goog.require('goog.asserts');
goog.require('ol.extent');
goog.require('ol.geom.GeometryType');
goog.require('ol.geom.SimpleGeometry');
goog.require('ol.geom.flat.deflate');



/**
 * @constructor
 * @extends {ol.geom.SimpleGeometry}
 * @param {ol.geom.RawPoint} center Center.
 * @param {number=} opt_radius Radius.
 * @param {ol.geom.GeometryLayout|string=} opt_layout Layout.
 * @todo api
 */
ol.geom.Circle = function(center, opt_radius, opt_layout) {
  goog.base(this);
  var radius = goog.isDef(opt_radius) ? opt_radius : 0;
  this.setCenterAndRadius(center, radius,
      /** @type {ol.geom.GeometryLayout|undefined} */ (opt_layout));
};
goog.inherits(ol.geom.Circle, ol.geom.SimpleGeometry);


/**
 * @inheritDoc
 * @todo api
 */
ol.geom.Circle.prototype.clone = function() {
  var circle = new ol.geom.Circle(null);
  circle.setFlatCoordinates(this.layout, this.flatCoordinates.slice());
  return circle;
};


/**
 * @inheritDoc
 */
ol.geom.Circle.prototype.closestPointXY =
    function(x, y, closestPoint, minSquaredDistance) {
  var flatCoordinates = this.flatCoordinates;
  var dx = x - flatCoordinates[0];
  var dy = y - flatCoordinates[1];
  var squaredDistance = dx * dx + dy * dy;
  if (squaredDistance < minSquaredDistance) {
    var i;
    if (squaredDistance === 0) {
      for (i = 0; i < this.stride; ++i) {
        closestPoint[i] = flatCoordinates[i];
      }
    } else {
      var delta = this.getRadius() / Math.sqrt(squaredDistance);
      closestPoint[0] = flatCoordinates[0] + delta * dx;
      closestPoint[1] = flatCoordinates[1] + delta * dy;
      for (i = 2; i < this.stride; ++i) {
        closestPoint[i] = flatCoordinates[i];
      }
    }
    closestPoint.length = this.stride;
    return squaredDistance;
  } else {
    return minSquaredDistance;
  }
};


/**
 * @inheritDoc
 */
ol.geom.Circle.prototype.containsXY = function(x, y) {
  var flatCoordinates = this.flatCoordinates;
  var dx = x - flatCoordinates[0];
  var dy = y - flatCoordinates[1];
  return dx * dx + dy * dy <= this.getRadiusSquared_();
};


/**
 * @return {ol.geom.RawPoint} Center.
 * @todo api
 */
ol.geom.Circle.prototype.getCenter = function() {
  return this.flatCoordinates.slice(0, this.stride);
};


/**
 * @inheritDoc
 * @todo api
 */
ol.geom.Circle.prototype.getExtent = function(opt_extent) {
  if (this.extentRevision != this.getRevision()) {
    var flatCoordinates = this.flatCoordinates;
    var radius = flatCoordinates[this.stride] - flatCoordinates[0];
    this.extent = ol.extent.createOrUpdate(
        flatCoordinates[0] - radius, flatCoordinates[1] - radius,
        flatCoordinates[0] + radius, flatCoordinates[1] + radius,
        this.extent);
    this.extentRevision = this.getRevision();
  }
  goog.asserts.assert(goog.isDef(this.extent));
  return ol.extent.returnOrUpdate(this.extent, opt_extent);
};


/**
 * @return {number} Radius.
 * @todo api
 */
ol.geom.Circle.prototype.getRadius = function() {
  return Math.sqrt(this.getRadiusSquared_());
};


/**
 * @private
 * @return {number} Radius squared.
 */
ol.geom.Circle.prototype.getRadiusSquared_ = function() {
  var dx = this.flatCoordinates[this.stride] - this.flatCoordinates[0];
  var dy = this.flatCoordinates[this.stride + 1] - this.flatCoordinates[1];
  return dx * dx + dy * dy;
};


/**
 * @inheritDoc
 * @todo api
 */
ol.geom.Circle.prototype.getSimplifiedGeometry = function(squaredTolerance) {
  return this;
};


/**
 * @inheritDoc
 * @todo api
 */
ol.geom.Circle.prototype.getType = function() {
  return ol.geom.GeometryType.CIRCLE;
};


/**
 * @param {ol.geom.RawPoint} center Center.
 * @todo api
 */
ol.geom.Circle.prototype.setCenter = function(center) {
  var stride = this.stride;
  goog.asserts.assert(center.length == stride);
  var radius = this.flatCoordinates[stride] - this.flatCoordinates[0];
  var flatCoordinates = center.slice();
  flatCoordinates[stride] = flatCoordinates[0] + radius;
  var i;
  for (i = 1; i < stride; ++i) {
    flatCoordinates[stride + i] = center[i];
  }
  this.setFlatCoordinates(this.layout, flatCoordinates);
};


/**
 * @param {ol.geom.RawPoint} center Center.
 * @param {number} radius Radius.
 * @param {ol.geom.GeometryLayout=} opt_layout Layout.
 * @todo api
 */
ol.geom.Circle.prototype.setCenterAndRadius =
    function(center, radius, opt_layout) {
  if (goog.isNull(center)) {
    this.setFlatCoordinates(ol.geom.GeometryLayout.XY, null);
  } else {
    this.setLayout(opt_layout, center, 0);
    if (goog.isNull(this.flatCoordinates)) {
      this.flatCoordinates = [];
    }
    /** @type {Array.<number>} */
    var flatCoordinates = this.flatCoordinates;
    var offset = ol.geom.flat.deflate.coordinate(
        flatCoordinates, 0, center, this.stride);
    flatCoordinates[offset++] = flatCoordinates[0] + radius;
    var i, ii;
    for (i = 1, ii = this.stride; i < ii; ++i) {
      flatCoordinates[offset++] = flatCoordinates[i];
    }
    flatCoordinates.length = offset;
    this.dispatchChangeEvent();
  }
};


/**
 * @param {ol.geom.GeometryLayout} layout Layout.
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 */
ol.geom.Circle.prototype.setFlatCoordinates =
    function(layout, flatCoordinates) {
  this.setFlatCoordinatesInternal(layout, flatCoordinates);
  this.dispatchChangeEvent();
};


/**
 * @param {number} radius Radius.
 * @todo api
 */
ol.geom.Circle.prototype.setRadius = function(radius) {
  goog.asserts.assert(!goog.isNull(this.flatCoordinates));
  this.flatCoordinates[this.stride] = this.flatCoordinates[0] + radius;
  this.dispatchChangeEvent();
};


/**
 * @inheritDoc
 */
ol.geom.Circle.prototype.transform = goog.abstractMethod;
