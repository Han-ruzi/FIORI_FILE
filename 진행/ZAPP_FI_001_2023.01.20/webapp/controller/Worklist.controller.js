sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"com/smilegate/zappfi001/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/model/Sorter",
	"sap/ui/core/message/ControlMessageProcessor",
	"sap/ui/core/message/Message",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/generic/app/navigation/service/NavigationHandler",
    "sap/ui/generic/app/navigation/service/NavType",
], function (BaseController, 
			JSONModel, 
			formatter, 
			Filter, 
			FilterOperator, 
			MessageToast, 
			MessageBox,
			Fragment,
			Sorter,
			ControlMessageProcessor,
			Message,
			MessagePopover,
			MessagePopoverItem,
			NavigationHandler,
			NavType) 
{
	"use strict";


	return BaseController.extend("com.smilegate.zappfi001.controller.Worklist", {

		formatter: formatter,
		_oResponsivePopover : null,

		onInit : function (oEvent) {
			// this.setLog("call function : Worklistcontroller-onInit");

			var oformat    = sap.ui.core.format.DateFormat.getDateInstance({pattern: 'YYYY/MM/dd'}),
				stoday     = oformat.format(new Date()),
				sdatesplit = stoday.split("/"),
				oTable     = this.byId("SingleWorklisttable01"),
				oItems     = oTable.getBinding("items"),
				that       = this,
				oView      = this.getView(),
				oModel 	   = this.getOwnerComponent().getModel(),
				sWorklistTitle = "";
				// iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

				oModel.setSizeLimit(999);
				this._oTable = oTable;

				// this.oNavigationHandler = new NavigationHandler(this);
                // var startupParameters   = this.oNavigationHandler.oRouter._oOwner.oComponentData.startupParameters;

			// 현재 날짜를 worklistDateLabel의 값을 선언하기 위해 년,월,일로 선언 및 flag 선언
			this.syear  = sdatesplit[0]; // 년
			this.smonth = sdatesplit[1]; // 월
			this.sday   = sdatesplit[2]; // 일
			this.aFilters     = [];		 // Quick Filter 및 해당 당을 저장하는 배열
			this.aafilter     = [];		 // Column Filter 배열 
			this.aSorter      = [];		 // Column Sorter 배열
			this.bflag        = true;	 // oViewModel Data 다시 Setting 하는 Flag
			this.bDialogflag  = true;	 // Column Filter 구별 Flag / ColumnFilter시 해당 onChange function filter 실행. 아닐시 onUpdateStarted function filter 실행
			this.bfilterCheck = true;	 // iconTab Filter 개수 구하는 Flag
			this.binitflag    = true;    // 초기에 데이터를 Read Flag
			this.sorterflag   = true;    // 기본 Key Sort 하는 Sorter Flag
			this._aTableSearchState = [];
			this.sColumnlength = oTable.getColumns().length; //TableColumn 개수
			this.oTemplateEqui = oTable.getBindingInfo("items").template; // Table Template



			//Path에 따른 Title Setasds
			// if(startupParameters.oModelsPath){ 
			// 	this.oModelsPath = startupParameters.oModelsPath[0];

			// 	if(this.oModelsPath === "/SingleSet"){
			// 		sWorklistTitle =  this.getResourceBundle().getText("SingleWorklistTitle");

			// 	}else if(this.oModelsPath === "/TeamSet"){
			// 		sWorklistTitle = this.getResourceBundle().getText("TeamWorklistTitle");

			// 	}else if(this.oModelsPath === "/CompanySet"){
			// 		sWorklistTitle = this.getResourceBundle().getText("CompanyWorklistTitle");

			// 	}
			// }else{
			// 	this.oModelsPath = "/WorklistSet";
			// 	sWorklistTitle =  this.getResourceBundle().getText("SingleWorklistTitle");
			// }

			// oTable.unbindAggregation("items");



			// oTable.bindItems({
			// 	path: this.oModelsPath,
			// 	template : this.oTemplateEqui,
			// 	templateShareable : true
			// }).setKeyboardMode("Navigation");

			// Model의 property 선언 및 기본 값 선언. 
			var oViewModel = new JSONModel({
				sTitle			  : sWorklistTitle,
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),		//i18n에 선언된 WokrlistTabTitle 값
				worklistDateLabel : this.syear + " / " + this.smonth,							// 년도 / 달
				tableNoDataText   : this.getResourceBundle().getText("tableNoDataText"),		// i18n에 선언된 tableNoDataText
				tableBusyDelay	  : 0,
				countAll  		  : 0,	    //데이터 총 개수
				complete  		  : 0,      //Complete 총 개수
				progress  		  : 0,      //Progress 총 개수
				delay     		  : 0,      //Delay 총 개수 
				wait              : 0,      //Wait 총 개수 
				bindingValue      : "",     //선택한 Column name
				bindingIndex      : 0,      //선택한 Column의 Index
				exbindingIndex    : null,   //선택한 Column의 전 Index
				filtericon01      : false,  //filter icon01의 Visible 값
				filtericon02      : false,  //filter icon02의 Visible 값
				filtericon03      : false,  //filter icon03의 Visible 값
				filtericon04      : false,  //filter icon04의 Visible 값
				filtericon05      : false,  //filter icon05의 Visible 값
				filtericon06      : false,  //filter icon06의 Visible 값
				filtericon07      : false,  //filter icon07의 Visible 값
			});

			// iconTab Filter, Filtericon Data Model Set
			this.setModel(oViewModel, "worklistView");

						            // Filter 
			this._mFilters = {
								"complete": [new Filter("Status", FilterOperator.BT,"C", "C")],
								"progress": [new Filter("Status", FilterOperator.BT,"P" ,"P")],
								"delay": [new Filter("Status", FilterOperator.BT, "D","D")],
								"wait": [new Filter("Status", FilterOperator.BT, "W","W")],
								"countAll": []
			};
			
			//Table Event handler - Column Dialog 생성 
			// if(!this._oResponsivePopover){
				
			// 	this._oResponsivePopover =  Fragment.load({
			// 		id   :  this.createId("ColumnPopover01"),
			// 		name : "com.smilegate.zappfi001.view.ColumnPopover",
			// 		controller: this
			// 	}).then(function(_oResponsivePopover){
					
			// 		oView.addDependent(_oResponsivePopover);
			// 		return _oResponsivePopover;
			// 	});
			// }

			//Table Event handler - Column Filter Set
			// oTable.addEventDelegate({
			// 	onAfterRendering : function(){
			// 		var oHeader = this.$().find('.sapMListTblHeaderCell');

			// 		// that.setLog(">---- call function : _customClick");
			// 		for(var i = 0; i < oHeader.length; i++){
			// 			var oID = oHeader[i].id;
						
			// 			that._customClick(oID);
			// 		}
			// 	}

			// }, oTable)

			
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		onUpdateStarted : function () {
			// this.setLog("call function : onUpdateStarted");

			
			var oTable   = this.getView().byId("SingleWorklisttable01"),
				oFilters = this.aFilters;
			var oSorters = [
				new Sorter('Pldat'   , false, true),
				new Sorter('Zfchid'  , false, true),
				new Sorter('Zfcmid'  , false, true),
				new Sorter('Zfcactid', false, true)
			];
			
			// 초기에 오늘 날짜에 대한 Filter binding
			// if(this.binitflag){
			// 	oFilters = new sap.ui.model.Filter("Fpldat", FilterOperator.EQ , new Date());

			// 	this.aFilters.push(oFilters);
			// 	this.binitflag = false;
			// 	var aBindings = this.getOwnerComponent().getModel().aBindings[0];
			// 	var odata = this.getOwnerComponent().getModel();
			// }
			
			// Column filter 실행 시, Filter binding
			if(this.bDialogflag){
				oTable.getBinding("items").filter(oFilters, "Application");
			}

			//Sorter
			if(this.sorterflag){
				oTable.getBinding("items").sort(oSorters);
				this.sorterflag = false;
			}

			oTable.getBinding("items").refresh(true);		
		
		},
		// onUpdateFinished : function (oEvent) {
		// 	// this.setLog("call function : onUpdateFinished");
		// 	// this.parametersetLog(">> parameter : oEvent", oEvent);

		// 	var oTable = oEvent.getSource(),
		// 		oworklistViewModel = this.getModel("worklistView"),
		// 		iTotalItems  	   = oEvent.getParameter("total"),
		// 		nallcountNum 	   = 0,
		// 		ncompleteNum 	   = 0,
		// 		nprogressNum 	   = 0,
		// 		nDelayNum    	   = 0,
		// 		nWaitNum           = 0,
		// 		nColumnlength      = parseInt(this.sColumnlength) -1;
	
		// 	// i18n에서 Title의 값을 불러와 해당 년, 달로 Title로 변경
		// 	var sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
		// 		sTitle = this.syear + " / " + this.smonth ;


		// 	if (  iTotalItems && oTable.getBinding("items").isLengthFinal() ) {

		// 		// this.bfilterCheck가 True 일경우, TabFilter의 count값을 변경함.
		// 		if(this.bfilterCheck){

		// 			var oitems = oTable.getItems();
		// 				nallcountNum = oitems.length;
						 
		// 			// filter의 값을 table에 binding된 items의 값중, Status의 값에 대하여 count함.
		// 			for (var i = 0; i < oitems.length; i++){
		// 				var oStatuscell = oitems[i].getCells()[nColumnlength];
		
		// 				switch(oStatuscell.getText()){
		// 					case  "Delay" :
		// 						nDelayNum++;
		// 						continue;
			
		// 					case  "Progress" :
		// 						nprogressNum ++;
		// 						continue;
		// 						// break;
			
		// 					case "Complete" :
		// 						ncompleteNum++;
		// 						continue;
		// 						// break;
							
		// 					default :
		// 						nWaitNum++;
		// 						continue;
		// 						// break;
		// 				}
		// 			}

		// 			// Count한 값을 Data를 가지고 있는 Model에 다시 값 Set 함.
		// 			oworklistViewModel.setProperty("/countAll", nallcountNum);
		// 			oworklistViewModel.setProperty("/complete", ncompleteNum);
		// 			oworklistViewModel.setProperty("/progress", nprogressNum);
		// 			oworklistViewModel.setProperty("/delay", nDelayNum);
		// 			oworklistViewModel.setProperty("/wait", nWaitNum);

		// 			this.bfilterCheck = false;
		// 		}
		// 	}

		// 	// items의 값이 0 일때, Count 값들을 다시 0으로 Set 함.
		// 	if(this.bfilterCheck && oEvent.getParameter("total") === 0){
		// 		oworklistViewModel.setProperty("/countAll", 0);
		// 		oworklistViewModel.setProperty("/complete", 0);
		// 		oworklistViewModel.setProperty("/progress", 0);
		// 		oworklistViewModel.setProperty("/delay", 0);
		// 		oworklistViewModel.setProperty("/wait", 0);
		// 	}

		// 	// 위에서 변경한 title을 데이터를 다시 Set 함.
		// 	this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		// },

		onQuickFilter: function(oEvent) {
			var oBinding = this._oTable.getBinding("items"),
				sKey = oEvent.getParameter("selectedKey");

			oBinding.filter(this._mFilters[sKey]);
		},

        onUpdateFinished2 : function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				oViewModel = this.getModel("worklistView"),
				iTotalItems = oEvent.getParameter("total"),
				oTableSearchState = [];
				
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				// Get the count for all the products and set the value to 'countAll' property

				this.getModel().read("/WorklistSet/$count", {
					success: function (oData) {
						oViewModel.setProperty("/countAll", oData);
					}
				});
				// read the count for the complete filter
				this.getModel().read("/WorklistSet/$count", {
					success: function (oData) {
						oViewModel.setProperty("/complete", oData);
					},
					filters: this._mFilters.complete
				});

				// read the count for the progress filter
				this.getModel().read("/WorklistSet/$count", {
					success: function(oData){
						oViewModel.setProperty("/progress", oData);
					},
					filters: this._mFilters.progress
				});
				// read the count for the delay filter
				this.getModel().read("/WorklistSet/$count", {
					success: function(oData){
						oViewModel.setProperty("/delay", oData);
					},
					filters: this._mFilters.delay
				});
				this.getModel().read("/WorklistSet/$count", {
					success: function(oData){
						oViewModel.setProperty("/wait", oData);
					},
					filters: this._mFilters.wait
				});


			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}

			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);

		   // oTable.getBinding("items").filter(oTableSearchState, "Application");

		},

		





		// Column Filter에서 Ascending을 클릭 할 시 발생하는 function
		onAscending: function(){
			// this.setLog("call function : onAscending");
		
			var oTable         = this.getView().byId("SingleWorklisttable01"),
				oItems         = oTable.getBinding("items"),
				oBindingPath   = this.getView().getModel("worklistView").getProperty("/bindingValue"),
				oWorklistModel = this.getView().getModel("worklistView"),  
				iIndex         = oWorklistModel.getProperty("/bindingIndex"),
				iexIndex       = oWorklistModel.getProperty("/exbindingIndex"),
				aColumns       = oTable.getColumns(),
				oColumn        = aColumns[iIndex],
				oSorter        = new Sorter(oBindingPath);
				this.Sorter = [];

			//sort문 binding
			oItems.sort(oSorter);
			this.aSorter.push(oSorter);

			//Soter문 SortIndicator Set
			oColumn.setSortIndicator("Ascending");
			
			if(iexIndex){
				if(iexIndex === iIndex){
					oColumn.setSortIndicator("Ascending");
				}else{
					aColumns[iexIndex].setSortIndicator("None");
				}
			}else if(iexIndex === 0){
				if(iexIndex !== iIndex){
					aColumns[iexIndex].setSortIndicator("None");
				}
			}

			oWorklistModel.setProperty("/exbindingIndex",iIndex);

			if(this._oResponsivePopover){
				this._oResponsivePopover.then(function(oResponsivePopover){
					oResponsivePopover.close();
				});
			}
		},
		// Column Filter에서 Descending을 클릭 할 시 발생하는 function
		onDescending: function(){
			// this.setLog("call function : onDescending");
		
			var oTable         = this.getView().byId("SingleWorklisttable01"),
				oItems         = oTable.getBinding("items"),
				oWorklistModel = this.getView().getModel("worklistView"),  
				oBindingPath   = oWorklistModel.getProperty("/bindingValue"),
				iIndex         = oWorklistModel.getProperty("/bindingIndex"),
				iexIndex       = oWorklistModel.getProperty("/exbindingIndex"),
				aColumns       = oTable.getColumns(),
				oColumn        = aColumns[iIndex],
				oSorter        = new Sorter(oBindingPath,true);
				this.Sorter = [];

			//sort문 binding
			oItems.sort(oSorter);
			this.aSorter.push(oSorter);

			//Soter문 SortIndicator Set
			oColumn.setSortIndicator("Descending");
			
			if(iexIndex){
				if(iexIndex === iIndex){
					oColumn.setSortIndicator("Descending");
				}
				else{
					aColumns[iexIndex].setSortIndicator("None");
				}
			}else if(iexIndex === 0){
				if(iexIndex !== iIndex){
					aColumns[iexIndex].setSortIndicator("None");
				}
			}
			
			oWorklistModel.setProperty("/exbindingIndex",iIndex);

			if(this._oResponsivePopover){
				this._oResponsivePopover.then(function(oResponsivePopover){
					oResponsivePopover.close();
				});
			}
		},
		// Column Filter에서 Filter 값 입력후, Enter Key를 눌렀을 시 발생 하는 function
		onChange: function(oEvent){
			// this.setLog("call function : onchange");
			// this.parametersetLog(">> parameter : oEvent", oEvent);

			var Value 			= oEvent.getParameter("value"),
				oMultipleValues = Value.split(","),
				oTable          = this.getView().byId ("SingleWorklisttable01"),
				oWorklistModel  = this.getModel("worklistView"),
				oBindingPath    = oWorklistModel.getProperty("/bindingValue"),
				iIndex          = oWorklistModel.getProperty("/bindingIndex"),
				aFilters        = [],
				aplusFilter     = [],
				sIconSet        = "/filtericon0";

			this.bfilterCheck = true;
			
			iIndex = parseInt(iIndex) + 1;
			sIconSet = sIconSet + iIndex; //JsonModel에 선언한 Propertyname

			
			if(Value){
				// 쉼표(,) 로 나눠놓은 filter값 Set
				for(var i = 0 ; i < oMultipleValues.length; i++){
				
					if(oBindingPath == "Pldat"){
						var aDateSplit   = oMultipleValues[i].split("/"),
							iYear        = parseInt(aDateSplit[0]),
							iMonth       = parseInt(aDateSplit[1]),
							iDay         = parseInt(aDateSplit[2]),
							sValue       = new Date(iYear, iMonth - 1, iDay, "9","0","0"),
							ofilter      = new Filter(oBindingPath, FilterOperator.EQ, sValue);
		
					}else{
						var ofilter = new Filter(oBindingPath, FilterOperator.Contains, oMultipleValues[i]);	
					}
	
					aFilters.push(ofilter);
				}
				
				//filter 배열에 추가되어 있는 관련된 path filter 제거 
				this._filterPathDel(this.aafilter, oBindingPath);

				//filter icon  Set
				oWorklistModel.setProperty(sIconSet,true);
			
				//Path별로, this.filter 생성 및 추가 
				switch(oBindingPath){
					
					case "Pldat" : 
	
						this.aPldat  =  aFilters;

						this.aafilter.push(...this.aPldat);
	
						break;
	
					case "Zfchidt": 
						
						this.aZfchidt = aFilters;
	
						this.aafilter.push(...this.aZfchidt);

						break;
	
					case "Zfcmidt" : 
	
						this.aZfcmidt  = aFilters;
						
						this.aafilter.push(...this.aZfcmidt);

						break;
						
					case  "Zfcactidt" :
						
						this.aZcactidt = aFilters;
					
						this.aafilter.push(...this.aZcactidt);
						break;
					
					case  "Butxt" :
				
							this.aButxt = aFilters;
						
							this.aafilter.push(...this.aButxt);
							break;
					
					case  "Ktext" :
				
						this.aKtext = aFilters;
					
						this.aafilter.push(...this.aKtext);
						break;
	
					case  "Name_last" :
			
						this.aName_last = aFilters;
					
						this.aafilter.push(...this.aName_last);
						break;
				}	
	
			}else{ // Filter를 Reset하고 싶은 경우

				if(oBindingPath){
					this._filterPathDel(this.aafilter,oBindingPath);
				}else{ 

				// Column Filter 중, 데이터가 존재 하지 않는 경우, oBindingPath 지정하여 실행;
					switch (iIndex){
						case 1 : 
						 	oBindingPath = "Pldat";
						 	break;
						case 2 :
							oBindingPath = "Zfchidt";
						 	break;
						case 3:
							oBindingPath = "Zfcmidt";
						 	break;
						case 4 :
							oBindingPath = "Zfcactidt";
						 	break;
						case 5 :
							oBindingPath = "Butxt";
							break;
						case 6 :
							oBindingPath = "Ktext";
						 	break;
						case 7 :
							oBindingPath = "Name_last";
						 	break;

						default :
							this.onSortFilterReset();
					}

					this._filterPathDel(this.aafilter,oBindingPath);
				}
			 
				 oWorklistModel.setProperty(sIconSet,false);

			}
		
		
			this.bDialogflag  = false;
			aplusFilter =	this.aafilter ;

			if(!this.bDialogflag){
				//filter binding
				oTable.getBinding('items').filter(aplusFilter);
				this.bDialogflag = true;
			}

			// Sorter가 실행되어 있을시, key sorter 실행 안하도록 flag 처리
			if(this.aSorter.length > 0){
				this.sorterflag   = false;
			}else{
				this.sorterflag   = true;
			}
		
			if(this._oResponsivePopover){
				this._oResponsivePopover.then(function(oResponsivePopover){
				
					oResponsivePopover.close();
				});
			}
		},
		// Reset 버튼 클릭시 Column Sort와 Filter를 Reset하는 function
		onSortFilterReset: function(){
			// this.setLog("call function : onSortFilterReset");

			var oTable   	   = this.getView().byId("SingleWorklisttable01"),
				oWorklistModel = this.getModel("worklistView"),
				oBinding 	   = oTable.getBinding("items"),
				aColumns  	   = oTable.getColumns();

			this.sorterflag   = true;
			this.bfilterCheck = true;
			this.aafilter     = [];
			this.Sorter       = [];
			
			//filter icon 및 sorticon reset
			for(var i = 0; i < aColumns.length; i++){

				var k = i + 1,
					sIconSet   = "/filtericon0" + k ,
					sPopoverid = "singleinput0" + k ;

				oWorklistModel.setProperty(sIconSet,false);
				aColumns[i].setSortIndicator("None");

				if(k < this.sColumnlength){
					var	oPopinput  = this.byId(sap.ui.core.Fragment.createId(this.createId("ColumnPopover01"), sPopoverid));
					oPopinput.setValue("");
				}

			}

			oBinding.filter(this.aafilter);
		},
		// Table List 클릭시 발생하는 function
		onPress : function (oEvent) {
			// this.setLog("call function : onPress - navigate objectPage");
			// this.parametersetLog(">> parameter : oEvent", oEvent);

			// object Page로 이동
			this._showObject(oEvent.getSource());
		},
		// 상단의 Calendar icon 클릭 시 Calendar App으로 넘어가게 실행
		onCalendarurl : function(){
			// this.setLog("call function : onCalendarurl");
			
			var sFPldate = this.syear + "/" + this.smonth,
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			jQuery.sap.storage.put("sFldat",sFPldate);
			jQuery.sap.storage.put("soModelset", this.oModelsPath);
	
			var ohash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject : "ZAPP_FI_004",
					action         : "display"
				}

			})) || "";0

			oCrossAppNavigator.toExternal({
				target : {
					shellHash : ohash
				}
			});

		},
		// 하단의 footer의 Complete 버튼 클릭시 실행
		onCompletion : function(){
			// this.setLog("call function : onCompletion");

			var groupId		  = [],
				otable 		  = this.byId ("SingleWorklisttable01"),
				scontexts 	  = otable.getSelectedContexts(),
				oView 		  = this.getView(),
				oModel 		  = oView.getModel(),
				sTextError    = this.getResourceBundle().getText("NoSelecteditems"),
				sSuccessToast = this.getResourceBundle().getText("changeStatus"),
				oBinding 	  = oView.byId("SingleWorklisttable01").getBinding("items"),
				sTitle 		  = this.getResourceBundle().getText("CompleteTitle"),
				oworklistViewModel = oView.getModel("worklistView"),
				nComplete     = parseInt(oworklistViewModel.getProperty("/complete")),
				nDelay        = parseInt(oworklistViewModel.getProperty("/delay")),
				nProgress     = parseInt(oworklistViewModel.getProperty("/progress")),
				nWait         = parseInt(oworklistViewModel.getProperty("/wait")),
				ichecknum    = 0;

			// Table에서 선택한 값이 없을 시 Error Message 발생
			if (!(scontexts.length > 0)){

				MessageBox.error( sTextError );
				return;
			}else{

				for (var i = 0; i < scontexts.length; i++ ){
					var contextpath  = scontexts[i].sPath,
						object       = oModel.getObject(contextpath),
						sStatus      = object.Status;

					if( sStatus !== "C"){
						ichecknum = ichecknum + 1;
					}
				}

				if(ichecknum  < 1){
					return;
				}else{
					var sContent =  this.getResourceBundle().getText("CompleteContent",ichecknum);
					groupId.push("new");
				}
			}

			// Status의 업데이트를 실패 시, Error Message
			var fnError = function (oError) {

				oView.setBusy(false);
				MessageBox.error(oError.message);
				otable.removeSelections(true);

			}.bind(this);

			// Status의 업데이트를 성공할 시, Table Rebinding
			var fnSuccess = function (oSuccess) {

				oworklistViewModel.setProperty("/complete", nComplete);
				oworklistViewModel.setProperty("/delay", nDelay);
				oworklistViewModel.setProperty("/progress", nProgress);
				oworklistViewModel.setProperty("/wait", nWait);

				oView.setBusy(true);
				oBinding.refresh(true);	
				otable.removeSelections(true);
				oView.setBusy(false);
				this.bfilterCheck = true;

			}.bind(this);
		
			// Complete의 확인 Message Box 생성및 메시지 박스 버튼에 따른 action
			MessageBox.confirm(sContent, {
				title : sTitle,
				initialFocus : sap.m.MessageBox.Action.CANCEL,
				onClose : function(sButton) {

					// OK 클릭시, Status의 값 Complete로 Update 하는 logic
					if (sButton === MessageBox.Action.OK) {

						for (var i = 0; i < scontexts.length; i++ ){

							var contextpath = scontexts[i].sPath,
								object = oModel.getObject(contextpath);

								
							switch(object.Status){
								case "D" : 
									nDelay    = nDelay - 1;
									nComplete = nComplete + 1;
									break;
								
								case "P" :
									nProgress = nProgress - 1;
									nComplete = nComplete +1;
									break;

								case "W" :
									nWait     = nWait  - 1 ;
									nComplete = nComplete + 1;
									break;		 	
							}

							if( object.Status !== "C"){

								var info = {
									"Bukrs"    : object.Bukrs,
									"Spmon"    : object.Spmon,
									"Zfchid"   : object.Zfchid,
									"Zfcmid"   : object.Zfcmid,
									"Zfcactid" : object.Zfcactid,
									"Status"   : "C",
									"Zcomment" : ""
								};
								
								oModel.update(contextpath, info,{
									method: "PUT",
									groupId: groupId[0],
									success: function(oData){
									},
									error : function(){
									}
								});
							}
						}	 

						oView.setBusy(true);
						oModel.setDeferredBatchGroups(groupId);
						oModel.setUseBatch(true);

						oModel.submitChanges({
							groupId : groupId[0],
							success : fnSuccess,
							error   : fnError});

						oModel.setUseBatch(false);
						oModel.setDeferredBatchGroups([]);

					}
					// Cancel 클릭시, Table 선택한 값들을 지움. 
					else if (sButton === MessageBox.Action.CANCEL){

						otable.removeSelections(true);
					}
				}
			});
		},
		// 하단의 footer의 Cancel 버튼 클릭시 실행
		onCancel: function(){
			// this.setLog("call function : onCancel");

			var groupId		  = [],
				otable 		  = this.byId ("SingleWorklisttable01"),
				scontexts 	  = otable.getSelectedContexts(),
				oView 		  = this.getView(),
				oModel 		  = oView.getModel(),
				sTextError    = this.getResourceBundle().getText("NoSelecteditems"),
				sSuccessToast = this.getResourceBundle().getText("changeStatus"),
				oBinding 	  = oView.byId("SingleWorklisttable01").getBinding("items"),
				sTitle 		  = this.getResourceBundle().getText("CancelTitle"),
				oworklistViewModel = oView.getModel("worklistView"),
				nComplete     = parseInt(oworklistViewModel.getProperty("/complete")),
				nDelay        = parseInt(oworklistViewModel.getProperty("/delay")),
				nProgress     = parseInt(oworklistViewModel.getProperty("/progress")),
	 			oformat       = sap.ui.core.format.DateFormat.getDateInstance({pattern: 'YYYY/MM/dd'}),
				ichecknum    = 0;
			// Table에서 선택한 값이 없을 시 Error Message 발생
			if (!(scontexts.length > 0)){

				MessageBox.error( sTextError );
				return;
			}else{
				for (var i = 0; i < scontexts.length; i++ ){

					var contextpath  = scontexts[i].sPath,
						object       = oModel.getObject(contextpath),
						sStatus      = object.Status;

					if( sStatus === "C"){
						ichecknum = ichecknum + 1;
					}
				}

				if(ichecknum  < 1){
					return;
				}else{
					var sContent =  this.getResourceBundle().getText("CancelContent", ichecknum);
					groupId.push("new");
				}
			}
		
		
		
			// Status의 업데이트를 실패 시, Error Message
			var fnError = function (oError) {

				oView.setBusy(false);
				MessageBox.error(oError.message);
				otable.removeSelections(true);

			}.bind(this);

			// Status의 업데이트를 성공할 시, Table Rebinding
			var fnSuccess = function (oSuccess) {

				oworklistViewModel.setProperty("/complete", nComplete);
				oworklistViewModel.setProperty("/delay", nDelay);
				oworklistViewModel.setProperty("/progress", nProgress);

				oView.setBusy(true);
				oBinding.refresh(true);	
				otable.removeSelections(true);
				oView.setBusy(false);
				this.bfilterCheck = false;

			}.bind(this);
		
			// Cancel의 확인 Message Box 생성및 메시지 박스 버튼에 따른 action
			//** 조건 : 상태가 Complete 일때만, 변경됨 */
			MessageBox.confirm(sContent, {
				title : sTitle,
				initialFocus : sap.m.MessageBox.Action.CANCEL,
				onClose : function(sButton) {

					// OK 클릭시, Status의 값 Update 하는 logic
					if (sButton === MessageBox.Action.OK) {

						for (var i = 0; i < scontexts.length; i++ ){

							var contextpath  = scontexts[i].sPath,
								object       = oModel.getObject(contextpath),
								soday        = oformat.format(object.Pldat),
								sodaysplit   = soday.split("/"),
								oObjectPldat = new Date(sodaysplit[0], (sodaysplit[1] -1) , sodaysplit[2],23,59,59),
								sStatus      = object.Status;
							
							if( sStatus === "C"){
								nComplete = nComplete - 1;

								if( (new Date().getTime() <= oObjectPldat.getTime()) ){ // 계획된 날짜가 오늘 날짜 보다 크거나 같을때 "Progress"
									sStatus   = "P";
									nProgress += 1;

								}else{ 													// 계획된 날짜가 오늘 날짜 보다 작은 때 "Delay "
									sStatus = "D";
									nDelay  += 1;
								}

								var info = {
									"Bukrs"    : object.Bukrs,
									"Spmon"    : object.Spmon,
									"Zfchid"   : object.Zfchid,
									"Zfcmid"   : object.Zfcmid,
									"Zfcactid" : object.Zfcactid,
									"Status"   : sStatus,
									"Zcomment" : ""
								};	
								
								oModel.update(contextpath, info,{
									method: "PUT",
									groupId: groupId[0],
									success: function(oData){
									},
									error : function(){
									}
								});
							}
						
						}

						oView.setBusy(true);
						oModel.setDeferredBatchGroups(groupId);
						oModel.setUseBatch(true);

						oModel.submitChanges({
							groupId : groupId[0],
							success : fnSuccess,
							error   : fnError});

						oModel.setUseBatch(false);
						oModel.setDeferredBatchGroups([]);

					}
					// Cancel 클릭시, Table 선택한 값들을 지움. 
					else if (sButton === MessageBox.Action.CANCEL){

						otable.removeSelections(true);
					}
				}
			});
		},
		// 상단의 icon Tab 클릭시 실행
		onQuickFilter2 : function(oEvent) {
			// this.setLog("call function : onQuickFilter");
			// this.parametersetLog(">> parameter : oEvent", oEvent);

			var sKey = oEvent.getParameter("selectedKey"),
				ofilter = null ;
			
			if(sKey  === 'A'){
				ofilter = null;
				this.bfilterCheck = true;
			}else{
				ofilter = new Filter("Status","EQ", sKey);
				this.bfilterCheck = false;
			}

			this._filterSetting('Q',ofilter);
		},

		// 년도/달 의 >(다음) 버튼 클릭시 실행
		onnextmonth: function(oEvent){
			// this.setLog("call function : onnextmonth");

			this._LNMonthRebind("N");

			this.onDayFilter(oEvent);
		},
		// 년도/달 의 <(이전) 버튼 클릭시 실행
		onlastmonth : function(oEvent){
			// this.setLog("call function : onlastmonth");

			this._LNMonthRebind("L")

			this.onDayFilter(oEvent);
		},
		// footer 하단의 Message 생성시, 해당 Message를 보여줌
		// Error 사항을 보여줌.
		onMessagesButtonPress: function(oEvent){
			// this.setLog("call function : onMessagesButtonPress");
			// this.parametersetLog(">> parameter : oEvent", oEvent);

			var oMessagesButton = oEvent.getSource();

			if (!this._messagePopover) {
				this._messagePopover = new MessagePopover({
					items: {
						path: "message>/",
						template: new MessagePopoverItem({
							description: "{message>description}",
							type: "{message>type}",
							title: "{message>message}"
						})
					}
				});
				oMessagesButton.addDependent(this._messagePopover);
			}
			this._messagePopover.toggle(oMessagesButton);
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		// 이전/다음 달 클릭시 해당 년월을 값에 맞게 Setting 및 관련 값에 대한 flag 변경을 위해 실행
		_LNMonthRebind : function(sLN){
			// this.setLog("call function : _LNMonthRebind");
			// this.parametersetLog(">> parameter : sLN \n" , sLN );

			var sTitle   = this.getResourceBundle().getText("worklistTableTitleCount"),
				sDateset = this.getView().byId("datelabel01").getText(),
				oiconTab = this.getView().byId("SingleWorklisticonTabBar01"),
				oTable   = this.getView().byId("SingleWorklisttable01"),
				oBinding = oTable.getBinding("items"),
				oMessageProcessor = new ControlMessageProcessor(),
				oMessageManager = sap.ui.getCore().getMessageManager(); 

			this.bfilterCheck  = true;
			this.bflag         = true;
			this.bDialogflag   = true;
			this.ofilters      = [];
			this.osKey         = null;

			// icon Tab에 전체값 선택
			oiconTab.setSelectedKey("A");
			
			// +,-의 값을 숫자로 계산 하기 위해 month와 year을 선언.
			var imonth = parseInt(this.smonth),
				iyear  = parseInt(this.syear);

			//** L: lastmonth(이전달), N : Nextmonth(다음달) */	
			if (sLN === "L"){
				imonth = imonth -1 ;
				
				if( (imonth === 0)){
					iyear  = iyear -1;
					imonth = 12;
				};
			}else if(sLN === "N"){
				imonth = imonth + 1;

				if(imonth > 12){
					iyear  = iyear + 1;
					imonth = 1;
				};
			};
			
			this.smonth = imonth;
			this.syear  = iyear;

			this.smonth = ('0' + this.smonth).slice(-2);


			//요청 하신 달에 맞는 filter 생성
			// var ofilter = new Filter({
			// 	path     : "Pldat",
			// 	operator : sap.ui.model.FilterOperator.EQ,
			// 	value1   : new Date(this.syear ,this.smonth -1, "2")});
			
			// //Wokrlist에서 달관련 값 변환
			sDateset = this.syear + " / " + this.smonth;
			sTitle   = this.syear + " / " + this.smonth ;	
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			this.getModel("worklistView").setProperty("/worklistDateLabel", sDateset);

			
			// // 달 넘어가면 footer Message 삭제
			oMessageManager.registerMessageProcessor(oMessageProcessor);
			oMessageManager.removeAllMessages();
			
			// this._filterSetting("M",ofilter);
		},
		// 달 및 icon Tab filter 관련 function
		_filterSetting : function (DQM,ofilter){
			// this.setLog("call function : _filterSetting");
			// this.parametersetLog(">> parameter : DQM, ofilter \n" + DQM, ofilter);
			
		  	var afilters = this.aFilters,
		   	    oTable   = this.getView().byId("SingleWorklisttable01"),
			    oBinding = oTable.getBinding("items"),
				oWorklistModel = this.getModel("worklistView");
			
			switch(DQM){
				//Quick Filter Setting
				case 'Q':
					//iconTab Filter가 있을 경우, filter에서 Status를 제거 하고 push

					if(!(ofilter == null)){

						this._filterPathDel(afilters,"Status");

						afilters.push(ofilter);

					//iconTab Filter 전체값 key = W를 눌렀을 시, filter에서 Status를 제거함.
					}else{

						this._filterPathDel(afilters,"Status");
					}

					break;

				//달을 넘겼을때의 Setting
				case 'M':
					this.sorterflag = true;
					this.aafilter = [];
					afilters = [];
					
					var aColumns  = oTable.getColumns();

					afilters.push(ofilter);
					
					//Column filter 및 sort icon reset
					for(var i = 0; i < aColumns.length; i++){
						var k = i + 1,
							sIconSet   = "/filtericon0" + k ,
							sPopoverid = "singleinput0" + k ;
		
						oWorklistModel.setProperty(sIconSet,false);
						aColumns[i].setSortIndicator("None");
		
						if(k < this.sColumnlength){
							var	oPopinput  = this.byId(sap.ui.core.Fragment.createId(this.createId("ColumnPopover01"), sPopoverid));
							oPopinput.setValue("");
						}
					}
					break;	
			}

			this.aFilters = afilters ;
			oBinding.filter(this.aafilter);
		},
		// Filter의 Paht가 bindingPath와 같은 값 제외 시키는 function
		_filterPathDel: function(ofilter, obindigpath){

			var ilength = parseInt(ofilter.length),
				k = 0;

			for(var i = 0; i < ilength ; i++){

				var oSpath =  ofilter[(i -k)].sPath;

				if(oSpath == obindigpath){

					ofilter.splice((i-k),1);
					k++;
				}
			}

		},
		// Table Column 클릭시 PopOver open 시키는 function 
		_customClick : function(oID){			
			// this.parametersetLog(">> parameter : oID", oID);

			var that = this;		

			$('#' + oID).click(function(oEvent){
			
				var oTarget     = oEvent.currentTarget,
					oLabelText  = oTarget.childNodes[0].textContent,
					oIndex      = oTarget.id.slice(-1),
					oView       = that.getView(),
					oTable      = oView.byId("SingleWorklisttable01"),					
					osKey       = oTable.getItems().length>0? oTable.getItems()[0].getCells()[oIndex-1].mBindingInfos.text.binding.sPath:""; 
					
				for(var i = 1 ; i < 8; i++){

					var sPopoverid = "singleinput0"  + i ,
						oPopinput  = that.byId(sap.ui.core.Fragment.createId(that.createId("ColumnPopover01"), sPopoverid));
		
					if( i == oIndex){					
						oPopinput.setVisible(true);						
					}else{
						oPopinput.setVisible(false);
					}
				}
				
				oView.getModel("worklistView").setProperty("/bindingValue",osKey);
				oView.getModel("worklistView").setProperty("/bindingIndex",oIndex -1);

				that._oResponsivePopover.then(function(oResponsivePopover){

					oResponsivePopover.openBy(oTarget);
				});
				
			
			});
		},
		// Table에서 List 클릭시 DetailPage에 이동을 위해 실행
		_showObject : function (oItem) {
			// this.setLog("call function : _showObject");
			// this.parametersetLog(">> parameter : oItem", oItem );

			var sPath = oItem.getBindingContext().getPath();
			
			sPath = sPath.split("/").slice(-1).pop();
			
			this.getRouter().navTo("object", {
				objectId: sPath
			});

		},
		_applySearch: function(aTableSearchState) {

			var oTable = this.byId("SingleWorklisttable01"),
				oWorklistModel = this.getModel("worklistView");

			oTable.getBinding("items").filter(aTableSearchState, "Application");

			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oWorklistModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
		_showErrorMessage: function(sMsg) {

			MessageBox.error(sMsg, {
				styleClass: this.getOwnerComponent().getContentDensityClass()
			});
		},
		onUnlistObjects: function() {
			var aSelectedLists, 
				i, 
				sPath, 
				List, 
				ListId;

			aSelectedLists = this.byId("SingleWorklisttable01").getSelectedItems();

			if (aSelectedLists.length) {
				for (i = 0; i < aSelectedLists.length; i++) {
					List = aSelectedLists[i];
					ListId = List.getBindingContext().getProperty("objectId");
					sPath = List.getBindingContext().getPath();
					this.getModel().remove(sPath, {
						success : this._handleUnlistActionResult.bind(this, ListId, true, i + 1, aSelectedLists.length),
						error : this._handleUnlistActionResult.bind(this, ListId, false, i + 1, aSelectedLists.length)
					});
				};
			} else {
				this._showErrorMessage(this.getModel("i18n").getResourceBundle().getText("TableSelectProduct"));
			}
		}
	});

});
