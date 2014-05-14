goog.provide('ol.source.XYZ');

goog.require('ol.Attribution');
goog.require('ol.TileUrlFunction');
goog.require('ol.TileUrlFunctionType');
goog.require('ol.source.TileImage');
goog.require('ol.tilegrid.XYZ');



/**
 * @constructor
 * @extends {ol.source.TileImage}
 * @param {olx.source.XYZOptions} options XYZ options.
 * @todo api
 */
ol.source.XYZ = function(options) {

  var projection = goog.isDef(options.projection) ?
      options.projection : 'EPSG:3857';

  var maxZoom = goog.isDef(options.maxZoom) ? options.maxZoom : 18;

  var tileGrid = new ol.tilegrid.XYZ({
    maxZoom: maxZoom
  });

  goog.base(this, {
    attributions: options.attributions,
    crossOrigin: options.crossOrigin,
    extent: options.extent,
    logo: options.logo,
    projection: projection,
    tileGrid: tileGrid,
    tileLoadFunction: options.tileLoadFunction,
    tileUrlFunction: ol.TileUrlFunction.nullTileUrlFunction
  });

  /**
   * @private
   * @type {ol.TileCoordTransformType}
   */
  this.tileCoordTransform_ = tileGrid.createTileCoordTransform({
    extent: options.extent,
    wrapX: options.wrapX
  });

  if (goog.isDef(options.tileUrlFunction)) {
    this.setTileUrlFunction(options.tileUrlFunction);
  } else if (goog.isDef(options.urls)) {
    this.setUrls(options.urls);
  } else if (goog.isDef(options.url)) {
    this.setUrl(options.url);
  }

};
goog.inherits(ol.source.XYZ, ol.source.TileImage);


/**
 * @param {ol.TileUrlFunctionType} tileUrlFunction Tile URL function.
 */
ol.source.XYZ.prototype.setTileUrlFunction = function(tileUrlFunction) {
  goog.base(this, 'setTileUrlFunction',
      ol.TileUrlFunction.withTileCoordTransform(
          this.tileCoordTransform_, tileUrlFunction));
};


/**
 * @param {string} url URL.
 * @todo api
 */
ol.source.XYZ.prototype.setUrl = function(url) {
  this.setTileUrlFunction(ol.TileUrlFunction.createFromTemplates(
      ol.TileUrlFunction.expandUrl(url)));
};


/**
 * @param {Array.<string>} urls URLs.
 */
ol.source.XYZ.prototype.setUrls = function(urls) {
  this.setTileUrlFunction(ol.TileUrlFunction.createFromTemplates(urls));
};
