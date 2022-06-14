import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ICanComponentDeactivate } from './deactivate.interface';

@Injectable({
    providedIn: 'root'
})
export class DeactivateGuardService implements CanDeactivate<ICanComponentDeactivate> {

    constructor() { }

    canDeactivate(component: ICanComponentDeactivate, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot)
        : boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        if (nextState.url.includes('login')) {
            return of(true);
        }
        return component.canDeactivate(currentRoute, currentState, nextState);
    }
}
