/// <reference path="../../../node_modules/@types/xrm/index.d.ts" />

import { ISolutionImportStatus, IImportProgress, IXrmresponse, IDevOpsExportStatus } from '../model/SolutionImportModel'
import { IDevopsSolution, ISolution } from '../model/models'


export class SolutionImportHelper {

    constructor() {
    }

    async createSolutionRecord(solution: ISolution) {

        var devopsSol: IDevopsSolution = {
            devops_name: solution.uniquename,
            devops_solutionuniquename: solution.uniquename,
            devops_version: solution.version
        }
        window.parent.Xrm.WebApi.online.createRecord("devops_solution", devopsSol).then(
            function success(result) {
                var newEntityId = result.id;
            },
            function (error) {
            }
        );
    }

    getDynamicsVersion = () => {
        return window.parent.Xrm.Utility.getGlobalContext().getVersion();
    }

    getDeploymentId = (): string => {
        try {
            let deploymentId = window.parent.Xrm.Page.data.entity.getId();
            console.log(`deployment Xrm Page entityID is ${deploymentId}`);
            return window.parent.Xrm.Page.data.entity.getId();
        }
        catch {
            return ''
        }
    }

    async getExportStatusOfDeployment(deploymentId?: string | null): Promise<IDevOpsExportStatus[]> {

        if ((deploymentId || '')?.length <= 0) {
            console.log(`deployment ID is null.`);
            return [];
        }
        return new Promise(async (resolve, reject) => {
            let filter: string = '';
            if (this.getDynamicsVersion().startsWith("9.1"))
                filter = `?$select=devops_name&$filter=_devops_deployment_value eq ${deploymentId}`;
            else
                filter = `?$select=devops_name&$filter=_devops_deployment_value eq ${deploymentId?.replace(/[{}]/g, "")}`;

            var output = await window.parent.Xrm.WebApi.online.retrieveMultipleRecords("devops_exportstatus", filter);
            var result: IDevOpsExportStatus[] = [];
            output.entities.map(item => {
                console.log("id = " + item.devops_exportstatusid)
                console.log("name = " + item.devops_names)
                result.push({
                    devops_exportstatusid: item.devops_exportstatusid,
                    name: item.devops_name
                });
            });

            resolve(result);
            //then(data => resolve(data)).catch(reason => reject(reason));

        });
    }

    async getImportStatusOfDeployment(deploymentId?: string | null): Promise<ISolutionImportStatus[]> {
        var records: ISolutionImportStatus[] = [];
        try {

            var data = await window.parent.Xrm.WebApi.online.retrieveMultipleRecords("devops_importstatus", `?$select=devops_importid,devops_name&$filter=_devops_deployment_value eq ${deploymentId?.replace(/[{}]/g, "")}&$orderby=createdon desc`);

            for (var i = 0; i < data.entities.length; i++) {
                records.push({
                    solutionName: data.entities[i]["devops_name"],
                    solutionImportId: data.entities[i]["devops_importid"]
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
            if (result === null || result === undefined) {
                throw new Error('Null received from server for devops_executeImportStatusRequest');
            }
            console.dir(result);
            return new Promise<IImportProgress>(async (resolve) => {
                resolve(
                    {
                        statusReason: result.status,
                        friendlymessage: result.message,
                        hasError: false,
                        message: result.messageVerbose,
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


    async importSolution(deploymentId: string, exportStatusRecId: string, solutionName: string, username: string, password: string, overwrite: boolean): Promise<IXrmresponse> {
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
            //alert(output.status);
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