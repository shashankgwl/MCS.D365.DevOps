
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

        public Guid ImportAsyncID { get; set; }

        public string UserName { get; set; }

        public string Password { get; set; }

        public Guid DeploymentID { get; set; }
        public void Execute(IServiceProvider serviceProvider)
        {
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            tracingService.Trace($"ExecuteImportStatus started...");

            

            ////Guid importId = Guid.Parse(deployment["devops_importid"].ToString());
            ////tracingService.Trace($"Import ID retrieved is {importId}.");
            this.DeploymentID = Guid.Parse(context.InputParameters["DeploymentID"].ToString());
            EntityCollection targetOrgCredentials = GetTargetOrgCredentials(this.DeploymentID, service);
            if (!context.InputParameters.Contains("DeploymentID") || !context.InputParameters.Contains("ImportAsyncID") || !context.InputParameters.Contains("UN") || !context.InputParameters.Contains("PW"))
            {
                throw new InvalidPluginExecutionException(OperationStatus.Failed, "Incomplete request received, required asyncId, deploymentID, USERNAME, PASSWORD");
            }

            this.ImportAsyncID = Guid.Parse(context.InputParameters["ImportAsyncID"].ToString());
            this.UserName = context.InputParameters["UN"].ToString();
            this.Password = context.InputParameters["PW"].ToString();
            Entity asyncOperation = GetAsyncOperationStatus(this.ImportAsyncID, tracingService, context, targetOrgCredentials);
            if(asyncOperation.Contains("friendlymessage"))
            {
                context.OutputParameters["ResultJSON"] = $" {{\"message\" : \"{asyncOperation["friendlymessage"]}\" ,\"status\" : \"{asyncOperation.FormattedValues["statuscode"]}\"}}";
            }

            else
            {
                context.OutputParameters["ResultJSON"] = $" {{\"message\" : \"{asyncOperation.FormattedValues["statuscode"]}\" ,\"status\" : \"{asyncOperation.FormattedValues["statuscode"]}\"}}";
            }
        }

        private Entity GetAsyncOperationStatus(Guid asyncId, ITracingService tracingService, IPluginExecutionContext context, EntityCollection credentials)
        {

            //AliasedValue usernameAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_username");
            //AliasedValue passwordAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_password");
            AliasedValue orgSvcAliasVal = credentials.Entities[0].GetAttributeValue<AliasedValue>("aa.devops_orgserviceurl");

            ////string userName = string.Empty;
            ////string password = string.Empty;
            string orgSvcUrl = string.Empty;

            if (orgSvcAliasVal != null)
            {
                ////userName = usernameAliasVal.Value.ToString();
                ////password = passwordAliasVal.Value.ToString();
                orgSvcUrl = orgSvcAliasVal.Value.ToString();
            }

            ClientCredentials clientCredentials = new ClientCredentials();
            clientCredentials.UserName.UserName = this.UserName;
            clientCredentials.UserName.Password = this.Password;

            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            IOrganizationService targetOrganizationService = new OrganizationServiceProxy(new Uri(orgSvcUrl), null, clientCredentials, null);

            Entity asyncOperation = null;
            if (targetOrganizationService != null)
            {
                tracingService.Trace($"Connection Established Successfully.");
                ColumnSet cols = new ColumnSet("statuscode", "friendlymessage", "data");
                asyncOperation = (Entity)targetOrganizationService.Retrieve("asyncoperation", asyncId, cols);
            }

            else
            {
                tracingService.Trace("Failed to Established Connection!!!");
            }
            return asyncOperation;
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

            fetchXml = string.Format(fetchXml, deploymentId);
            EntityCollection entityCollection = service.RetrieveMultiple(new FetchExpression(fetchXml));
            return entityCollection;

        }
    }
}
