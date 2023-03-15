sap.ui.define([
    "sap/ui/unified/library"
], 
    function (unifiedLibrary) {
        "use strict";
        var CalendarDayType = unifiedLibrary.CalendarDayType;
        return {
        
            Dateset :function(oDay){
                var DateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"YYYY/MM/dd"}),
                    DateStr    = DateFormat.format(oDay),
                    timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern:"HH:mm:ss "}),
                    TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000,
                    // timeStr    = timeFormat.format(new Date(otime.ms + TZOffsetMs)),
                    Datesplit = DateStr.split("/");
                    // timesplit = timeStr.split(":");
                var year  = Datesplit[0],
                    month = Datesplit[1],
                    day   = Datesplit[2];
                    // hh    = timesplit[0];
    
                month = month - 1;
                
                var returnDate = new Date(year, month, day, 0, 0, 0);
                    
                return returnDate;
            },
            StatusType: function(Status){
           
                switch(Status){
                    case  'C' :
                        return CalendarDayType.Type07;
                        break;
                    case  'P' :
                        return CalendarDayType.Type01;
                        break;
                    case 'D' :
                        return CalendarDayType.Type03;
                        break;
                    case 'W' :
                        return CalendarDayType.Type09;
                        break;
                    default :
                      return CalendarDayType.NonWorking;
                };
            },
            Status: function(iValue){ 
                var State;

                switch(iValue){
                    case  'D' :
                        State = 'Delay';
                        break;
    
                    case  'P' :
                        State = 'Progress';
                        break;
    
                    case  'C' :
                        State = 'Complete';
                        break;
                    
                    case  'H' :
                        State = 'Holiday';
                        break;
                        
                    default :
                        State = 'Wait';
                }
                return State;
    
            },
            specialType(shortTxt){
                var type;
                
                if(shortTxt){
                    type = CalendarDayType.Type04;
                }else{
                    type = "";
                };

                return type;
            },
            DialogDateSet(oDate){
              if(oDate){
                var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"YYYY/MM/dd"}),
                    oDateStr    = oDateFormat.format(oDate);

                return oDateStr;
              };
            }   
    };
});