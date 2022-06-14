
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, Event, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, ActivatedRoute } from '@angular/router';
import { NgProgress, NgProgressRef } from '@ngx-progressbar/core';
import { OAuthService, OAuthEvent, OAuthInfoEvent, TokenResponse } from 'angular-oauth2-oidc';
import { ToastrService } from 'ngx-toastr';
import { JwtService, SEOService, DestroyService } from '@services';
import { map, filter, mergeMap, tap, takeUntil } from 'rxjs/operators';
import { SwUpdate } from '@angular/service-worker';
import { environment } from 'src/environments/environment';

declare var gtag;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [DestroyService],
})
export class AppComponent {

    isLoading: boolean = false;
    progressRef: NgProgressRef;

    constructor(
        private router: Router,
        private _ngProgressService: NgProgress,
        private oauthService: OAuthService,
        private _toast: ToastrService,
        private _jwt: JwtService,
        private _seoService: SEOService,
        private _activatedRoute: ActivatedRoute,
        private _SwUpdates: SwUpdate,
        private _destroyService: DestroyService
    ) {
        this.progressRef = this._ngProgressService.ref();
        this.oauthService.setStorage(localStorage);
        // this.oauthService.setupAutomaticSilentRefresh();

        // * Google Analytics
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + environment.GOOGLE_ANALYTICS_ID;
        document.head.prepend(script);
    }

    ngOnInit() {

        //#region Router Event
        this.router.events.pipe(
            tap((event: Event) => {
                switch (true) {
                    case event instanceof NavigationStart: {
                        this.isLoading = true;
                        this.progressRef.start();
                        break;
                    }
                    case event instanceof NavigationEnd:
                    case event instanceof NavigationCancel:
                    case event instanceof NavigationError: {
                        this.progressRef.complete();
                        break;
                    }
                    default: {
                        break;
                    }
                }
            })
        ).pipe(
            filter((event) => event instanceof NavigationEnd),
            tap((event: NavigationEnd) => {
                gtag('config', environment.GOOGLE_ANALYTICS_ID, { 'page_path': event.urlAfterRedirects });
            }),
            map(() => this._activatedRoute),
            map((route) => {
                while (route.firstChild) {
                    route = route.firstChild;
                }
                return route;
            }),
            filter((route) => route.outlet === 'primary'),
            mergeMap((route) => route.data),
            takeUntil(this._destroyService)
        ).subscribe(
            (routeData: { name: string, title: string }) => {
                this._seoService.updateTitle(routeData.title || 'eFMS');
            }
        );
        //#endregion

        //#region Oauth    
        this.oauthService.events
            .pipe(takeUntil(this._destroyService))
            .subscribe(
                (e: OAuthEvent) => {
                    if (e instanceof OAuthInfoEvent) {
                        if (e.type === 'token_expires') {
                            this.oauthService.refreshToken().then(
                                (res: TokenResponse | any) => {
                                    this._jwt.saveTokenID('efms');
                                }
                            );
                        }
                        if (e.type === 'logout') {
                            this._toast.info('successfully', e.type);
                        }
                    }
                });
        //#endregion

        //#region service worker
        if (this._SwUpdates.isEnabled) {
            console.log("Service worker is anabled");
        }

        this._SwUpdates.available
            .pipe(takeUntil(this._destroyService))
            .subscribe((event) => {
                console.log(`current`, event.current, `available `, event.available);
                if (confirm('update available for eFMS, Reload to update')) {
                    this._SwUpdates.activateUpdate().then(() => location.reload());
                }
            });
        this._SwUpdates.activated
            .pipe(takeUntil(this._destroyService))
            .subscribe(event => {
                console.log('old version was', event.previous);
                console.log('new version is', event.current);
            });


        //#endregion
    }
}
