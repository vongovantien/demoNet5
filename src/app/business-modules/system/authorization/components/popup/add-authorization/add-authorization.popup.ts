import { PopupBase } from "src/app/popup.base";
import { Component, Output, EventEmitter, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder, AbstractControl, Validators } from "@angular/forms";
import { SystemRepo, CatalogueRepo } from "@repositories";
import { ToastrService } from "ngx-toastr";
import { catchError, distinctUntilChanged, map } from "rxjs/operators";
import { formatDate } from "@angular/common";
import { ConfirmPopupComponent } from "@common";
import { Authorization } from "@models";
import { Observable } from "rxjs";
@Component({
    selector: 'add-authorization-popup',
    templateUrl: './add-authorization.popup.html'
})

export class AuthorizationAddPopupComponent extends PopupBase {
    @Output() onRequestAuthorization: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('confirmUpdatePopup') confirmUpdatePopup: ConfirmPopupComponent;
    @ViewChild('confirmCancelPopup') confirmCancelPopup: ConfirmPopupComponent;
    @ViewChild('confirmChangeStatus') confirmChangeStatusPopup: ConfirmPopupComponent;

    formAuthorization: FormGroup;
    authorization: Authorization = new Authorization();
    authorizationToUpdate: Authorization = new Authorization();

    isSubmited: boolean = false;
    action: string = 'create';

    authorizationName: AbstractControl;
    personInCharge: AbstractControl;
    authorizedPerson: AbstractControl;
    authorizationService: AbstractControl;
    effectiveDate: AbstractControl;
    expirationDate: AbstractControl;
    authorizationNote: AbstractControl;
    authorizationActive: AbstractControl;


    minDateExpired: any = null;
    minDateEffective: any = null;

    datetimeCreated: string;
    userCreatedName: string;
    datetimeModified: string;
    userModifiedName: string;

    personInChargeList: Observable<any[]>;
    serviceList: Observable<CommonInterface.IValueDisplay[]>;

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _systemRepo: SystemRepo,
        private _toastService: ToastrService,) {
        super();
    }

    ngOnInit() {
        this.serviceList = this._catalogueRepo.getListService();
        this.personInChargeList = this._systemRepo.getSystemUsers({ active: true });
        this.initForm();
    }

    initForm() {
        this.formAuthorization = this._fb.group({
            authorizationName: ['',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(50)
                ])],
            personInCharge: [],
            authorizedPerson: [null, Validators.required],
            authorizationService: [null, Validators.required],
            effectiveDate: [null, Validators.required],
            expirationDate: [null],
            authorizationNote: [''],
            authorizationActive: []
        });

        this.authorizationName = this.formAuthorization.controls['authorizationName'];
        this.personInCharge = this.formAuthorization.controls['personInCharge'];
        this.authorizedPerson = this.formAuthorization.controls['authorizedPerson'];
        this.authorizationService = this.formAuthorization.controls['authorizationService'];
        this.effectiveDate = this.formAuthorization.controls['effectiveDate'];
        this.expirationDate = this.formAuthorization.controls['expirationDate'];
        this.authorizationNote = this.formAuthorization.controls['authorizationNote'];
        this.authorizationActive = this.formAuthorization.controls['authorizationActive'];

    }

    saveAuthorization() {
        [this.personInCharge].forEach((control: AbstractControl) => this.setError(control));
        this.isSubmited = true;
        if (this.formAuthorization.valid) {
            const _authorization: Authorization = {
                id: this.authorization.id,
                userId: this.personInCharge.value,
                assignTo: this.authorizedPerson.value,
                name: this.authorizationName.value,
                services: !!this.authorizationService.value ? this.authorizationService.value.toString().replace(/(?:,)/g, ';') : '',
                description: this.authorizationNote.value,
                startDate: this.effectiveDate.value ? (this.effectiveDate.value.startDate !== null ? formatDate(this.effectiveDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
                endDate: this.expirationDate.value ? (this.expirationDate.value.startDate !== null ? formatDate(this.expirationDate.value.startDate, 'yyyy-MM-dd', 'en') : null) : null,
                userCreated: this.authorization.userCreated,
                datetimeCreated: this.authorization.datetimeCreated,
                userModified: this.authorization.userModified,
                datetimeModified: this.authorization.datetimeModified,
                active: this.authorizationActive.value,
                inactiveOn: this.authorization.inactiveOn,
                servicesName: this.authorization.servicesName,
                userNameAssign: '',
                userNameAssignTo: '',
                groupId: this.authorization.groupId,
                departmentId: this.authorization.departmentId,
                officeId: this.authorization.officeId,
                companyId: this.authorization.companyId,
                permission: this.authorization.permission,

            };
            this.authorizationToUpdate = _authorization;
            if (this.action === "create") {
                this._systemRepo.addNewAuthorization(_authorization)
                    .pipe(catchError(this.catchError))
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                this._toastService.success(res.message);
                                this.onRequestAuthorization.emit();
                                this.closeAuthorization();
                            } else {
                                this._toastService.error(res.message);
                            }
                        }
                    );
            } else {
                this.confirmUpdatePopup.show();
            }
        }
    }

    onUpdateAuthorization() {
        this.confirmUpdatePopup.hide();
        this._systemRepo.updateAuthorization(this.authorizationToUpdate)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.onRequestAuthorization.emit();
                        this.closeAuthorization();
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    onCancelAuthorization() {
        this.confirmCancelPopup.hide();
        this.closeAuthorization();
    }

    getDetail() {
        this.isShowUpdate = true;

        this.formAuthorization.setValue({
            authorizationName: this.authorization.name,
            personInCharge: this.authorization.userId,
            authorizedPerson: this.authorization.assignTo,
            authorizationService: !!this.authorization.services ? this.authorization.services.split(";") : [],
            effectiveDate: !!this.authorization.startDate ? { startDate: new Date(this.authorization.startDate) } : null,
            expirationDate: !!this.authorization.endDate ? { startDate: new Date(this.authorization.endDate) } : null,
            authorizationNote: this.authorization.description,
            authorizationActive: this.authorization.active
        });

        this.datetimeCreated = this.authorization.datetimeCreated;
        this.userCreatedName = this.authorization.userCreatedName;
        this.datetimeModified = this.authorization.datetimeModified;
        this.userModifiedName = this.authorization.userModifiedName;
    }


    closePopup() {
        this.confirmCancelPopup.show();
    }

    closeAuthorization() {
        this.hide();
        this.isSubmited = false;
        this.authorization = new Authorization();
        this.formAuthorization.reset();
        this.minDateExpired = null;
        this.minDateEffective = null;
        // this.formAuthorization.updateValueAndValidity();
    }

    changeStatus($event: Event) {
        if (this.action !== 'create' && this.authorizationActive.value) {
            this.confirmChangeStatusPopup.show();
            $event.preventDefault();
        }
    }

    onCnfirmChangeStatus() {
        this.confirmChangeStatusPopup.hide();
        this.authorizationActive.setValue(!this.authorizationActive.value);
    }
};