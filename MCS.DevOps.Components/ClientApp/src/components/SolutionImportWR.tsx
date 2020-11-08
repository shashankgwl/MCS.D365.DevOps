import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn, Selection, SelectionMode } from '../../../node_modules/office-ui-fabric-react/lib/DetailsList'
import { IDevOpsExportStatus } from '../model/SolutionImportModel'
import { PrimaryButton, Fabric, MarqueeSelection, ProgressIndicator } from '../../../node_modules/office-ui-fabric-react/lib'
import { SolutionImportHelper } from '../ts/SolutionImportHelper'
import ImportButton  from '../components/ImportButton'
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
                minWidth: 150,
                name: "Import",
                isResizable: true,
                isCollapsible: true,
                data: 'string',
                onRender: (item: IDevOpsExportStatus) => {
                    return (<table>
                        <tr>
                            <td>
                                <ImportButton
                                    isDisabled={operationInProgress}
                                    exportStatusRecordId={item.devops_exportstatusid}
                                    deploymentRecordID={localStorage.getItem("deploymentRecordId")}
                                    text="Click to import" />
                            </td>

                        </tr>
                    </table>);
                }
            },

            {
                key: "chkprogress",
                minWidth: 150,
                name: "View progress",
                isResizable: true,
                isCollapsible: true,
                data: 'string',
                onRender: item => {
                    return (<ImportButton text="View Progress" />);
                }
            }
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

    let curSelItem: IDevOpsExportStatus = { name: "", devops_exportstatusid: "" };
    let ab: IDevOpsExportStatus[] = [];
    const [operationInProgress, setOperationInProgresss] = React.useState(false);
    const [selItem, setSelectedItem] = React.useState(curSelItem);
    const [data, setData] = React.useState(ab);
    const timer = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    React.useEffect(() => {
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

    let listSelection: Selection = new Selection({
        onSelectionChanged: () => {
            setSelectedItem(listSelection.getSelection()[0] as IDevOpsExportStatus)
        },
    });

    const onImportClick = () => {
        window.parent.Xrm.Utility.alertDialog(selItem.name, () => { });
        //debugger;
        //setImportInProgress(true);
        //alert(selItem.name);
        //timer(2000).then(() => { setImportInProgress(false) });
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
        <Fabric>
            <MarqueeSelection selection={listSelection}>
                <div style={{ display: getVisibility(), width: "100%", height: "100%" }}>
                    <ProgressIndicator label='Getting your data from server.' description="Please wait while the operation is in progress." />
                </div>
                <div style={{ display: getVisibility() === "none" ? "block" : "none", width: "100%", height: "100%" }}>
                    <DetailsList
                        selection={listSelection}
                        //onRenderItemColumn={renderItemColumn}
                        selectionPreservedOnEmptyClick={false}
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
        </Fabric>
    );
}

export default SolutionImportWR