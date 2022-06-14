import { Observable } from "rxjs";
import { RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";

export interface ICanComponentDeactivate {
    nextState: RouterStateSnapshot;

    canDeactivate: (route: ActivatedRouteSnapshot, currenctState: RouterStateSnapshot, nextState: RouterStateSnapshot) => Observable<boolean> | Promise<boolean> | boolean;

    getDeactivateNextState?(): RouterStateSnapshot;

    getDeactivateCurrenctState?(): RouterStateSnapshot;

    handleCancelForm?(): void;

    confirmCancel?(): void;
}
