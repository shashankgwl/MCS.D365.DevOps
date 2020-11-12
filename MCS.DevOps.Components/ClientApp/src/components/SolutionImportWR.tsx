import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, Selection, SelectionMode } from '../../../node_modules/office-ui-fabric-react/lib/DetailsList'
//import AzureAD from 'react-aad-msal'
import { IDevOpsExportStatus, ISolutionImportProgress, IXrmresponse } from '../model/SolutionImportModel'
import { PrimaryButton, Fabric, MarqueeSelection, ProgressIndicator, Toggle } from '../../../node_modules/office-ui-fabric-react/lib'
import { Dialog, DialogType, DialogFooter, TextField, Panel, PanelType } from '../../../node_modules/office-ui-fabric-react/lib'
import { Stack, StackItem, IStackTokens, IStackItemStyles, IStackStyles } from '../../../node_modules/office-ui-fabric-react/lib/Stack'
import { SolutionImportHelper } from '../ts/SolutionImportHelper'
import { useBoolean } from '@uifabric/react-hooks'
import { authProvider } from '../../src/js/authProvider'
import ImportPanel from './ImportPanel';
//import ImportPanel from '../components/ImportPanel'
function SolutionImportWR() {
    const columns: IColumn[] =
        [
            {
                key: "solutionname",
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

            //{
            //    key: "chkprogress",
            //    minWidth: 150,
            //    name: "View progress",
            //    isResizable: true,
            //    isCollapsible: true,
            //    data: 'string',
            //    onRender: item => {
            //        return (<ImportButton text="View Progress" />);
            //    }
            //}
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
    const importProgressModel: ISolutionImportProgress[] = [];
    const [operationInProgress, setOperationInProgresss] = React.useState(false);
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
    const [importProgress, setSolutionImportProgress] = React.useState(importProgressModel);
    const timer = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const verticalGapStackTokens: IStackTokens = {
        childrenGap: 10,
        padding: 10,
    };

    const cardStackStyle: IStackStyles = {
        root:
        {
            border: "15",
            borderColor: "blue",
            backgroundColor: "#c7c5c1"
        }
    }

    const cardStackItemStyle: IStackItemStyles =
    {
        root:
        {
            height: "100%",
            color : "white"
        }
    }

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

    const successdialogContentProps = {
        type: DialogType.normal,
        title: `${dialogMessage.header}`,
        subText: `${dialogMessage.message}` //,
    };

    const containerStackTokens: IStackTokens = { childrenGap: 20 };

    React.useEffect(() => {
        if (dummy) { return; }
        var helper: SolutionImportHelper = new SolutionImportHelper();
        setOperationInProgresss(true);
        var deploymentId = localStorage.getItem("deploymentRecordId");
        helper.getExportStatusOfDeployment(deploymentId).then(result => {
            let exportRecords: IDevOpsExportStatus[] = [];
            result.entities.map(exportRecord => {
                exportRecords.push({ name: exportRecord.devops_name, devops_exportstatusid: exportRecord.devops_exportstatusid });
            });

            setData(exportRecords);
            setOperationInProgresss(false);
        });
    }, []);


    React.useEffect(() => {

    }, []);


    const getCredentials = () => {
        setShowCreds(false);
    }

    const getDummyProgress = () => {
        const ary: ISolutionImportProgress[] = [];
        for (let i: number = 0; i < 30; i++) {
            let item: ISolutionImportProgress =
            {
                message: "message" + i,
                status: "status" + i,
                solutionImportId: i.toString()
            }

            ary.push(item);
        }

        return ary;
    }

    const onViewProgress = async () => {
        setPanelOpen();
        timer(5000).then(() => {
            var dummyData = getDummyProgress()
            setSolutionImportProgress(dummyData);
        });;
    }

    const onImportClick = async () => {
        if (dummy) { return; }
        var exportStatusRecordId = selItem.devops_exportstatusid;
        let deploymentRecordID: any = localStorage.getItem("deploymentRecordId");
        var solutionName = selItem.name;

        if (userid.length <= 0 || pwd.length <= 0) {

            setDialogMessage({
                header: 'Error',
                message: 'Please use Authenticate button to provide credentials!!'
            });
            toggleHideDialog();
            //alert('');
            return;
        }

        setImportInProgress(true);
        var helper = new SolutionImportHelper();
        helper.beginImport(deploymentRecordID, exportStatusRecordId, solutionName, userid, pwd, overwrite).then(resp => {
            //alert(resp);
            setImportInProgress(false);
            setDialogMessage({
                message: resp.hasError ? resp.message : 'Your import has been triggered, you can check the progress by clicking anytime on View progress button.',
                header: resp.hasError ? 'Error' : 'Success'
            });
            toggleHideDialog();
        }).catch((reason: IXrmresponse) => {
            setDialogMessage({
                message: reason.hasError ? reason.message : 'Your import has been triggered, you can check the progress by clicking anytime on View progress button.',
                header: reason.hasError ? 'Error' : 'Success'
            });
        });

        //alert(`the export status is ${exportStatusRecordId} and deployment record is ${deploymentRecordID}`);
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
                                items={dummy}
                                //items={data}
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

            <Panel isLightDismiss isOpen={pnlOpen} type={PanelType.medium} hasCloseButton
                onDismiss={setPanelOpen}
                closeButtonAriaLabel="Close"
                isHiddenOnDismiss={true}
                headerText="Import progress">

                <ImportPanel/>
                <Stack tokens={verticalGapStackTokens} >
                    {
                        importProgress.map(progress => {
                            return (
                                <StackItem styles={cardStackItemStyle} >
                                    <Stack horizontal styles={cardStackStyle} tokens={containerStackTokens} >
                                        <StackItem>
                                            {progress.status}
                                        </StackItem>
                                        <StackItem>
                                            <Stack>
                                                <StackItem>
                                                    {progress.message}
                                                </StackItem>
                                                <StackItem>
                                                    {progress.message}
                                                </StackItem>
                                                <StackItem>
                                                    {progress.message}
                                                </StackItem>
                                            </Stack>
                                        </StackItem>
                                    </Stack>
                                </StackItem>
                            );
                        })
                    }
                    <StackItem>
                    </StackItem>
                </Stack>
            </Panel>
        </Fabric>
    );
}

export default SolutionImportWR