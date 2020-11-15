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

export interface ISolutionImportStatus {
    solutionName: string
    status: string
    message: string
    solutionImportId: string
}

export interface IImportProgress {
    solutionName: string,
    statusReason: string,
    friendlymessage: string,
    hasError: boolean
}
