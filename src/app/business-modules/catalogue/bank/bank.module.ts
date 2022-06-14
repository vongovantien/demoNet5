import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgProgressModule } from '@ngx-progressbar/core';

import { BankComponent } from './bank.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormCreateBankPopupComponent } from './components/form-create/form-create-bank.popup';
import { BankImportComponent } from './import/bank-import.component';

const routing: Routes = [
    { path: '', component: BankComponent, data: { name: "", title: 'eFMS Bank' } },
    { path: 'import', component: BankImportComponent, data: { name: "Import" } }
];

@NgModule({
    imports: [
        SharedModule,
        ModalModule.forRoot(),
        NgProgressModule,
        PaginationModule.forRoot(),
        RouterModule.forChild(routing)
    ],
    exports: [],
    declarations: [
        BankComponent,
        FormCreateBankPopupComponent,
        BankImportComponent
    ],
    providers: [],
})
export class BankModule { }
