import * as React from 'react';
import '../../src/custom.css'
import { Fabric, DialogType, IStackTokens, ProgressIndicator } from '../../../node_modules/office-ui-fabric-react/lib'
import { SolutionImportHelper } from '../ts/SolutionImportHelper'
import { useBoolean } from '@uifabric/react-hooks'
import { ISolutionImportStatus, IImportProgress } from '../model/SolutionImportModel';

function ImportPanel(props: any) {

    const getUrlParameter = (name: string) => {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(window.location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    const progressObject: IImportProgress = {
        friendlymessage: '',
        statusReason: '',
        solutionName: '',
        hasError: false
    }



    const [isOperationInProgress, { setTrue: setOperationInProgress, setFalse: resetOperationInProgress }] = useBoolean(false);
    const [progressStatement, setProgressStatement] = React.useState(progressObject);
    React.useEffect(() => {
        var thisImportStatus = props.importStatusRecord as ISolutionImportStatus;
        var asyncImportId = thisImportStatus.solutionImportId;
        var deploymentId: any = getUrlParameter("id"); //localStorage.getItem("deploymentRecordId");
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