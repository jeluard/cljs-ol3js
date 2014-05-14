// FIXME decide default value for snapToPixel

goog.provide('ol.style.Icon');
goog.provide('ol.style.IconAnchorOrigin');
goog.provide('ol.style.IconAnchorUnits');
goog.provide('ol.style.IconImageCache');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('ol.dom');
goog.require('ol.style.Image');
goog.require('ol.style.ImageState');


/**
 * @enum {string}
 */
ol.style.IconAnchorOrigin = {
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right'
};


/**
 * @enum {string}
 */
ol.style.IconAnchorUnits = {
  FRACTION: 'fraction',
  PIXELS: 'pixels'
};



/**
 * @constructor
 * @param {olx.style.IconOptions=} opt_options Options.
 * @extends {ol.style.Image}
 * @todo api
 */
ol.style.Icon = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};

  /**
   * @private
   * @type {Array.<number>}
   */
  this.anchor_ = goog.isDef(options.anchor) ? options.anchor : [0.5, 0.5];

  /**
   * @private
   * @type {ol.style.IconAnchorOrigin}
   */
  this.anchorOrigin_ = goog.isDef(options.anchorOrigin) ?
      options.anchorOrigin : ol.style.IconAnchorOrigin.TOP_LEFT;

  /**
   * @private
   * @type {ol.style.IconAnchorUnits}
   */
  this.anchorXUnits_ = goog.isDef(options.anchorXUnits) ?
      options.anchorXUnits : ol.style.IconAnchorUnits.FRACTION;

  /**
   * @private
   * @type {ol.style.IconAnchorUnits}
   */
  this.anchorYUnits_ = goog.isDef(options.anchorYUnits) ?
      options.anchorYUnits : ol.style.IconAnchorUnits.FRACTION;

  /**
   * @type {?string}
   */
  var crossOrigin =
      goog.isDef(options.crossOrigin) ? options.crossOrigin : null;

  /**
   * @private
   * @type {ol.style.IconImage_}
   */
  this.iconImage_ = ol.style.IconImage_.get(options.src, crossOrigin);

  /**
   * @private
   * @type {ol.Size}
   */
  this.size_ = goog.isDef(options.size) ? options.size : null;

  /**
   * @type {number}
   */
  var opacity = goog.isDef(options.opacity) ? options.opacity : 1;

  /**
   * @type {boolean}
   */
  var rotateWithView = goog.isDef(options.rotateWithView) ?
      options.rotateWithView : false;

  /**
   * @type {number}
   */
  var rotation = goog.isDef(options.rotation) ? options.rotation : 0;

  /**
   * @type {number}
   */
  var scale = goog.isDef(options.scale) ? options.scale : 1;

  goog.base(this, {
    opacity: opacity,
    rotation: rotation,
    scale: scale,
    snapToPixel: undefined,
    rotateWithView: rotateWithView
  });

};
goog.inherits(ol.style.Icon, ol.style.Image);


/**
 * @inheritDoc
 * @todo api
 */
ol.style.Icon.prototype.getAnchor = function() {
  var anchor = this.anchor_;
  var size = this.getSize();
  if (this.anchorXUnits_ == ol.style.IconAnchorUnits.FRACTION ||
      this.anchorYUnits_ == ol.style.IconAnchorUnits.FRACTION) {
    if (goog.isNull(size)) {
      return null;
    }
    anchor = this.anchor_.slice();
    if (this.anchorXUnits_ == ol.style.IconAnchorUnits.FRACTION) {
      anchor[0] *= size[0];
    }
    if (this.anchorYUnits_ == ol.style.IconAnchorUnits.FRACTION) {
      anchor[1] *= size[1];
    }
  }

  if (this.anchorOrigin_ != ol.style.IconAnchorOrigin.TOP_LEFT) {
    if (goog.isNull(size)) {
      return null;
    }
    if (anchor === this.anchor_) {
      anchor = this.anchor_.slice();
    }
    if (this.anchorOrigin_ == ol.style.IconAnchorOrigin.TOP_RIGHT ||
        this.anchorOrigin_ == ol.style.IconAnchorOrigin.BOTTOM_RIGHT) {
      anchor[0] = -anchor[0] + size[0];
    }
    if (this.anchorOrigin_ == ol.style.IconAnchorOrigin.BOTTOM_LEFT ||
        this.anchorOrigin_ == ol.style.IconAnchorOrigin.BOTTOM_RIGHT) {
      anchor[1] = -anchor[1] + size[1];
    }
  }
  return anchor;
};


/**
 * @inheritDoc
 * @todo api
 */
ol.style.Icon.prototype.getImage = function(pixelRatio) {
  return this.iconImage_.getImage(pixelRatio);
};


/**
 * @inheritDoc
 */
ol.style.Icon.prototype.getImageState = function() {
  return this.iconImage_.getImageState();
};


/**
 * @inheritDoc
 */
ol.style.Icon.prototype.getHitDetectionImage = function(pixelRatio) {
  return this.iconImage_.getHitDetectionImage(pixelRatio);
};


/**
 * @return {string|undefined} Image src.
 * @todo api
 */
ol.style.Icon.prototype.getSrc = function() {
  return this.iconImage_.getSrc();
};


/**
 * @inheritDoc
 * @todo api
 */
ol.style.Icon.prototype.getSize = function() {
  return goog.isNull(this.size_) ? this.iconImage_.getSize() : this.size_;
};


/**
 * @inheritDoc
 */
ol.style.Icon.prototype.listenImageChange = function(listener, thisArg) {
  return goog.events.listen(this.iconImage_, goog.events.EventType.CHANGE,
      listener, false, thisArg);
};


/**
 * Load not yet loaded URI.
 */
ol.style.Icon.prototype.load = function() {
  this.iconImage_.load();
};


/**
 * @inheritDoc
 */
ol.style.Icon.prototype.unlistenImageChange = function(listener, thisArg) {
  goog.events.unlisten(this.iconImage_, goog.events.EventType.CHANGE,
      listener, false, thisArg);
};



/**
 * @constructor
 * @param {string} src Src.
 * @param {?string} crossOrigin Cross origin.
 * @extends {goog.events.EventTarget}
 * @private
 */
ol.style.IconImage_ = function(src, crossOrigin) {

  goog.base(this);

  /**
   * @private
   * @type {Image|HTMLCanvasElement}
   */
  this.hitDetectionImage_ = null;

  /**
   * @private
   * @type {Image}
   */
  this.image_ = new Image();

  if (!goog.isNull(crossOrigin)) {
    this.image_.crossOrigin = crossOrigin;
  }

  /**
   * @private
   * @type {Array.<number>}
   */
  this.imageListenerKeys_ = null;

  /**
   * @private
   * @type {ol.style.ImageState}
   */
  this.imageState_ = ol.style.ImageState.IDLE;

  /**
   * @private
   * @type {ol.Size}
   */
  this.size_ = null;

  /**
   * @private
   * @type {string}
   */
  this.src_ = src;

  /**
   * @private
   * @type {boolean}
   */
  this.tainting_ = false;

};
goog.inherits(ol.style.IconImage_, goog.events.EventTarget);


/**
 * @param {string} src Src.
 * @param {?string} crossOrigin Cross origin.
 * @return {ol.style.IconImage_} Icon image.
 */
ol.style.IconImage_.get = function(src, crossOrigin) {
  var iconImageCache = ol.style.IconImageCache.getInstance();
  var iconImage = iconImageCache.get(src, crossOrigin);
  if (goog.isNull(iconImage)) {
    iconImage = new ol.style.IconImage_(src, crossOrigin);
    iconImageCache.set(src, crossOrigin, iconImage);
  }
  return iconImage;
};


/**
 * @private
 */
ol.style.IconImage_.prototype.determineTainting_ = function() {
  var context = ol.dom.createCanvasContext2D(1, 1);
  context.drawImage(this.image_, 0, 0);
  try {
    context.getImageData(0, 0, 1, 1);
  } catch (e) {
    this.tainting_ = true;
  }
};


/**
 * @private
 */
ol.style.IconImage_.prototype.dispatchChangeEvent_ = function() {
  this.dispatchEvent(goog.events.EventType.CHANGE);
};


/**
 * @private
 */
ol.style.IconImage_.prototype.handleImageError_ = function() {
  this.imageState_ = ol.style.ImageState.ERROR;
  this.unlistenImage_();
  this.dispatchChangeEvent_();
};


/**
 * @private
 */
ol.style.IconImage_.prototype.handleImageLoad_ = function() {
  this.imageState_ = ol.style.ImageState.LOADED;
  this.size_ = [this.image_.width, this.image_.height];
  this.unlistenImage_();
  this.determineTainting_();
  this.dispatchChangeEvent_();
};


/**
 * @param {number} pixelRatio Pixel ratio.
 * @return {Image} Image element.
 */
ol.style.IconImage_.prototype.getImage = function(pixelRatio) {
  return this.image_;
};


/**
 * @return {ol.style.ImageState} Image state.
 */
ol.style.IconImage_.prototype.getImageState = function() {
  return this.imageState_;
};


/**
 * @param {number} pixelRatio Pixel ratio.
 * @return {Image|HTMLCanvasElement} Image element.
 */
ol.style.IconImage_.prototype.getHitDetectionImage = function(pixelRatio) {
  if (goog.isNull(this.hitDetectionImage_)) {
    if (this.tainting_) {
      var width = this.size_[0];
      var height = this.size_[1];
      var context = ol.dom.createCanvasContext2D(width, height);
      context.fillRect(0, 0, width, height);
      this.hitDetectionImage_ = context.canvas;
    } else {
      this.hitDetectionImage_ = this.image_;
    }
  }
  return this.hitDetectionImage_;
};


/**
 * @return {ol.Size} Image size.
 */
ol.style.IconImage_.prototype.getSize = function() {
  return this.size_;
};


/**
 * @return {string|undefined} Image src.
 */
ol.style.IconImage_.prototype.getSrc = function() {
  return this.src_;
};


/**
 * Load not yet loaded URI.
 */
ol.style.IconImage_.prototype.load = function() {
  if (this.imageState_ == ol.style.ImageState.IDLE) {
    goog.asserts.assert(goog.isDef(this.src_));
    goog.asserts.assert(goog.isNull(this.imageListenerKeys_));
    this.imageState_ = ol.style.ImageState.LOADING;
    this.imageListenerKeys_ = [
      goog.events.listenOnce(this.image_, goog.events.EventType.ERROR,
          this.handleImageError_, false, this),
      goog.events.listenOnce(this.image_, goog.events.EventType.LOAD,
          this.handleImageLoad_, false, this)
    ];
    try {
      this.image_.src = this.src_;
    } catch (e) {
      this.handleImageError_();
    }
  }
};


/**
 * Discards event handlers which listen for load completion or errors.
 *
 * @private
 */
ol.style.IconImage_.prototype.unlistenImage_ = function() {
  goog.asserts.assert(!goog.isNull(this.imageListenerKeys_));
  goog.array.forEach(this.imageListenerKeys_, goog.events.unlistenByKey);
  this.imageListenerKeys_ = null;
};



/**
 * @constructor
 */
ol.style.IconImageCache = function() {

  /**
   * @type {Object.<string, ol.style.IconImage_>}
   * @private
   */
  this.cache_ = {};

  /**
   * @type {number}
   * @private
   */
  this.cacheSize_ = 0;

  /**
   * @const
   * @type {number}
   * @private
   */
  this.maxCacheSize_ = 32;
};
goog.addSingletonGetter(ol.style.IconImageCache);


/**
 * @param {string} src Src.
 * @param {?string} crossOrigin Cross origin.
 * @return {string} Cache key.
 */
ol.style.IconImageCache.getKey = function(src, crossOrigin) {
  goog.asserts.assert(goog.isDef(crossOrigin));
  return crossOrigin + ':' + src;
};


/**
 * FIXME empty description for jsdoc
 */
ol.style.IconImageCache.prototype.clear = function() {
  this.cache_ = {};
  this.cacheSize_ = 0;
};


/**
 * FIXME empty description for jsdoc
 */
ol.style.IconImageCache.prototype.expire = function() {
  if (this.cacheSize_ > this.maxCacheSize_) {
    var i = 0;
    var key, iconImage;
    for (key in this.cache_) {
      iconImage = this.cache_[key];
      if ((i++ & 3) === 0 && !goog.events.hasListener(iconImage)) {
        delete this.cache_[key];
        --this.cacheSize_;
      }
    }
  }
};


/**
 * @param {string} src Src.
 * @param {?string} crossOrigin Cross origin.
 * @return {ol.style.IconImage_} Icon image.
 */
ol.style.IconImageCache.prototype.get = function(src, crossOrigin) {
  var key = ol.style.IconImageCache.getKey(src, crossOrigin);
  return key in this.cache_ ? this.cache_[key] : null;
};


/**
 * @param {string} src Src.
 * @param {?string} crossOrigin Cross origin.
 * @param {ol.style.IconImage_} iconImage Icon image.
 */
ol.style.IconImageCache.prototype.set = function(src, crossOrigin, iconImage) {
  var key = ol.style.IconImageCache.getKey(src, crossOrigin);
  this.cache_[key] = iconImage;
  ++this.cacheSize_;
};
