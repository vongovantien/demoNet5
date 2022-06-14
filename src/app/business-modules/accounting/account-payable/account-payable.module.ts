import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routing: Routes = [
    {
        path: "",
        data: { name: "" },
        children: [
            {
                path: '', redirectTo: 'customer'
            },
            {
                path: '', loadChildren: () => import('./account-payable-detail/account-payable-detail.module').then(m => m.AccountPayableModule),
                data: { name: 'AP Detail', title: 'eFMS AP Detail' }
            },
        ]
    },
];


@NgModule({
    declarations: [
    ],
    imports: [
        RouterModule.forChild(routing)
    ],
    exports: [],
    providers: [],
})
export class AccountPayableModule { }
