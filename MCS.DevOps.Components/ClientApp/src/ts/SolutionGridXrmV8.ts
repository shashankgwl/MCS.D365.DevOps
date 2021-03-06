﻿/// <reference path="../../../node_modules/@types/xrm/index.d.ts" />
import { ISolution, IDevopsSolution } from '../model/models'
let solORders: Array<any> = new Array<[number, string]>();

//export namespace MCS.DevOps.Web {
export async function retrieveSolutionDeploymentOrder(recordId: string) {
    return new Promise<Xrm.RetrieveMultipleResult>((resolve => {
        solORders = new Array<[number, string]>();
        var expand = `?$select=devops_deploymentorder,_devops_solution_value&$expand=devops_solution($select=devops_name,devops_solutionguid,devops_solutionid,devops_solutionuniquename,devops_version)&$orderby=devops_deploymentorder asc&$filter=_devops_solutiondeploymentorder_value eq ${recordId.replace(/[{}]/g, "")}`;
        window.Xrm.WebApi.online.retrieveMultipleRecords("devops_solutiondeploymentorder", expand).then(
            function success(results) {
                resolve(results);
            },
            function (error) {
                window.Xrm.Utility.alertDialog(error.message, () => { });
            }
        );
    })).then(solutionOrders => {
        solutionOrders.entities.forEach((item, index) => {
            solORders.push([item.devops_deploymentorder, item.devops_solution.devops_solutionuniquename, 'Not Started']);
        });

        return solORders.sort((item1, item2) => { return item1.devops_deploymentorder - item2.devops_deploymentorder });
    });
}

export async function createSolutionRecord(solutionData: ISolution[]) {
    solutionData.map(solution => {
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
    });
}

export async function getUnmanagedSolutions() {
    debugger;
    return new Promise<any[]>(async resolve => {
        var result = await window.parent.Xrm.WebApi.online.retrieveMultipleRecords("solution", "?$select=solutionid,friendlyname,ismanaged,uniquename,version&$filter=ismanaged eq false&$orderby=createdon desc");
        resolve(result.entities);
    });
}

export async function createExportStatusRecord(filename: string, exportStatus: string, solutionOrder: number) {
    var entity: any = {};
    entity.devops_name = filename;
    entity.devops_status = exportStatus;
    entity.devops_exportorder = solutionOrder;
    entity["devops_Deployment@odata.bind"] = `/devops_deployments(${localStorage.getItem("recid")})`;
    var exportStatusRecord = await window.Xrm.WebApi.createRecord('devops_exportstatus', entity);
    return exportStatusRecord.id;
}

export async function createAnnotationRecord(fileBase64: any, filename: string, solutionOrder: number) {
    window.Xrm.Utility.showProgressIndicator(`Creating export status record for ${filename}`);
    var exportStatusRecordId = await createExportStatusRecord(filename, "Completed", solutionOrder);
    let entity: any = {};
    entity.filename = filename;
    entity["objectid_devops_exportstatus@odata.bind"] = `/devops_exportstatuses(${exportStatusRecordId})`;
    entity.subject = filename;
    entity.mimetype = "application/zip";
    entity.documentbody = fileBase64;
    window.sessionStorage.setItem(exportStatusRecordId, fileBase64)
    return window.Xrm.WebApi.online.createRecord("annotation", entity);
}

export async function beginExportSolution() {
    try {
        let decoder: any = new TextDecoder();
        debugger;
        for (var i = 0; i < solORders.length; i++) {
            console.log(`Now processing ${solORders[i][1]}`);
            window.Xrm.Utility.showProgressIndicator(`Now processing ${solORders[i][1]}`);
            let response : any = await exportSolutionSingle(solORders[i][1])
            var kk = JSON.parse(response.responseText).ExportSolutionFile
            //var body: any = response.body;
            //var stream: ReadableStream = body;
            //var reader = await stream.getReader();
            //var data = '';
            //while (true) {
            //    var newread = await reader.read();
            //    data += decoder.decode(newread.value);
            //    if (newread.done) {
            //        break;
            //    }
            //}


            //var result = await fetchStream(stream);
            var fileBase64 = kk;//JSON.parse(data).ExportSolutionFile;
            localStorage.getItem("exportmanaged");

            await createAnnotationRecord(fileBase64, solORders[i][1] + '.zip', i);
            window.Xrm.Utility.showProgressIndicator(`Attachment created for ${solORders[i][1]}`);
        }

        window.Xrm.Utility.showProgressIndicator(`Export completed. This window will close now.`);
        solORders.splice(0, solORders.length);
        setTimeout(() => {
            window.Xrm.Utility.closeProgressIndicator();
        }, 2000);
    }
    catch (e) {
        window.Xrm.Utility.alertDialog(e.message, () => { });
        window.Xrm.Utility.closeProgressIndicator();
    }

    finally {
    }
}


export function exportSolutionSingle(solutionName: string): Xrm.Async.PromiseLike<Xrm.ExecuteResponse> {
    var parameters: any = {};
    var exportmanaged = localStorage.getItem("exportmanaged");
    console.log(`Called`);

    parameters.SolutionName = solutionName;
    parameters.Managed = exportmanaged;
    var exportSolutionRequest = {
        SolutionName: parameters.SolutionName,
        Managed: parameters.Managed,

        getMetadata: () => {
            return {
                boundParameter: null,
                parameterTypes: {
                    "SolutionName": {
                        "typeName": "Edm.String",
                        "structuralProperty": 1
                    },
                    "Managed": {
                        "typeName": "Edm.Boolean",
                        "structuralProperty": 1
                    }
                },
                operationType: 0,
                operationName: "ExportSolution"
            };
        }
    };

    return window.Xrm.WebApi.online.execute(exportSolutionRequest);

    ////Xrm.Utility.confirmDialog("This action will start exporting solutions based on the order defined in solution deployment order, do you want to continue?", () => { }, () => { });
}
//}

//export default MCS.DevOps.Web 
