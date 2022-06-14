import { Injectable, NgModuleRef, NgModuleFactory } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ILazyModules } from 'src/app/load-module-map';

type SetStateArgs<T> = T | ((prev: T) => T);

type LazyModuleRefsMap = {
    [key in keyof ILazyModules]?: {
        moduleRef: NgModuleRef<any>;
        moduleFactory: NgModuleFactory<any>;
    };
};

@Injectable({ providedIn: 'root' })
export class LoadModuleService {
    private _moduleRefsSub: BehaviorSubject<LazyModuleRefsMap> = new BehaviorSubject<LazyModuleRefsMap>({});

    get moduleRefs(): LazyModuleRefsMap {
        return this._moduleRefsSub.value;
    }

    updateModuleRefs(arg: SetStateArgs<LazyModuleRefsMap>) {
        if (typeof arg === 'function') {
            this._moduleRefsSub.next(arg(this.moduleRefs));
        } else {
            this._moduleRefsSub.next(arg);
        }
    }

    destroy(moduleName: keyof ILazyModules): void {
        // tslint:disable-next-line: no-unused-expression
        this.moduleRefs[moduleName] && this.moduleRefs[moduleName].moduleRef.destroy();
        this.updateModuleRefs(prev => ({ ...prev, [moduleName]: null }));
    }

    destroyBulk(...moduleNames: Array<keyof ILazyModules>): void {
        for (const moduleName of moduleNames) {
            this.destroy(moduleName);

        }
    }
}

