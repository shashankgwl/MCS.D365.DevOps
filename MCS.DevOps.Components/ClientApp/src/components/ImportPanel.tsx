import * as React from 'react';
import { PrimaryButton } from '../../../node_modules/office-ui-fabric-react/lib/Button'
import { Panel, Dialog, DialogType, Stack, IStackTokens, DialogFooter, ContextualMenu } from '../../../node_modules/office-ui-fabric-react/lib'
import { SolutionImportHelper } from '../ts/SolutionImportHelper'
import { useBoolean } from '@uifabric/react-hooks'

function ImportPanel(props: any) {

    const successdialogContentProps = {
        type: DialogType.normal,
        title: 'Success',
        subText: 'Your import has been triggered, you can check the progress by clicking anytime on View progress button.',
    };

    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    const [isPanelOpen, { setTrue: showPanel, setFalse: hidePanel }] = useBoolean(false);
    const [isOperationInProgress, { setTrue: setOperationInProgress, setFalse: resetOperationInProgress }] = useBoolean(false);


    const onImportClick = () => {
        var exportStatusRecordId = props.exportStatusRecordId;
        var deploymentRecordID = props.deploymentRecordID;
        var solutionName = props.solutionName
        setOperationInProgress();
        var helper = new SolutionImportHelper();
        //helper.triggerImport(deploymentRecordID, exportStatusRecordId, solutionName,).then(resp => {
        //    if (resp.ok) {
        //        toggleHideDialog();
        //        resetOperationInProgress();
        //    }
        //    else {
        //        alert(resp.text + ' ' + resp.statusText)
        //        resetOperationInProgress();
        //    }
        //})

        //alert(`the export status is ${exportStatusRecordId} and deployment record is ${deploymentRecordID}`);
    }

    const onViewProgressClick = () => {
        showPanel();
    }

    const getText = (): string => {
        if (isOperationInProgress)
            return "Please wait.";
        else
            return "Click to import";
    }

    const containerStackTokens: IStackTokens = { childrenGap: 5, padding: 10 };


    return (
        <div>
            <Stack horizontal={true} tokens={containerStackTokens}>
                <PrimaryButton text={getText()} disabled={isOperationInProgress} onClick={onImportClick} />
                <PrimaryButton text="View Progress" onClick={onViewProgressClick} />
            </Stack>
            <Panel
                isOpen={isPanelOpen}
                closeButtonAriaLabel="Close"
                onDismiss={hidePanel}
                headerText="Check Import Progress." />

            <Dialog hidden={hideDialog} dialogContentProps={successdialogContentProps}>
                <DialogFooter>
                    <PrimaryButton onClick={toggleHideDialog} text="Got it!!" />
                </DialogFooter>
            </Dialog>
        </div>
    )
}

export default ImportPanel