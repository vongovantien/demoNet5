import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Store, ActionsSubject } from '@ngrx/store';
import { DocumentationRepo, CatalogueRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';

import { AppForm } from '@app';
import { ConfirmPopupComponent, InfoPopupComponent } from '@common';
import { HouseBill } from '@models';
import { DataService } from '@services';
import { RoutingConstants, SystemConstants } from '@constants';

import { AirImportHBLFormCreateComponent } from '../components/form-create-house-bill-air-import/form-create-house-bill-air-import.component';
import { ShareBusinessDeliveryOrderComponent, ShareBusinessImportHouseBillDetailComponent, ShareBusinessArrivalNoteAirComponent, getTransactionPermission, IShareBussinessState, TransactionGetDetailAction } from '@share-bussiness';

import { forkJoin, merge, of } from 'rxjs';
import _merge from 'lodash/merge';
import isUUID from 'validator/lib/isUUID';

import { catchError, mergeMap, takeUntil, switchMap } from 'rxjs/operators';
import { ShareBusinessProofOfDelieveyComponent } from 'src/app/business-modules/share-business/components/hbl/proof-of-delivery/proof-of-delivery.component';
import { InjectViewContainerRefDirective } from '@directives';


@Component({
    selector: 'app-create-hbl-air-import',
    templateUrl: './create-house-bill.component.html',
})
export class AirImportCreateHBLComponent extends AppForm implements OnInit {
    @ViewChild(AirImportHBLFormCreateComponent) formCreateHBLComponent: AirImportHBLFormCreateComponent;
    @ViewChild(ShareBusinessArrivalNoteAirComponent, { static: true }) arrivalNoteComponent: ShareBusinessArrivalNoteAirComponent;
    @ViewChild(ShareBusinessDeliveryOrderComponent, { static: true }) deliveryComponent: ShareBusinessDeliveryOrderComponent;
    @ViewChild(ShareBusinessProofOfDelieveyComponent, { static: true }) proofOfDeliveryComponent: ShareBusinessProofOfDelieveyComponent;
    @ViewChild(ShareBusinessImportHouseBillDetailComponent) importHouseBillPopup: ShareBusinessImportHouseBillDetailComponent;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;

    jobId: string;
    selectedHbl: any = {};
    isImport: boolean = false;

    activeTab: string = 'hawb';

    constructor(
        protected _activedRoute: ActivatedRoute,
        protected _store: Store<IShareBussinessState>,
        protected _documentationRepo: DocumentationRepo,
        protected _catalogueRepo: CatalogueRepo,
        protected _toastService: ToastrService,
        protected _actionStoreSubject: ActionsSubject,
        protected _router: Router,
        protected _dataService: DataService
    ) {
        super();
    }

    ngOnInit() {
        this._activedRoute.params
            .subscribe((param: Params) => {
                if (isUUID(param.jobId)) {
                    this.jobId = param.jobId;

                    this._store.dispatch(new TransactionGetDetailAction(this.jobId));

                    this.permissionShipments = this._store.select(getTransactionPermission);
                } else {
                    this.gotoList();
                }
            });

        this.listenShortcutSaveHawb();
    }

    listenShortcutSaveHawb() {
        merge(
            this.createShortcut(['ControlLeft', 'ShiftLeft', 'KeyS']),
        ).pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
                () => {
                    this.confirmSaveHBL();
                }
            );
    }

    confirmSaveHBL() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            body: 'You are about to create a new HAWB. Are you sure all entered details are correct?',
        }, () => { this.saveHBL() });
    }

    onImport(selectedData: any) {
        this.isImport = true;
        this.selectedHbl = selectedData;
        this.selectedHbl.hwbno = this.formCreateHBLComponent.hwbno.value;
        this.selectedHbl.mawb = this.formCreateHBLComponent.mawb.value;
        this.formCreateHBLComponent.updateFormValue(this.selectedHbl);
    }

    showImportPopup() {
        const dataSearch = { jobId: this.jobId };
        dataSearch.jobId = this.jobId;
        this.importHouseBillPopup.typeFCL = 'Import';
        this.importHouseBillPopup.selected = - 1;
        this.importHouseBillPopup.getHourseBill(dataSearch);
        this.importHouseBillPopup.show();
    }

    getDataForm() {
        const form: any = this.formCreateHBLComponent.formCreate.getRawValue();
        const formData = {
            customerId: form.customer,
            notifyPartyId: form.notifyId,
            notifyPartyDescription: form.notifyDescription,
            hwbno: form.hawb,

            eta: !!form.eta && !!form.eta.startDate ? formatDate(form.eta.startDate, 'yyyy-MM-dd', 'en') : null,
            arrivalDate: !!form.arrivalDate && !!form.arrivalDate.startDate ? formatDate(form.arrivalDate.startDate, 'yyyy-MM-dd', 'en') : null,
            flightDate: (!!form.flightDate && !!form.flightDate.startDate) ? formatDate(form.flightDate.startDate, 'yyyy-MM-dd', 'en') : null,
            flightDateOrigin: !!form.flightDateOrigin && form.flightDateOrigin.startDate !== undefined ? formatDate(form.flightDateOrigin.startDate, 'yyyy-MM-dd', 'en') : null,
            issueHBLDate: !!form.issueHBLDate ? formatDate(form.issueHBLDate.startDate, 'yyyy-MM-dd', 'en') : null,
            wareHouseAnDate: !!form.wareHouseAnDate ? formatDate(form.wareHouseAnDate.startDate, 'yyyy-MM-dd', 'en') : null,

            grossWeight: form.gw,
            finalPOD: form.finalPod,
        };

        const houseBill = new HouseBill(_merge(form, formData));
        return houseBill;
    }

    saveHBL() {
        this.formCreateHBLComponent.isSubmitted = true;
        this.arrivalNoteComponent.isSubmitted = true;
        this.deliveryComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.activeTab = 'hawb';
            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                title: 'Cannot create HBL',
                body: this.invalidFormText
            });
            return;
        }
        if (!this.arrivalNoteComponent.checkValidate() || !this.arrivalNoteComponent.hblArrivalNote.arrivalNo) {
            this.activeTab = 'arrival';
            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                title: 'Cannot create HBL',
                body: this.invalidFormText
            });

            return;
        }


        if (!this.deliveryComponent.deliveryOrder.deliveryOrderNo) {
            this.activeTab = 'authorize';
            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                title: 'Cannot create HBL',
                body: this.invalidFormText
            });
            return;
        }

        // if (!this.proofOfDeliveryComponent.proofOfDelievey.referenceNo
        //     || !this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate
        //     || !this.proofOfDeliveryComponent.proofOfDelievey.deliveryPerson
        //     || !this.proofOfDeliveryComponent.proofOfDelievey.note
        // ) {
        //     this.activeTab = 'proof';
        //     this.infoPopup.show();
        //     return;
        // }

        this._documentationRepo.checkExistedHawbNo(this.formCreateHBLComponent.hwbno.value, this.jobId, null)
            .pipe(
                catchError(this.catchError),
            )
            .subscribe(
                (res: any) => {
                    if (res) {
                        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
                            body: 'HAWB No has existed, do you want to continue saving?',
                            title: 'HAWB Existed'
                        }, () => { this.confirmSaveData() });
                    } else {
                        const houseBill: HouseBill = this.getDataForm();
                        houseBill.jobId = this.jobId;

                        this.createHbl(houseBill);

                    }
                }
            );
    }

    confirmSaveData() {
        const houseBill: HouseBill = this.getDataForm();
        houseBill.jobId = this.jobId;

        this.createHbl(houseBill);
    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.formCreateHBLComponent.formCreate.valid) {
            valid = false;
        }
        return valid;
    }

    createHbl(houseBill: HouseBill) {
        if (this.formCreateHBLComponent.formCreate.valid) {
            this._documentationRepo.validateCheckPointContractPartner(houseBill.customerId, SystemConstants.EMPTY_GUID, 'DOC', null, 6)
                .pipe(
                    switchMap((res: CommonInterface.IResult) => {
                        if (!res.status) {
                            this._toastService.warning(res.message);
                            return of(false);
                        }
                        return this._documentationRepo.createHousebill(houseBill)
                            .pipe(
                                mergeMap((res: any) => {
                                    const dateNotice = {
                                        arrivalFirstNotice: !!this.arrivalNoteComponent.hblArrivalNote.arrivalFirstNotice && !!this.arrivalNoteComponent.hblArrivalNote.arrivalFirstNotice.startDate ? formatDate(this.arrivalNoteComponent.hblArrivalNote.arrivalFirstNotice.startDate, 'yyyy-MM-dd', 'en') : formatDate(new Date(), 'yyyy-MM-dd', 'en'),
                                        arrivalSecondNotice: !!this.arrivalNoteComponent.hblArrivalNote.arrivalSecondNotice && <any>!!this.arrivalNoteComponent.hblArrivalNote.arrivalSecondNotice.startDate ? formatDate(this.arrivalNoteComponent.hblArrivalNote.arrivalSecondNotice.startDate, 'yyyy-MM-dd', 'en') : null,
                                    };
                                    this.arrivalNoteComponent.hblArrivalNote.hblid = res.data;
                                    const arrival = this._documentationRepo.updateArrivalInfo(Object.assign({}, this.arrivalNoteComponent.hblArrivalNote, dateNotice));
                                    const printedDate = {
                                        deliveryOrderPrintedDate: !!this.deliveryComponent.deliveryOrder.deliveryOrderPrintedDate && !!this.deliveryComponent.deliveryOrder.deliveryOrderPrintedDate.startDate ? formatDate(this.deliveryComponent.deliveryOrder.deliveryOrderPrintedDate.startDate, 'yyyy-MM-dd', 'en') : null,
                                    };
                                    this.deliveryComponent.deliveryOrder.hblid = res.data;
                                    const delivery = this._documentationRepo.updateDeliveryOrderInfo(Object.assign({}, this.deliveryComponent.deliveryOrder, printedDate));


                                    this.proofOfDeliveryComponent.proofOfDelievey.hblid = res.data;
                                    const deliveryDate = {
                                        deliveryDate: !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate && !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate ? formatDate(this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate, 'yyyy-MM-dd', 'en') : null,
                                    };
                                    const proof = this._documentationRepo.updateProofOfDelivery(Object.assign({}, this.proofOfDeliveryComponent.proofOfDelievey, deliveryDate));

                                    //this.proofOfDeliveryComponent.saveProofOfDelivery();
                                    return forkJoin([arrival, delivery, proof]);
                                }),
                                catchError(this.catchError),
                            )
                    })
                )
                .subscribe((res: CommonInterface.IResult) => {
                    if (!!res) {
                        this._toastService.success(res[1].message, '');
                        if (res[2].status && this.proofOfDeliveryComponent.fileList !== null && this.proofOfDeliveryComponent.fileList.length !== 0 && Object.keys(this.proofOfDeliveryComponent.files).length === 0) {
                            this.proofOfDeliveryComponent.uploadFilePOD();
                        }
                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${this.jobId}/hbl/${this.arrivalNoteComponent.hblArrivalNote.hblid}`]);
                    }
                });
        }
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.AIR_IMPORT}/${this.jobId}/hbl`]);
    }

    showCreatepoup() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Save HBL',
            body: this.confirmCreateHblText,
            labelCancel: 'No',
            labelConfirm: 'Yes'
        }, () => { this.saveHBL() });
    }
}
