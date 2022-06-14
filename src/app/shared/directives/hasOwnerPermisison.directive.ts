import { Subject } from 'rxjs';
import { Directive, TemplateRef, ViewContainerRef, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { getCurrentUserState, IAppState } from '@store';

@Directive({ selector: '[hasOwnerPermission]' })
export class HasOwnerPermissionDirective extends Subject<void> implements OnInit, OnDestroy {

    private currentUser$: SystemInterface.IClaimUser; // ? User Logged
    private userCreated: string;

    @Input()
    set hasOwnerPermission(v: string) {
        this.userCreated = v;
        this.updateView();
    }

    constructor(
        private _tpl: TemplateRef<any>,
        private _vcr: ViewContainerRef,
        private _store: Store<IAppState>,
    ) {
        super();
    }

    ngOnInit(): void {
        this._store.select(getCurrentUserState)
            .pipe(takeUntil(this))
            .subscribe(
                (user: any) => {
                    if (user) {
                        this.currentUser$ = user;
                        this.updateView();
                    }
                }
            )
    }

    private updateView() {
        if (this.currentUser$?.id === this.userCreated) {
            this._vcr.createEmbeddedView(this._tpl)
        } else {
            this._vcr.clear();
        }
    }

    ngOnDestroy(): void {
        this.next();
        this.complete();
    }
}