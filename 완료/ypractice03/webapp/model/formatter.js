sap.ui.define([
   
], 
    function () {
        "use strict";
        return {
            fnTimeSet :function(oDepTime){
                
                console.log(oDepTime);
                var  timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern:"HH:mm:ss "}),
                    TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000,
                    timeStr    = timeFormat.format(new Date(oDepTime.ms + TZOffsetMs));

                return(timeStr);

            },
            fnDaySet :function(oDaySet){
                var DateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"YYYY/MM/dd"}),
                DateStr    = DateFormat.format(oDaySet)
                
                return(DateStr);
            }
        
   
    };
}); 