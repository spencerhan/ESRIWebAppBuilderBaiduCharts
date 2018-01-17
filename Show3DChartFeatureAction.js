define(
  ["dojo/_base/declare", "jimu/BaseFeatureAction", "jimu/WidgetManager"],
  function(declare, BaseFeatureAction, WidgetManager) {
    var clazz = declare(BaseFeatureAction, {
      iconFormat: "png",
      isFeatureSupported: function(featureSet) {
        // Later change this to only support point
        var bool = false;
        if (featureSet.features.length > 0) {
          featureSet.features.forEach(function(f) {
            // later change this to only support Wellvar
            if ("LOCATED_KEY" in f.attributes && f.geometry.type === "point") {
              bool = true;
            }
          });
          return bool;
        } else {
          return bool;
        }
      },

      onExecute: function(featureSet) {
        WidgetManager.getInstance()
          .triggerWidgetOpen(this.widgetId)
          .then(function(myWidget) {
            myWidget.show3DChart(featureSet);
          });
      }
    });
    return clazz;
  }
);
