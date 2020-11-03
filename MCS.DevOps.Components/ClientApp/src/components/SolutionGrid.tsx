import { Dialog, DialogType, DialogFooter } from '../../../node_modules/office-ui-fabric-react/lib/Dialog';
import * as React from 'react';
import { Fabric, PrimaryButton, ProgressIndicator } from '../../../node_modules/office-ui-fabric-react/lib/';
import { DetailsList, DetailsListLayoutMode, IColumn, SelectionMode } from '../../../node_modules/office-ui-fabric-react/lib/DetailsList'
import SolutionGridXrm  from '../ts/SolutionGridXrm'

const timeout = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function SolutionGrid() {

    interface ISolution {
        name: string,
        uniqueName: string,
        version: string
    }

    function getSolutionRecords() {
        debugger;
        SolutionGridXrm.beginExportSolution();
        //let newSolutionIds : Array<any> = [];
        //  window.parent.Xrm.WebApi.online.retrieveMultipleRecords("solution", "?$select=solutionid,friendlyname,ismanaged,uniquename,version&$filter=ismanaged eq false").then(
        //     function success(results) {
        //         for (var i = 0; i < results.entities.length; i++) {
        //         var solution = {};

        //         }

        //         console.log("****************");
        //        // console.log(solutions);
        //         console.log("--------------");
        //         // // console.log(solutionIdsToBeCreated);
        //         // for (var index = 0; index < solutionIdsToBeCreated.length; index++)
        //         // {
        //         // console.log("****************");
        //         // var solutionId = solutionIdsToBeCreated[index];
        //         //     var solution = solutions[solutionId]
        //         //     console.log(solution);
        //         //     var data = {
        //         //         "devops_name": solution["friendlyname"],
        //         //         "devops_solutionuniquename": solution["uniquename"],
        //         //         "devops_version": solution["version"],
        //         //         "devops_solutionguid": solution["solutionid"]
        //         //     }
        //         //     Xrm.WebApi.createRecord("devops_solution", data).then(
        //         //     function success(result) {
        //         //         console.log("Custom Solution created with ID: " + result.id);
        //         //     },
        //         //     function (error) {
        //         //         console.log(error.message);
        //         //     }
        //         // );
        //         // }
        //     },
        //     function(error) {
        //         //Xrm.Utility.alertDialog(error.message);
        //     }
        // );
        //arrData = [];
        //populateSolutionRecords(true);
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
                key: "name",
                minWidth: 150,
                name: "Solution Name",

                isResizable: true,
                isCollapsible: true,
                data: 'string',
                onRender: (item: ISolution) => {
                    return <span>{item.name}</span>;
                }
            },

            {
                key: "uniqueName",
                minWidth: 150,
                name: "Solution Unique Name",

                isResizable: true,
                isCollapsible: true,
                data: 'string',
                onRender: (item: ISolution) => {
                    return <span>{item.uniqueName}</span>;
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
                    return <span>{item.version}</span>;
                }
            },

            {
                key: "Add",
                minWidth: 150,
                name: "Action",

                isResizable: true,
                isCollapsible: true,
                data: 'string',
                onRender: (item: ISolution) => {

                    return <PrimaryButton onClick={clickNow}>
                        Click to call
                </PrimaryButton>
                }
            }
        ]

    const [isLoading, setLoading] = React.useState(true);
    const [data, setData] = React.useState({});
    ////const [hideDialog, { toggle: toggleHideDialog }] = React.useBoolean(false);
    //const []=useBoolean(false);

    React.useEffect(() => {

        getSolutionRecords();
        timeout(3000).then(() => {
            let sols: ISolution[] = [
                {
                    name: "Solution 1",
                    uniqueName: "Solution 1",
                    version: "1.0"
                },

                {
                    name: "Solution 2",
                    uniqueName: "Solution 2",
                    version: "1.0"
                },

                {
                    name: "Solution 3",
                    uniqueName: "Solution 3",
                    version: "1.0"
                },

                {
                    name: "Solution 4",
                    uniqueName: "Solution 4",
                    version: "1.0"
                },
                {
                    name: "Solution 5",
                    uniqueName: "Solution 5",
                    version: "1.0"
                },
                {
                    name: "Solution 6",
                    uniqueName: "Solution 6",
                    version: "1.0"
                }
            ]

            setLoading(false);

            setData(sols);
        });
    });

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

                    layoutMode={DetailsListLayoutMode.fixedColumns}
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