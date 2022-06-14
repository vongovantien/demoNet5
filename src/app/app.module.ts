
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { StoreModule } from "@ngrx/store";

import { HeaderComponent } from "./master-page/header/header.component";
import { FooterComponent } from "./master-page/footer/footer.component";
import { PageSidebarComponent } from "./master-page/page-sidebar/page-sidebar.component";
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";
import { MasterPageComponent } from "./master-page/master-page.component";
import { NotfoundPageComponent } from "./404/404-page.component";
import { DashboardComponent } from "./dashboard/dashboard.component";

import {
    PerfectScrollbarModule,
} from "ngx-perfect-scrollbar";
import { CookieService } from "ngx-cookie-service";
import { OAuthModule, AuthConfig } from "angular-oauth2-oidc";
import { NgxSpinnerModule } from "ngx-spinner";
import { HighchartsChartModule } from "highcharts-angular";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";
import { NgProgressModule } from "@ngx-progressbar/core";
import { ToastrModule } from "ngx-toastr";
import { EffectsModule } from "@ngrx/effects";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { AuthInterceptor, MenuResolveGuard, LoadingInterceptor } from "@core";

import { GlobalState } from "./global-state";
import { AppRoutingModule } from "./app-routing.module";
import { environment } from "src/environments/environment";

import { reducers, effects } from "./store";
import { ForbiddenPageComponent } from "./403/403.component";
import { DEFAULT_TIMEOUT } from "./core/inject/default-timeout.token";
import { ServiceWorkerModule } from '@angular/service-worker';

const authConfig: AuthConfig = {
    issuer: environment.HOST.INDENTITY_SERVER_URL,
    tokenEndpoint: environment.HOST.INDENTITY_SERVER_URL + '/connect/token',
    redirectUri: window.location.origin + '/#/home',
    clientId: 'eFMS',
    requireHttps: false,
    oidc: false,
    logoutUrl: window.location.origin + '/#/login',
    sessionCheckIntervall: 2000,
    scope: 'openid profile offline_access efms_api',
    sessionChecksEnabled: true,
};

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        MasterPageComponent,
        NotfoundPageComponent,
        HeaderComponent,
        FooterComponent,
        PageSidebarComponent,
        //DashboardComponent,
        ForbiddenPageComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot({
            positionClass: 'toast-bottom-right',
            easeTime: 500
        }),
        NgxSpinnerModule,
        PerfectScrollbarModule,
        OAuthModule.forRoot({
            resourceServer: {
                allowedUrls: ["**"],
                sendAccessToken: true
            }
        }),
        NgxDaterangepickerMd.forRoot(),
        //HighchartsChartModule,
        NgProgressModule,

        StoreModule.forRoot(reducers),
        EffectsModule.forRoot(effects),
        StoreDevtoolsModule.instrument({
            maxAge: 25, // Retains last 25 states
            logOnly: !environment.production, // Restrict extension to log-only mode
        }),
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production || environment.uat })

    ],
    providers: [
        GlobalState,
        CookieService,
        MenuResolveGuard,

        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true, },
        { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
        { provide: AuthConfig, useValue: authConfig },
        { provide: DEFAULT_TIMEOUT, useValue: !environment.production ? 300000 : 600000 },
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent],
    exports: []
})
export class AppModule { }

