import { NgModule } from "@angular/core";
import { LAZY_MODULES_MAP, ILazyModules } from "src/app/load-module-map";

export const lazyModulesFClMap: ILazyModules = {
    SeaFCLExport_cdNote: () => import('./detail-job/cd-note/sea-fcl-export-cd-note.module').then(m => m.SeaFCLExportCDNoteModule),
    SeaFCLExport_assignment: () => import('./detail-job/assignment/sea-fcl-export-assigment.module').then(m => m.SeaFCLExportAssignmentModule),
    Share_advanceSettle: () => import('../../share-business/components/advance-settle/share-advance-settle.module').then(m => m.ShareAdvanceSettleModule),
    SeaFclExport_attachFile: () => import('./detail-job/attach-file/sea-fcl-export-attach-file.module').then(m => m.SeaFclExportAttachFilesModule)
};

@NgModule({
    providers: [
        {
            provide: LAZY_MODULES_MAP,
            useFactory: () => lazyModulesFClMap
        }
    ]
})
export class SeaFCLExportLazyLoadModule { }