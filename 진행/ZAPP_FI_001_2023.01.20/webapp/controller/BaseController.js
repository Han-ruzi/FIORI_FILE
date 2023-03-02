sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/m/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/format/DateFormat"
], function (Controller, UIComponent, mobileLibrary,Filter,FilterOperator,DateFormat) {
	"use strict";

	return Controller.extend("com.smilegate.zappfi001.controller.BaseController", {
		/**
		 * Console.log출력 함. 
		 */
		setLog : function(obj){
			if(location.port == "8080" || location.port == "44380"){
				
				console.log(obj);
			}
		},
		parametersetLog : function(sstring, obj){
			if(location.port == "8080" || location.port == "44380"){
	
					console.log(sstring, obj);
			}
		},
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel : function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress : function () {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			mobileLibrary.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		onDayFilter: function(oEvent) {

	    var oTable = this.getView().byId("SingleWorklisttable01"),
		    oTableSearchState = [];

		var oToolbar = this.getView().byId("datelabel01"); // 툴바 컨트롤의 ID를 사용하여 컨트롤 객체 가져오기
		var aContent = oToolbar.getProperty("text");

		var flDate= this.onDayFirstLast(aContent,"T");

		var oFilters = new Filter("Pldat", FilterOperator.BT ,flDate.Fdate,flDate.Ldate);


		oTable.getBinding("items").filter(oFilters, "Application");

		console.log(oTable.getBinding("items").filter(oFilters, "Application"));
		},

		// 월 처음 날짜와 마지막 날짜( 타임스탬프 변환 or 날짜 변환 )
		onDayFirstLast: function(date, dayCase){
			var Fdate, Ldate;
		    var oDate = new Date(date);

			var initFdate = new Date(oDate.getFullYear(), oDate.getMonth(), 1);
		    var initLdate = new Date(oDate.getFullYear(), oDate.getMonth()+1 , 0);

			switch(dayCase){
				case "T" :
				Fdate = Math.floor(initFdate);
				Ldate = Math.floor(initLdate);
				break;
				case "D" :
				Fdate = DateFormat.getDateInstance({pattern: "yyyy-MM-dd"}).format(new Date(initFdate));
				Ldate = DateFormat.getDateInstance({pattern: "yyyy-MM-dd"}).format(new Date(initLdate));
				break;
			}

	    return { Fdate: Fdate,Ldate: Ldate };
		}

	});

});