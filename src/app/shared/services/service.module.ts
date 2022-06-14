import { NgModule, Optional, SkipSelf } from '@angular/core';

import { PreviousRouteService, JwtService, SortService, ApiService, PagingService, DataService, SEOService } from '@services';
import { SignalRService } from './signalr.service';
@NgModule({
    declarations: [],
    imports: [
    ],
    exports: [],
    providers: [
        SortService,
        ApiService,
        PagingService,
        DataService,
        PreviousRouteService,
        JwtService,
        SEOService,
        SignalRService
    ],
})
export class ServiceModule {
    constructor(@Optional() @SkipSelf() parentModule: ServiceModule) {
        if (parentModule) {
            throw new Error('ServiceModule is already loaded. Import it in the AppModule only');
        }
    }
}
