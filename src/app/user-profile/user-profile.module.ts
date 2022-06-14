import { NgModule } from '@angular/core';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { UserProfilePageComponent } from './user-profile.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

const routing: Routes = [
    {
        path: ':id',
        component: UserProfilePageComponent,
        data: { name: '' },
    },

];


@NgModule({
    declarations: [
        UserProfilePageComponent,
    ],
    imports: [
        TabsModule.forRoot(),
        RouterModule.forChild(routing),
        SharedModule,
        FroalaEditorModule.forRoot(),
        FroalaViewModule.forRoot(),
    ],
    exports: [],
    providers: [],
})
export class UserProfileModule { }
