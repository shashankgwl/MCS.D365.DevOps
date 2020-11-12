
namespace MCS.PSA.DevOps.Plugins
{
    using System;
    //using MCS.PSA.Plugins.BusinessLogic;
    using Microsoft.Xrm.Sdk;
    using Microsoft.Xrm.Sdk.Client;
    using Microsoft.Xrm.Sdk.Query;
    using System.Net;
    using System.ServiceModel.Description;

    public class ExecuteImportStatus : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            tracingService.Trace($"ExecuteImportStatus started...");

            Entity deployment = null;
            Guid recordID = Guid.Empty;
            if (context.InputParameters.Contains("RecordId"))
            {
                recordID = Guid.Parse(context.InputParameters["RecordId"].ToString());
                ColumnSet cols = new ColumnSet("devops_importid");
                deployment = (Entity)service.Retrieve("devops_deployment", recordID, cols);
            }

            Guid importId = Guid.Parse(deployment["devops_importid"].ToString());
            tracingService.Trace($"Import ID retrieved is {importId}.");

            EntityCollection targetOrgCredentials = GetTargetOrgCredentials(recordID, service);
            Entity asyncOperation = GetAsyncOperationStatus(importId, tracingService, context, targetOrgCredentials);

            OptionSetValue status = (OptionSetValue)asyncOperation["statuscode"];
            if (status.Value == 30)
            {
                tracingService.Trace($"Status is {status.Value}.");
                //tracingService.Trace($"Error Message is {(string)asyncOperation["friendlymessage"]}.");
                CreateSuccessImportStatusRecord(status.Value, (string)context.InputParameters["SolutionName"],
                                    Guid.Parse(context.InputParameters["RecordId"].ToString()), service, tracingService);
            }
            ////if (status.Value == 30 || status.Value == 31 || status.Value == 32)
            if (status.Value == 31 || status.Value == 32)
            {
                tracingService.Trace($"Status is {status.Value}.");
                //tracingService.Trace($"Error Message is {(string)asyncOperation["friendlymessage"]}.");
                CreateImportStatusRecord(status.Value, (string)context.InputParameters["SolutionName"], (string)asyncOperation["friendlymessage"],
                                    Guid.Parse(context.InputParameters["RecordId"].ToString()), service, tracingService);
            }

        }

        private static Entity GetAsyncOperationStatus(Guid asyncId, ITracingService tracingService, IPluginExecutionContext context, EntityCollection credentials)
        {
            IOrganizationService targetOrganizationService = null;

            AliasedValue usernameAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_username");
            AliasedValue passwordAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_password");
            AliasedValue orgSvcAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_organizationserviceurl");

            string userName = string.Empty;
            string password = string.Empty;
            string orgSvcUrl = string.Empty;

            if (usernameAliasVal != null && passwordAliasVal != null && orgSvcAliasVal != null)
            {
                userName = usernameAliasVal.Value.ToString();
                password = passwordAliasVal.Value.ToString();
                orgSvcUrl = orgSvcAliasVal.Value.ToString();
            }

            ClientCredentials clientCredentials = new ClientCredentials();
            clientCredentials.UserName.UserName = userName;
            clientCredentials.UserName.Password = password;

            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            targetOrganizationService = (IOrganizationService)new OrganizationServiceProxy(new Uri(orgSvcUrl),
             null, clientCredentials, null);

            Entity asyncOperation = null;
            if (targetOrganizationService != null)
            {
                tracingService.Trace($"Connection Established Successfully.");
                ColumnSet cols = new ColumnSet("statuscode", "friendlymessage");
                asyncOperation = (Entity)targetOrganizationService.Retrieve("asyncoperation", asyncId, cols);
            }

            else
            {
                tracingService.Trace("Failed to Established Connection!!!");
            }
            return asyncOperation;
        }

        private static void CreateImportStatusRecord(int status, string solutionName, string error, Guid deploymentId, IOrganizationService service, ITracingService tracingService)
        {
            int maxLength = 99999;
            tracingService.Trace($"Creating Import Status record");
            Entity importstatus = new Entity("devops_importstatus");
            importstatus["devops_name"] = solutionName;
            importstatus["devops_deployment"] = new EntityReference("devops_deployment", deploymentId);
            if (status == 30)
            {
                importstatus["devops_status"] = "Succeeded";
            }
            else
            {
                importstatus["devops_status"] = "Failed";
                importstatus["devops_errordetails"] = error.Substring(0, Math.Min(error.Length, maxLength)); ;////error.Substring(0, Math.Min(error.Length, maxLength)); //restrict the error to first 100k characters
            }
            service.Create(importstatus);
            tracingService.Trace($"Import Status record created.");
        }
        private static void CreateSuccessImportStatusRecord(int status, string solutionName, Guid deploymentId, IOrganizationService service, ITracingService tracingService)
        {
            tracingService.Trace($"Creating Import Status record");
            Entity importstatus = new Entity("devops_importstatus");
            importstatus["devops_name"] = solutionName;
            importstatus["devops_deployment"] = new EntityReference("devops_deployment", deploymentId);
            if (status == 30)
            {
                importstatus["devops_status"] = "Succeeded";
            }
            service.Create(importstatus);
            tracingService.Trace($"Import Status record created.");
        }

        private static EntityCollection GetTargetOrgCredentials(Guid deploymentId, IOrganizationService service)
        {
            string fetchXml = @"<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>
                                    <entity name='devops_deployment'>
                                    <filter type='and'>
                                        <condition attribute='devops_deploymentid' operator='eq' value='{0}' />
                                        </filter>
                                    <link-entity name='devops_environment' from='devops_environmentid' to='devops_environment' link-type='inner' alias='aa'>
      	                                <attribute name='devops_username' />
	                                    <attribute name='devops_password' />
	                                    <attribute name='devops_organizationserviceurl' />
                                    </link-entity>
                                    </entity>
                                </fetch>";

            fetchXml = string.Format(fetchXml, deploymentId);
            EntityCollection entityCollection = service.RetrieveMultiple(new FetchExpression(fetchXml));
            return entityCollection;

        }

    }
}
