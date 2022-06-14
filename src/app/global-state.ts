import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class GlobalState implements OnDestroy {

    ngUnsub: Subject<any> = new Subject<any>();

    public _data = new BehaviorSubject<Object>({ event: 'default', data: null });

    public _dataStream$ = this._data.asObservable();

    public _subscriptions: Map<string, Function[]> = new Map<string, Function[]>();

    constructor() {
        this._dataStream$.pipe(takeUntil(this.ngUnsub)).subscribe((data: any) => this._onEvent(data));
    }

    notifyDataChanged(event: string | number, value: any) {

        const current = this._data[event];
        if (current !== value) {
            this._data[event] = value;

            this._data.next({
                event,
                data: this._data[event],
            });
        }
    }

    subscribe(event: string, callback: Function): any {
        let subscribers = this._subscriptions.get(event) || [];
        subscribers = [];
        subscribers.push(callback);
        return this._subscriptions.set(event, subscribers);
    }

    _onEvent(data: any) {
        const subscribers = this._subscriptions.get(data['event']) || [];
        subscribers.forEach((callback) => {
            callback.call(null, data['data']);
        });
    }

    getCurrentData(event: string) {
        return this._data[event] || null;
    }


    ngOnDestroy(): void {
        this.ngUnsub.next();
        this.ngUnsub.complete();
    }
}

