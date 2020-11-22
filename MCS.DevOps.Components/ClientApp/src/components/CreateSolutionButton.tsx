import * as React from 'react';
import { ActionButton } from '../../../node_modules/office-ui-fabric-react/lib/Button'
import { ISolution } from '../model/models'
import { SolutionImportHelper } from '../ts/SolutionImportHelper'

function SolutionButton(props: any) {

    const onSolutionRowClick = () => {
        let sol: ISolution = props.solutionItem;
        let helper = new SolutionImportHelper();
        helper.createSolutionRecord(sol);
        alert(`created solution record for ${sol.uniquename}`);
    }

    //cons


    return (
        <ActionButton color="yellow"
            iconProps={{ iconName: "AddTo" }} onClick={onSolutionRowClick}>Create</ActionButton>
    );
}

export default SolutionButton