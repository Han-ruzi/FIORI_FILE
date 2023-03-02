/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/smilegate/ypratice03/model/models"
    ],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("com.smilegate.ypratice03.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () 
            {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                
                var oModel = new sap.ui.model.json.JSONModel(sap.ui.require.toUrl('com/smilegate/ypratice03/model/mockdata.json'));
                
                oModel.setSizeLimit(1000);

                this.setModel(oModel,"mockdata");
      
            }
        });
    }
);