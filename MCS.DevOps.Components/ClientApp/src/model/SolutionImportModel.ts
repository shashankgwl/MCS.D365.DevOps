export interface IDevOpsExportStatus {
    name: string,
    devops_exportstatusid: string,
    clicktoImport?: string,
    viewProgress?: string
}

export interface IXrmresponse {
    hasError: boolean
    message: string
}

export interface ISolutionImportProgress {
    status: string
    message: string
    solutionImportId: string
}
