import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SystemRoutingModule } from './system-routing.module';
import { RoleComponent } from './role/role.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  imports: [
    SystemRoutingModule,
    SharedModule
  ],
  declarations: [RoleComponent]
})
export class SystemModule { }
