sap.ui.define([
	"sap/ui/demo/fiori2/controller/BaseController",
	"sap/f/library"
], function (BaseController,fioriLibrary) {
	"use strict";
	return BaseController.extend("sap.ui.demo.fiori2.controller.List", {
		
		onSort: function () {
			this.Sort("Price");
		},

		onSearch: function (oEvent){
			this.Search(oEvent, "Name");
		},

		onListItemPress: function (oEvent) {

			var oFCL = this.oView.getParent().getParent();
            oFCL.setLayout(fioriLibrary.LayoutType.TwoColumnsMidExpanded);

			var products = this.TableitemGetPath(oEvent,"products");

			this.oRouter.navTo("detail", {
				layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded, 
				product: products
			});
		}


		
	});
});