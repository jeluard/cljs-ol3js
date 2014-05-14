// FIXME works for View2D only

goog.provide('ol.animation');

goog.require('ol.PreRenderFunction');
goog.require('ol.ViewHint');
goog.require('ol.coordinate');
goog.require('ol.easing');


/**
 * @param {olx.animation.BounceOptions} options Bounce options.
 * @return {ol.PreRenderFunction} Pre-render function.
 * @todo api
 */
ol.animation.bounce = function(options) {
  var resolution = options.resolution;
  var start = goog.isDef(options.start) ? options.start : goog.now();
  var duration = goog.isDef(options.duration) ? options.duration : 1000;
  var easing = goog.isDef(options.easing) ?
      options.easing : ol.easing.upAndDown;
  return (
      /**
       * @param {ol.Map} map Map.
       * @param {?oli.FrameState} frameState Frame state.
       */
      function(map, frameState) {
        if (frameState.time < start) {
          frameState.animate = true;
          frameState.viewHints[ol.ViewHint.ANIMATING] += 1;
          return true;
        } else if (frameState.time < start + duration) {
          var delta = easing((frameState.time - start) / duration);
          var deltaResolution = resolution - frameState.view2DState.resolution;
          frameState.animate = true;
          frameState.view2DState.resolution += delta * deltaResolution;
          frameState.viewHints[ol.ViewHint.ANIMATING] += 1;
          return true;
        } else {
          return false;
        }
      });
};


/**
 * @param {olx.animation.PanOptions} options Pan options.
 * @return {ol.PreRenderFunction} Pre-render function.
 * @todo api
 */
ol.animation.pan = function(options) {
  var source = options.source;
  var start = goog.isDef(options.start) ? options.start : goog.now();
  var sourceX = source[0];
  var sourceY = source[1];
  var duration = goog.isDef(options.duration) ? options.duration : 1000;
  var easing = goog.isDef(options.easing) ?
      options.easing : ol.easing.inAndOut;
  return (
      /**
       * @param {ol.Map} map Map.
       * @param {?oli.FrameState} frameState Frame state.
       */
      function(map, frameState) {
        if (frameState.time < start) {
          frameState.animate = true;
          frameState.viewHints[ol.ViewHint.ANIMATING] += 1;
          return true;
        } else if (frameState.time < start + duration) {
          var delta = 1 - easing((frameState.time - start) / duration);
          var deltaX = sourceX - frameState.view2DState.center[0];
          var deltaY = sourceY - frameState.view2DState.center[1];
          frameState.animate = true;
          frameState.view2DState.center[0] += delta * deltaX;
          frameState.view2DState.center[1] += delta * deltaY;
          frameState.viewHints[ol.ViewHint.ANIMATING] += 1;
          return true;
        } else {
          return false;
        }
      });
};


/**
 * @param {olx.animation.RotateOptions} options Rotate options.
 * @return {ol.PreRenderFunction} Pre-render function.
 * @todo api
 */
ol.animation.rotate = function(options) {
  var sourceRotation = goog.isDef(options.rotation) ? options.rotation : 0;
  var start = goog.isDef(options.start) ? options.start : goog.now();
  var duration = goog.isDef(options.duration) ? options.duration : 1000;
  var easing = goog.isDef(options.easing) ?
      options.easing : ol.easing.inAndOut;
  var anchor = goog.isDef(options.anchor) ?
      options.anchor : null;

  return (
      /**
       * @param {ol.Map} map Map.
       * @param {?oli.FrameState} frameState Frame state.
       */
      function(map, frameState) {
        if (frameState.time < start) {
          frameState.animate = true;
          frameState.viewHints[ol.ViewHint.ANIMATING] += 1;
          return true;
        } else if (frameState.time < start + duration) {
          var delta = 1 - easing((frameState.time - start) / duration);
          var deltaRotation =
              (sourceRotation - frameState.view2DState.rotation) * delta;
          frameState.animate = true;
          frameState.view2DState.rotation += deltaRotation;
          if (!goog.isNull(anchor)) {
            var center = frameState.view2DState.center;
            ol.coordinate.sub(center, anchor);
            ol.coordinate.rotate(center, deltaRotation);
            ol.coordinate.add(center, anchor);
          }
          frameState.viewHints[ol.ViewHint.ANIMATING] += 1;
          return true;
        } else {
          return false;
        }
      });
};


/**
 * @param {olx.animation.ZoomOptions} options Zoom options.
 * @return {ol.PreRenderFunction} Pre-render function.
 * @todo api
 */
ol.animation.zoom = function(options) {
  var sourceResolution = options.resolution;
  var start = goog.isDef(options.start) ? options.start : goog.now();
  var duration = goog.isDef(options.duration) ? options.duration : 1000;
  var easing = goog.isDef(options.easing) ?
      options.easing : ol.easing.inAndOut;
  return (
      /**
       * @param {ol.Map} map Map.
       * @param {?oli.FrameState} frameState Frame state.
       */
      function(map, frameState) {
        if (frameState.time < start) {
          frameState.animate = true;
          frameState.viewHints[ol.ViewHint.ANIMATING] += 1;
          return true;
        } else if (frameState.time < start + duration) {
          var delta = 1 - easing((frameState.time - start) / duration);
          var deltaResolution =
              sourceResolution - frameState.view2DState.resolution;
          frameState.animate = true;
          frameState.view2DState.resolution += delta * deltaResolution;
          frameState.viewHints[ol.ViewHint.ANIMATING] += 1;
          return true;
        } else {
          return false;
        }
      });
};
