/// <reference path="../../../node_modules/@types/xrm/index.d.ts" />

import { AuthenticationState } from "react-aad-msal";
import { IXrmresponse } from '../model/SolutionImportModel'


export class SolutionImportHelper {

    constructor() {
    }

    async getExportStatusOfDeployment(deploymentId?: string | null): Promise<Xrm.RetrieveMultipleResult> {

        return new Promise((resolve, reject) => {
            window.parent.Xrm.WebApi.online.retrieveMultipleRecords("devops_exportstatus", `?$select=devops_name&$filter=_devops_deployment_value eq ${deploymentId}`).
                then(data => resolve(data)).catch(reason => reject(reason));
        });
    }

    async beginImport(deploymentId: string, exportStatusRecId: string, solutionName: string, username: string, password: string, overwrite: boolean): Promise<IXrmresponse> {
        //alert(`overwrite is ${overwrite}`);
        var devops_executeImportRequest = {
            deploymentId: deploymentId,
            exportStatusId: exportStatusRecId,
            SolutionName: solutionName,
            UN: username,
            PW: password,
            Overwrite: overwrite,
            getMetadata: function () {
                return {
                    boundParameter: null,
                    parameterTypes: {
                        "deploymentId": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "exportStatusId": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "SolutionName": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "UN": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "PW": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "Overwrite": {
                            "typeName": "Edm.Boolean",
                            "structuralProperty": 1
                        }
                    },
                    operationType: 0,
                    operationName: "devops_executeImportRequest"
                };
            }
        };

        try {
            var output = await window.parent.Xrm.WebApi.online.execute(devops_executeImportRequest);
            alert(output.status);
            return new Promise(resolve => {
                resolve({ hasError: false, message: "Operation completed successfully." });
            });
        }
        catch (err) {
            return new Promise((resolve, reject) => {
                reject({ hasError: true, message: err.message });
            });
        }

    }
}
/*

 */