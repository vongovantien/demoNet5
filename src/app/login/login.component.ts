import { Component, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { SystemConstants } from 'src/constants/system.const';
import { OAuthService, JwksValidationHandler, TokenResponse } from 'angular-oauth2-oidc';
import { CookieService } from 'ngx-cookie-service';
import crypto_js from 'crypto-js';

import { RSAHelper } from 'src/helper/RSAHelper';
import { SystemRepo } from '../shared/repositories/system.repo';
import { Observable } from 'rxjs';
import { Company } from '@models';
import { share } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'src/environments/environment';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    username: string = "";
    password: string = "";
    remember_me: boolean = false;

    currenURL: string = ''; // * URL before redirect to login.

    company$: Observable<Company[]>;

    selectedCompanyId: any;
    spinnerLogin: string = 'spinnerLogin';
    eFMSVersion: string = environment.eFMSVersion;
    ngAfterViewInit(): void {
        // if (this.route.snapshot.paramMap.get("isEndSession")) {
        //     setTimeout(() => {
        //         this.toastr.warning("Login again to continue, please !", "Expired Session");
        //     }, 50);
        // }

        this.getLoginData();
        this._cd.detectChanges();

    }

    constructor(
        private toastr: ToastrService,
        private router: Router,
        private route: ActivatedRoute,
        private oauthService: OAuthService,
        private cookieService: CookieService,
        private _systemRepo: SystemRepo,
        private _cd: ChangeDetectorRef,
        private _spinner: NgxSpinnerService,
    ) {
    }

    private async configureWithNewConfigApi() {
        this.oauthService.tokenValidationHandler = new JwksValidationHandler();
        await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    }


    ngOnInit() {
        // Load company list.
        this.company$ = this._systemRepo.getListCompanyPermissionLevel().pipe(share());

        this.company$.subscribe(
            (companies: any) => {
                this.selectedCompanyId = companies[0].id;
            }
        );
    }

    async Login(form: NgForm) {
        if (form.form.status !== "INVALID" && !!this.selectedCompanyId) {
            try {
                this.currenURL = this.route.snapshot.paramMap.get("url") || 'home/dashboard';
                this._spinner.show(this.spinnerLogin);

                await this.configureWithNewConfigApi();
                const passwordEncoded = RSAHelper.serverEncode(this.password);

                const header: HttpHeaders = new HttpHeaders({
                    companyId: this.selectedCompanyId,
                });
                this.oauthService.fetchTokenUsingPasswordFlow(this.username, passwordEncoded, header) // * Request Access Token.
                    .then(async (resp: TokenResponse) => {
                        localStorage.setItem(SystemConstants.ID_TOKEN, 'efms');
                        return this.oauthService.loadUserProfile();
                    }).then(() => {
                        const userInfo: SystemInterface.IClaimUser = <any>this.oauthService.getIdentityClaims(); // * Get info User.

                        if (!!userInfo) {
                            this.setupLocalInfo();
                            this.rememberMe();

                            // * CURRENT_URL: url before into auth guard.
                            if (this.currenURL.includes("login")) {
                                this.currenURL = "home/dashboard";
                            }
                            this.router.navigateByUrl(this.currenURL);
                            this._spinner.hide(this.spinnerLogin);

                            const cookieData = this.cookieService.getAll();
                            console.log(cookieData);

                            this.cookieService.delete("__p", "/", window.location.hostname);
                            this.cookieService.delete("__u", "/", window.location.hostname);

                            // * save username & password into cookies.
                            const userInfoEncrypted = this.encryptUserInfo(this.username, this.password);

                            this.cookieService.set("__u", userInfoEncrypted.username_encrypt, 1, "/", window.location.hostname); // * 1 days.
                            this.cookieService.set("__p", userInfoEncrypted.password_encrypt, 1, "/", location.hostname);

                            this.toastr.info("Welcome back, " + userInfo.userName.toUpperCase() + " !", "Login Success");
                        }
                    })
                    .catch((err) => {
                        this._spinner.hide(this.spinnerLogin);
                    });
            } catch (error) {
                this._spinner.hide(this.spinnerLogin);
            }
        }
    }

    rememberMe() {
        if (this.remember_me) {
            const userInfo = this.encryptUserInfo(this.username, this.password);
            this.cookieService.set("_u", userInfo.username_encrypt, 1, "/", window.location.hostname);
            this.cookieService.set("_p", userInfo.password_encrypt, 1, "/", location.hostname);
        } else {
            this.cookieService.deleteAll("/", window.location.hostname);
        }
    }

    encryptUserInfo(username: string | crypto_js.LibWordArray, password: string | crypto_js.LibWordArray) {
        const username_encrypt = crypto_js.AES.encrypt(username, SystemConstants.SECRET_KEY);
        const password_encrypt = crypto_js.AES.encrypt(password, SystemConstants.SECRET_KEY);

        const returnObj = {
            username_encrypt: username_encrypt.toString(),
            password_encrypt: password_encrypt.toString()
        };

        return returnObj;
    }

    getUserName() {
        const username_encypt = this.cookieService.get("_u");
        const bytes = crypto_js.AES.decrypt(username_encypt, SystemConstants.SECRET_KEY);
        const username = bytes.toString(crypto_js.enc.Utf8);
        return username;
    }

    getUserPassword() {
        const pass_encypt = this.cookieService.get("_p");
        const bytes = crypto_js.AES.decrypt(pass_encypt, SystemConstants.SECRET_KEY);
        const password = bytes.toString(crypto_js.enc.Utf8);
        return password;
    }

    private getLoginData() {
        this.username = this.getUserName();
        this.password = this.getUserPassword();
        this.remember_me = (this.username !== '' || this.password !== '');
    }

    changeLanguage(lang: string) {
        localStorage.setItem(SystemConstants.CURRENT_CLIENT_LANGUAGE, lang);
        if (localStorage.getItem(SystemConstants.CURRENT_CLIENT_LANGUAGE) === "en") {
            localStorage.setItem(SystemConstants.CURRENT_LANGUAGE, "en-US");
            window.location.href = window.location.protocol + "//" + window.location.hostname;
        } else {
            localStorage.setItem(SystemConstants.CURRENT_LANGUAGE, "vi-VN");
            window.location.href = window.location.protocol + "//" + window.location.hostname + "/" + lang + "/";
        }
    }


    setupLocalInfo() {
        if (localStorage.getItem(SystemConstants.CURRENT_LANGUAGE) == null) {
            localStorage.setItem("CURRENT_LANGUAGE", SystemConstants.DEFAULT_LANGUAGE);
        }
        if (localStorage.getItem(SystemConstants.CURRENT_VERSION) == null) {
            localStorage.setItem("CURRENT_VERSION", "1");
        }
        const current_client_lang = localStorage.getItem(SystemConstants.CURRENT_CLIENT_LANGUAGE);

        if (current_client_lang === null) {
            localStorage.setItem(SystemConstants.CURRENT_CLIENT_LANGUAGE, "en");
        }
    }

}


