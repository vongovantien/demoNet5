import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from 'src/environments/environment';

export const authConfig: AuthConfig = {

  // Url of the Identity Provider
  issuer: environment.HOST.INDENTITY_SERVER_URL,


  // URL of the SPA to redirect the user to after login
  redirectUri: window.location.origin + '/#/home',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: 'eFMS',
  requireHttps: environment.AUTHORIZATION.requireHttps,
  oidc: false,
  logoutUrl: '#/login',

  sessionCheckIntervall: 2000,
  // set the scope for the permissions the client should request
  // The first three are defined by OIDC. The 4th is a usecase-specific one
  scope: 'openid profile offline_access efms_api',
  sessionChecksEnabled: true
}