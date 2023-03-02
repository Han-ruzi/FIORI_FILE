sap.ui.define([
	"sap/ui/core/library"
] , function (coreLibrary) {
	"use strict";

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit : function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		DateSet: function(oDate){
			var DateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"YYYY/MM/dd"}),
			DateStr    = DateFormat.format(oDate)

			return(DateStr);
		}, 

		/**
		 * Defines a value state based on the stock level
		 *
		 * @public
		 * @param {number} iValue the stock level of a product
		 * @returns {string} sValue the state for the stock level
		 */
		StatusState: function(iValue){ 
			

			if (iValue ==='D'){
				return	ValueState.Error;
				
			}else if(iValue === 'P' ){
				return ValueState.Warning;

			}else if(iValue === 'C'){
				return ValueState.Success;
			}else{
				return ValueState.None;
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
					
				default :
					State = 'Wait';
			}
			return State;

		},
		TimeSet:function(TValue){

			if(TValue){
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern:"KK:mm a"});
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			var timeStr = timeFormat.format(new Date(TValue.ms + TZOffsetMs));
			return timeStr;
				
			}else{
				return TValue;
			};
			
			
		},
		Comments : function(Value){
			if(Value){
				return Value;
			}else{
				return null;
			}
		},
		DateTimeset: function(oDate, oTime){

			if(oTime && oDate){
				var timeFormat  = sap.ui.core.format.DateFormat.getTimeInstance({pattern:"KK:mm a"}),
				 	TZOffsetMs  = new Date(0).getTimezoneOffset() * 60 * 1000,
				 	timeStr     = timeFormat.format(new Date(oTime.ms + TZOffsetMs)),
					DateFormat  = sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"YYYY/MM/dd"}),
					DateStr     = DateFormat.format(oDate),
					DateTimeStr = DateStr + ' ' + timeStr;
					return DateTimeStr;
			}else{
				DateTimeStr = null;
			};

		}

	};

});