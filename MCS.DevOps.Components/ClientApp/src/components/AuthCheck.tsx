import AzureAD from 'react-aad-msal'
import * as React from 'react';
import { PrimaryButton } from '../../../node_modules/office-ui-fabric-react/lib/Button'
import { authProvider } from '../../src/js/authProvider'

const onauth = async() => {
    debugger
    var act = await authProvider.getAccessToken();

    alert(act.accessToken);
}


function AuthCheck() {
    return (<div>
        <AzureAD provider={authProvider} forceLogin={true} >
        <PrimaryButton onClick={onauth} > Authenticate</PrimaryButton>
        </AzureAD>
    </div>

    );
}

export default AuthCheck