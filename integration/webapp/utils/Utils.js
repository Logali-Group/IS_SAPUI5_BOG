sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],function (JSONModel, MessageToast) {

    let oUtils = {

        getData: function (sAction, oModel, sID) {

            switch (sAction) {
                case 'read':
                    let oRead = {
                        "Records": {
                            "Statement": {
                                "Employees": {
                                    "@action": "SELECT",
                                    "table": "LOGALI.EMPLOYEES",
                                    "access": {
                                        "ID":"",
                                        "EMAIL": "",
                                        "DNI": "",
                                        "FIRSTNAME": "",
                                        "LASTNAME": "",
                                        "CREATIONDATE": ""
                                    }
                                }
                            }
                        }
                };

                return oRead;

                case 'create':
                    let oData = {
                        "Records": {
                            "Statement": {
                                "Employees": {
                                    "@action": "INSERT",
                                    "table": "LOGALI.EMPLOYEES",
                                    "access": {
                                        "EMAIL": oModel.getProperty("/Email"),
                                        "DNI": oModel.getProperty("/NumberDocument"),
                                        "FIRSTNAME": oModel.getProperty("/FirstName"),
                                        "LASTNAME": oModel.getProperty("/LastName"),
                                        "CREATIONDATE": new Date()
                                    }
                                }
                            }
                        }
                    }
                return oData;

                case 'query':
                    let oQuery = {
                        "Records": {
                            "Statement": {
                                "Employees": {
                                    "@action": "SELECT",
                                    "table": "LOGALI.EMPLOYEES",
                                    "key": {
                                        "ID": sID
                                    },
                                    "access": {
                                        "ID":"",
                                        "EMAIL": "",
                                        "DNI": "",
                                        "FIRSTNAME": "",
                                        "LASTNAME": "",
                                        "CREATIONDATE": ""
                                    }
                                }
                            }
                        }
                    }
                return oQuery;

                case 'delete':
                    let oDelete = {
                        "Records": {
                            "Statement": {
                                "Employees": {
                                    "@action": "DELETE",
                                    "table": "LOGALI.EMPLOYEES",
                                    "key": {
                                        "ID": sID
                                    }
                                }
                            }
                        }
                    };

                return oDelete;
            }
        },

        _getToken: function () {
            console.log("Estoy dentro");
            let sUrl = "https://4ef6c63atrial.authentication.us10.hana.ondemand.com/oauth/token";
            //env.process.CLIENT_ID
            let oData = {
                grant_type:"client_credentials",
                client_id: "sb-1bd2d56d-638b-4bb6-84f9-9ccc008c0bbe!b320850|it-rt-4ef6c63atrial!b26655",
                client_secret: "9814b838-783b-4b95-95e6-7d5b35ec83e6$YQWFtNXVgVF7IgxGCmEdFfZDBLvF89v9JWNs-UPtMEg="
            };

            return new Promise((resolve, reject)=>{
                $.post(sUrl, oData, null, 'json',{}).done((data)=>{
                    return resolve(data.access_token);
                }).error((error)=>{
                    reject(error);
                })
            })
        },


        execute: async function (sAction, oData, oController) {

            let sBaseUrl= "https://4ef6c63atrial.it-cpitrial05-rt.cfapps.us10-001.hana.ondemand.com/http/shana/sapui5",
                sProxy = "http://localhost:8081/",
                sUrl = sProxy+sBaseUrl;

            let sToken = await this._getToken();

            $.ajax({
                url: sUrl,
                dataType: 'json',
                headers:{
                    'Content-Type':'application/json',
                    'Authorization':'Bearer '+sToken,
                    'Body':JSON.stringify(oData)
                },
                username: "sb-1bd2d56d-638b-4bb6-84f9-9ccc008c0bbe!b320850|it-rt-4ef6c63atrial!b26655",
                password: "9814b838-783b-4b95-95e6-7d5b35ec83e6$YQWFtNXVgVF7IgxGCmEdFfZDBLvF89v9JWNs-UPtMEg="
            }).done((data)=>{
                switch (sAction) {
                    case 'read':
                        this._loadRead(data, oController);
                    break;
                    case 'create':
                        oController.onCancel();
                        MessageToast.show("El registro fue insertado de forma exitosa");
                    break;
                    case 'query':
                        console.log("Estoy a punto de hacer la consulta por ID");
                        this._loadQuery(data, oController);
                    break;
                    case 'delete':
                        console.log("Estoy a punto de borrar un registro");
                        MessageToast.show("El registro fue eliminado exitosamente");
                    break;
                }
            }).error((error)=>{
                MessageToast.show("Ocurrió un error durante el proceso");
                console.log(error);
            });
        },

        _loadRead: function (data, oController) {
            let aValues = data.Records.Statement_response.row;
            let oObject = {
                Employees: aValues
            };
            let oModel = new JSONModel(oObject);
            oController.setModel(oModel, "hana");
        },

        _loadQuery: function (data, oController) {
            let oObject = data.Records.Statement_response.row;
            let oModel = oController.getView().getModel("form");
                oModel.setProperty("/NumberDocument", oObject.DNI);
                oModel.setProperty("/FirstName", oObject.FIRSTNAME);
                oModel.setProperty("/LastName", oObject.LASTNAME);
                oModel.setProperty("/Email", oObject.EMAIL);
            oController.onDialog();
        }

    };


    return oUtils;

});