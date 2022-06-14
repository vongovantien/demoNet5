import { Component } from "@angular/core";
import { AppList } from "src/app/app.list";
import { Router } from "@angular/router";
import { NgProgress } from "@ngx-progressbar/core";
import { ToastrService } from "ngx-toastr";
import { SortService } from "@services";
import { SettingRepo, ExportRepo } from "@repositories";
import { UnlockRequestResult, User } from "@models";
import { catchError, finalize, map } from "rxjs/operators";
import { RoutingConstants, SystemConstants } from "@constants";
import { HttpResponse } from "@angular/common/http";

@Component({
    selector: 'app-unlock-request',
    templateUrl: './unlock-request.component.html',
})
export class UnlockRequestComponent extends AppList {
    unlockRequests: UnlockRequestResult[] = [];
    userLogged: User;
    constructor(
        private _router: Router,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _sortService: SortService,
        private _settingRepo: SettingRepo,
        private _exportRepo: ExportRepo) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestList = this.searchUnlockRequest;
        this.requestSort = this.sortUnlockRequest;
    }

    ngOnInit() {
        this.headers = [
            { title: 'Subject', field: 'subject', sortable: true },
            { title: 'Request Date', field: 'requestDate', sortable: true },
            { title: 'Requester', field: 'requesterName', sortable: true },
            { title: 'Unlock Type', field: 'unlockType', sortable: true },
            { title: 'Status', field: 'statusApproval', sortable: true },
            { title: 'Created Date', field: 'datetimeCreated', sortable: true },
        ];
        this.getUserLogged();
        this.searchUnlockRequest();
    }

    onSearchUnlockRequest($event: any) {
        this.page = 1;
        this.dataSearch = $event;
        console.log($event);
        this.searchUnlockRequest();
    }

    searchUnlockRequest() {
        this._progressRef.start();
        this.isLoading = true;
        this._settingRepo.getListUnlockRequest(this.page, this.pageSize, this.dataSearch) // Object.assign({}, this.dataSearch)
            .pipe(
                catchError(this.catchError),
                finalize(() => {
                    this._progressRef.complete();
                    this.isLoading = false;
                }),
                map((data: CommonInterface.IResponsePaging) => {
                    return {
                        data: (data.data || []).map((item: UnlockRequestResult) => new UnlockRequestResult(item)),
                        totalItems: data.totalItems,
                    };
                })
            ).subscribe(
                (res: CommonInterface.IResponsePaging) => {
                    this.totalItems = res.totalItems || 0;
                    this.unlockRequests = res.data;
                },
            );
    }

    sortUnlockRequest(sort: string): void {
        this.unlockRequests = this._sortService.sort(this.unlockRequests, sort, this.order);
    }

    getUserLogged() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this.dataSearch = { requester: this.userLogged.id };
    }

    viewDetail(data: UnlockRequestResult): void {
        this._router.navigate([`${RoutingConstants.TOOL.UNLOCK_REQUEST}/${data.id}`]);
    }

    deleteUnlockRequest(id: string) {
        this._settingRepo.deleteUnlockRequest(id)
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.message) {
                        this._toastService.success(res.message);
                        this.searchUnlockRequest();
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    exportUnlockRequest() {
        this._progressRef.start();
        this._exportRepo.exportUnlockRequest(this.dataSearch)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (response: HttpResponse<any>) => {
                    if (response!=null) {
                        this.downLoadFile(response.body, SystemConstants.FILE_EXCEL, response.headers.get(SystemConstants.EFMS_FILE_NAME));
                    } else {
                        this._toastService.warning('Not found data to print', '');
                    }
                },
            );
    }
}