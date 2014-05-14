goog.provide('ol.proj.EPSG3857');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('ol.math');
goog.require('ol.proj');
goog.require('ol.proj.Projection');
goog.require('ol.proj.Units');



/**
 * @constructor
 * @extends {ol.proj.Projection}
 * @param {string} code Code.
 * @todo api
 */
ol.proj.EPSG3857 = function(code) {
  goog.base(this, {
    code: code,
    units: ol.proj.Units.METERS,
    extent: ol.proj.EPSG3857.EXTENT,
    global: true
  });
};
goog.inherits(ol.proj.EPSG3857, ol.proj.Projection);


/**
 * @const
 * @type {number}
 */
ol.proj.EPSG3857.RADIUS = 6378137;


/**
 * @const
 * @type {number}
 */
ol.proj.EPSG3857.HALF_SIZE = Math.PI * ol.proj.EPSG3857.RADIUS;


/**
 * @const
 * @type {ol.Extent}
 */
ol.proj.EPSG3857.EXTENT = [
  -ol.proj.EPSG3857.HALF_SIZE, -ol.proj.EPSG3857.HALF_SIZE,
  ol.proj.EPSG3857.HALF_SIZE, ol.proj.EPSG3857.HALF_SIZE
];


/**
 * Lists several projection codes with the same meaning as EPSG:3857.
 *
 * @type {Array.<string>}
 */
ol.proj.EPSG3857.CODES = [
  'EPSG:3857',
  'EPSG:102100',
  'EPSG:102113',
  'EPSG:900913',
  'urn:ogc:def:crs:EPSG:6.18:3:3857',
  'http://www.opengis.net/gml/srs/epsg.xml#3857'
];


/**
 * Projections equal to EPSG:3857.
 *
 * @const
 * @type {Array.<ol.proj.Projection>}
 */
ol.proj.EPSG3857.PROJECTIONS = goog.array.map(
    ol.proj.EPSG3857.CODES,
    function(code) {
      return new ol.proj.EPSG3857(code);
    });


/**
 * Transformation from EPSG:4326 to EPSG:3857.
 *
 * @param {Array.<number>} input Input array of coordinate values.
 * @param {Array.<number>=} opt_output Output array of coordinate values.
 * @param {number=} opt_dimension Dimension (default is `2`).
 * @return {Array.<number>} Output array of coordinate values.
 */
ol.proj.EPSG3857.fromEPSG4326 = function(input, opt_output, opt_dimension) {
  var length = input.length,
      dimension = opt_dimension > 1 ? opt_dimension : 2,
      output = opt_output;
  if (!goog.isDef(output)) {
    if (dimension > 2) {
      // preserve values beyond second dimension
      output = input.slice();
    } else {
      output = new Array(length);
    }
  }
  goog.asserts.assert(output.length % dimension === 0);
  for (var i = 0; i < length; i += dimension) {
    output[i] = ol.proj.EPSG3857.RADIUS * Math.PI * input[i] / 180;
    output[i + 1] = ol.proj.EPSG3857.RADIUS *
        Math.log(Math.tan(Math.PI * (input[i + 1] + 90) / 360));
  }
  return output;
};


/**
 * Transformation from EPSG:3857 to EPSG:4326.
 *
 * @param {Array.<number>} input Input array of coordinate values.
 * @param {Array.<number>=} opt_output Output array of coordinate values.
 * @param {number=} opt_dimension Dimension (default is `2`).
 * @return {Array.<number>} Output array of coordinate values.
 */
ol.proj.EPSG3857.toEPSG4326 = function(input, opt_output, opt_dimension) {
  var length = input.length,
      dimension = opt_dimension > 1 ? opt_dimension : 2,
      output = opt_output;
  if (!goog.isDef(output)) {
    if (dimension > 2) {
      // preserve values beyond second dimension
      output = input.slice();
    } else {
      output = new Array(length);
    }
  }
  goog.asserts.assert(output.length % dimension === 0);
  for (var i = 0; i < length; i += dimension) {
    output[i] = 180 * input[i] / (ol.proj.EPSG3857.RADIUS * Math.PI);
    output[i + 1] = 360 * Math.atan(
        Math.exp(input[i + 1] / ol.proj.EPSG3857.RADIUS)) / Math.PI - 90;
  }
  return output;
};


/**
 * @inheritDoc
 */
ol.proj.EPSG3857.prototype.getPointResolution = function(resolution, point) {
  return resolution / ol.math.cosh(point[1] / ol.proj.EPSG3857.RADIUS);
};
