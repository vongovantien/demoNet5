import { NgModule } from '@angular/core';

import { DocumentationRoutingModule } from './documentation-routing.module';
import { InlandTruckingComponent } from './inland-trucking/inland-trucking.component';
@NgModule({
  imports: [
    DocumentationRoutingModule,
  ],
  declarations: [
    InlandTruckingComponent,
  ]
})
export class DocumentationModule { }
