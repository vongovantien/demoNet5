import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubHeaderComponent, InputTableLayoutComponent, BreadcrumbComponent, DefaultButtonComponent, SearchOptionsComponent, ReportPreviewComponent, ComboGridVirtualScrollComponent, AppMultipleSelectComponent, TableNoneRecordComponent, TableHeaderComponent, TableRowLoadingComponent, TableCollapseRowComponent, AppTableComponent, AppComboGridComponent, SwitchToggleComponent, TableBodyComponent, AppPermissionButtonComponent, AppComboGridIconComponent, NoneRecordPlaceholderComponent, AppDropdownComponent, AppContextMenuComponent } from '.';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { ConfirmPopupComponent, InfoPopupComponent, Permission403PopupComponent } from './popup';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DirectiveModule } from '../directives/directive.module';
import { FormsModule } from '@angular/forms';
import { AppPaginationComponent } from './pagination/pagination.component';
import { TableCellComponent } from './table-cell/table-cell.component';
import { PipeModule } from '../pipes/pipe.module';
import { RouterModule } from '@angular/router';
import { AppCombogridItemComponent } from './combo-grid-virtual-scroll/combogrid-item/combo-grid-item.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { LoadingPopupComponent } from './popup/loading/loading.popup';
const COMPONENTS = [
    SubHeaderComponent,
    InputTableLayoutComponent,
    BreadcrumbComponent,
    DefaultButtonComponent,
    AppPaginationComponent,
    SearchOptionsComponent,
    ReportPreviewComponent,
    ComboGridVirtualScrollComponent,
    AppMultipleSelectComponent,
    TableNoneRecordComponent,
    TableHeaderComponent,
    TableRowLoadingComponent,
    TableCollapseRowComponent,
    AppTableComponent,
    AppComboGridComponent,
    SwitchToggleComponent,
    TableBodyComponent,
    ConfirmPopupComponent,
    InfoPopupComponent,
    TableCellComponent,
    AppPermissionButtonComponent,
    Permission403PopupComponent,
    AppComboGridIconComponent,
    AppCombogridItemComponent,
    NoneRecordPlaceholderComponent,
    AppDropdownComponent,
    LoadingPopupComponent,
    AppContextMenuComponent
];

@NgModule({
    declarations: [
        ...COMPONENTS
    ],
    imports: [
        RouterModule,
        CommonModule,
        ModalModule,
        ScrollingModule,
        PaginationModule.forRoot(),
        CollapseModule,
        FormsModule,
        DirectiveModule,
        PipeModule,
        TooltipModule.forRoot(),
        BsDropdownModule.forRoot()
    ],
    exports: [
        ...COMPONENTS
    ],
    providers: [],
})
export class CommonComponentModule {

}
