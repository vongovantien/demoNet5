import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FroalaEditorModule } from 'angular-froala-wysiwyg';
import { NgxDaterangepickerMd, LocaleConfig } from 'ngx-daterangepicker-material';
import { RouterModule, Routes } from '@angular/router';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/shared/shared.module';
import { ChartOfAccountsComponent } from './chart-of-accounts.component';
import { FormSearchChartOfAccountsComponent } from './components/form-search-chart-of-accounts/form-search-chart-of-accounts.component';
import { FormCreateChartOfAccountsPopupComponent } from './components/form-create-chart-of-accounts/form-create-chart-of-accounts.popup';
import { ChartOfAccountsImportComponent } from './chart-of-accounts-import/chart-of-accounts-import.component';


const routing: Routes = [
    {
        path: '', component: ChartOfAccountsComponent
        , data: { name: '' }
    },
    {

        path: 'import', component: ChartOfAccountsImportComponent, data: { name: "Import" }
    },
    {

    }
];


const config: LocaleConfig = {
    format: 'MM/DD/YYYY',
};

@NgModule({
    imports: [
        SharedModule,
        PaginationModule.forRoot(),
        RouterModule.forChild(routing),
        NgxDaterangepickerMd.forRoot(config),
        FroalaEditorModule.forRoot(),
        ReactiveFormsModule,
        ModalModule.forRoot(),

    ],
    exports: [],
    declarations: [
        FormSearchChartOfAccountsComponent,
        FormCreateChartOfAccountsPopupComponent,
        ChartOfAccountsComponent,
        ChartOfAccountsImportComponent
    ],
    providers: [],
})
export class ChartOfAccountsModule { }