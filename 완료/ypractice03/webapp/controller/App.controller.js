sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/smilegate/ypratice03/model/formatter",
    "sap/ui/core/Fragment",
    "sap/m/ColumnListItem"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter, Fragment, ColumnListItem) {
        "use strict";
        

        return Controller.extend("com.smilegate.ypratice03.controller.App", {
            formatter: formatter,

            onInit: function () {

            },

          fnCreate : function(){
            console.log("Create");

            if (!this.pDialog) {
              this.pDialog = this.loadFragment({
                name: "com.smilegate.ypratice03.view.Create",
                Controller: this
              });
            } 
            this.pDialog.then(function(oDialog) {
              oDialog.open();
            });
          },

          onCloseDialog : function () {
            // note: We don't need to chain to the pDialog promise, since this event-handler
            // is only called from within the loaded dialog itself.
            this.byId("CreateDialog").close();
          },


          onCreateRow : function() {

            var addLine = new ColumnListItem({
              cells :[
                new sap.m.Input({
                  value : ""
                }),
                new sap.m.Input({
                  value : ""
                }),
                new sap.m.Input({
                  value : ""
                }),
                new sap.m.Input({
                  value : ""
                })

              ]
            });
            this.getView().byId("Table02").addItem(addLine);
          },

          onSaveDialog : function() {
            var oTable = this.getView().byId("Table02");
            var selTable = oTable.getItems();
            var oModel = this.getView().getModel();
            
            var groupid = "Create"

            for( var i = 0 ; i < selTable.length ; i++ ){
                var item = selTable[i];

     

                var CarridCell = item.getCells()[0],
                    ConnidCell = item.getCells()[1],
                    CarrnameCell = item.getCells()[2],
                    DepdateCell = item.getCells()[3];
                    // DeptimeCell = item.getCells()[4];

                var Carrid = CarridCell.getValue(),
                    Connid = ConnidCell.getValue(),
                    Carrname = CarrnameCell.getValue(),
                    Depdate = DepdateCell.getValue();
                    // Deptime = DeptimeCell.getValue();
                // Date : 년.월. 일 따로 구해서 new Date(년,월,일) value => info 정보

              
                var info = {
                  "Carrid" : Carrid,
                  "Connid" : Connid,
                  "Carrname" : Carrname,
                  "Depdate" : new Date(Depdate)
                };


                console.log(info);

                oModel.create("/SFLIGHTSet", info,{
                  method : "POST",
                  groupId : groupid
                })
           } 

           this._fnsetUserBatch(groupid);

          },


          fnDelete : function(){
            var oTable = this.getView().byId("Table01");
            var selTable = oTable.getSelectedContexts();
            var oModel = this.getView().getModel();
            console.log(oModel.getDeferredGroups());
            
            console.log(selTable[0].sPath);
            
            var groupid = "delete"

            for( var i = 0 ; i < selTable.length ; i++ ){
                oModel.remove(selTable[i].sPath,{
                    method : "DELETE",
                    groupId : groupid
                })
            }
            
            this._fnsetUserBatch(groupid);

          
            console.log(selTable);

          },
          fnUpdate : function(){
            console.log("Update");

            var oTable = this.getView().byId("Table01");
            var selTable = oTable.getSelectedContexts();
            var oModel = this.getView().getModel();
            var oView = this.getView();
            var i = 0;
            console.log(selTable[i].sPath);
            console.log(oModel.getProperty(selTable[i].sPath));
            oModel.getProperty(selTable[i].sPath);



            if (!this.pDialog) {
              this.pDialog = this.loadFragment({
                name: "com.smilegate.ypratice03.view.Update",
                Controller: this
              });
            } 
            this.pDialog.then(function(oDialog) {
              oDialog.open();
              
              for(var i = 0; i < selTable.length; i++){
                
                var Data = oModel.getProperty(selTable[i].sPath);
                console.log(Data.Carrid);

                var addLine = new ColumnListItem({
                  cells :[
                    new sap.m.Input({
                      value : Data.Carrname
                    }),
                    new sap.m.Input({
                      value : Data.Producer
                    }),
                    new sap.m.Input({
                      value : Data.Status
                    })
    
                  ]
                });

                oView.byId("Table03").addItem(addLine);
    
              }
            });


          },


          onUpdateDialog : function(){

            var oTable = this.getView().byId("Table03");
            var oTable01 = this.getView().byId("Table01");
            var selTableCont = oTable01.getSelectedContexts();

            var selTable = oTable.getItems();
            var oModel = this.getView().getModel();
            
            var groupid = "Update"

            for( var i = 0 ; i < selTable.length ; i++ ){
                var item = selTable[i];

                var CarrnameCell = item.getCells()[0],
                    ProducerCell = item.getCells()[1],
                    StatusCell = item.getCells()[2];
                    // DeptimeCell = item.getCells()[4];

                var Carrname = CarrnameCell.getValue(),
                    Producer = ProducerCell.getValue(),
                    Status = StatusCell.getValue();
                    // Deptime = DeptimeCell.getValue();
                // Date : 년.월. 일 따로 구해서 new Date(년,월,일) value => info 정보
              
                var info = {
                  "Carrname" : Carrname,
                  "Producer" : Producer,
                  "Status" : Status,
                };


                console.log(info);
                console.log(selTableCont[i].sPath);

                oModel.update(selTableCont[i].sPath, info,{
                  method : "PUT",
                  groupId : groupid
                })

           } 

           this._fnsetUserBatch(groupid);




          },

          _fnsetUserBatch : function(groupid){
           var oModel = this.getView().getModel();
            oModel.setDeferredGroups(groupid);
            oModel.setUseBatch(true);

            oModel.submitChanges({
              groupId : groupid,
              success : function(){
                console.log("Success");
                },
              error : function(){
                console.log("Error!");
                }
            });
            oModel.setUseBatch(false);
            oModel.setDeferredGroups([]);
        }

            
        });
    });



