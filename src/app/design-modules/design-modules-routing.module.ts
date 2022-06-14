import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormComponent } from './form/form.component';
import { TableComponent } from './table/table.component';

const routes: Routes = [
  {
    path:'form',
    component:FormComponent
  },
  {
    path:'table',
    component:TableComponent
  },
  {
    path:'',
    redirectTo:'form',
    pathMatch:'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DesignModulesRoutingModule { }
