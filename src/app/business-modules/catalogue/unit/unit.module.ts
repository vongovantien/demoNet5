import { NgModule } from '@angular/core';

import { NgProgressModule } from '@ngx-progressbar/core';

import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { UnitComponent } from './unit.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormCreateUnitPopupComponent } from './components/form/form-unit.popup';
import { NgSelectModule } from '@ng-select/ng-select';

const routing: Routes = [
    { path: '', component: UnitComponent, data: { name: "", title: 'eFMS Unit' } },
];

@NgModule({
    imports: [
        PaginationModule.forRoot(),
        ModalModule.forRoot(),
        SharedModule,
        NgSelectModule,
        NgProgressModule,
        RouterModule.forChild(routing)
    ],
    exports: [],
    declarations: [
        UnitComponent,
        FormCreateUnitPopupComponent
    ],
    providers: [],
})
export class UnitModule { }
