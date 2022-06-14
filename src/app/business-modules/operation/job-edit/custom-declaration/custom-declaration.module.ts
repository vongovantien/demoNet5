import { NgModule } from '@angular/core';
import { BillingCustomDeclarationComponent } from './billing-custom-declaration.component';

import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddMoreModalComponent } from './add-more-modal/add-more-modal.component';
import { SearchMultipleComponent } from './components/search-multiple/search-multiple.component';


const LIB = [
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
];

@NgModule({
    declarations: [
        BillingCustomDeclarationComponent,
        AddMoreModalComponent,
        SearchMultipleComponent,
    ],
    imports: [
        SharedModule,
        ...LIB
    ],
    exports: [],
    providers: [],
    entryComponents: [
        BillingCustomDeclarationComponent
    ]
})
export class CustomDeclarationModule {
    static rootComponent = BillingCustomDeclarationComponent;
}