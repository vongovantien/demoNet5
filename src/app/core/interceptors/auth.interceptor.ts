import { Injectable, Inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { SystemConstants } from 'src/constants/system.const';
import { DEFAULT_TIMEOUT } from '../inject/default-timeout.token';


@Injectable({
    providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
    constructor(
        private _toastService: ToastrService,
        @Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number,
    ) {
    }

    authReq: HttpRequest<any> = null;
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        const timeoutValue = req.headers.get('timeout') || this.defaultTimeout;
        let token;
        const authHeader = localStorage.getItem(SystemConstants.ACCESS_TOKEN);

        if (!!authHeader) {
            token = `Bearer ${authHeader}`;
        }

        this.authReq = req.clone(req);
        if (environment.local) {
            if (!!this.authReq && (this.authReq.url.includes("44369") || this.authReq.url.includes("identityserver") || this.authReq.method !== 'GET')) {
                this.authReq = req.clone(Object.assign({}, req, { headers: req.headers.set('Authorization', authHeader), url: req.url }));
            } else {
                this.authReq = req.clone(Object.assign({}, req, { headers: req.headers.delete('Authorization'), url: req.url }));
            }
        } else {
            this.authReq = req.clone(Object.assign({}, req, { headers: req.headers.set('Authorization', token || ''), url: req.url }));
            // this.authReq = req;
        }
        return next.handle(this.authReq).pipe(
            timeout(+timeoutValue),
            catchError((error: HttpErrorResponse) => {
                let message: string = '';
                switch (error.status) {
                    case 400:
                        console.log(error);
                        message = this.detectError(error);
                        break;
                    case 401:
                        window.location.href = '#/login';
                        break;
                    case 403:
                        window.location.href = '#/403';
                        break;
                    case 404:
                        message = "Not found request";
                        break;
                    case 200: // * Upload Crystal PDF
                        message = '';
                        break;
                    default:
                        message = "Something wrong!";
                        break;
                }
                if (error instanceof TimeoutError) {
                    message = "Request time out";
                }
                if (!!message) {
                    this._toastService.error(message);
                }
                return throwError(error);
            })
        );
    }

    detectError(error: HttpErrorResponse): string {
        let message: string = 'Something wrong!';
        if (!!error.error) {
            if (!!error.error.error) {
                if (error.error.error === 'invalid_grant') {
                    message = error.error.error_description;
                } else {
                    message = error.error.error.Message;
                }
            } else if (!!error.error.message) {
                message = `${error.error.message}`;
            } else {
                message = `Something wrong!`;
            }
        } else {
            message = `Something wrong!`;
        }
        return message;
    }
}


