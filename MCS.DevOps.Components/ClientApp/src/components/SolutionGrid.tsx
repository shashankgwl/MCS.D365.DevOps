/// <reference path="../../../node_modules/@types/xrm/index.d.ts" />
import { DialogType, } from 'office-ui-fabric-react/lib/'// '../../../node_modules/office-ui-fabric-react/lib/Dialog';
import * as React from 'react';
import { IStackStyles } from 'office-ui-fabric-react/lib/Stack';
import { DefaultPalette } from 'office-ui-fabric-react/lib/Styling';
import { Fabric, PrimaryButton, ProgressIndicator, Label, Stack, TooltipHost } from 'office-ui-fabric-react/lib/' // '../../../node_modules/office-ui-fabric-react/lib/';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/'// '../../../node_modules/office-ui-fabric-react/lib/DetailsList'
import * as SolutionHelper from '../ts/SolutionGridXrm'
import { ISolution } from '../model/models'
const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function SolutionGrid() {

    const stackStyles: IStackStyles = {
        root: {
            background: DefaultPalette.whiteTranslucent40,
        },
    };

    const getDummyData = () => {
        var kk: ISolution[] = [
            { friendlyname: "sfsfs", uniquename: "dfsfds", solutionid: "sfs", version: "sdfs" },
            { friendlyname: "sfsfs", uniquename: "dfsfds", solutionid: "sfs", version: "sdfs" },
            { friendlyname: "sfsfs", uniquename: "dfsfds", solutionid: "sfs", version: "sdfs" },
            { friendlyname: "sfsfs", uniquename: "dfsfds", solutionid: "sfs", version: "sdfs" },
            { friendlyname: "sfsfs", uniquename: "dfsfds", solutionid: "sfs", version: "sdfs" },
            { friendlyname: "sfsfs", uniquename: "dfsfds", solutionid: "sfs", version: "sdfs" }
        ]

        return kk;
    }

    const getSolutionRecords = () => {
        debugger;
        return SolutionHelper.getUnmanagedSolutions();
    }


    const dialogContentProps = {
        type: DialogType.normal,
        title: 'The Subject',
        closeButtonAriaLabel: 'Close',
        subText: 'Do you want to send this message without a subject?',
    };

    const solutionItemInvoked = (item: ISolution, index?: number, evt?: Event) => {
        //toggleHideDialog();
        //setDialog(false);
        //alert(`You clicked on ${item.name} at ${index}`);
    }


    let clickNow = async () => {
        setOperationInProgress(true);
        await SolutionHelper.createSolutionRecord(data);
        setOperationInProgress(false);
        //timeout(5000).then(() => { setOperationInProgress(false) });
    }

    const columns: IColumn[] =
        [
            {
                key: "friendlyname",
                minWidth: 150,
                name: "Solution Name",
                isResizable: true,
                isCollapsible: true,
                data: 'string',

                onRender: (item: ISolution) => {
                    return <Label>{item.friendlyname}</Label>;
                }
            },

            {
                key: "uniquename",
                minWidth: 150,
                name: "Solution Unique Name",

                isResizable: true,
                isCollapsible: true,
                data: 'string',
                onRender: (item: ISolution) => {
                    return <Label>{item.uniquename}</Label>;
                }
            },

            {
                key: "version",
                minWidth: 150,
                name: "Solution Version",

                isResizable: true,
                isCollapsible: true,
                data: 'string',
                onRender: (item: ISolution) => {
                    return <Label>{item.version}</Label>;
                }
            }
        ]

    const filter = (item: ISolution) => {
        return !item.friendlyname.includes('Active') &&
            !item.friendlyname.includes('Basic') &&
            !item.friendlyname.includes('Default')
    }
    const [opeationInPrgoress, setOperationInProgress] = React.useState(true);
    var allSolutions: ISolution[] = [];
    const [data, setData] = React.useState(allSolutions);
    ////const [hideDialog, { toggle: toggleHideDialog }] = React.useBoolean(false);
    //const []=useBoolean(false);

    React.useEffect(() => {
        //var bb = getDummyData();
        //setData(bb)
        //setOperationInProgress(false);
        if (data.length > 0) {
            console.log("data already exists, skipping server call.");
            setOperationInProgress(false);
        }
        else {
            console.log("data doesn't exist, calling server.");
            getSolutionRecords().then(entites => {
                setData(entites.filter(filter));
                setOperationInProgress(false);
            });
        }
    }, []);

    const getVisibility = () => {
        if (opeationInPrgoress)
            return (
                "block"
            );
        else {

            return (
                "none"
            );
        }
    }

    return (<Fabric>
        <div className='"display":"flex","flexwrap":"wrap","data-is-scrollable"="true"'>
            <Stack horizontal={false} styles={stackStyles}>
                <Stack.Item align="end">
                    <TooltipHost content="click this button to create solution records. should be done only once.">
                        <PrimaryButton style={{ marginTop: 5 }} disabled={opeationInPrgoress} text="import solution records." onClick={clickNow} />
                    </TooltipHost>
                </Stack.Item>
                <Stack.Item>
                    <div style={{ display: getVisibility(), width: "100%", height: "100%" }}>
                        <ProgressIndicator label='Getting your data from server.' description="Please wait while the operation is in progress." />
                    </div>
                    <div style={{ display: getVisibility() === "none" ? "block" : "none", width: "100%", height: "100%" }}>
                        <DetailsList
                            selectionPreservedOnEmptyClick={true}
                            items={data as ISolution[]}
                            columns={columns}
                            layoutMode={DetailsListLayoutMode.fixedColumns}
                            isHeaderVisible={true}
                            selectionMode={SelectionMode.single}
                            enterModalSelectionOnTouch={true}
                            onItemInvoked={solutionItemInvoked}
                        >
                        </DetailsList>
                    </div>

                </Stack.Item>
            </Stack>
            {/* <MarqueeSelection selection> */}
            {/* </MarqueeSelection> */}
        </div>
    </Fabric>
    );


}

export default SolutionGrid