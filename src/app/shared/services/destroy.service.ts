import { Subject } from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';

@Injectable()
export class DestroyService extends Subject<void> implements OnDestroy {
    ngOnDestroy() {
        console.log("on destroy from service");
        this.next();
        this.complete();
    }

}