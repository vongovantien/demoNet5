import { InjectionToken, NgModuleFactory } from '@angular/core';

export type LoadChildrenCallback<T = any> = () => Promise<NgModuleFactory<T>> | T;

export interface ILazyModules {
    [modulename: string]: LoadChildrenCallback;
}

export const LAZY_MODULES_MAP = new InjectionToken('LAZY_MODULES_MAP');
