/// <reference path="../../../node_modules/@types/xrm/index.d.ts" />
import { Dialog, DialogType, DialogFooter } from '../../../node_modules/office-ui-fabric-react/lib/Dialog';
import * as React from 'react';
import { Fabric, PrimaryButton, ProgressIndicator, Label } from '../../../node_modules/office-ui-fabric-react/lib/';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from '../../../node_modules/office-ui-fabric-react/lib/DetailsList'
import * as SolutionHelper from '../ts/SolutionGridXrm.js'
const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function SolutionGrid() {

    interface ISolution {
        friendlyname: string,
        uniquename: string,
        version: string,
        solutionid: string
    }

    const getSolutionRecords = () => {
        debugger;
        return SolutionHelper.default.getUnmanagedSolutions();

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


    let clickNow = () => {
        //toggleHideDialog();
        //alert('hail mogambo');
    }

    const columns: IColumn[] =
        [
            {
                key: "friendlyname",
                minWidth: 150,
                name: "<u>Solution Name</u>",
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
    const [isLoading, setLoading] = React.useState(true);
    const [data, setData] = React.useState({});
    ////const [hideDialog, { toggle: toggleHideDialog }] = React.useBoolean(false);
    //const []=useBoolean(false);

    React.useEffect(() => {
        getSolutionRecords().then(entites => {
            setData(entites.filter(filter));
            setLoading(false);
        });;
        //solutions

    }, []);

    if (isLoading) {

        return <ProgressIndicator description='Please wait while solution data is loading.' label='Wait while loading' />
    }

    else {
        //let a : ISelection<IObjectWithKey> = {};
        return (<Fabric>
            <div className='"display":"flex","flexwrap":"wrap","data-is-scrollable"="true"'>
                {/* <MarqueeSelection selection> */}
                <DetailsList
                    selectionPreservedOnEmptyClick={true}
                    items={data as ISolution[]}
                    columns={columns}
                    layoutMode={DetailsListLayoutMode.justified}
                    isHeaderVisible={true}
                    selectionMode={SelectionMode.single}
                    enterModalSelectionOnTouch={true}
                    onItemInvoked={solutionItemInvoked}
                >
                </DetailsList>

                {/* </MarqueeSelection> */}

                <Dialog dialogContentProps={dialogContentProps}>

                    <DialogFooter>
                        <PrimaryButton text="Send" />
                        <PrimaryButton text="Don't send" />
                    </DialogFooter>
                </Dialog>
            </div>
        </Fabric>
        );
    }
}

export default SolutionGrid