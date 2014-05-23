[OpenLayers 3](http://ol3js.org/) as a [lein-cljsbuild](https://github.com/emezeske/lein-cljsbuild) friendy package.

WARNING: does not work with ClojureScript `>= 2227` as of now. 

Just add as dependency in your `project.clj`:

```clojure
:dependencies [[cljs-ol3js "3.0.0-beta.5"]]
```

Then use OpenLayers 3 in your ClojureScript code:

```clojure
(ns my-ns
  (:import ol.Map  ol.View2D ol.layer.Tile ol.source.MapQuest))

(Map. (clj->js {:target "some-id"
                :layers [(Tile. {:source (MapQuest. {:layer "sat"})})]
                :view (View2D. {:center (ol.proj/transform [37.41 8.82] "EPSG:4326" "EPSG:3857") :zoom 4})}))
```

Now assuming your project is correctly configured with lein-cljsbuild you can run `lein cljsbuild once`. Works with all optimizations level.
