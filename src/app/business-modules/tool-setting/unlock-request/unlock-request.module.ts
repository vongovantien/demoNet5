import { UnlockRequestComponent } from "./unlock-request.component";
import { Route, RouterModule } from "@angular/router";
import { NgxDaterangepickerMd } from "ngx-daterangepicker-material";

import { ModalModule } from "ngx-bootstrap/modal";
import { PaginationModule } from "ngx-bootstrap/pagination";

import { SharedModule } from "src/app/shared/shared.module";
import { NgModule } from "@angular/core";
import { UnlockRequestFormSearchComponent } from "./components/form-search-unlock-request/form-search-unlock-request.component";
import { UnlockRequestAddNewComponent } from "./add/add-unlock-request.component";
import { UnlockRequestDetailComponent } from "./detail/detail-unlock-request.component";
import { FroalaEditorModule } from "angular-froala-wysiwyg";
import { UnlockRequestListJobComponent } from "./components/list-job-unlock-request/list-job-unlock-request.component";
import { UnlockRequestInfoDeniedCommentPopupComponent } from "./components/popup/info-denied-comment/info-denied-comment.popup";
import { UnlockRequestInputDeniedCommentPopupComponent } from "./components/popup/input-denied-comment/input-denied-comment.popup";
import { UnlockRequestInputSearchJobPopupComponent } from "./components/popup/input-search-job/input-search-job.popup";
import { UnlockRequestInputSearchSettlementAdvancePopupComponent } from "./components/popup/input-search-settlement-advance/input-search-settlement-advance.popup";
import { UnlockRequestProcessApproveComponent } from "./components/process-approve-unlock-request/process-approve-unlock-request.component";
import { NgSelectModule } from "@ng-select/ng-select";

const routing: Route[] = [
    {
        path: '', data: { name: "" },
        children: [
            {
                path: '', component: UnlockRequestComponent
            },
            {
                path: "new", component: UnlockRequestAddNewComponent,
                data: { name: "New", }
            },
            {
                path: ":id", component: UnlockRequestDetailComponent,
                data: { name: "Detail", }
            }
        ]
    }
];


@NgModule({
    imports: [
        RouterModule.forChild(routing),
        SharedModule,
        NgSelectModule,
        NgxDaterangepickerMd,
        ModalModule.forRoot(),
        PaginationModule.forRoot(),
        FroalaEditorModule.forRoot(),
    ],
    exports: [],
    declarations: [
        UnlockRequestComponent,
        UnlockRequestFormSearchComponent,
        UnlockRequestAddNewComponent,
        UnlockRequestDetailComponent,
        UnlockRequestListJobComponent,
        UnlockRequestInfoDeniedCommentPopupComponent,
        UnlockRequestInputDeniedCommentPopupComponent,
        UnlockRequestInputSearchJobPopupComponent,
        UnlockRequestInputSearchSettlementAdvancePopupComponent,
        UnlockRequestProcessApproveComponent
    ],
    providers: [],
})
export class UnlockRequestModule { }