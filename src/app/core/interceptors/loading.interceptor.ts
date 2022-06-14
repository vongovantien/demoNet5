import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class LoadingInterceptor implements HttpInterceptor {
    private _totalRequests = 0;

    constructor(private readonly _spinner: NgxSpinnerService) {
    }
    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const hideSpinner = req.headers.get('hideSpinner'); // * Allow API not showing ~Loading~
        if (hideSpinner !== null) {
            return next.handle(req);
        }
        this._totalRequests++;
        if (this._totalRequests > 0) {
            this._spinner.show();
        }
        return next.handle(req).pipe(
            finalize(() => {
                this._totalRequests--;
                if (this._totalRequests <= 0) {
                    this._spinner.hide();
                    this._totalRequests = 0;
                }
            })
        );
    }
}