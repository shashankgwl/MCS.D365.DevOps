/// <reference path="../../../node_modules/@types/xrm/index.d.ts" />

import { AuthenticationState } from "react-aad-msal";
import { ISolutionImportStatus, IImportProgress, IXrmresponse } from '../model/SolutionImportModel'


export class SolutionImportHelper {

    constructor() {
    }

    async getExportStatusOfDeployment(deploymentId?: string | null): Promise<Xrm.RetrieveMultipleResult> {

        return new Promise((resolve, reject) => {
            window.parent.Xrm.WebApi.online.retrieveMultipleRecords("devops_exportstatus", `?$select=devops_name&$filter=_devops_deployment_value eq ${deploymentId}`).
                then(data => resolve(data)).catch(reason => reject(reason));
        });
    }

    async getImportStatusOfDeployment(deploymentId?: string | null): Promise<ISolutionImportStatus[]> {
        var records: ISolutionImportStatus[] = [];
        try {
            var data = await window.parent.Xrm.WebApi.online.retrieveMultipleRecords("devops_importstatus", `?$select=devops_importid,devops_name&$filter=_devops_deployment_value eq ${deploymentId}&$orderby=createdon desc`);

            for (var i = 0; i < data.entities.length; i++) {
                records.push({
                    solutionName: data.entities[i]["devops_name"],
                    solutionImportId: data.entities[i]["devops_importid"],
                    message: '',
                    status: ''
                });
            }
            return new Promise<ISolutionImportStatus[]>(resolve => resolve(records));
        }

        catch (error) {
            return new Promise<ISolutionImportStatus[]>((resolve, reject) => {
                reject(records.push({
                    message: error.message,
                    solutionImportId: '',
                    solutionName: '',
                    status: ''
                }));
            });
        }

        //return new Promise<ISolutionImportStatus[]>((resolve, reject) => {
        //    reject(records.push({
        //        message: '',
        //        solutionImportId: '',
        //        solutionName: '',
        //        status: ''
        //    }));
        //});
    }

    async getImportProgressOnServer(deploymentId: string, asyncJobID: string, username: string, password: string): Promise<IImportProgress> {
        var devops_executeImportStatusRequest = {
            DeploymentID: deploymentId,
            ImportAsyncID: asyncJobID,
            UN: username,
            PW: password,

            getMetadata: function () {
                return {
                    boundParameter: null,
                    parameterTypes: {
                        "DeploymentID": {
                            "typeName": "Edm.String",
                            "structuralProperty": 1
                        },
                        "ImportAsyncID": {
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
                        }
                    },
                    operationType: 0,
                    operationName: "devops_executeImportStatus"
                };
            }
        };

        try {
            var output = await window.parent.Xrm.WebApi.online.execute(devops_executeImportStatusRequest);
            var result = JSON.parse(JSON.parse(await output.text()).ResultJSON);
            return new Promise<IImportProgress>(async (resolve) => {
                resolve(
                    {
                        statusReason: result.status,
                        friendlymessage: result.message,
                        hasError: false,
                        solutionName: ''
                    });
            });
        }
        catch (error) {
            return new Promise<IImportProgress>((resolve, reject) => {
                reject(
                    {
                        statusReason: '',
                        friendlymessage: error.message,
                        hasError: true
                    });
            });
        }
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