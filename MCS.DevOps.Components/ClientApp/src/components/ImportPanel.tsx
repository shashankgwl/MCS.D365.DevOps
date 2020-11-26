import * as React from 'react';
import { IIconProps, getTheme, mergeStyleSets, FontWeights } from 'office-ui-fabric-react'
import '../../src/custom.css'
import { DefaultButton, Modal, IconButton, ProgressIndicator } from '../../../node_modules/office-ui-fabric-react/lib'
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

    const theme: any = getTheme();


    const contentStyles = mergeStyleSets({
        container: {
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'stretch',
        },
        header: [

            theme.fonts.xLargePlus,
            {
                flex: '1 1 auto',
                borderTop: `4px solid ${theme.palette.themePrimary}`,
                color: theme.palette.neutralPrimary,
                display: 'flex',
                alignItems: 'center',
                fontWeight: FontWeights.semibold,
                padding: '12px 12px 14px 24px',
            },
        ],
        body: {
            flex: '4 4 auto',
            padding: '0 24px 24px 24px',
            overflowY: 'hidden',
            selectors: {
                p: { margin: '14px 0' },
                'p:first-child': { marginTop: 0 },
                'p:last-child': { marginBottom: 0 },
            },
        },
    });
    const toggleStyles = { root: { marginBottom: '20px' } };

    const iconProp: IIconProps = { iconName: "Cancel" }


    const iconButtonStyles = {
        root: {
            color: theme.palette.neutralPrimary,
            marginLeft: 'auto',
            marginTop: '4px',
            marginRight: '2px',
        },
        rootHovered: {
            color: theme.palette.neutralDark,
        },
    };

    const [isOperationInProgress, { setTrue: setOperationInProgress, setFalse: resetOperationInProgress }] = useBoolean(false);
    const [isModelOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
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
                    message: resp.message,
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


    return (<div className="progressCard">
        <span style={{ width: "50%", display: isOperationInProgress ? "block" : "none" }}>
            <ProgressIndicator label='Getting your data from server.' description="Please wait while the operation is in progress." />
        </span>
        <strong>The status of {progressStatement.solutionName} is <u>{progressStatement.statusReason}</u></strong>
        <div className="progressContainer">
            {progressStatement.friendlymessage}<br />

            {(progressStatement.message || '').length > 0 ? <DefaultButton text="Details" onClick={showModal} /> : ''}
            <Modal isOpen={isModelOpen}>
                <div className={contentStyles.header}>
                    <IconButton styles={iconButtonStyles} iconProps={iconProp} ariaLabel="Close details" onClick={hideModal} />
                </div>
                <div className={contentStyles.body} >
                    {unescape(progressStatement.message || '')}
                </div>
            </Modal>
        </div>
    </div>
    )
}

export default ImportPanel