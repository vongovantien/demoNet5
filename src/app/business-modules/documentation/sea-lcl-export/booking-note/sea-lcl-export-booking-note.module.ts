import { NgModule } from '@angular/core';
import { SeaLCLExportBookingNoteComponent } from './sea-lcl-export-booking-note.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { Routes, RouterModule } from '@angular/router';
import { SeaLCLExportBookingNoteDetailComponent } from './detail/detail-booking-note-lcl-export.component';
import { SeaLCLExportBookingNoteCreateComponent } from './create/create-booking-note-lcl-export.component';
import { SeaLCLExportFormBookingNoteComponent } from './components/form-booking-note-lcl-export.component';
import { NgxDaterangepickerMd, LocaleConfig } from 'ngx-daterangepicker-material';
import { FroalaEditorModule } from 'angular-froala-wysiwyg';
import { SeaLCLExportBookingNoteFormSearchComponent } from './components/form-search-booking-note/form-search-booking-note.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgSelectModule } from '@ng-select/ng-select';

const routing: Routes = [
    {
        path: '', component: SeaLCLExportBookingNoteComponent, data: { name: '' }
    },
    {
        path: 'new', component: SeaLCLExportBookingNoteCreateComponent,
        data: { name: 'Add New', }
    },
    {
        path: ':bookingNoteId', component: SeaLCLExportBookingNoteDetailComponent,
        data: { name: 'View/Edit Booking Note', }
    }
];

const config: LocaleConfig = {
    format: 'DD/MM/YYYY',
};

@NgModule({
    imports: [
        SharedModule,
        PaginationModule.forRoot(),
        RouterModule.forChild(routing),
        NgxDaterangepickerMd.forRoot(config),
        FroalaEditorModule.forRoot(),
        NgSelectModule,
    ],
    exports: [],
    declarations: [
        SeaLCLExportBookingNoteComponent,
        SeaLCLExportBookingNoteCreateComponent,
        SeaLCLExportBookingNoteDetailComponent,
        SeaLCLExportFormBookingNoteComponent,
        SeaLCLExportBookingNoteFormSearchComponent
    ],
    providers: [],
})
export class SeaLCLExportBookingNoteModule { }
