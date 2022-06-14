import { Component, Output, EventEmitter } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { CatalogueRepo, SystemRepo, OperationRepo } from 'src/app/shared/repositories';
import { catchError, map } from 'rxjs/operators';
import { User } from 'src/app/shared/models';
import { DataService } from 'src/app/shared/services';
import { SystemConstants } from 'src/constants/system.const';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'share-asign-stage-popup',
    templateUrl: './assign-stage.popup.html',
})
export class ShareBusinessAssignStagePopupComponent extends PopupBase {

    @Output() onAssign: EventEmitter<any> = new EventEmitter<any>();

    formAssignStage: FormGroup;

    configStage: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [
            { field: 'code', label: 'Stage Code' },
            { field: 'stageNameEn', label: 'Stage Name' },
        ],
        dataSource: [],
        selectedDisplayFields: ['stageNameEn'],
    };
    selectedStage: Partial<CommonInterface.IComboGridData> = {};
    selectedStageData: any;

    configUser: CommonInterface.IComboGirdConfig = {
        placeholder: 'Please select',
        displayFields: [
            { field: 'username', label: 'User Name' },
            { field: 'employeeNameVn', label: 'Full Name' },
        ],
        dataSource: [],
        selectedDisplayFields: ['username'],
    };
    selectedUser: Partial<CommonInterface.IComboGridData> = {};
    selectedUserData: any;



    users: User[] = [];
    // selectedUser: any = null;

    description: string = '';

    isSubmitted: boolean = false;
    jobId: string = '';
    isAsignment: boolean = false;

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _dataService: DataService,
        private _sysRepo: SystemRepo,
        private _operationRepo: OperationRepo,
        private _toastService: ToastrService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.getStage();
        this.getListUser();

    }

    getStage() {
        this._catalogueRepo.getStage({ active: true })
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    this.configStage.dataSource = res;
                },
                () => { }
            );
    }

    getListUser() {
        if (!!this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER)) {
            this.users = this._dataService.getDataByKey(SystemConstants.CSTORAGE.SYSTEM_USER) || [];
            // this.users = <any>this.utility.prepareNg2SelectData(this.users, 'id', 'username');

        } else {
            this._sysRepo.getListSystemUser()
                .pipe(
                    catchError(this.catchError),
                    map((data: any[]) => data.map((item: any) => new User(item))),
                )
                .subscribe(
                    (data: any) => {
                        // this.users = data || [];

                        // this.users = <any>this.utility.prepareNg2SelectData(this.users, 'id', 'username');
                        this.configUser.dataSource = data || [];
                    },
                );
        }
    }

    assignStage() {
        this.isSubmitted = true;
        if (!this.selectedUser.value || !this.selectedStage.value) {
            return;
        }
        const body: IAssignStage = {
            id: "00000000-0000-0000-0000-000000000000",
            jobId: this.jobId,
            stageId: this.selectedStageData.id,
            mainPersonInCharge: this.selectedUserData.id,
            description: this.description
        };
        this._operationRepo.assignStageOPS(body).pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.onAssign.emit(this.selectedStageData.jobId);
                        this.closePopup();
                    } else {
                        this._toastService.warning(res.message);
                    }
                },
            );
    }

    removeStage() {
        this.selectedStage = {};
    }

    removeUser() {
        this.selectedUser = {};
    }

    onSelectStage(stage: any) {
        this.selectedStageData = stage;
        this.selectedStage = { field: 'stageNameEn', value: stage.stageNameEn };
    }

    onSelectUser(user: any) {
        this.selectedUserData = user;
        this.selectedUser = { field: 'username', value: user.username };
    }


    closePopup() {
        this.hide();

        // * Reset value
        this.description = '';
        // this.selectedUser = null;
        this.selectedStage = {};
        this.selectedUser = {};
        this.isSubmitted = false;
    }
}

interface IAssignStage {
    id: string;
    jobId: string;
    stageId: number;
    mainPersonInCharge: string;
    description: string;
}
