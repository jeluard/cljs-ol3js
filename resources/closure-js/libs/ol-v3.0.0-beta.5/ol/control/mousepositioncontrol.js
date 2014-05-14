// FIXME should listen on appropriate pane, once it is defined
// FIXME works for View2D only

goog.provide('ol.control.MousePosition');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.style');
goog.require('ol.CoordinateFormatType');
goog.require('ol.Object');
goog.require('ol.Pixel');
goog.require('ol.TransformFunction');
goog.require('ol.control.Control');
goog.require('ol.proj');
goog.require('ol.proj.Projection');


/**
 * @enum {string}
 */
ol.control.MousePositionProperty = {
  PROJECTION: 'projection',
  COORDINATE_FORMAT: 'coordinateFormat'
};



/**
 * Create a new control to show the position of the mouse in the map's
 * projection (or any other supplied projection). By default the control is
 * shown in the top right corner of the map but this can be changed by using
 * a css selector `.ol-mouse-position`.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {olx.control.MousePositionOptions=} opt_options Mouse position
 *     options.
 * @todo observable projection {ol.proj.Projection} the projection to report
 *       mouse position in
 * @todo observable coordinateFormat {ol.CoordinateFormatType} the format to
 *       render the current position in
 * @todo api
 */
ol.control.MousePosition = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};

  var className = goog.isDef(options.className) ?
      options.className : 'ol-mouse-position';

  var element = goog.dom.createDom(goog.dom.TagName.DIV, {
    'class': className
  });

  goog.base(this, {
    element: element,
    target: options.target
  });

  goog.events.listen(this,
      ol.Object.getChangeEventType(ol.control.MousePositionProperty.PROJECTION),
      this.handleProjectionChanged_, false, this);

  if (goog.isDef(options.coordinateFormat)) {
    this.setCoordinateFormat(options.coordinateFormat);
  }
  if (goog.isDef(options.projection)) {
    this.setProjection(ol.proj.get(options.projection));
  }

  /**
   * @private
   * @type {string}
   */
  this.undefinedHTML_ = goog.isDef(options.undefinedHTML) ?
      options.undefinedHTML : '';

  /**
   * @private
   * @type {string}
   */
  this.renderedHTML_ = element.innerHTML;

  /**
   * @private
   * @type {ol.proj.Projection}
   */
  this.mapProjection_ = null;

  /**
   * @private
   * @type {?ol.TransformFunction}
   */
  this.transform_ = null;

  /**
   * @private
   * @type {ol.Pixel}
   */
  this.lastMouseMovePixel_ = null;

};
goog.inherits(ol.control.MousePosition, ol.control.Control);


/**
 * @inheritDoc
 */
ol.control.MousePosition.prototype.handleMapPostrender = function(mapEvent) {
  var frameState = mapEvent.frameState;
  if (goog.isNull(frameState)) {
    this.mapProjection_ = null;
  } else {
    if (this.mapProjection_ != frameState.view2DState.projection) {
      this.mapProjection_ = frameState.view2DState.projection;
      this.transform_ = null;
    }
  }
  this.updateHTML_(this.lastMouseMovePixel_);
};


/**
 * @private
 */
ol.control.MousePosition.prototype.handleProjectionChanged_ = function() {
  this.transform_ = null;
};


/**
 * @return {ol.CoordinateFormatType|undefined} Coordinate format.
 * @todo api
 */
ol.control.MousePosition.prototype.getCoordinateFormat = function() {
  return /** @type {ol.CoordinateFormatType|undefined} */ (
      this.get(ol.control.MousePositionProperty.COORDINATE_FORMAT));
};
goog.exportProperty(
    ol.control.MousePosition.prototype,
    'getCoordinateFormat',
    ol.control.MousePosition.prototype.getCoordinateFormat);


/**
 * @return {ol.proj.Projection|undefined} Projection.
 * @todo api
 */
ol.control.MousePosition.prototype.getProjection = function() {
  return /** @type {ol.proj.Projection|undefined} */ (
      this.get(ol.control.MousePositionProperty.PROJECTION));
};
goog.exportProperty(
    ol.control.MousePosition.prototype,
    'getProjection',
    ol.control.MousePosition.prototype.getProjection);


/**
 * @param {goog.events.BrowserEvent} browserEvent Browser event.
 * @protected
 */
ol.control.MousePosition.prototype.handleMouseMove = function(browserEvent) {
  var map = this.getMap();
  var eventPosition = goog.style.getRelativePosition(
      browserEvent, map.getViewport());
  this.lastMouseMovePixel_ = [eventPosition.x, eventPosition.y];
  this.updateHTML_(this.lastMouseMovePixel_);
};


/**
 * @param {goog.events.BrowserEvent} browserEvent Browser event.
 * @protected
 */
ol.control.MousePosition.prototype.handleMouseOut = function(browserEvent) {
  this.updateHTML_(null);
  this.lastMouseMovePixel_ = null;
};


/**
 * @inheritDoc
 * @todo api
 */
ol.control.MousePosition.prototype.setMap = function(map) {
  goog.base(this, 'setMap', map);
  if (!goog.isNull(map)) {
    var viewport = map.getViewport();
    this.listenerKeys.push(
        goog.events.listen(viewport, goog.events.EventType.MOUSEMOVE,
            this.handleMouseMove, false, this),
        goog.events.listen(viewport, goog.events.EventType.MOUSEOUT,
            this.handleMouseOut, false, this)
    );
  }
};


/**
 * @param {ol.CoordinateFormatType} format Coordinate format.
 * @todo api
 */
ol.control.MousePosition.prototype.setCoordinateFormat = function(format) {
  this.set(ol.control.MousePositionProperty.COORDINATE_FORMAT, format);
};
goog.exportProperty(
    ol.control.MousePosition.prototype,
    'setCoordinateFormat',
    ol.control.MousePosition.prototype.setCoordinateFormat);


/**
 * @param {ol.proj.Projection} projection Projection.
 * @todo api
 */
ol.control.MousePosition.prototype.setProjection = function(projection) {
  this.set(ol.control.MousePositionProperty.PROJECTION, projection);
};
goog.exportProperty(
    ol.control.MousePosition.prototype,
    'setProjection',
    ol.control.MousePosition.prototype.setProjection);


/**
 * @param {?ol.Pixel} pixel Pixel.
 * @private
 */
ol.control.MousePosition.prototype.updateHTML_ = function(pixel) {
  var html = this.undefinedHTML_;
  if (!goog.isNull(pixel) && !goog.isNull(this.mapProjection_)) {
    if (goog.isNull(this.transform_)) {
      var projection = this.getProjection();
      if (goog.isDef(projection)) {
        this.transform_ = ol.proj.getTransformFromProjections(
            this.mapProjection_, projection);
      } else {
        this.transform_ = ol.proj.identityTransform;
      }
    }
    var map = this.getMap();
    var coordinate = map.getCoordinateFromPixel(pixel);
    if (!goog.isNull(coordinate)) {
      this.transform_(coordinate, coordinate);
      var coordinateFormat = this.getCoordinateFormat();
      if (goog.isDef(coordinateFormat)) {
        html = coordinateFormat(coordinate);
      } else {
        html = coordinate.toString();
      }
    }
  }
  if (!goog.isDef(this.renderedHTML_) || html != this.renderedHTML_) {
    this.element.innerHTML = html;
    this.renderedHTML_ = html;
  }
};
