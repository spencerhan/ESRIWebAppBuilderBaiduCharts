define(
  [
    "dojo/_base/declare",
    "dojo/dom-style",
    "jimu/BaseWidget",
    "jimu/WidgetManager",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/request/script",
    "dojo/promise/all",
    "dojo/json",
    "dojo/_base/array",
    "dojo/_base/window",
    "dojo/on"
  ],
  function(
    declare,
    domStyle,
    BaseWidget,
    WidgetManager,
    dom,
    domConstruct,
    script,
    all,
    JSON,
    arrayUtil,
    win,
    on
  ) {
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {
      // Custom widget code goes here

      baseClass: "3d-chart",
      // this property is set by the framework when widget is loaded.
      // name: '3DChart',
      // add additional properties here

      //methods to communication with app container:
      myChart: null,
      postCreate: function() {
        this.inherited(arguments);
        console.log("3DChart::postCreate");
      },

      startup: function() {
        this.inherited(arguments);
        console.log("3DChart::startup");
      },

      onOpen: function() {
        console.log("3DChart::onOpen");
      },

      onClose: function() {
        console.log("3DChart::onClose");
        this.cleanWidgetPanel();
      },

      // onMinimize: function(){

      //   console.log('3DChart::onMinimize');

      // },

      // onMaximize: function(){

      //   console.log('3DChart::onMaximize');

      // },

      // onSignIn: function(credential){

      //   console.log('3DChart::onSignIn', credential);

      // },

      // onSignOut: function(){

      //   console.log('3DChart::onSignOut');

      // }

      // onPositionChange: function(){

      //   console.log('3DChart::onPositionChange');

      // },

      // resize: function(){

      //   console.log('3DChart::resize');

      // }

      //methods to communication between widgets:
      show3DChart: function(featureSet) {
        var container = WidgetManager.getInstance().getWidgetsByName("3DChart")[
          0
        ]["3DViewer"];
        var widgetParent = _widgetManager.getWidgetsByName("3DChart")[0][
          "3DViewer"
        ].parentNode.parentNode.parentNode;

        var widgetOffsetParent = _widgetManager.getWidgetsByName("3DChart")[0][
          "3DViewer"
        ].parentNode.offsetParent;

        domStyle.set(container, {
          width: domStyle.get(widgetOffsetParent, "width") - 50 + "px", //"600px",
          height: domStyle.get(widgetOffsetParent, "height") - 50 + "px" // "600px"
        });

        domConstruct.place("<div id='loading'></div>", win.body(), "after");
        domConstruct.place(
          "<img id='loading-image' src='https://icons8.com/preloaders/preloaders/831/Pinwheel.gif' alt='' />",
          "loading",
          "after"
        );

        var promises = [];
        featureSet.features.forEach(function(f) {
          if ("LOCATED_KEY" in f.attributes) {
            for (var a in f.attributes) {
              if (String(a) === "LOCATED_KEY") {
                var queryWhere =
                  "LOCATED_KEY LIKE " + "'" + f.attributes[a] + "'";
                var requestHandle = script.get(
                  "https://arcmaps.waikatoregion.govt.nz/arcgistest/rest/services/WRCMAPS/Stratlog/MapServer/0/query?",
                  {
                    jsonp: "callback",
                    query: {
                      where: queryWhere,
                      outFields: "LOCATED_KEY,START_DEPTH_M,END_DEPTH_M,DOMINANT,SECONDARY",
                      returnGeometry: false,
                      f: "json"
                    }
                  }
                );
                promises.push(requestHandle);
              }
            }
          }
        });
        var x_axis = [];
        var y_axis = [];
        var z_axis = [];

        all(promises).then(
          function(results) {
            results.forEach(function(res) {
              console.log(res);
              data = res.features;
              for (var i = 0; i < data.length; i++) {
                if (i == 0) {
                  x_axis.push(data[i].attributes.START_DEPTH_M);
                  y_axis.push(data[i].attributes.LOCATED_KEY);
                  z_axis.push([0, 0, res.features[i].attributes.END_DEPTH_M]);
                } else {
                  if (x_axis.indexOf(data[i].attributes.START_DEPTH_M) == -1) {
                    x_axis.push(data[i].attributes.START_DEPTH_M);
                  }
                  if (y_axis.indexOf(data[i].attributes.LOCATED_KEY == -1)) {
                    y_axis.indexOf(data[i].attributes.LOCATED_KEY);
                  }
                  z_axis.push([
                    x_axis.indexOf(data[i].attributes.START_DEPTH_M),
                    y_axis.indexOf(data[i].attributes.LOCATED_KEY),
                    data[i].attributes.END_DEPTH_M
                  ]);
                }
              }
            });
            option = {
              legend: {
                top: 10
              },
              tooltip: {},
              visualMap: {
                max: 20,
                inRange: {
                  color: [
                    "#313695",
                    "#4575b4",
                    "#74add1",
                    "#abd9e9",
                    "#e0f3f8",
                    "#ffffbf",
                    "#fee090",
                    "#fdae61",
                    "#f46d43",
                    "#d73027",
                    "#a50026"
                  ]
                }
              },
              xAxis3D: {
                type: "category",
                data: x_axis,
                name: "Chemical",
                nameGap: 30
              },
              yAxis3D: {
                type: "category",
                data: y_axis,
                name: "Well No.",
                nameGap: 30
              },
              zAxis3D: {
                type: "value",
                name: "Value"
              },
              grid3D: {
                boxWidth: 200,
                boxDepth: 80,
                light: {
                  main: {
                    intensity: 1.2
                  },
                  ambient: {
                    intensity: 0.3
                  }
                }
              },
              series: [
                {
                  type: "bar3D",
                  data: z_axis.map(function(item) {
                    return {
                      value: [item[0], item[1], item[2]]
                    };
                  }),
                  shading: "color",

                  label: {
                    show: false,
                    textStyle: {
                      fontSize: 16,
                      borderWidth: 1
                    }
                  },

                  itemStyle: {
                    opacity: 0.4
                  },

                  emphasis: {
                    label: {
                      textStyle: {
                        fontSize: 20,
                        color: "#900"
                      }
                    },
                    itemStyle: {
                      color: "#900"
                    }
                  }
                }
              ]
            };
            domConstruct.destroy("loading-image");
            domConstruct.destroy("loading");
            var chart = echarts.init(document.getElementById("3DViewer"));
            chart.setOption(option);
            on(widgetParent.parentNode, "mouseover", function(evt) {
              console.log("lastchild");
              chart.resize({
                width: domStyle.get(widgetOffsetParent, "width") - 50,
                height: domStyle.get(widgetOffsetParent, "height") - 50
              });
            });
            this.myChart = chart;
          },
          function(err) {
            console.log(String(err));
          }
        );
      },
      cleanWidgetPanel: function() {
        if (this.myChart != null) {
          this.myChart.dispose();
        }
      }
    });
  }
);
