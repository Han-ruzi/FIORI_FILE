sap.ui.define([
	"sap/ui/demo/fiori2/controller/BaseController",
	'sap/f/library'
], function (BaseController,fioriLibrary) {
	"use strict";

	return BaseController.extend("sap.ui.demo.fiori2.controller.Detail", {
		onInit: function () {
			var oOwnerComponent = this.getOwnerComponent();

			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();

			this.oRouter.getRoute("list").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detailDetail").attachPatternMatched(this._onProductMatched, this);
		},

		_onProductMatched: function (oEvent) {
			this._product = oEvent.getParameter("arguments").product || this._product || "0";

			this.getView().bindElement({
				path: "/ProductCollection/" + this._product,
				model: "products"
			});
		},

		onExit: function () {
			this.oRouter.getRoute("list").detachPatternMatched(this._onProductMatched, this);
			this.oRouter.getRoute("detail").detachPatternMatched(this._onProductMatched, this);
		},

        onSupplierPress : function (oEvent){

			var supplier = this.TableitemGetPath(oEvent, "products");
               
			this.oRouter.navTo("detailDetail", {
				layout: fioriLibrary.LayoutType.ThreeColumnsMidExpanded, 
				supplier: supplier,
				product: this._product
			});
		}



	});
});