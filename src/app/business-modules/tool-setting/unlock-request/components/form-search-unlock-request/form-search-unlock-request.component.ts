import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { AppForm } from "src/app/app.form";
import { FormBuilder, FormGroup, AbstractControl } from "@angular/forms";
import { SystemRepo } from "@repositories";
import { formatDate } from "@angular/common";
import { UnlockRequestCriteria, User } from "@models";
import { CommonEnum } from "@enums";
import { SystemConstants } from "@constants";
import { Observable } from "rxjs";

@Component({
    selector: 'form-search-unlock-request',
    templateUrl: './form-search-unlock-request.component.html'
})

export class UnlockRequestFormSearchComponent extends AppForm implements OnInit {
    @Output() onSearch: EventEmitter<UnlockRequestCriteria> = new EventEmitter<UnlockRequestCriteria>();

    formSearch: FormGroup;
    referenceNo: AbstractControl;
    unlockType: AbstractControl;
    requester: AbstractControl;
    createdDate: AbstractControl;
    unlockStatus: AbstractControl;

    requesterList: Observable<any[]>;

    displayFieldsRequester: CommonInterface.IComboGridDisplayField[] = [
        { field: 'username', label: 'User Name' },
        { field: 'employeeNameVn', label: 'Full Name' }
    ];

    unlockTypeList: string[] = ['Shipment', 'Advance', 'Settlement', 'Change Service Date'];
    unlockStatusList: string[] = ['New', 'Request Approval', 'Leader Approved', 'Manager Approved', 'Accountant Approved', 'Denied', 'Done'];

    userLogged: User;

    constructor(
        private _systemRepo: SystemRepo,
        private _fb: FormBuilder,
    ) {
        super();
    }

    ngOnInit() {
        this.requesterList = this._systemRepo.getSystemUsers({ active: true });
        this.initFormSearch();
        this.getUserLogged();
    }

    initFormSearch() {
        this.formSearch = this._fb.group({
            referenceNo: [],
            unlockType: [],
            requester: [],
            createdDate: [],
            unlockStatus: []
        });
        this.referenceNo = this.formSearch.controls['referenceNo'];
        this.unlockType = this.formSearch.controls['unlockType'];
        this.requester = this.formSearch.controls['requester'];
        this.createdDate = this.formSearch.controls['createdDate'];
        this.unlockStatus = this.formSearch.controls['unlockStatus'];
    }

    getUserLogged() {
        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
    }

    onSubmit() {
        let _unlockTypeEnum = 0;
        switch (this.unlockType.value) {
            case "Shipment":
                _unlockTypeEnum = CommonEnum.UnlockTypeEnum.SHIPMENT;
                break;
            case "Advance":
                _unlockTypeEnum = CommonEnum.UnlockTypeEnum.ADVANCE;
                break;
            case "Settlement":
                _unlockTypeEnum = CommonEnum.UnlockTypeEnum.SETTEMENT;
                break;
            case "Change Service Date":
                _unlockTypeEnum = CommonEnum.UnlockTypeEnum.CHANGESERVICEDATE;
                break;
            default:
                break;
        }
        const body: UnlockRequestCriteria = {
            referenceNos: !!this.referenceNo.value ? this.referenceNo.value.trim().replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim()) : null,
            unlockTypeNum: _unlockTypeEnum,
            requester: this.requester.value ? this.requester.value : this.userLogged.id,
            createdDate: this.createdDate.value ? (this.createdDate.value.startDate !== null ? formatDate(this.createdDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
            statusApproval: this.unlockStatus.value,
        };
        this.onSearch.emit(body);
    }

    search() {
        this.onSubmit();
    }

    reset() {
        this.formSearch.reset();
        // tslint:disable-next-line: no-any
        this.onSearch.emit(<any>{ requester: this.userLogged.id });
    }
}
