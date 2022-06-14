import { NgModule } from "@angular/core";
import { LAZY_MODULES_MAP, ILazyModules } from "src/app/load-module-map";

export const lazyModulesJobEditMap: ILazyModules = {
    // cd: () => import('./custom-declaration/custom-declaration.module').then(m => m.CustomDeclarationModule),
    // cdNote: () => import('./cd-note/ops-cd-note.module').then(m => m.OpsCDNoteModule),
    // stageManagement: () => import('./stage-management/stage-management.module').then(m => m.StateManagmentModule),
    Share_advanceSettle: () => import('../../share-business/components/advance-settle/share-advance-settle.module').then(m => m.ShareAdvanceSettleModule)

};

@NgModule({
    providers: [
        {
            provide: LAZY_MODULES_MAP,
            useFactory: () => lazyModulesJobEditMap
        }
    ]
})
export class JobEditLazyLoadComponentModule { }
