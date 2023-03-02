sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"com/smilegate/zappfi001/model/formatter",
	"sap/ui/core/format/DateFormat",
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent"
], function (
	BaseController, JSONModel, History, formatter, DateFormat,MessageToast,UIComponent) {
	"use strict";

	return BaseController.extend("com.smilegate.zappfi001.controller.Object", {

		formatter: formatter,

		onInit : function () {
			// this.setLog("call function : Objectcontroller-onInit");

			var oViewModel = new JSONModel({
					busy     : true,
					delay    : 0,
					editable : false
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);	
			
			// Store original busy indicator delay, so it can be restored later on
			var iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");

			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		// ObjectPage에서 Memo의 버튼을 클릭할시 실행
		onPost: function () {
			// this.setLog("call function : onPost");

			var oObject        = this.getView().getBindingContext().getObject(),
				oFeedbackModel = this.getModel("Feedback"),
				sValue         = oFeedbackModel.getProperty("/Comment"),
				successMessage = this.getResourceBundle().getText("ObjectMeMoSaveMessage");
			
			if(!sValue){
				sValue = "";
			}else{
				sValue = sValue;
			}

			var	oCreCommnets = {
					Bukrs	 : oObject.Bukrs,
					Spmon	 : oObject.Spmon,
					Zfchid	 : oObject.Zfchid,			
					Zfcmid	 : oObject.Zfcmid,					
					Zfcactid : oObject.Zfcactid,
					Status   : "",
					Zcomment : sValue
				};

			this.getView().getModel().update('/'+this.sObjectId,oCreCommnets,{
				method : "PUT",
				success : function(oData){
					MessageToast.show(successMessage);
				}
			});
		
		},
		// ObjectPage에서 Close버튼 클릭시 실행
		onClose: function(){
			// this.setLog("call function : onClose");

			var oHistory 	  = History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash(); 
			
			if( sPreviousHash !== undefined){
				window.history.go(-1);
			} else {
				var oRouter = UIComponent.getRouterFor(this);
				oRouter.navTo("worklist",{},true);
			}

		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		// Worklist에서 누른 값에 대해 Matching을 해주는 Function
		_onObjectMatched : function (oEvent) {
			// this.setLog("call function : _onObjectMatched");
			// this.parametersetLog(">> parameter : oEvent", oEvent);

			this.sObjectId = oEvent.getParameter("arguments").objectId || this.objectId || "0";
			var sObjectId  	   = this.sObjectId,
				oFeedbackModel = this.getView().getModel("Feedback"),
				oformat        = DateFormat.getDateInstance({pattern: 'YYYY/MM/dd'}),
				sDate 		   = oformat.format(new Date()),
				sPath 		   = '/' + this.sObjectId,
				odata 		   = this.getView().getModel().getObject(sPath),
				sPldat         = oformat.format(new Date(odata.Pldat)),
				aDatesplit     = sDate.split("/"),
				aPldatsplit    = sPldat.split("/"),
				oViewModel     = this.getView().getModel("objectView");
			const	PMonth = aDatesplit[1],
				    Month  = aPldatsplit[1];

			// Path에 맞게 Object View Data Binding
			this._bindView("/" +  sObjectId);
			
			// Key 값 Split 
			var aIdsplit  = sObjectId.split("'"),
				sBukrs    = aIdsplit[1],
				sSpmon    = aIdsplit[3],
				sZfchid   = aIdsplit[5],
				sZfcmid   = aIdsplit[7],
				sZfcactid = aIdsplit[9],
				aSetPath  = aIdsplit[0].split("("),
				sSetPath  = aSetPath[0];

			this.getModel().metadataLoaded().then( function() {

				var sObjectPath = this.getModel().createKey(sSetPath, {
						Bukrs	 :  sBukrs,
						Spmon    :  sSpmon,
						Zfchid   :  sZfchid,
						Zfcmid   :  sZfcmid,
						Zfcactid :  sZfcactid
					});

				this._bindView("/" + sObjectPath);
			}.bind(this));

			oFeedbackModel.setProperty("/Comment",odata.Zcomment);
			if((Month === PMonth)){
				oViewModel.setProperty("/editable",true);
		
			}else{
				oViewModel.setProperty("/editable",false);
			}
			
		},
		_bindView : function (sObjectPath) {
			// this.setLog("call function : _bindView");
			// this.parametersetLog(">> parameter : sObjectPath", sObjectPath);

			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();
				
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							oViewModel.setProperty("/busy", true);
							
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange : function () {
			// this.setLog("call function : _onBindingChange");
			
			var oView           = this.getView(),
				oViewModel      = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			oViewModel.setProperty("/busy", false);
		
		}

	});

});

