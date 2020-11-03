
namespace MCS.PSA.DevOps.Plugins
{
    using System;
    using Microsoft.Xrm.Sdk;
    using Microsoft.Xrm.Sdk.Client;
    using Microsoft.Crm.Sdk.Messages;
    using Microsoft.Xrm.Sdk.Query;
    using Microsoft.Xrm.Sdk.Messages;
    using System.Net;
    using System.ServiceModel.Description;

    public class ExecuteSolutionImport : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(context.UserId);
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            tracingService.Trace($"ExecuteSolutionImport started...");

            //byte[] fileContent = Convert.FromBase64String((string)retrievedAnnotation["documentbody"]);
            byte[] fileContent = null;
            if (context.InputParameters.Contains("RecordId") && context.InputParameters.Contains("SolutionName"))
            {
                tracingService.Trace($"Solution Name: {(string)context.InputParameters["SolutionName"]}");
                tracingService.Trace($"RecordId: {(string)context.InputParameters["RecordId"]}");
                var recordId = Guid.Parse(context.InputParameters["RecordId"].ToString());
                var solutionName = (string)context.InputParameters["SolutionName"];
                solutionName = $"{solutionName}.zip";

                tracingService.Trace($"Solution Import started for solution {solutionName} for id {recordId}");
                var notes = GetAnnotation(service, recordId, solutionName);
                if (notes != null && notes.Entities.Count > 0)
                {
                    tracingService.Trace($"File Name Retrieved is {notes.Entities[0].GetAttributeValue<string>("filename")}");
                    fileContent = Convert.FromBase64String(notes.Entities[0].GetAttributeValue<string>("documentbody"));
                }

                var targetOrgCredentials = GetTargetOrgCredentials(recordId, service);

                var asyncOperationId = ImportSolutionInTargetOrg(tracingService, fileContent, targetOrgCredentials);

                tracingService.Trace($"Updating the importid.");
                var deployment = new Entity("devops_deployment");
                deployment.Id = recordId;
                deployment["devops_importid"] = asyncOperationId.ToString();
                service.Update(deployment);
                tracingService.Trace($"Import Id updated: {asyncOperationId}");
            }
        }


        private static EntityCollection GetAnnotation(IOrganizationService service, Guid recordId, string fileName)
        {
            QueryExpression notes = new QueryExpression
            {
                EntityName = "annotation",
                ColumnSet = new ColumnSet("filename", "documentbody"),
                Criteria = new FilterExpression
                {
                    Conditions =
                {
                    new ConditionExpression { AttributeName = "objectid", Operator = ConditionOperator.Equal, Values = {recordId}},
                    new ConditionExpression { AttributeName = "isdocument", Operator = ConditionOperator.Equal, Values = {true}},
                    new ConditionExpression { AttributeName = "filename", Operator = ConditionOperator.Equal, Values = {fileName}},
                }
                }

            };

            EntityCollection results = service.RetrieveMultiple(notes);
            return results;

        }

        private static Guid ImportSolutionInTargetOrg(ITracingService tracingService, byte[] fileContent, EntityCollection credentials)
        {
            Guid asyncOperationId = Guid.Empty;
            IOrganizationService targetOrganizationService = null;

            AliasedValue usernameAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_username");
            AliasedValue passwordAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_password");
            AliasedValue orgSvcAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_organizationserviceurl");

            string userName = string.Empty;
            string password = string.Empty;
            string orgSvcUrl = string.Empty;

            if(usernameAliasVal != null && passwordAliasVal != null && orgSvcAliasVal != null) 
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

            if (targetOrganizationService != null)
            {
                tracingService.Trace($"Starting import in target organization");
                var request = new ImportSolutionRequest()
                {
                    CustomizationFile = fileContent
                };
                var requestAsync = new ExecuteAsyncRequest
                {
                    Request = request
                };

                var asyncResp = (ExecuteAsyncResponse)targetOrganizationService.Execute(requestAsync);
                tracingService.Trace($"Executed the Import Request");

                asyncOperationId = asyncResp.AsyncJobId;
            }
            return asyncOperationId;

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
