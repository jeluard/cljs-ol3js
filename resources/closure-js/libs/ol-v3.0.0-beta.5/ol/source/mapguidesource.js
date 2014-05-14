goog.provide('ol.source.MapGuide');

goog.require('goog.object');
goog.require('goog.uri.utils');
goog.require('ol.Image');
goog.require('ol.ImageUrlFunction');
goog.require('ol.extent');
goog.require('ol.source.Image');



/**
 * @constructor
 * @extends {ol.source.Image}
 * @param {olx.source.MapGuideOptions} options Options.
 * @todo api
 */
ol.source.MapGuide = function(options) {

  goog.base(this, {
    extent: options.extent,
    projection: options.projection,
    resolutions: options.resolutions
  });

  /**
   * @private
   * @type {?string}
   */
  this.crossOrigin_ =
      goog.isDef(options.crossOrigin) ? options.crossOrigin : null;

  /**
   * @private
   * @type {number}
   */
  this.displayDpi_ = goog.isDef(options.displayDpi) ?
      options.displayDpi : 96;

  var imageUrlFunction;
  if (goog.isDef(options.url)) {
    var params = goog.isDef(options.params) ? options.params : {};
    imageUrlFunction = ol.ImageUrlFunction.createFromParamsFunction(
        options.url, params, goog.bind(this.getUrl, this));
  } else {
    imageUrlFunction = ol.ImageUrlFunction.nullImageUrlFunction;
  }

  /**
   * @private
   * @type {ol.ImageUrlFunctionType}
   */
  this.imageUrlFunction_ = imageUrlFunction;

  /**
   * @private
   * @type {boolean}
   */
  this.hidpi_ = goog.isDef(options.hidpi) ? options.hidpi : true;

  /**
   * @private
   * @type {number}
   */
  this.metersPerUnit_ = goog.isDef(options.metersPerUnit) ?
      options.metersPerUnit : 1;

  /**
   * @private
   * @type {number}
   */
  this.ratio_ = goog.isDef(options.ratio) ? options.ratio : 1;

  /**
   * @private
   * @type {boolean}
   */
  this.useOverlay_ = goog.isDef(options.useOverlay) ?
      options.useOverlay : false;

  /**
   * @private
   * @type {ol.Image}
   */
  this.image_ = null;

};
goog.inherits(ol.source.MapGuide, ol.source.Image);


/**
 * @inheritDoc
 */
ol.source.MapGuide.prototype.getImage =
    function(extent, resolution, pixelRatio, projection) {
  resolution = this.findNearestResolution(resolution);
  pixelRatio = this.hidpi_ ? pixelRatio : 1;

  var image = this.image_;
  if (!goog.isNull(image) &&
      image.getResolution() == resolution &&
      image.getPixelRatio() == pixelRatio &&
      ol.extent.containsExtent(image.getExtent(), extent)) {
    return image;
  }

  if (this.ratio_ != 1) {
    extent = extent.slice();
    ol.extent.scaleFromCenter(extent, this.ratio_);
  }
  var width = ol.extent.getWidth(extent) / resolution;
  var height = ol.extent.getHeight(extent) / resolution;
  var size = [width * pixelRatio, height * pixelRatio];

  var imageUrl = this.imageUrlFunction_(extent, size, projection);
  if (goog.isDef(imageUrl)) {
    image = new ol.Image(extent, resolution, pixelRatio,
        this.getAttributions(), imageUrl, this.crossOrigin_);
  } else {
    image = null;
  }
  this.image_ = image;

  return image;
};


/**
 * @param {ol.Extent} extent The map extents.
 * @param {ol.Size} size the viewport size.
 * @param {number} metersPerUnit The meters-per-unit value.
 * @param {number} dpi The display resolution.
 * @return {number} The computed map scale.
 */
ol.source.MapGuide.getScale = function(extent, size, metersPerUnit, dpi) {
  var mcsW = ol.extent.getWidth(extent);
  var mcsH = ol.extent.getHeight(extent);
  var devW = size[0];
  var devH = size[1];
  var mpp = 0.0254 / dpi;
  if (devH * mcsW > devW * mcsH) {
    return mcsW * metersPerUnit / (devW * mpp); // width limited
  } else {
    return mcsH * metersPerUnit / (devH * mpp); // height limited
  }
};


/**
 * @param {string} baseUrl The mapagent url.
 * @param {Object.<string, string|number>} params Request parameters.
 * @param {ol.Extent} extent Extent.
 * @param {ol.Size} size Size.
 * @param {ol.proj.Projection} projection Projection.
 * @return {string} The mapagent map image request URL.
 */
ol.source.MapGuide.prototype.getUrl =
    function(baseUrl, params, extent, size, projection) {
  var scale = ol.source.MapGuide.getScale(extent, size,
      this.metersPerUnit_, this.displayDpi_);
  var center = ol.extent.getCenter(extent);
  var baseParams = {
    'OPERATION': this.useOverlay_ ? 'GETDYNAMICMAPOVERLAYIMAGE' : 'GETMAPIMAGE',
    'VERSION': '2.0.0',
    'LOCALE': 'en',
    'CLIENTAGENT': 'ol.source.MapGuide source',
    'CLIP': '1',
    'SETDISPLAYDPI': this.displayDpi_,
    'SETDISPLAYWIDTH': Math.round(size[0]),
    'SETDISPLAYHEIGHT': Math.round(size[1]),
    'SETVIEWSCALE': scale,
    'SETVIEWCENTERX': center[0],
    'SETVIEWCENTERY': center[1]
  };
  goog.object.extend(baseParams, params);
  return goog.uri.utils.appendParamsFromMap(baseUrl, baseParams);
};
