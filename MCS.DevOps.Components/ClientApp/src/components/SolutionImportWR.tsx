import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, Selection, SelectionMode } from '../../../node_modules/office-ui-fabric-react/lib/DetailsList'
import { initializeIcons } from '@uifabric/icons';

//import AzureAD from 'react-aad-msal'
import { IDevOpsExportStatus, ISolutionImportStatus, IXrmresponse } from '../model/SolutionImportModel'
import { PrimaryButton, IconButton, Fabric, MarqueeSelection, ProgressIndicator, Toggle } from '../../../node_modules/office-ui-fabric-react/lib'
import { Dialog, DialogType, DialogFooter, TextField, Panel, PanelType } from '../../../node_modules/office-ui-fabric-react/lib'
import { Stack, StackItem, IStackTokens } from '../../../node_modules/office-ui-fabric-react/lib/Stack'
import { SolutionImportHelper } from '../ts/SolutionImportHelper'
import { useBoolean } from '@uifabric/react-hooks'
//import { authProvider } from '../../src/js/authProvider'
import ImportPanel from '../components/ImportPanel'
function SolutionImportWR() {
    const columns: IColumn[] =
        [
            {
                key: "name",
                minWidth: 150,
                name: "Solution Name",
                isResizable: true,
                isCollapsible: true,
                data: 'string',
                onRender: (item: IDevOpsExportStatus) => {
                    return <span>{item.name}</span>
                }
            },

            {
                key: "import",
                minWidth: 250,
                name: "Import",
                isResizable: true,
                isCollapsible: true,
                data: 'string',
                onRender: (item: IDevOpsExportStatus) => {
                    return (<PrimaryButton
                        color="white"
                        disabled={importInProgress}
                        text={getText()}
                        onClick={onImportClick}
                    //exportStatusRecordId={item.devops_exportstatusid}
                    //deploymentRecordID={localStorage.getItem("deploymentRecordId")}
                    //solutionName={item.name}
                    />
                    );
                }
            },

        ]

    const getVisibility = () => {
        if (operationInProgress)
            return (
                "block"
            );
        else {

            return (
                "none"
            );
        }
    }

    interface IDialogProps {
        header: string,
        message: string
    }

    let dialogProps: IDialogProps = { header: '', message: '' };
    let curSelItem: IDevOpsExportStatus = { name: "", devops_exportstatusid: "" };
    let ab: IDevOpsExportStatus[] = [];
    const importProgressModel: ISolutionImportStatus[] = [];
    const [operationInProgress, setOperationInProgresss] = React.useState(false);
    const [panelLoadInProgress, setPanelLoadInProgress] = React.useState(false);
    const [importInProgress, setImportInProgress] = React.useState(false);
    const [showCreds, setShowCreds] = React.useState(true);
    const [selItem, setSelectedItem] = React.useState(curSelItem);
    const [userid, setUserID] = React.useState('');
    const [pwd, setPwd] = React.useState('');
    const [dialogMessage, setDialogMessage] = React.useState(dialogProps);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    const [overwrite, { toggle: setOverWrite }] = useBoolean(true);
    const [pnlOpen, { toggle: setPanelOpen }] = useBoolean(false);
    const [data, setData] = React.useState(ab);
    const [importStatusRecords, setSolutionImportStatusRecords] = React.useState(importProgressModel);
    const timer = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const verticalGapStackTokens: IStackTokens = {
        childrenGap: 10,
        padding: 10,
    };

    const getText = (): string => {
        if (importInProgress)
            return "Please wait.";
        else
            return "Click to import";
    }

    const dialogContentProps = {
        type: DialogType.close,
        title: 'Authentication',
        closeButtonAriaLabel: 'Close',
        subText: 'Please enter a valid CDS username and password.',
    };

    //const getUrlParameter = (name: string) => {
    //    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    //    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    //    var results = regex.exec(window.location.search);
    //    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    //};

    const successdialogContentProps = {
        type: DialogType.normal,
        title: `${dialogMessage.header}`,
        subText: `${dialogMessage.message}` //,
    };

    const containerStackTokens: IStackTokens = { childrenGap: 20 };

    const getExportStatus = () => {
        var helper = new SolutionImportHelper();
        setOperationInProgresss(true);

        console.log(`The value of deployment id in getExportStatus = ${helper.getDeploymentId()}`);
        //var deploymentId = localStorage.getItem("deploymentRecordId");
        //alert(deploymentId);
        helper.getExportStatusOfDeployment(helper.getDeploymentId()).then(result => {
            setData(result);
            setOperationInProgresss(false);
        });
    }

    React.useEffect(() => {
        initializeIcons();
        //if (dummy) { return; }
        getExportStatus();
    }, []);


    const getCredentials = () => {
        setShowCreds(false);
    }

    const chekCredentials = () => {

        if (userid.length <= 0 || pwd.length <= 0) {

            setDialogMessage({
                header: 'Error',
                message: 'Please use Authenticate button to provide credentials!!'
            });
            toggleHideDialog();
            //alert('');
            return -1;
        }

        else {
            return 0;
        }
    }

    //const getDummyProgress = () => {
    //    const ary: ISolutionImportStatus[] = [];
    //    for (let i: number = 0; i < 30; i++) {
    //        let item: ISolutionImportStatus =
    //        {
    //            message: "message" + i,
    //            status: "status" + i,
    //            solutionImportId: i.toString()
    //        }

    //        ary.push(item);
    //    }

    //    return ary;
    //}

    const onViewProgress = async () => {
        var helper: SolutionImportHelper = new SolutionImportHelper();
        var deploymentId = helper.getDeploymentId();// getUrlParameter("id"); // localStorage.getItem("deploymentRecordId");
        console.log(`The deployment id is ${deploymentId}`);
        if (chekCredentials() === -1) {
            return;
        }
        setPanelOpen();
        //if (importStatusRecords.length <= 0) {
        setPanelLoadInProgress(true);
        await helper.getImportStatusOfDeployment(deploymentId).
            then(data => {
                setSolutionImportStatusRecords(data);
                setPanelLoadInProgress(false);
            }).
            catch((error: ISolutionImportStatus[]) => {

                setDialogMessage({
                    header: 'Error',
                    message: error[0].message ?? ''
                });
                toggleHideDialog();

            })
        //timer(5000).then(() => {
        //    //var dummyData = getDummyProgress()
        //    //setSolutionImportStatusRecords(dummyData);
        //    setPanelLoadInProgress(false);
        //});;
        //}//alert('called');
        //else
        //    setPanelLoadInProgress(false);
    }

    const onImportClick = async () => {
        //if (dummy) { return; }
        var exportStatusRecordId = selItem.devops_exportstatusid;
        var helper = new SolutionImportHelper();
        let deploymentRecordID: string = helper.getDeploymentId();//getUrlParameter("id");// localStorage.getItem("deploymentRecordId");
        var solutionName = selItem.name;

        if (chekCredentials() === -1) {
            return;
        }
        setImportInProgress(true);
        helper.importSolution(deploymentRecordID, exportStatusRecordId, solutionName, userid, pwd, overwrite).then(resp => {
            //alert(resp);
            setImportInProgress(false);
            setDialogMessage({
                message: 'Your import has been triggered, you can check the progress by clicking anytime on View progress button.',
                header: 'Success'
            });
            toggleHideDialog();
        }).catch((reason: IXrmresponse) => {
            setDialogMessage({
                message: reason.message,
                header: 'Error'
            });
            toggleHideDialog();
            setImportInProgress(false);
        });

        //alert(`the export status is ${ exportStatusRecordId } and deployment record is ${ deploymentRecordID }`);
    }

    const onChangeUserID = React.useCallback(
        (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
            setUserID(newValue || '');
        },
        [],
    );

    const onChangePwd = React.useCallback(
        (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
            setPwd(newValue || '');
        },
        [],
    );

    let listSelection: Selection = new Selection({
        onSelectionChanged: () => {
            setSelectedItem(listSelection.getSelection()[0] as IDevOpsExportStatus)
        },
    });

    const PanelDefinition = () => {
        if (importStatusRecords.length > 0) {
            console.log('value of open is ' + pnlOpen);
            return (
                <Panel isLightDismiss isOpen={pnlOpen} type={PanelType.medium} hasCloseButton
                    onDismiss={setPanelOpen}
                    closeButtonAriaLabel="Close"

                    //isHiddenOnDismiss={true}
                    headerText="Import progress">
                    <div style={{ display: panelLoadInProgress ? "block" : "none", width: "100%", height: "100%" }}>
                        <ProgressIndicator label="Wait" description="Getting data from server." />
                    </div>

                    {
                        importStatusRecords.map(progress => {
                            return (
                                <Stack tokens={verticalGapStackTokens} >
                                    <StackItem className="progressCard">
                                        <ImportPanel importStatusRecord={progress} UserId={userid} Password={pwd} />
                                    </StackItem>
                                </Stack>
                            );
                        })
                    }

                </Panel>
            );
        }

        else
            console.log('value of open is ' + pnlOpen);

        return (
            <Panel isLightDismiss isOpen={pnlOpen} type={PanelType.medium} hasCloseButton
                onDismiss={setPanelOpen}
                closeButtonAriaLabel="Close"

                //isHiddenOnDismiss={true}
                headerText="Import progress">
                <div style={{ display: panelLoadInProgress ? "block" : "none", width: "100%", height: "100%" }}>
                    <ProgressIndicator label="Wait" description="Getting data from server." />
                </div>
                <Stack tokens={verticalGapStackTokens} >
                    <StackItem>
                        <h2>No Import Records were found. Did you import?</h2>
                    </StackItem>
                </Stack>
            </Panel>
        )
    }


    var dummy: IDevOpsExportStatus[] = [
        {
            name: "solution 1",
            clicktoImport: "yes",
            devops_exportstatusid: ""
        },
        {
            name: "solution 2",
            devops_exportstatusid: "",
        },
        {
            name: "solution 3",
            devops_exportstatusid: ""
        },
        {
            name: "solution 4",
            devops_exportstatusid: ""
        },
    ];
    return (
        <Fabric applyThemeToBody>
            <Stack tokens={verticalGapStackTokens} >
                <StackItem align="stretch">
                    <Stack horizontal={true} tokens={containerStackTokens} >
                        <StackItem>
                            <PrimaryButton onClick={getCredentials} > Authenticate</PrimaryButton>
                        </StackItem>
                        <StackItem>
                            <Toggle defaultChecked={overwrite} onChange={(elm, check) => { setOverWrite(); }} inlineLabel label="Override customizations" onText="Yes" offText="No" />
                        </StackItem>
                        <StackItem>
                            <PrimaryButton onClick={onViewProgress}>View Progress</PrimaryButton>
                        </StackItem>

                        <StackItem>
                            <IconButton iconProps={{ iconName: "Refresh" }} title="Refresh grid" onClick={getExportStatus} />
                        </StackItem>
                    </Stack>
                </StackItem>

                <StackItem>
                    <MarqueeSelection selection={listSelection}>
                        <div style={{ display: getVisibility(), width: "100%", height: "100%" }}>
                            <ProgressIndicator label='Getting your data from server.' description="Please wait while the operation is in progress." />
                        </div>
                        <div style={{ display: getVisibility() === "none" ? "block" : "none", width: "100%", height: "100%" }}>
                            <DetailsList
                                selection={listSelection}
                                //onRenderItemColumn={renderItemColumn}
                                selectionPreservedOnEmptyClick={false}
                                //items={dummy}
                                items={data}
                                columns={columns}
                                setKey="set"
                                layoutMode={DetailsListLayoutMode.justified}
                                isHeaderVisible={true}
                                selectionMode={SelectionMode.single}
                            >
                            </DetailsList>
                        </div>
                    </MarqueeSelection>
                </StackItem >
            </Stack>

            <Dialog hidden={showCreds} dialogContentProps={dialogContentProps} >
                <div><TextField label="Enter CDS User" value={userid} onChange={onChangeUserID} required /></div>
                <div><TextField label="Enter CDS Password" value={pwd} onChange={onChangePwd} type="password" required canRevealPassword /></div>
                <DialogFooter>
                    <PrimaryButton onClick={() => { setShowCreds(true) }}>Ok</PrimaryButton>
                </DialogFooter>
            </Dialog>

            <Dialog hidden={hideDialog} dialogContentProps={successdialogContentProps}>
                <DialogFooter>
                    <PrimaryButton onClick={toggleHideDialog} text="Got it!!" />
                </DialogFooter>
            </Dialog>
            {PanelDefinition()}
        </Fabric>
    );
}

export default SolutionImportWR