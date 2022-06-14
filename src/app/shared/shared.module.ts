import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CommonComponentModule } from "./common/common.module";
import { DirectiveModule } from "./directives/directive.module";
import { PipeModule } from "./pipes/pipe.module";

const APP_MODULES = [
  DirectiveModule,
  CommonComponentModule,
  PipeModule,
  CommonModule,
  FormsModule,
  ReactiveFormsModule
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ...APP_MODULES
  ],
  declarations: [
  ],
  exports: [
    ...APP_MODULES
  ],
  providers: [

  ]
})
export class SharedModule { }
