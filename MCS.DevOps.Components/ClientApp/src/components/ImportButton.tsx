import * as React from 'react';
import { IDevOpsExportStatus } from '../model/SolutionImportModel'
import { PrimaryButton } from '../../../node_modules/office-ui-fabric-react/lib/Button'
import { SolutionImportHelper } from '../ts/SolutionImportHelper'

function ImportButton(props: any) {

    const onImportClick = () => {
        var exportStatusRecordId = props.exportStatusRecordId;
        var deploymentRecordID = props.deploymentRecordID;
        alert(`the export status is ${exportStatusRecordId} and deployment record is ${deploymentRecordID}`);
    }

    const getText = (): string => {
        let txt: string = props.text as string;
        if (txt.length <= 0)
            return "Click to import"
        else
            return txt
    }


    return (
        <PrimaryButton text={getText()} disabled={props.isDisabled} onClick={onImportClick} />
    )
}

export default ImportButton