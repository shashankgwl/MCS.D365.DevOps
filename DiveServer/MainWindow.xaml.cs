using System;
using System.IO;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;

namespace CandyServer
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        HttpListener httpListener = null;
        CancellationTokenSource tokenSource = null;
        public MainWindow()
        {
            InitializeComponent();
            App.Current.Exit += ApplicationExit;
        }

        private void ApplicationExit(object sender, ExitEventArgs e)
        {
            StopServer();
        }

        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            OpenXrmLogin();
            btnStartServer.IsEnabled = false;
            btnStopServer.IsEnabled = true;
            tokenSource = new CancellationTokenSource();
            await StartHttpListner();
        }

        private void OpenXrmLogin()
        {
            var login = new CrmLoginPage();
            login.ConnectionToCrmCompleted += Login_ConnectionToCrmCompleted;
            login.ShowDialog();

            if (login.CrmConnectionMgr == null || login.CrmConnectionMgr.CrmSvc == null || !login.CrmConnectionMgr.CrmSvc.IsReady)
            {
                //MessageBox.Show("Connection to D365 failed.");
            }

            var xrmClient = login.CrmConnectionMgr.CrmSvc;
            lblCursorPosition.Text = $"Connected to {xrmClient.ConnectedOrgFriendlyName} version {xrmClient.ConnectedOrgVersion}";
        }

        private async Task StartHttpListner()
        {
            httpListener = new HttpListener();
            HttpListenerContext httpContext = null;
            await Task.Factory.StartNew(async () =>
            {
                httpListener.Prefixes.Add("http://localhost:7075/API/");
                httpListener.Start();
                while (true)
                {
                    if (tokenSource.IsCancellationRequested)
                    {
                        httpListener.Stop();
                        break;
                    }
                    try
                    {
                        httpContext = httpListener.GetContext();
                        ProcessContext(httpContext);
                    }
                    catch (HttpListenerException ex)
                    {
                        if (tokenSource.IsCancellationRequested)
                        {
                            httpListener.Stop();
                            break;
                        }
                        else
                        {
                            MessageBox.Show(ex.Message);
                        }
                    }
                }
            }, tokenSource.Token);
        }

        private void ProcessContext(HttpListenerContext httpContext)
        {
            //var request = httpContext.Request;
            var response = httpContext.Response;
            using (var streamwriter = new StreamWriter(response.OutputStream))
            {
                streamwriter.Write($"<h1>Candy Server is running.</h1>");
                //Thread.Sleep(10000);
            }
        }

        private void Login_ConnectionToCrmCompleted(object sender, EventArgs e)
        {
            if (sender is CrmLoginPage)
            {
                this.Dispatcher.Invoke(() =>
                {
                    ((CrmLoginPage)sender).Close();
                });
            }
            //throw new NotImplementedException();
        }

        private void CommandBinding_CanExecute(object sender, System.Windows.Input.CanExecuteRoutedEventArgs e)
        {

        }

        private void StopServer()
        {
            if (tokenSource == null || httpListener == null)
            {
                return;
            }

            tokenSource.Cancel();
            httpListener.Stop();
            btnStartServer.IsEnabled = true;
            btnStopServer.IsEnabled = false;
            lblCursorPosition.Text = "Disconnected";
        }
        private void btnStopServer_Click(object sender, RoutedEventArgs e)
        {
            StopServer();
        }
    }
}