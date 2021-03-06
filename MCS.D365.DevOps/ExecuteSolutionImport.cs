﻿
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
    using System.Runtime.CompilerServices;

    public class ExecuteSolutionImport : IPlugin
    {
        public bool OverWrite { get; set; }
        public void Execute(IServiceProvider serviceProvider)
        {
            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(context.UserId);
            var tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            tracingService.Trace($"ExecuteSolutionImport started...");

            //byte[] fileContent = Convert.FromBase64String((string)retrievedAnnotation["documentbody"]);
            byte[] fileContent = null;
            if (!context.InputParameters.Contains("deploymentId") || !context.InputParameters.Contains("exportStatusId"))
            {
                throw new InvalidPluginExecutionException("incomplete parameters received.");
            }

            if (!context.InputParameters.Contains("UN") || !context.InputParameters.Contains("PW"))
            {
                throw new InvalidPluginExecutionException("Credentials not received.");
            }

            var deploymentId = Guid.Parse(context.InputParameters["deploymentId"].ToString());
            var exportStatusRecord = Guid.Parse(context.InputParameters["exportStatusId"].ToString());
            var solutionName = context.InputParameters["SolutionName"].ToString();
            var userName = context.InputParameters["UN"].ToString();
            var password = context.InputParameters["PW"].ToString();
            this.OverWrite = bool.Parse(context.InputParameters["Overwrite"].ToString());
            tracingService.Trace($"Now Calling GetTargetOrgCredentials");
            var targetOrgCredentials = GetTargetOrgCredentials(deploymentId, service);
            tracingService.Trace($"done calling GetTargetOrgCredentials");
            tracingService.Trace($"Now Calling GetAnnotation");
            var note = GetAnnotation(service, exportStatusRecord);
            tracingService.Trace($"Done Calling GetAnnotation");
            fileContent = Convert.FromBase64String(note.Entities[0].GetAttributeValue<string>("documentbody"));
            tracingService.Trace($"Now calling ImportSolutionInTargetOrg");
            var asyncOperationId = ImportSolutionInTargetOrg(tracingService, fileContent, targetOrgCredentials, userName, password);
            CreateImportRecord(service, deploymentId, asyncOperationId, solutionName);


            //if (context.InputParameters.Contains("RecordId") && context.InputParameters.Contains("SolutionName"))
            //{
            //    tracingService.Trace($"Solution Name: {(string)context.InputParameters["SolutionName"]}");
            //    tracingService.Trace($"RecordId: {(string)context.InputParameters["RecordId"]}");
            //    var recordId = Guid.Parse(context.InputParameters["RecordId"].ToString());
            //    var solutionName = (string)context.InputParameters["SolutionName"];
            //    solutionName = $"{solutionName}.zip";

            //    tracingService.Trace($"Solution Import started for solution {solutionName} for id {recordId}");
            //    if (notes != null && notes.Entities.Count > 0)
            //    {
            //        tracingService.Trace($"File Name Retrieved is {notes.Entities[0].GetAttributeValue<string>("filename")}");
            //    }



            //    tracingService.Trace($"Updating the importid.");
            //    var deployment = new Entity("devops_deployment");
            //    deployment.Id = recordId;
            //    deployment["devops_importid"] = asyncOperationId.ToString();
            //    service.Update(deployment);
            //    tracingService.Trace($"Import Id updated: {asyncOperationId}");
            //}
        }

        private static void CreateImportRecord(IOrganizationService service, Guid deploymentID, Guid asyncId, string solutionName)
        {
            var importStatus = new Entity("devops_importstatus");
            importStatus.Attributes.Add("devops_deployment", new EntityReference("devops_deployment", deploymentID));
            importStatus.Attributes.Add("devops_importid", asyncId.ToString());
            importStatus.Attributes.Add("devops_name", solutionName);
            //SolutionName
            service.Create(importStatus);
        }

        private static EntityCollection GetAnnotation(IOrganizationService service, Guid recordId)
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
                    //new ConditionExpression { AttributeName = "filename", Operator = ConditionOperator.Equal, Values = {fileName}},
                }
                }
            };

            EntityCollection results = service.RetrieveMultiple(notes);
            return results;
        }

        private Guid ImportSolutionInTargetOrg(ITracingService tracingService, byte[] fileContent, EntityCollection credentials, string username, string password)
        {
            Guid asyncOperationId = Guid.Empty;
            IOrganizationService targetOrganizationService = null;

            //AliasedValue usernameAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_userid");
            //AliasedValue passwordAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_userpassword");
            AliasedValue orgSvcAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_orgserviceurl");

            //string userName = string.Empty;
            //string password = string.Empty;
            string orgSvcUrl = string.Empty;

            if (orgSvcAliasVal != null)
            {
                //userName = usernameAliasVal.Value.ToString();
                //password = passwordAliasVal.Value.ToString();
                orgSvcUrl = orgSvcAliasVal.Value.ToString();
            }

            ClientCredentials clientCredentials = new ClientCredentials();
            clientCredentials.UserName.UserName = username;
            clientCredentials.UserName.Password = password;

            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            tracingService.Trace($"Trying to create new OrganizationServiceProxy");
            targetOrganizationService = new OrganizationServiceProxy(new Uri(orgSvcUrl),
             null, clientCredentials, null);

            if (targetOrganizationService != null)
            {
                tracingService.Trace($"Starting import in target organization");
                var request = new ImportSolutionRequest()
                {
                    CustomizationFile = fileContent,
                    OverwriteUnmanagedCustomizations = OverWrite

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
	                                    <attribute name='devops_orgserviceurl' />
                                    </link-entity>
                                    </entity>
                                </fetch>";


            //        string fetchXml = @"<fetch version='1.0' output-format='xml - platform' mapping='logical' distinct='true'>
            //< entity name = 'devops_environment' >
            //     < attribute name = 'devops_userpassword' />
            //      < attribute name = 'devops_userid' />
            //      < attribute name = 'devops_orgserviceurl' />
            //       < order attribute = 'devops_name' descending = 'false' />
            //          < link - entity name = 'devops_deployment' from = 'devops_environment' to = 'devops_environmentid' link - type = 'inner' alias = 'ab' >
            //                         < filter type = 'and' >
            //                            < condition attribute = 'devops_deploymentid' operator= 'eq' uiname = 'QA deployment' uitype = 'devops_deployment' value = '{0}' />
            //                                  </ filter >
            //                                </ link - entity >
            //                              </ entity >
            //                            </ fetch >";
            fetchXml = string.Format(fetchXml, deploymentId);
            EntityCollection entityCollection = service.RetrieveMultiple(new FetchExpression(fetchXml));
            return entityCollection;
        }
    }
}