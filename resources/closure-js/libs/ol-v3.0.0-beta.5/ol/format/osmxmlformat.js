// FIXME add typedef for stack state objects
goog.provide('ol.format.OSMXML');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom.NodeType');
goog.require('goog.object');
goog.require('ol.Feature');
goog.require('ol.format.XMLFeature');
goog.require('ol.geom.LineString');
goog.require('ol.geom.Point');
goog.require('ol.geom.Polygon');
goog.require('ol.proj');
goog.require('ol.xml');



/**
 * @constructor
 * @extends {ol.format.XMLFeature}
 * @todo api
 */
ol.format.OSMXML = function() {
  goog.base(this);
};
goog.inherits(ol.format.OSMXML, ol.format.XMLFeature);


/**
 * @const
 * @type {Array.<string>}
 * @private
 */
ol.format.OSMXML.EXTENSIONS_ = ['.osm'];


/**
 * @inheritDoc
 */
ol.format.OSMXML.prototype.getExtensions = function() {
  return ol.format.OSMXML.EXTENSIONS_;
};


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @private
 */
ol.format.OSMXML.readNode_ = function(node, objectStack) {
  goog.asserts.assert(node.nodeType == goog.dom.NodeType.ELEMENT);
  goog.asserts.assert(node.localName == 'node');
  var state = /** @type {Object} */ (objectStack[objectStack.length - 1]);
  var id = node.getAttribute('id');
  var coordinates = /** @type {Array.<number>} */ ([
    parseFloat(node.getAttribute('lon')),
    parseFloat(node.getAttribute('lat'))
  ]);
  goog.object.set(state.nodes, id, coordinates);

  var values = ol.xml.pushParseAndPop({
    tags: {}
  }, ol.format.OSMXML.NODE_PARSERS_, node, objectStack);
  if (!goog.object.isEmpty(values.tags)) {
    var geometry = new ol.geom.Point(coordinates);
    var feature = new ol.Feature(geometry);
    feature.setId(id);
    feature.setValues(values.tags);
    state.features.push(feature);
  }
};


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @private
 */
ol.format.OSMXML.readWay_ = function(node, objectStack) {
  goog.asserts.assert(node.nodeType == goog.dom.NodeType.ELEMENT);
  goog.asserts.assert(node.localName == 'way');
  var id = node.getAttribute('id');
  var values = ol.xml.pushParseAndPop({
    ndrefs: [],
    tags: {}
  }, ol.format.OSMXML.WAY_PARSERS_, node, objectStack);
  var state = /** @type {Object} */ (objectStack[objectStack.length - 1]);
  var flatCoordinates = /** @type {Array.<number>} */ ([]);
  for (var i = 0, ii = values.ndrefs.length; i < ii; i++) {
    var point = goog.object.get(state.nodes, values.ndrefs[i]);
    goog.array.extend(flatCoordinates, point);
  }
  var geometry;
  if (values.ndrefs[0] == values.ndrefs[values.ndrefs.length - 1]) {
    // closed way
    geometry = new ol.geom.Polygon(null);
    geometry.setFlatCoordinates(ol.geom.GeometryLayout.XY, flatCoordinates,
        [flatCoordinates.length]);
  } else {
    geometry = new ol.geom.LineString(null);
    geometry.setFlatCoordinates(ol.geom.GeometryLayout.XY, flatCoordinates);
  }
  var feature = new ol.Feature(geometry);
  feature.setId(id);
  feature.setValues(values.tags);
  state.features.push(feature);
};


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @private
 * @return {ol.Feature|undefined} Track.
 */
ol.format.OSMXML.readNd_ = function(node, objectStack) {
  goog.asserts.assert(node.nodeType == goog.dom.NodeType.ELEMENT);
  goog.asserts.assert(node.localName == 'nd');
  var values = /** @type {Object} */ (objectStack[objectStack.length - 1]);
  values.ndrefs.push(node.getAttribute('ref'));
};


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @private
 * @return {ol.Feature|undefined} Track.
 */
ol.format.OSMXML.readTag_ = function(node, objectStack) {
  goog.asserts.assert(node.nodeType == goog.dom.NodeType.ELEMENT);
  goog.asserts.assert(node.localName == 'tag');
  var values = /** @type {Object} */ (objectStack[objectStack.length - 1]);
  goog.object.set(values.tags, node.getAttribute('k'), node.getAttribute('v'));
};


/**
 * @const
 * @private
 * @type {Array.<string>}
 */
ol.format.OSMXML.NAMESPACE_URIS_ = [
  null
];


/**
 * @const
 * @type {Object.<string, Object.<string, ol.xml.Parser>>}
 * @private
 */
ol.format.OSMXML.WAY_PARSERS_ = ol.xml.makeParsersNS(
    ol.format.OSMXML.NAMESPACE_URIS_, {
      'nd': ol.format.OSMXML.readNd_,
      'tag': ol.format.OSMXML.readTag_
    });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.xml.Parser>>}
 * @private
 */
ol.format.OSMXML.PARSERS_ = ol.xml.makeParsersNS(
    ol.format.OSMXML.NAMESPACE_URIS_, {
      'node': ol.format.OSMXML.readNode_,
      'way': ol.format.OSMXML.readWay_
    });


/**
 * @const
 * @type {Object.<string, Object.<string, ol.xml.Parser>>}
 * @private
 */
ol.format.OSMXML.NODE_PARSERS_ = ol.xml.makeParsersNS(
    ol.format.OSMXML.NAMESPACE_URIS_, {
      'tag': ol.format.OSMXML.readTag_
    });


/**
 * @inheritDoc
 */
ol.format.OSMXML.prototype.readFeaturesFromNode = function(node) {
  goog.asserts.assert(node.nodeType == goog.dom.NodeType.ELEMENT);
  if (node.localName == 'osm') {
    var state = ol.xml.pushParseAndPop({
      nodes: {},
      features: []
    }, ol.format.OSMXML.PARSERS_, node, []);
    if (goog.isDef(state.features)) {
      return state.features;
    }
  }
  return [];
};


/**
 * @inheritDoc
 */
ol.format.OSMXML.prototype.readProjectionFromDocument = function(doc) {
  return ol.proj.get('EPSG:4326');
};


/**
 * @inheritDoc
 */
ol.format.OSMXML.prototype.readProjectionFromNode = function(node) {
  return ol.proj.get('EPSG:4326');
};
