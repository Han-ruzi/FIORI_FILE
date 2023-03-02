sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	"sap/f/library"
], function (
	JSONModel, 
	Controller, 
	Filter, 
	FilterOperator, 
	Sorter, 
	MessageBox, 
	fioriLibrary ) {
	"use strict";

	return Controller.extend("sap.ui.demo.fiori2.controller.BaseController", {
		onInit: function () {
			this.oView = this.getView();

			// Sort
			this._bDescendingSort = false;

			// Search byID = Table 써야함 
			this.oProductsTable = this.oView.byId("productsTable");
			
			this.oRouter = this.getOwnerComponent().getRouter();
		},

// ==============================(Item) Get Path 가져오기======================================
        itemGetPath : function(oEvent, field){
			return oEvent.getSource().getBindingContext().getProperty(field);
		},

        TableitemGetPath : function(oEvent, field){
			var tablePath = oEvent.getSource().getBindingContext(field).getPath();
            return tablePath.split("/").slice(-1).pop();
		},

// ==============================Search======================================
		Search: function (oEvent, Filtername) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter(Filtername, FilterOperator.Contains, sQuery)];
			}

			this.oProductsTable.getBinding("items").filter(oTableSearchState, "Application");
		},

// ==============================Sort======================================
		Sort: function (SortName) {
			this._bDescendingSort = !this._bDescendingSort;
			var oBinding = this.oProductsTable.getBinding("items"),
				oSorter = new Sorter(SortName, this._bDescendingSort);

			oBinding.sort(oSorter);
		},


		onEditToggleButtonPress: function() {
			var oObjectPage = this.getView().byId("ObjectPageLayout"),
				bCurrentShowFooterState = oObjectPage.getShowFooter();
			oObjectPage.setShowFooter(!bCurrentShowFooterState);
		},

		onAdd: function () {
			MessageBox.information("This functionality is not ready yet.", {title: "Aw, Snap!"});
		}



	});
});