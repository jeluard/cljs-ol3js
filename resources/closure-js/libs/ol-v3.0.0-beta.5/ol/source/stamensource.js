goog.provide('ol.source.Stamen');

goog.require('goog.asserts');
goog.require('ol.Attribution');
goog.require('ol.source.OSM');
goog.require('ol.source.XYZ');


/**
 * @type {Object.<string, {extension: string, opaque: boolean}>}
 */
ol.source.StamenLayerConfig = {
  'terrain': {
    extension: 'jpg',
    opaque: true
  },
  'terrain-background': {
    extension: 'jpg',
    opaque: true
  },
  'terrain-labels': {
    extension: 'png',
    opaque: false
  },
  'terrain-lines': {
    extension: 'png',
    opaque: false
  },
  'toner-background': {
    extension: 'png',
    opaque: true
  },
  'toner': {
    extension: 'png',
    opaque: true
  },
  'toner-hybrid': {
    extension: 'png',
    opaque: false
  },
  'toner-labels': {
    extension: 'png',
    opaque: false
  },
  'toner-lines': {
    extension: 'png',
    opaque: false
  },
  'toner-lite': {
    extension: 'png',
    opaque: true
  },
  'watercolor': {
    extension: 'jpg',
    opaque: true
  }
};


/**
 * @type {Object.<string, {minZoom: number, maxZoom: number}>}
 */
ol.source.StamenProviderConfig = {
  'terrain': {
    minZoom: 4,
    maxZoom: 18
  },
  'toner': {
    minZoom: 0,
    maxZoom: 20
  },
  'watercolor': {
    minZoom: 3,
    maxZoom: 16
  }
};



/**
 * @constructor
 * @extends {ol.source.XYZ}
 * @param {olx.source.StamenOptions} options Stamen options.
 * @todo api
 */
ol.source.Stamen = function(options) {

  var i = options.layer.indexOf('-');
  var provider = i == -1 ? options.layer : options.layer.slice(0, i);
  goog.asserts.assert(provider in ol.source.StamenProviderConfig);
  var providerConfig = ol.source.StamenProviderConfig[provider];

  goog.asserts.assert(options.layer in ol.source.StamenLayerConfig);
  var layerConfig = ol.source.StamenLayerConfig[options.layer];

  var protocol = ol.IS_HTTPS ? 'https:' : 'http:';
  var url = goog.isDef(options.url) ? options.url :
      protocol + '//{a-d}.tile.stamen.com/' + options.layer + '/{z}/{x}/{y}.' +
      layerConfig.extension;

  goog.base(this, {
    attributions: ol.source.Stamen.ATTRIBUTIONS,
    crossOrigin: 'anonymous',
    maxZoom: providerConfig.maxZoom,
    // FIXME uncomment the following when tilegrid supports minZoom
    //minZoom: providerConfig.minZoom,
    opaque: layerConfig.opaque,
    tileLoadFunction: options.tileLoadFunction,
    url: url
  });

};
goog.inherits(ol.source.Stamen, ol.source.XYZ);


/**
 * @const
 * @type {Array.<ol.Attribution>}
 */
ol.source.Stamen.ATTRIBUTIONS = [
  new ol.Attribution({
    html: 'Map tiles by <a href="http://stamen.com/">Stamen Design</a>, ' +
        'under <a href="http://creativecommons.org/licenses/by/3.0/">CC BY' +
        ' 3.0</a>.'
  }),
  ol.source.OSM.DATA_ATTRIBUTION
];
