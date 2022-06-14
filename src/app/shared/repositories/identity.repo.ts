import { Injectable } from '@angular/core';
import { ApiService } from '../services';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class IdentityRepo {
    constructor(protected _api: ApiService) {
    }

    signout() {
        return this._api.get(`${environment.HOST.INDENTITY_SERVER_URL}/api/Account/Signout`);
    }

    getUserProfile() {
        return this._api.get(`${environment.HOST.INDENTITY_SERVER_URL}/Connect/Userinfo`, null, null, false);
    }
}
