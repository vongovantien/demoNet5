import { Injectable } from '@angular/core';

enum STORAGE_KEY {
    ACCESS_TOKEN = 'access_token',
    EXPIRE_TOKEN = 'expires_at',
    REFRESH_TOKEN = 'refresh_token',
    EXPIRES_AT = 'expires_at',
    ACCESS_TOKEN_STORED_AT = 'access_token_stored_at',
    ID_TOKEN = 'id_token',
    CLAIMS = 'id_token_claims_obj',
    BRAVO_TOKEN = 'bravo_token',
}

@Injectable({ providedIn: 'root' })
export class JwtService {

    private getToken(): String {
        return window.localStorage[STORAGE_KEY.ACCESS_TOKEN];
    }

    private saveToken(token: String) {
        window.localStorage[STORAGE_KEY.ACCESS_TOKEN] = token;
    }

    saveTokenID(tokenId: string) {
        window.localStorage[STORAGE_KEY.ID_TOKEN] = tokenId;
    }

    destroyToken() {
        window.localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
    }

    destroyRefreshToken() {
        window.localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN);
    }

    destroyClaim() {
        window.localStorage.removeItem(STORAGE_KEY.CLAIMS);
    }

    destroyExpiresAt() {
        window.localStorage.removeItem(STORAGE_KEY.EXPIRES_AT);
    }

    destroyIdToken() {
        window.localStorage.removeItem(STORAGE_KEY.ID_TOKEN);
    }

    destroyAccessTokenStoredAt() {
        window.localStorage.removeItem(STORAGE_KEY.ACCESS_TOKEN_STORED_AT);
    }

    saveBravoToken(token: string) {
        window.localStorage.setItem(STORAGE_KEY.BRAVO_TOKEN, token);
    }

    getBravoToken() {
        return window.localStorage.getItem(STORAGE_KEY.BRAVO_TOKEN) || null;
    }

    private getExpiresToken() {
        return window.localStorage[STORAGE_KEY.EXPIRE_TOKEN];
    }

    public hasValidAccessToken(): boolean {
        if (this.getToken()) {
            const expiresAt = this.getExpiresToken();
            const now = new Date();
            if (expiresAt && parseInt(expiresAt, 10) < now.getTime()) {
                // localStorage.clear();
                return false;
            }
            return true;
        }
        // localStorage.clear();
        return false;
    }

    public remainingExpireTimeToken(): number {
        if (this.getToken()) {
            const expiresAt = localStorage.getItem(STORAGE_KEY.EXPIRE_TOKEN);
            const expTime = +new Date(parseInt(expiresAt, 10));
            const nowTime = +new Date();
            const remainingMinutes = new Date(expTime - nowTime).getMinutes();
            const remainingHours = new Date(expTime).getHours() - new Date(nowTime).getHours();
            if (remainingHours === 0) {
                return remainingMinutes;
            } else {
                return -1;
            }
        }
        return -1;
    };

}
