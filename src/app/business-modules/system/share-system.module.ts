import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";


import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { CommonComponentModule } from "src/app/shared/common/common.module";
import { DirectiveModule } from "src/app/shared/directives/directive.module";
import { PipeModule } from "src/app/shared/pipes/pipe.module";

import { ShareSystemAddUserComponent } from "./components/add-user/add-user.component";
import { ShareSystemDetailPermissionComponent } from "./components/permission/permission-detail.component";
import { PermissionFormCreateComponent } from "./permission/components/form-create-permission/form-create-permission.component";
import { reducers, shareSystemEffects } from "./store";
import { ShareSystemAddEmailComponent } from "./components/add-email/add-email.component";

import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';


const COMPONENTS = [
    ShareSystemAddUserComponent,
    ShareSystemDetailPermissionComponent,
    PermissionFormCreateComponent,
    ShareSystemAddEmailComponent,

]
@NgModule({
    declarations: [
        ...COMPONENTS
    ],
    imports: [
        CommonModule,
        CommonComponentModule,
        FormsModule,
        ReactiveFormsModule,
        DirectiveModule,
        PipeModule,
        TabsModule.forRoot(),
        CollapseModule.forRoot(),
        ModalModule.forRoot(),
        NgSelectModule,


        // * STORE
        StoreModule.forFeature('share-system', reducers),
        EffectsModule.forFeature(shareSystemEffects),

    ],
    exports: [
        ...COMPONENTS
    ],
    providers: [],
})

export class ShareSystemModule {}