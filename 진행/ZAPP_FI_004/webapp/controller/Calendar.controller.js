sap.ui.define([
    "./BaseController",
    "com/smilegate/zappfi004/model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/library",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
    "sap/ui/generic/app/navigation/service/NavigationHandler",
    "sap/ui/generic/app/navigation/service/NavType"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController,formatter,JSONModel,mobileLibrary,Filter,FilterOperator,Fragment,NavigationHandler,NavType) {
        
        "use strict";    
        var StickyMode   = mobileLibrary.PlanningCalendarStickyMode;
        
        return BaseController.extend("com.smilegate.zappfi004.controller.Calendar", {
            formatter: formatter,

            onInit: function (oEvent) {
                // this.setLog("call function : Calendar Controller-onInit");

                var allDayModel = new JSONModel(),
                    oModel = this.getOwnerComponent().getModel(),
                    oSinglePlanningCalendar = this.getView().byId("oSPC01"),
                    oDate  = new Date(),
                    that  = this,
                    sCalendarTitle = "",
                    sSubTitle = "";
                this.oNavigationHandler = new NavigationHandler(this);
                var startupParameters = this.oNavigationHandler.oRouter._oOwner.oComponentData.startupParameters;

                // Worklist에서 Calendar 누를 경우
                if(jQuery.sap.storage.get("soModelset")){
                    var soModelpath  = jQuery.sap.storage.get("soModelset");
                 
                    this.oModelsPath = soModelpath;
                
                // LauchPad Tile에서 Calendar를 누를 경우 
                }else if(startupParameters.oModelsPath){
                    var sModelPath  =  startupParameters.oModelsPath[0];

                    this.oModelsPath = sModelPath;
                } else{

                    this.oModelsPath = "/SingleSet";
                }

                // Parameter 값에 따라 해당 Calendar Title 변경 Set
                if(this.oModelsPath === "/SingleSet"){
                    sCalendarTitle =  this.getResourceBundle().getText("SingleCalendarTitle");
                    sSubTitle = this.getResourceBundle().getText("SingleCalendarsubTitle");
                    
                }else if(this.oModelsPath === "/TeamSet"){
                    sCalendarTitle = this.getResourceBundle().getText("TeamCalendarTitle");
                    sSubTitle = this.getResourceBundle().getText("TeamCalendarsubTitle");

                }else if(this.oModelsPath === "/CompanySet"){
                    sCalendarTitle = this.getResourceBundle().getText("CompanyCalendarTitle");
                    sSubTitle = this.getResourceBundle().getText("CompanyCalendarsubTitle");
                 
                }

                this.byId("oComboBox01").setVisible(false);

                 // Worklist에서 Calendar 누를 경우, oDate(startDate)의 값을 변경하여 Set
                if(jQuery.sap.storage.get("sFldat")){
                  
                    var sFPldat = jQuery.sap.storage.get("sFldat"),
                        asFPlat = sFPldat.split("/"),
                        iyear   = parseInt(asFPlat[0]),
                        imonth  = parseInt(asFPlat[1]) - 1;

                    oDate = new Date(iyear,imonth,"2");
                    
                    jQuery.sap.storage.removeAll(); 
                   
                }
                
                // Calendar Setting을 정의하기 위한 Model Set
                allDayModel.setData({ stickyMode: StickyMode.None, 
                                      enableAppointmentsDragAndDrop: false, 
                                      enableAppointmentsResize: false, 
                                      enableAppointmentsCreate: false,
                                      allDay :false,
                                      title : sCalendarTitle,
                                      subtitle : sSubTitle
                                    });

                this.getView().setModel(allDayModel, "settings");

                //Calendar 관련 Data Model Set
                var  oDataModel = new JSONModel({
                        startDate  : oDate,
                        HolidaySet : "",
                        PathSet    : "",
                        FilterSet  : "",
                        FilterKey  : "all"
                });

                oDataModel.setSizeLimit(999);

                this.afilter = [];
                this.afilter.push(new Filter("Pldat",FilterOperator.EQ, oDate));

                // 데이터 GET 성공시, Data Model Set
                this.getOwnerComponent().getModel().read(this.oModelsPath,{
                    filters :  this.afilter,
                    success: function(oData){
                       var aCompany = [],
                           aTeam   = [],
                           svalue = that.getResourceBundle().getText("filterAll");

                        aTeam.push({
                                key : "all",
                                value : svalue });
                        
                        aCompany.push({
                                key : "all",
                                value : svalue });

                        oDataModel.setProperty("/PathSet", oData.results);

                        if(oData.results[0]){

                            for(var i = 0; i< oData.results.length; i++){

                               if(oData.results[i].Bukrs){
                                    aCompany.push({
                                        key   : oData.results[i].Bukrs,
                                        value : oData.results[i].Butxt
                                    });

                                    aTeam.push({
                                        key  : oData.results[i].Kostl,
                                        value: oData.results[i].Ktext
                                    });
                               }
                                
                            }
                        }
                        
                        if(that.oModelsPath === "/TeamSet"){

                            that._filterDistinct(aTeam);
                            

                        }else if (that.oModelsPath === "/CompanySet"){
                    
                            that._filterDistinct(aCompany);
                        }
                    }
                });

                this.getOwnerComponent().getModel().read("/HolidaySet",{
                    filters :  [
                        new Filter("Date",FilterOperator.EQ, oDate)
                    ],
                    success: function(oData){
                        oDataModel.setProperty("/HolidaySet", oData.results);
                    }
                });

                this.getView().setModel(oDataModel, 'oData');
                
                
                
                // Planning Calendar 초기에 Setting할 View 설정. WorkWeekView 설정.
                oSinglePlanningCalendar.setSelectedView(oSinglePlanningCalendar.getViews()[3]);
                            
                // Planning Calendar에서 클릭시 발생하는 Event Setting
                oSinglePlanningCalendar.addEventDelegate({
                    onclick : function(oEvent){

                        if(!(oSinglePlanningCalendar.getSelectedView() === oSinglePlanningCalendar.getViews()[3].sId)){
                            // that.parametersetLog(">> onClick : oEvent" , oEvent );

                            that._privateHandleAppointmentSelect(oEvent.srcControl, "N");
                        }

                    }
                });
            
            },
            // Calendar에서 Month View를 클릭할 시 실행
            handleMoreLinkPress: function(oEvent){
                // this.setLog("call function : handleMoreLinkPress");
                // this.parametersetLog(">> parameter :oEvent", oEvent );

                var sDate = oEvent.getParameter("date"),
                    oSinglePlanningCalendar = this.getView().byId("oSPC01");
                
 
                // Month View에서 More 클릭시 해당 날짜의 DayView로 이동하는 logic
                oSinglePlanningCalendar.setSelectedView(oSinglePlanningCalendar.getViews()[0]);
                oSinglePlanningCalendar.setStartDate(sDate);
            },
            // Calendar에서 날짜 변경시 실행 
            handleStartDateChange : function(oEvent){
                // this.setLog("call function : handleStartDateChange");
                // this.parametersetLog(">> parameter :oEvent", oEvent );
                
                var oStartDate  = oEvent.getParameter("date"),
                    oformat     = sap.ui.core.format.DateFormat.getDateInstance({pattern: 'YYYY/MM/dd'}),
                    sToday      = oformat.format(oStartDate),
                    oTodaySplit = sToday.split("/"),
                    sTodayyear  = parseInt(oTodaySplit[0]),
                    sTodaymonth = parseInt(oTodaySplit[1]),
                    sTodayday   = parseInt(oTodaySplit[2]),
                    oModel      = this.getView().getModel(),
                    oDataModel  = this.getView().getModel('oData');
                    
                    // 해당 날짜에 맞게 조회하기 위해 값 Setting.
                    sToday = new Date( sTodayyear , (sTodaymonth - 1), (sTodayday+1));
                    var afilter = this.afilter
                    this._filterPathDel(afilter, 'Pldat');
                    this.afilter.push(new Filter("Pldat", FilterOperator.EQ , sToday));
                    
                    // 날짜에 맞는 데이터 Data Set
                    oModel.read( this.oModelsPath,{
                        filters: this.afilter,
                        success : function (oData){
                            oDataModel.setProperty("/PathSet",oData.results);
                        }
                    });
                    // SpecialDay(휴일) Data Set
                    oModel.read("/HolidaySet",{
                        filters :  [
                            new Filter("Date",FilterOperator.EQ, sToday)
                        ],
                        success: function(oData){
                            oDataModel.setProperty("/HolidaySet", oData.results);
                        }
                    });
    

                    this.getView().setModel(oDataModel,"oData"); 
                
            },
            handleComoboxChange: function(){
                var oDataModel = this.getView().getModel("oData"),
                    sKey       = oDataModel.getProperty("/FilterKey"),
                    afilter    = this.afilter,
                    oModel     = this.getView().getModel();

          
                if(this.oModelsPath === "/TeamSet"){

                    if(sKey === "all"){
                        this._filterPathDel(afilter,"Kostl");
                    }else{
                        this._filterPathDel(afilter,"Kostl");
                        this.afilter.push(new Filter("Kostl", FilterOperator.EQ, sKey));
                    }
            
                    
                }else if (this.oModelsPath === "/CompanySet"){
                    if(sKey === "all"){
                        this._filterPathDel(afilter,"Bukrs");
                    }else{
                        this._filterPathDel(afilter,"Bukrs");
                        this.afilter.push(new Filter("Bukrs", FilterOperator.EQ, sKey));
                    }
                    
                } 

                oModel.read( this.oModelsPath,{
                    filters: this.afilter,
                    success : function (oData){
    
                        oDataModel.setProperty("/PathSet",oData.results);
                    }
                });

     
            },
            // Appointment의 Detail Dialog에서 Close버튼 클릭시 실행
            handlePopoverCloseButton: function(){
                // this.setLog("call function : handlePopoverCloseButton");

                var oPopover = this.getView().byId("SingledetailsPopover01");

                oPopover.close();
                oPopover.destroy();
            },
            /* =========================================================== */
		    /* internal methods                                            */
		    /* =========================================================== */
            //Calendar에서 클릭할 시 실행
            _privateHandleAppointmentSelect: function(oEvent, tag){
                // this.setLog("call function : _privateHandleAppointmentSelect");
                // this.parametersetLog(">> parameter :tag, oEvent \n "+tag, oEvent );
                
                var oSinglePlanningCalendar = this.getView().byId("oSPC01"),
                    sMonthView = oSinglePlanningCalendar.getViews()[3].sId,
                    sPlanningView = oSinglePlanningCalendar.getSelectedView();

                if(tag == null){
                    // Month View에서 클릭시 appointment의 데이터가 있을 경우 해당 popover 실행
                  if(typeof(oEvent) !== 'undefined' && (sPlanningView == sMonthView)){
                        var oAppointment =  oEvent.getParameter("appointment");

                        if (oAppointment === undefined) {
                            return;
                        }

                        // this.setLog("privatepopover - month view");
                        this._oOpenPopOver(oAppointment);
                    }
                }else{
                    // Day, WorkWeek, Week에서 appointment를 클릭할 시 해당 popover 실행
                    if(oEvent.getMetadata()._sClassName === 'sap.ui.unified.CalendarAppointment'){ 
                        
                        var oAppointment = oEvent;
                        // this.setLog("privatepopover");
                        this._oOpenPopOver(oAppointment);
                    }else{
                        return;
                    }
                }
            },
            // 해당 Event가 Appointment일 시 데이터에 맞는 PopOver를 실행
            _oOpenPopOver(oAppointment){
                // this.setLog("call function : _oOpenPopOver");
                // this.parametersetLog(">> parameter: oAppointment ", oAppointment );

                var sStartDate          = oAppointment.getStartDate(),
                    sEndDate            = oAppointment.getEndDate(),
                    sTrimmedStartDate   = new Date(sStartDate),
                    sTrimmedEndDate     = new Date(sEndDate),
                    bAllDate            = false,
                    ocalendarModel      = this.getView().getModel('oData'),
                    oallDayModel        = this.getView().getModel("settings"),
                    oView               = this.getView(),
                    oPopover            =  this.getView().byId("SingledetailsPopover01");
                    

               
                //popover 실행되어 있을 경우 해당 Popover close 및 destroy 
                if(typeof(oPopover) !='undefined'){
                    oPopover.close();
                    oPopover.destroy();
                }

                if(sStartDate.getTime() === sTrimmedStartDate.getTime()&&
                   sEndDate.getTime() === sTrimmedEndDate.getTime()){
                    bAllDate = true;
                }

                oallDayModel.getData().allDay = bAllDate;
                oallDayModel.updateBindings();

                //클릭한 appointment에 맞는 데이터 Binding을 위해 Setting
               var  oData = ocalendarModel.getObject(oAppointment.oBindingContexts.oData.sPath),
                    sPath = this.oModelsPath +'(Bukrs=\''+oData.Bukrs+'\',Spmon=\''+oData.Spmon +'\',Zfchid=\''+oData.Zfchid+'\',Zfcmid=\''+oData.Zfcmid+'\',Zfcactid=\''+oData.Zfcactid+'\')';
                
                //popover 실행, 해당 popover에 관련 데이터 Binding
                if (!pDetailsPopover) {
                    
                    var pDetailsPopover = Fragment.load({
                            id: oView.getId(),
                            name: "com.smilegate.zappfi004.view.Details",
                            controller: this
                        }).then(function(oResponsivePopover){
                            oView.addDependent(oResponsivePopover);
                            return oResponsivePopover;
                        });
                    
                        pDetailsPopover.then(function (oResponsivePopover) {

                            oResponsivePopover.bindObject(sPath);
                            oResponsivePopover.openBy(oAppointment);
                        });
                }

            },
            _filterDistinct(aValue){
                var aPropertyData = [],
                    oModel = this.getView().getModel('oData');


                var arrunique = aValue.filter((character, idx, arr)=>{
                    return arr.findIndex((item) => item.key === character.key && item.value === character.value) === idx ;
                });

                for(var i = 0; i<arrunique.length; i++){
                    var Data = arrunique[i];

                    if(arrunique[i]){
                        aPropertyData.push(Data);

                    }
                      

                }

                if(aPropertyData.length > 2){
                    oModel.setProperty("/FilterSet",aPropertyData);
                    this.getView().byId("oComboBox01").setVisible(true);
                }

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

            }
        })
    });
