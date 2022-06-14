import { Directive, OnDestroy, ElementRef, ViewContainerRef, Input, HostListener } from '@angular/core';
import { Overlay, OverlayRef, OverlayConfig, ConnectionPositionPair } from '@angular/cdk/overlay';
import { OVERLAY_POSITION_MAP } from '@constants';
import { TemplatePortal } from '@angular/cdk/portal';

import { Subscription, merge, Subject, iif, fromEvent, Observable } from 'rxjs';
import { IDropdownPanel } from '@common';
import { tap, mapTo, debounceTime, map, takeUntil } from 'rxjs/operators';
import { DestroyService } from '../services/destroy.service';
@Directive({
    selector: '[dpToggle]',
    providers: [DestroyService]

})
export class DropdownToggleDirective implements OnDestroy {

    @Input('dpToggle') public dropdownPanel: IDropdownPanel;
    @Input() set position(key: any) {
        if (!!key) {
            this._position = OVERLAY_POSITION_MAP[key];
        }
    }
    @Input() set trigger(t: 'click' | 'hover') {
        this._trigger = t;
    }

    get position() {
        return this._position;
    }

    get trigger() {
        return this._trigger;
    }

    private isOpenDropdown: boolean = false;
    private overlayRef: OverlayRef;
    private dropdownClosingActions$: Subscription = Subscription.EMPTY;
    private _position: ConnectionPositionPair = OVERLAY_POSITION_MAP.topRight;
    private _trigger: 'click' | 'hover' = 'click';

    private hover$: Observable<boolean>;
    private click$: Observable<boolean>;

    private get overlayConfig(): OverlayConfig {
        return new OverlayConfig({
            hasBackdrop: this._trigger !== 'hover',
            backdropClass: 'cdk-overlay-dropdown-backdrop',
            scrollStrategy: this._overlay.scrollStrategies.close(),
            positionStrategy: this._overlay
                .position()
                .flexibleConnectedTo(this._elementRef)
                .withPositions([
                    this.position
                ])
        });
    }

    constructor(
        private readonly _overlay: Overlay,
        private readonly _elementRef: ElementRef<HTMLElement>,
        private readonly _viewContainerRef: ViewContainerRef,
        private readonly _destroyService: DestroyService
    ) { }

    ngOnInit(): void {
        const mouseover$ = fromEvent(this._elementRef.nativeElement, 'mouseover');
        const mouseleave$ = fromEvent(this._elementRef.nativeElement, 'mouseleave');
        this.click$ = fromEvent(this._elementRef.nativeElement, 'click').pipe(map(() => true)); // * Click event alway true

        this.hover$ = merge(
            mouseover$.pipe(mapTo(true)),
            mouseleave$.pipe(mapTo(false))
        );
    }

    ngAfterViewInit(): void {
        this.initDropdown();
    }

    private initDropdown() {
        const menuVisible$ = this.dropdownPanel.visible$;
        const hover$ = merge(menuVisible$, this.hover$).pipe(
            debounceTime(100)
        );
        const handdleEventTrigger$ = iif(() => this.trigger === 'click', this.click$, hover$);

        handdleEventTrigger$
            .pipe(takeUntil(this._destroyService))
            .subscribe(
                (value) => {
                    if (value) {
                        this.openDropdown();
                        return;
                    }
                    this.destroyDropdown();
                }
            )
    }


    public toggleDropdown() {
        this.isOpenDropdown ? this.destroyDropdown() : this.openDropdown();
    }

    private openDropdown() {
        if (this.isOpenDropdown) {
            return;
        }
        this.isOpenDropdown = true;

        this.overlayRef = this._overlay.create(this.overlayConfig);

        this.overlayRef.attach(new TemplatePortal(
            this.dropdownPanel.templateRef,
            this._viewContainerRef
        ));

        // Listen Event Closing
        this.onClosingDropdown()
            .subscribe(
                () => this.destroyDropdown()
            );
    }

    private destroyDropdown() {
        if (!this.overlayRef || !this.isOpenDropdown) {
            return;
        }

        this.dropdownClosingActions$.unsubscribe();
        this.isOpenDropdown = false;
        this.overlayRef.detach();
    }

    private onClosingDropdown() {
        const backdropClick$ = this.overlayRef.backdropClick(); // ? clickoutside 
        const detachment$ = this.overlayRef.detachments();
        const dropdownClosed$ = this.dropdownPanel.closed;   // ? dropdown emit close

        return merge(backdropClick$, detachment$, dropdownClosed$);
    }

    ngOnDestroy(): void {
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }
    }
}