import { MsalAuthProvider, LoginType } from 'react-aad-msal'

// Msal Configurations
const config = {
    auth: {
        authority: 'https://login.microsoftonline.com/d9a1b506-a006-4359-966b-696cb2dad64d/',
        clientId: 'b20003a0-ad25-4bb1-b701-9b9e38b3fa1a',
        redirectUri: 'https://galiciadev.crm2.dynamics.com/'
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
    }
};

// Authentication Parameters
const authenticationParameters = {
    scopes: ['https://admin.services.crm.dynamics.com/user_impersonation']
}

// Options
const options = {
    loginType: LoginType.Popup,
    tokenRefreshUri: window.location.origin + '/auth.html'
}

export const authProvider = new MsalAuthProvider(config, authenticationParameters, options)
