import { NgModule } from "@angular/core";
import { OperationRoutingModule } from "./operation-routing.module";
import { TruckingAssignmentComponent } from "./trucking-assignment/trucking-assignment.component";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { effects, reducers } from "./store";

@NgModule({
    imports: [
        OperationRoutingModule,
        StoreModule.forFeature('operations', reducers),
        EffectsModule.forFeature(effects),
    ],
    declarations: [
        TruckingAssignmentComponent,
    ]
})
export class OperationModule { }
