import { NgModule } from '@angular/core';
import { AssigmentComponent } from './assigment.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';


const routing: Routes = [
    {
        path: "", component: AssigmentComponent, pathMatch: 'full', data: { name: "", }
    },
];


@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routing),
    ],
    exports: [],
    declarations: [AssigmentComponent],
    providers: [],
})
export class AssignmentModule { }
