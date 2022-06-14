import { NgModule } from '@angular/core';
import { CommodityComponent } from './commodity.component';
import { Routes, RouterModule } from '@angular/router';
import { CommodityImportComponent } from '../commodity-import/commodity-import.component';
import { CommodityGroupImportComponent } from '../commodity-group-import/commodity-group-import.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgProgressModule } from '@ngx-progressbar/core';
import { CommodityAddPopupComponent } from './components/form-create-commodity/form-create-commodity.popup';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';

import { CommodityGroupAddPopupComponent } from './components/form-create-commodity-group/form-create-commodity-group.popup';
import { CommodityGroupListComponent } from './components/list-commodity-group/list-commodity-group.component';
import { NgSelectModule } from '@ng-select/ng-select';

const routing: Routes = [
    {
        path: '', data: { name: "", title: 'eFMS Commodity' },
        children: [
            {
                path: '', component: CommodityComponent
            },
            {
                path: 'commodity-import', component: CommodityImportComponent, data: { name: "Import" }
            },
            {
                path: 'commodity-group-import', component: CommodityGroupImportComponent, data: { name: "Group Import" }
            },
        ]
    },
];
@NgModule({
    imports: [
        SharedModule,
        NgSelectModule,
        NgProgressModule,
        RouterModule.forChild(routing),
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        TabsModule.forRoot(),
    ],
    exports: [],
    declarations: [
        CommodityComponent,
        CommodityImportComponent,
        CommodityGroupImportComponent,
        CommodityAddPopupComponent,
        CommodityGroupAddPopupComponent,
        CommodityGroupListComponent
    ],
    providers: [],
})
export class CommondityModule { }
