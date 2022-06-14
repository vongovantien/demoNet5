import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { environment } from "src/environments/environment";

export function delayTime(milliseconds: number = 0) {
    return function (_target: any, _key: any, descriptor: any) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            setTimeout(() => {
                originalMethod.apply(this, args);
            }, milliseconds);
        };
        return descriptor;
    };
}

export function log$(target: any, propertyKey: string) {
    let propertyValue;

    function getter() {
        return propertyValue;
    }

    function setter(value: any) {
        if (value instanceof Observable) {
            propertyValue = value.pipe(
                tap((res) => {
                    const isArrayOfObjects = Array.isArray(res) && typeof res[0] === 'object';
                    const logType = isArrayOfObjects ? 'table' : 'log';
                    console.groupCollapsed(propertyKey);
                    console[logType](res);
                    console.groupEnd();
                    return res;
                })
            );
        } else {
            propertyValue = value;
        }
    }

    Object.defineProperty(target, propertyKey, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    });
}

export function NgLog(): ClassDecorator {
    return function (constructor: any) {
        if (!environment.production) {
            const LIFECYCLE_HOOKS = [
                'ngOnInit',
                'ngOnChanges',
                'ngOnDestroy'
            ];
            const component = constructor.name;

            LIFECYCLE_HOOKS.forEach(hook => {
                const original = constructor.prototype[hook];

                constructor.prototype[hook] = function (...args) {
                    console.log(`%c ${component} - ${hook}`, `color: #4CAF50; font-weight: bold`, ...args);
                    // tslint:disable-next-line: no-unused-expression
                    (original && original.apply(this, args));
                };
            });
        }
    };
}

export function Controller(strCtrlName?: string) {
    return (target: any) => {
        let ctrl = target.prototype.constructor.name;
        if (strCtrlName != null) {
            ctrl = strCtrlName;
        }
        Object.defineProperty(target.prototype, 'CONTROLLER', { value: ctrl, writable: false });
    };
}

export function Key(target: any, key: string) {
    if (!target.constructor.prototype.hasOwnProperty('KEYS')) {
        Object.defineProperty(target, 'KEYS', { value: new Array<string>() });
    }

    const keys: Array<string> = target.constructor.prototype.KEYS;
    keys.push(key);
}

