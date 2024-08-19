sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../utils/Utils",
    "sap/m/MessageBox"
],function (Controller, JSONModel, Fragment, Filter, FilterOperator, Utils, MessageBox) {

    //integration = webapp --> controller --> Main.controller.js
    return Controller.extend("integration.controller.Main",{

            onInit: function () {
                this._loadModel();
                this._loadFilters();
                this._loadView();
            },

            _loadView: function () {
                let oData = {
                    NumberDocument: "",
                    FirstName: "",
                    LastName: "",
                    Email: "",
                    CreationDate: new Date()
                };
                let oModel = new JSONModel(oData);
                    this.getView().setModel(oModel, "form");
            },

            _loadFilters: function () {
                let oData = {
                    NumberDocument: "",
                    FullName: ""
                };
                let oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "filters");
            },

            _loadModel: function () {
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
                this._loadView();
                this._pDialog.then((oDialog)=>{
                    oDialog.close();
                });
            },

            onFilter: function (oEvent) {

                let oModel = this.getView().getModel("filters"),
                    sNumberDocument = this.byId("FilterNumberDocument").getValue(),
                    sFullName = this.byId("FilterFullName").getValue();

                let aFilters = [];

                if (sNumberDocument) {
                    aFilters.push(new Filter("NumberDocument", FilterOperator.Contains, sNumberDocument));
                }

                if (sFullName) {
                    aFilters.push(new Filter({
                        filters:[
                            new Filter("FirstName", FilterOperator.Contains, sFullName),
                            new Filter("LastName", FilterOperator.Contains, sFullName)
                        ],
                        and: false
                    }));
                }

                let oTable = this.byId("Table"),
                    oBinding = oTable.getBinding("items");
                    oBinding.filter(aFilters);
            },

            onSubmit: async function () {
                let oModel = this.getView().getModel("form");
                let oData = Utils.getData('create', oModel);
                await Utils.execute('create', oData, this);
            },

            onDetails: async function (oEvent) {
                let oItem = oEvent.getSource(),
                    oBindingContext = oItem.getBindingContext("hana");
                let sID = oBindingContext.getProperty("ID");
                let oData = Utils.getData('query', null, sID);
                await Utils.execute('query', oData, this );
            },

            onDelete: async function (oEvent) {
                let oItem = oEvent.getSource().getParent(),
                    oBindingContext = oItem.getBindingContext("hana"),
                    sID = oBindingContext.getProperty("ID");
                let oData = Utils.getData('delete', null, sID);

                MessageBox.confirm("Esta seguro de que desea eliminar el Registro con ID: "+sID+"?", {
                    actions:[MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            await Utils.execute('delete', oData, this);
                        } else {
                            sap.m.MessageToast.show("La operación a sido cancelada");
                        }
                    }
                })

                
            }

    });

});