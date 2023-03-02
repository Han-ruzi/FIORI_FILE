sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("ANS.ypratice04.controller.Object", {
            onInit: function () {
                console.log("ObjectView");
                console.log(this.getOwnerComponent().getRouter());

                this.getOwnerComponent().getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);	

            },
            _onObjectMatched : function(oEvent){
                console.log(oEvent.getParameter("arguments"));
                console.log(oEvent.getParameter("arguments").objectId);

                this.sObjectId = oEvent.getParameter("arguments").objectId || this.objectId || "0";
                var otemplate = this.getView().byId("Table02").getBindingInfo("items").template

                console.log(otemplate);
                
                this.getView().byId("Table02").bindItems({
                    path :"/" + this.sObjectId +"/SCARRTOSFLIGHT",
                    template : otemplate,
                    templateShareable : true
                }).setKeyboardMode("Navigation");

            }
        });
    });
