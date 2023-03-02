sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("ANS.ypratice04.controller.App", {
            onInit: function () {

            },
            fnPressList : function(oEvent){
                console.log(oEvent.getMetadata());
                console.log(oEvent.getSource());
                console.log(oEvent.getSource().getBindingContext());
                console.log(oEvent.getSource().getBindingContext().sPath);
            
                var sPath = oEvent.getSource().getBindingContext().sPath;
                    sPath = sPath.split("/").slice(-1).pop();
                    console.log(sPath);
			
                this.getOwnerComponent().getRouter().navTo("object", {
                    objectId: sPath
                });
              
                
            }
        });
    });
