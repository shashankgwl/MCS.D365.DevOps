/// <reference path="../../../node_modules/@types/xrm/index.d.ts" />

export class SolutionImportHelper {

    constructor() {
    }

    async getExportStatusOfDeployment(deploymentId?: string | null): Promise<Xrm.RetrieveMultipleResult> {

        return new Promise((resolve, reject) => {
            window.parent.Xrm.WebApi.online.retrieveMultipleRecords("devops_exportstatus", `?$select=devops_name&$filter=_devops_deployment_value eq ${deploymentId}`).
                then(data => resolve(data)).catch(reason => reject(reason));
        });
    }
}
/*

 */