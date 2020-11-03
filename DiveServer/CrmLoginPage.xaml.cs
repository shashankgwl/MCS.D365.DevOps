using Microsoft.Xrm.Tooling.Connector;
using Microsoft.Xrm.Tooling.CrmConnectControl;
using System;
using System.Windows;
using System.Windows.Threading;

namespace CandyServer
{
    /// <summary>
    /// Interaction logic for CrmLoginPage.xaml
    /// </summary>
    public partial class CrmLoginPage : Window
    {

        /// <summary>
        ///  This is used to allow the UI to reset w/out closing 
        /// </summary>
        private bool resetUiFlag = false;

        /// <summary>
        /// Microsoft.Xrm.Tooling.Connector services
        /// </summary>
        private CrmServiceClient CrmSvc = null;

        /// <summary>
        /// CRM Connection Manager component. 
        /// </summary>
        private CrmConnectionManager mgr = null;
        /// <summary>
        /// Bool flag to determine if there is a connection 
        /// </summary>
        private bool bIsConnectedComplete = false;

        /// <summary>
        /// Raised when a connection to CRM has completed. 
        /// </summary>
        public event EventHandler ConnectionToCrmCompleted;


        public CrmLoginPage()
        {
            InitializeComponent();
        }

        /// <summary>
        /// CRM Connection Manager 
        /// </summary>
        public CrmConnectionManager CrmConnectionMgr { get { return mgr; } }

        private void D365Login_Loaded(object sender, RoutedEventArgs e)
        {
            mgr = new CrmConnectionManager();
            mgr.ParentControl = crmlogin;
            mgr.UseUserLocalDirectoryForConfigStore = true;
            mgr.ClientId = "fac5cf2c-b58b-4248-bdef-d9a8a5cb4287";
            mgr.RedirectUri = new Uri("app://EB4864FC-5C9A-4EE5-AB75-43EB3A710F23");
            crmlogin.SetGlobalStoreAccess(mgr);

            // There are several modes to the login control UI
            crmlogin.SetControlMode(ServerLoginConfigCtrlMode.FullLoginPanel);
            // this wires an event that is raised when the login button is pressed. 
            crmlogin.ConnectionCheckBegining += new EventHandler(crmlogin_ConnectionCheckBegining);
            // this wires an event that is raised when an error in the connect process occurs. 
            crmlogin.ConnectErrorEvent += new EventHandler<ConnectErrorEventArgs>(CrmLoginCtrl_ConnectErrorEvent);
            // this wires an event that is raised when a status event is returned. 
            crmlogin.ConnectionStatusEvent += new EventHandler<ConnectStatusEventArgs>(CrmLoginCtrl_ConnectionStatusEvent);
            // this wires an event that is raised when the user clicks the cancel button. 
            crmlogin.UserCancelClicked += new EventHandler(CrmLoginCtrl_UserCancelClicked);

            if (!mgr.RequireUserLogin())
            {
                if (MessageBox.Show("Credentials already saved in configuration\nChoose Yes to Auto Login or No to Reset Credentials", "Auto Login", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
                {
                    // If RequireUserLogin is false, it means that there has been a successful login here before and the credentials are cached. 
                    crmlogin.IsEnabled = false;
                    // When running an auto login,  you need to wire and listen to the events from the connection manager.
                    // Run Auto User Login process, Wire events. 
                    mgr.ServerConnectionStatusUpdate += new EventHandler<ServerConnectStatusEventArgs>(mgr_ServerConnectionStatusUpdate);
                    mgr.ConnectionCheckComplete += new EventHandler<ServerConnectStatusEventArgs>(mgr_ConnectionCheckComplete);
                    // Start the connection process. 
                    mgr.ConnectToServerCheck();

                    // Show the message grid. 
                    crmlogin.ShowMessageGrid();
                }
            }
        }

        /// <summary>
        /// Login control connect check status event. 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void CrmLoginCtrl_ConnectionStatusEvent(object sender, ConnectStatusEventArgs e)
        {
            //Here we are using the bIsConnectedComplete bool to check to make sure we only process this call once. 
            if (e.ConnectSucceeded && !bIsConnectedComplete)
                ProcessSuccess();

        }

        /// <summary>
        /// Updates from the Auto Login process. 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void mgr_ServerConnectionStatusUpdate(object sender, ServerConnectStatusEventArgs e)
        {
            // The Status event will contain information about the current login process,  if Connected is false, then there is not yet a connection. 
            // Set the updated status of the loading process. 
            Dispatcher.Invoke(DispatcherPriority.Normal,
                               new System.Action(() =>
                               {
                                   this.Title = string.IsNullOrWhiteSpace(e.StatusMessage) ? e.ErrorMessage : e.StatusMessage;
                               }
                                   ));

        }

        /// <summary>
        /// Complete Event from the Auto Login process
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void mgr_ConnectionCheckComplete(object sender, ServerConnectStatusEventArgs e)
        {
            // The Status event will contain information about the current login process,  if Connected is false, then there is not yet a connection. 
            // Unwire events that we are not using anymore, this prevents issues if the user uses the control after a failed login. 
            ((CrmConnectionManager)sender).ConnectionCheckComplete -= mgr_ConnectionCheckComplete;
            ((CrmConnectionManager)sender).ServerConnectionStatusUpdate -= mgr_ServerConnectionStatusUpdate;

            if (!e.Connected)
            {
                // if its not connected pop the login screen here. 
                if (e.MultiOrgsFound)
                    MessageBox.Show("Unable to Login to CRM using cached credentials. Org Not found", "Login Failure");
                else
                    MessageBox.Show("Unable to Login to CRM using cached credentials", "Login Failure");

                resetUiFlag = true;
                crmlogin.GoBackToLogin();
                // Bad Login Get back on the UI. 
                Dispatcher.Invoke(DispatcherPriority.Normal,
                       new System.Action(() =>
                       {
                           this.Title = "Failed to Login with cached credentials.";
                           MessageBox.Show(this.Title, "Notification from ConnectionManager", MessageBoxButton.OK, MessageBoxImage.Error);
                           crmlogin.IsEnabled = true;
                       }
                        ));
                resetUiFlag = false;
            }
            else
            {
                // Good Login Get back on the UI 
                if (e.Connected && !bIsConnectedComplete)
                    ProcessSuccess();
            }

        }


        /// <summary>
        /// Login control Error event. 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void CrmLoginCtrl_ConnectErrorEvent(object sender, ConnectErrorEventArgs e)
        {
            //MessageBox.Show(e.ErrorMessage, "Error here");
        }

        /// <summary>
        /// Login Control Cancel event raised. 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void CrmLoginCtrl_UserCancelClicked(object sender, EventArgs e)
        {
            if (!resetUiFlag)
                this.Close();
        }


        /// <summary>
        /// This raises and processes Success
        /// </summary>
        private void ProcessSuccess()
        {
            resetUiFlag = true;
            bIsConnectedComplete = true;
            CrmSvc = mgr.CrmSvc;
            crmlogin.GoBackToLogin();
            Dispatcher.Invoke(DispatcherPriority.Normal,
               new System.Action(() =>
               {
                   this.Title = "Notification from Parent";
                   crmlogin.IsEnabled = true;
               }
                ));

            // Notify Caller that we are done with success. 
            if (ConnectionToCrmCompleted != null)
                ConnectionToCrmCompleted(this, null);

            resetUiFlag = false;
        }


        /// <summary>
        ///  Login control connect check starting. 
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void crmlogin_ConnectionCheckBegining(object sender, EventArgs e)
        {
            bIsConnectedComplete = false;
            Dispatcher.Invoke(DispatcherPriority.Normal,
                               new Action(() =>
                               {
                                   this.Title = "Starting Login Process. ";
                                   crmlogin.IsEnabled = true;
                               }
                                   ));
        }
    }
}
