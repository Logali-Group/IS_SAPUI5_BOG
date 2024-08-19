sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment"

],function (Controller, JSONModel, Fragment) {

    //integration = webapp --> controller --> Main.controller.js
    return Controller.extend("integration.controller.Main",{

            onInit: function () {
                this.loadModel();
            },

            loadModel: function () {
                let oModel = new JSONModel();
                    oModel.loadData("/model/Employees.json");
                this.getView().setModel(oModel, "view");
            },

            onDialog: function () {
                let oView = this.getView();

                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        id: oView.getId(),
                        name: "integration.fragment.Form",
                        controller: this
                    }).then((oDialog)=>{
                        oView.addDependent(oDialog);
                        return oDialog;
                    });
                }

                this._pDialog.then((oDialog)=>{
                    oDialog.open();
                });
            },

            onCancel: function () {
                this._pDialog.then((oDialog)=>{
                    oDialog.close();
                });
            }

    });

});