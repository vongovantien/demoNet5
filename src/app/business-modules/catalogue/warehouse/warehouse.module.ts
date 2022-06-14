import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgProgressModule } from '@ngx-progressbar/core';

import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { SharedModule } from 'src/app/shared/shared.module';

import { WarehouseComponent } from './warehouse.component';
import { WarehouseImportComponent } from './warehouse-import/warehouse-import.component';
import { FormWarehouseComponent } from './components/form-warehouse.component';
import { NgSelectModule } from '@ng-select/ng-select';


const routing: Routes = [
    {
        path: '', data: { name: "", title: 'eFMS Warehouse' }, children: [
            {
                path: '', component: WarehouseComponent,
            },
            { path: 'import', component: WarehouseImportComponent, data: { name: "Import", level: 3 } },
        ]
    },

];
@NgModule({
    imports: [
        RouterModule.forChild(routing),
        SharedModule,
        NgProgressModule,
        NgSelectModule,
        ModalModule.forRoot(),
        PaginationModule.forRoot(),

    ],
    declarations: [
        WarehouseComponent,
        WarehouseImportComponent,
        FormWarehouseComponent
    ],
    exports: [],
    bootstrap: [],
    providers: [],
})
export class WareHouseModule {
}
