import * as React from 'react';
import '../../src/custom.css'
import { Panel, Fabric, DialogType, Stack, IStackTokens, DialogFooter, ProgressIndicator } from '../../../node_modules/office-ui-fabric-react/lib'
import { SolutionImportHelper } from '../ts/SolutionImportHelper'
import { useBoolean } from '@uifabric/react-hooks'
import { ISolutionImportStatus, IXrmresponse, IImportProgress } from '../model/SolutionImportModel';

function ImportPanel(props: any) {

    const successdialogContentProps = {
        type: DialogType.normal,
        title: 'Success',
        subText: 'Your import has been triggered, you can check the progress by clicking anytime on View progress button.',
    };

    const progressObject: IImportProgress = {
        friendlymessage: '',
        statusReason: '',
        solutionName: '',
        hasError: false
    }



    //const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    //const [isPanelOpen, { setTrue: showPanel, setFalse: hidePanel }] = useBoolean(false);
    const [isOperationInProgress, { setTrue: setOperationInProgress, setFalse: resetOperationInProgress }] = useBoolean(false);
    const [progressStatement, setProgressStatement] = React.useState(progressObject);
    React.useEffect(() => {
        var thisImportStatus = props.importStatusRecord as ISolutionImportStatus;
        var asyncImportId = thisImportStatus.solutionImportId;
        var deploymentId: any = localStorage.getItem("deploymentRecordId");
        var usrName = props.UserId;
        var pswd = props.Password;
        setOperationInProgress();
        var helper = new SolutionImportHelper();
        helper.getImportProgressOnServer(deploymentId, asyncImportId, usrName, pswd)
            .then(resp => {
                setProgressStatement({
                    hasError: resp.hasError,
                    solutionName: thisImportStatus.solutionName,
                    friendlymessage: resp.friendlymessage,
                    statusReason: resp.statusReason
                })
                resetOperationInProgress();    //alert(resp.message)
            })
            .catch((reason: IImportProgress) => {
                //alert(reason.message)
                setProgressStatement({
                    hasError: true,
                    solutionName: thisImportStatus.solutionName,
                    friendlymessage: reason.friendlymessage,
                    statusReason: reason.statusReason
                })
                resetOperationInProgress();    //alert(resp.message)
            });

    }, [props.importStatusRecord, props.Password, props.UserId]);

    const onViewProgressClick = () => {
        //showPanel();
    }



    const getText = (): string => {
        if (isOperationInProgress)
            return "Please wait.";
        else
            return "Click to import";
    }

    const containerStackTokens: IStackTokens = { childrenGap: 5, padding: 10 };

    return (<Fabric>
        <div className="card">
            <span style={{ width: "50%", display: isOperationInProgress ? "block" : "none" }}>
                <ProgressIndicator label='Getting your data from server.' description="Please wait while the operation is in progress." />
            </span>
            <strong>The status of {progressStatement.solutionName} is <u>{progressStatement.statusReason}</u></strong>
            <div className="container">
                {progressStatement.friendlymessage}
            </div>
        </div>
    </Fabric >
    )
}

export default ImportPanel