import { NgModule } from "@angular/core";
import { LAZY_MODULES_MAP, ILazyModules } from "src/app/load-module-map";

export const lazyModulesFClMap: ILazyModules = {
    AirImport_cdNote: () => import('./detail-job/cd-note/air-import-cd-note.module').then(m => m.AirImportCDNoteModule),
    AirImport_assignment: () => import('./detail-job/assignment/air-import-assigment.module').then(m => m.AirImportAssignmentModule),
    AirImport_attachFile: () => import('./detail-job/attach-file/air-import-attach-file.module').then(m => m.AirImportAttachFilesModule),
    Share_advanceSettle: () => import('../../share-business/components/advance-settle/share-advance-settle.module').then(m => m.ShareAdvanceSettleModule)
};

@NgModule({
    providers: [
        {
            provide: LAZY_MODULES_MAP,
            useFactory: () => lazyModulesFClMap
        }
    ]
})
export class AirImportLazyLoadModule { }
