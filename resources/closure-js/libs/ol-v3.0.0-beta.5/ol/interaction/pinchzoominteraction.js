// FIXME works for View2D only

goog.provide('ol.interaction.PinchZoom');

goog.require('goog.asserts');
goog.require('goog.style');
goog.require('ol.Coordinate');
goog.require('ol.ViewHint');
goog.require('ol.interaction.Interaction');
goog.require('ol.interaction.Pointer');



/**
 * Allows the user to zoom the map by pinching with two fingers
 * on a touch screen.
 * @constructor
 * @extends {ol.interaction.Pointer}
 * @param {olx.interaction.PinchZoomOptions=} opt_options Options.
 * @todo api
 */
ol.interaction.PinchZoom = function(opt_options) {

  var options = goog.isDef(opt_options) ? opt_options : {};

  goog.base(this);

  /**
   * @private
   * @type {ol.Coordinate}
   */
  this.anchor_ = null;

  /**
   * @private
   * @type {number}
   */
  this.duration_ = goog.isDef(options.duration) ? options.duration : 400;

  /**
   * @private
   * @type {number|undefined}
   */
  this.lastDistance_ = undefined;

  /**
   * @private
   * @type {number}
   */
  this.lastScaleDelta_ = 1;

};
goog.inherits(ol.interaction.PinchZoom, ol.interaction.Pointer);


/**
 * @inheritDoc
 */
ol.interaction.PinchZoom.prototype.handlePointerDrag =
    function(mapBrowserEvent) {
  goog.asserts.assert(this.targetPointers.length >= 2);
  var scaleDelta = 1.0;

  var touch0 = this.targetPointers[0];
  var touch1 = this.targetPointers[1];
  var dx = touch0.clientX - touch1.clientX;
  var dy = touch0.clientY - touch1.clientY;

  // distance between touches
  var distance = Math.sqrt(dx * dx + dy * dy);

  if (goog.isDef(this.lastDistance_)) {
    scaleDelta = this.lastDistance_ / distance;
  }
  this.lastDistance_ = distance;
  if (scaleDelta != 1.0) {
    this.lastScaleDelta_ = scaleDelta;
  }

  var map = mapBrowserEvent.map;
  // FIXME works for View2D only
  var view = map.getView().getView2D();
  var view2DState = view.getView2DState();

  // scale anchor point.
  var viewportPosition = goog.style.getClientPosition(map.getViewport());
  var centroid =
      ol.interaction.Pointer.centroid(this.targetPointers);
  centroid[0] -= viewportPosition.x;
  centroid[1] -= viewportPosition.y;
  this.anchor_ = map.getCoordinateFromPixel(centroid);

  // scale, bypass the resolution constraint
  map.render();
  ol.interaction.Interaction.zoomWithoutConstraints(
      map, view, view2DState.resolution * scaleDelta, this.anchor_);

};


/**
 * @inheritDoc
 */
ol.interaction.PinchZoom.prototype.handlePointerUp =
    function(mapBrowserEvent) {
  if (this.targetPointers.length < 2) {
    var map = mapBrowserEvent.map;
    var view = map.getView();
    view.setHint(ol.ViewHint.INTERACTING, -1);
    // FIXME works for View2D only
    var view2D = view.getView2D();
    var view2DState = view2D.getView2DState();
    // Zoom to final resolution, with an animation, and provide a
    // direction not to zoom out/in if user was pinching in/out.
    // Direction is > 0 if pinching out, and < 0 if pinching in.
    var direction = this.lastScaleDelta_ - 1;
    ol.interaction.Interaction.zoom(map, view2D, view2DState.resolution,
        this.anchor_, this.duration_, direction);
    return false;
  } else {
    return true;
  }
};


/**
 * @inheritDoc
 */
ol.interaction.PinchZoom.prototype.handlePointerDown =
    function(mapBrowserEvent) {
  if (this.targetPointers.length >= 2) {
    var map = mapBrowserEvent.map;
    this.anchor_ = null;
    this.lastDistance_ = undefined;
    this.lastScaleDelta_ = 1;
    if (!this.handlingDownUpSequence) {
      map.getView().setHint(ol.ViewHint.INTERACTING, 1);
    }
    map.render();
    return true;
  } else {
    return false;
  }
};
