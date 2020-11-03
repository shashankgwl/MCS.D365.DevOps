namespace MCS.PSA.Devops.Plugins
{
    using System;
    using Microsoft.Xrm.Sdk;
    using Microsoft.Crm.Sdk.Messages;

    public class ExecuteSolutionExport : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(context.UserId);
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            tracingService.Trace($"ExecuteSolutionExport started...");
            tracingService.Trace($"Plugin Executed - {context.MessageName}");

            if (context.InputParameters.Contains("RecordId") && context.InputParameters.Contains("SolutionName") && context.InputParameters.Contains("ExportAsManaged"))
            {
                string solutionName = (string)context.InputParameters["SolutionName"];
                tracingService.Trace($"Solution Name - {solutionName}");
                Guid recordId = Guid.Parse(context.InputParameters["RecordId"].ToString());
                tracingService.Trace($"Record ID - {recordId}");
                bool exportSolutionType = (bool)context.InputParameters["ExportAsManaged"];
                tracingService.Trace($"ExportAsManaged - {exportSolutionType}");

                string SuceessMessage = "Succeeded";
                string FailedMessage = "Failed";
                try
                {
                    tracingService.Trace($"Exporting Solution - {solutionName} for recordId: {recordId}");
                    byte[] exportXml = ExportSolution(solutionName, service, exportSolutionType);
                    tracingService.Trace($"Exported the solution - {solutionName}");


                    tracingService.Trace($"Creating note for {recordId}");
                    Guid attachmentId = CreateAnnotationRecord(solutionName, exportXml, recordId, service);
                    tracingService.Trace($"Notes created successfully - {attachmentId} for {solutionName}");

                    CreateExportStatusRecord(solutionName, recordId, service, tracingService, SuceessMessage);
                }
                catch(Exception ex)
                {
                   // Exception Message = ex;
                    CreateExportStatusRecord(solutionName, recordId, service, tracingService, FailedMessage);
                }
            }
        }

        private static byte[] ExportSolution(string solutionName, IOrganizationService service, bool exportSolutionType)
        {
            var exportSolutionRequest = new ExportSolutionRequest();
            exportSolutionRequest.Managed = exportSolutionType;
            exportSolutionRequest.SolutionName = solutionName;

            var exportSolutionResponse = (ExportSolutionResponse)service.Execute(exportSolutionRequest);
            byte[] exportXml = exportSolutionResponse.ExportSolutionFile;
            return exportXml;
        }

        private static Guid CreateAnnotationRecord(string solutionName, byte[] exportXml, Guid recordId, IOrganizationService service)
        {
            Entity note = new Entity("annotation");
            note["subject"] = solutionName;
            note["filename"] = $"{solutionName}.zip";
            note["mimetype"] = "application/zip";
            note["documentbody"] = Convert.ToBase64String(exportXml);
            note["objectid"] = new EntityReference("devops_deployment", recordId);

            return service.Create(note);
        }
        private static void CreateExportStatusRecord(string solutionName, Guid deploymentId, IOrganizationService service, ITracingService tracingService , string Message)
        {
            tracingService.Trace($"Creating Export Status record");
            Entity Exportstatus = new Entity("devops_exportstatus");
            Exportstatus["devops_name"] = solutionName;
            Exportstatus["devops_deployment"] = new EntityReference("devops_deployment", deploymentId);
            Exportstatus["devops_status"] = Message;
            Exportstatus["devops_error"] = $"{Message} in plugin to export"; //restrict the error to first 100k characters         
            service.Create(Exportstatus);
            tracingService.Trace($"Export Status record created.");
        }
    }
}