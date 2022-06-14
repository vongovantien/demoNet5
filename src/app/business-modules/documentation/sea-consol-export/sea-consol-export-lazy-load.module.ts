import { NgModule } from "@angular/core";
import { LAZY_MODULES_MAP, ILazyModules } from "src/app/load-module-map";

export const lazyModulesConsolExportMap: ILazyModules = {
    SeaConsolExport_cdNote: () => import('./detail-job/cd-note/sea-consol-export-cd-note.module').then(m => m.SeaConsolExportCDNoteModule),
    SeaConsolExport_assignment: () => import('./detail-job/assignment/sea-consol-export-assigment.module').then(m => m.SeaConsolExportAssignmentModule),
    Share_advanceSettle: () => import('../../share-business/components/advance-settle/share-advance-settle.module').then(m => m.ShareAdvanceSettleModule),
    SeaExport_attachFile: () => import('./detail-job/attach-file/sea-export-attach-file.module').then(m => m.SeaExportAttachFilesModule),
};

@NgModule({
    providers: [
        {
            provide: LAZY_MODULES_MAP,
            useFactory: () => lazyModulesConsolExportMap
        }
    ]
})
export class SeaConsolExportLazyLoadModule { }