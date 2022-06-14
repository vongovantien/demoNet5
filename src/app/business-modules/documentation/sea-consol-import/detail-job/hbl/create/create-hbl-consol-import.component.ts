import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { formatDate } from '@angular/common';
import { ActionsSubject, Store } from '@ngrx/store';
import { ToastrService } from 'ngx-toastr';

import { DocumentationRepo, CatalogueRepo } from '@repositories';
import { AppForm } from '@app';
import { InfoPopupComponent, ConfirmPopupComponent } from '@common';
import { Container, CsTransaction, CsTransactionDetail } from '@models';
import { SystemConstants, RoutingConstants } from '@constants';
import { DataService } from '@services';

import {
    ShareBusinessArrivalNoteComponent,
    ShareBusinessDeliveryOrderComponent
    , ShareBusinessImportHouseBillDetailComponent,
    ShareBussinessHBLGoodSummaryFCLComponent,
    getTransactionPermission,
    getTransactionDetailCsTransactionState
} from '@share-bussiness';

import { ShareSeaServiceFormCreateHouseBillSeaImportComponent } from 'src/app/business-modules/documentation/share-sea/components/form-create-hbl-sea-import/form-create-hbl-sea-import.component';
import * as fromShareBussiness from './../../../../../share-business/store';

import { catchError, takeUntil, mergeMap, skip, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import isUUID from 'validator/lib/isUUID';
import { ShareBusinessProofOfDelieveyComponent } from 'src/app/business-modules/share-business/components/hbl/proof-of-delivery/proof-of-delivery.component';
import { InjectViewContainerRefDirective } from '@directives';

enum HBL_TAB {
    DETAIL = 'DETAIL',
    ARRIVAL = 'ARRIVAL',
    DELIVERY = 'DELIVERY'

}
@Component({
    selector: 'app-create-hbl-consol-import',
    templateUrl: './create-hbl-consol-import.component.html',
})
export class SeaConsolImportCreateHBLComponent extends AppForm {
    @ViewChild(ShareSeaServiceFormCreateHouseBillSeaImportComponent) formHouseBill: ShareSeaServiceFormCreateHouseBillSeaImportComponent;
    @ViewChild(ShareBussinessHBLGoodSummaryFCLComponent) hblGoodSummaryComponent: ShareBussinessHBLGoodSummaryFCLComponent;
    @ViewChild(ShareBusinessImportHouseBillDetailComponent) importHouseBillPopup: ShareBusinessImportHouseBillDetailComponent;
    @ViewChild(ShareBusinessArrivalNoteComponent, { static: true, }) arrivalNoteComponent: ShareBusinessArrivalNoteComponent;
    @ViewChild(ShareBusinessDeliveryOrderComponent, { static: true }) deliveryComponent: ShareBusinessDeliveryOrderComponent;
    @ViewChild(ShareBusinessProofOfDelieveyComponent, { static: true }) proofOfDeliveryComponent: ShareBusinessProofOfDelieveyComponent;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;

    jobId: string = '';
    selectedHbl: CsTransactionDetail;
    containers: Container[] = [];
    selectedTab: string = HBL_TAB.DETAIL;

    constructor(
        protected _documentationRepo: DocumentationRepo,
        protected _catalogueRepo: CatalogueRepo,
        protected _toastService: ToastrService,
        protected _activedRoute: ActivatedRoute,
        protected _actionStoreSubject: ActionsSubject,
        protected _router: Router,
        protected _store: Store<fromShareBussiness.ITransactionState>,
        protected _cd: ChangeDetectorRef,
        protected _dataService: DataService


    ) {
        super();

        this._actionStoreSubject
            .pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe(
                (action: fromShareBussiness.ContainerAction) => {
                    if (action.type === fromShareBussiness.ContainerActionTypes.SAVE_CONTAINER) {
                        this.containers = action.payload;
                        if (!!this.containers) {
                            this.containers.forEach(c => {
                                c.mblid = SystemConstants.EMPTY_GUID;
                            });
                        }

                        // * Update field inword with container data.
                        this.formHouseBill.formGroup.controls["inWord"].setValue(this.updateInwordField(this.containers));

                    }
                });

        this._store.select(getTransactionDetailCsTransactionState)
            .pipe(takeUntil(this.ngUnsubscribe), catchError(this.catchError), skip(1))
            .subscribe(
                (shipment: CsTransaction) => {
                    if (!!shipment.desOfGoods) {
                        this.hblGoodSummaryComponent.description = shipment.desOfGoods;
                    }
                });
    }

    ngOnInit() {
        this._activedRoute.params.subscribe((param: Params) => {
            if (param.jobId && isUUID(param.jobId)) {
                this.jobId = param.jobId;
                this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));

                // * Get default containers from masterbill dispatch to hbl container state.
                this._store.dispatch(new fromShareBussiness.GetContainersHBLAction({ mblid: this.jobId }));

                this.permissionShipments = this._store.select(getTransactionPermission);

            } else {
                this.combackToHBLList();
            }
        });
    }

    onSelectTab(tabName: HBL_TAB | string) {
        this.selectedTab = tabName;
    }

    ngAfterViewInit() {

        this.hblGoodSummaryComponent.initContainer();

        this.hblGoodSummaryComponent.containerPopup.isAdd = true;

        this.hblGoodSummaryComponent.description = "AS PER BILL";
        this.formHouseBill.notifyPartyDescription.setValue("SAME AS CONSIGNEE");

        this._store.dispatch(new fromShareBussiness.GetDetailHBLSuccessAction({}));
        this.formHouseBill.type = 'SFI';

        this._cd.detectChanges();

    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.formHouseBill.formGroup.valid) {
            valid = false;
        }
        return valid;
    }

    oncreate() {
        this.formHouseBill.isSubmited = true;
        if (!this.checkValidateForm() || !this.arrivalNoteComponent.checkValidate() || !this.deliveryComponent.deliveryOrder.deliveryOrderNo) {
            this.arrivalNoteComponent.isSubmitted = true;
            this.deliveryComponent.isSubmitted = true;
            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                body: this.invalidFormText,
                title: 'Cannot create HBL'
            });
        } else {
            const body = this.onsubmitData();

            this.createHbl(body);

        }
    }

    onImport(selectedData: any) {
        this.selectedHbl = selectedData;
        if (!!this.selectedHbl) {
            this.formHouseBill.onUpdateDataToImport(this.selectedHbl);
        }
    }

    showCreatePpoup() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Save HBL',
            body: this.confirmCreateHblText,
            labelCancel: 'No',
            labelConfirm: 'Yes'
        }, () => { this.oncreate() });
    }

    showImportPopup() {
        const dataSearch = { jobId: this.jobId };
        dataSearch.jobId = this.jobId;
        this.importHouseBillPopup.selected = - 1;
        this.importHouseBillPopup.typeFCL = 'Import';
        this.importHouseBillPopup.getHourseBill(dataSearch);
        this.importHouseBillPopup.show();
    }

    combackToHBLList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/${this.jobId}/hbl`]);
    }

    createHbl(body: any) {
        if (this.formHouseBill.formGroup.valid) {
            this._documentationRepo.validateCheckPointContractPartner(body.customerId, SystemConstants.EMPTY_GUID, 'DOC', null, 6)
                .pipe(
                    switchMap((res: CommonInterface.IResult) => {
                        if (!res.status) {
                            this._toastService.warning(res.message);
                            return of(false);
                        }
                        return this._documentationRepo.createHousebill(body)
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

                                    this.proofOfDeliveryComponent.proofOfDelievey.hblid = res.data;
                                    const proof = this._documentationRepo.updateProofOfDelivery(Object.assign({}, this.proofOfDeliveryComponent.proofOfDelievey, deliveryDate));

                                    return forkJoin([arrival, delivery, proof]);
                                }),
                                catchError(this.catchError),
                            )
                    })
                )
                .subscribe((result) => {
                    if (!!result) {
                        this._toastService.success(result[0].message, '');
                        if (result[2].status && this.proofOfDeliveryComponent.fileList !== null && this.proofOfDeliveryComponent.fileList.length !== 0 && Object.keys(this.proofOfDeliveryComponent.files).length === 0) {
                            this.proofOfDeliveryComponent.uploadFilePOD();
                        }
                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_CONSOL_IMPORT}/${this.jobId}/hbl/${this.arrivalNoteComponent.hblArrivalNote.hblid}`]);
                    }
                });
        }
    }

    onsubmitData() {
        const body: any = {
            id: SystemConstants.EMPTY_GUID,
            jobId: this.jobId,

            etd: !!this.formHouseBill.etd.value && this.formHouseBill.etd.value.startDate != null ? formatDate(this.formHouseBill.etd.value.startDate !== undefined ? this.formHouseBill.etd.value.startDate : this.formHouseBill.etd.value, 'yyyy-MM-dd', 'en') : null,
            eta: !!this.formHouseBill.eta.value ? formatDate(this.formHouseBill.eta.value.startDate !== undefined ? this.formHouseBill.eta.value.startDate : this.formHouseBill.eta.value, 'yyyy-MM-dd', 'en') : null,
            documentDate: !!this.formHouseBill.documentDate.value && this.formHouseBill.documentDate.value.startDate != null ? formatDate(this.formHouseBill.documentDate.value.startDate !== undefined ? this.formHouseBill.documentDate.value.startDate : this.formHouseBill.documentDate.value, 'yyyy-MM-dd', 'en') : null,
            etawarehouse: !!this.formHouseBill.etawarehouse.value && this.formHouseBill.etawarehouse.value.startDate != null ? formatDate(this.formHouseBill.etawarehouse.value.startDate !== undefined ? this.formHouseBill.etawarehouse.value.startDate : this.formHouseBill.etawarehouse.value, 'yyyy-MM-dd', 'en') : null,
            issueHBLDate: !!this.formHouseBill.issueHBLDate.value && this.formHouseBill.issueHBLDate.value.startDate != null ? formatDate(this.formHouseBill.issueHBLDate.value.startDate !== undefined ? this.formHouseBill.issueHBLDate.value.startDate : this.formHouseBill.issueHBLDate.value, 'yyyy-MM-dd', 'en') : null,
            receivedBillTime: !!this.formHouseBill.receivedBillTime.value && this.formHouseBill.receivedBillTime.value.startDate != null ? formatDate(this.formHouseBill.receivedBillTime.value.startDate !== undefined ? this.formHouseBill.receivedBillTime.value.startDate : this.formHouseBill.receivedBillTime.value, 'yyyy-MM-dd', 'en') : null,

            hbltype: this.formHouseBill.hbltype.value,
            servicetype: this.formHouseBill.servicetype.value,
            originBLNumber: this.formHouseBill.originBLNumber.value,

            mawb: this.formHouseBill.mtBill.value,
            saleManId: !!this.formHouseBill.saleMan.value ? this.formHouseBill.saleMan.value : null,
            shipperId: !!this.formHouseBill.shipper.value ? this.formHouseBill.shipper.value : null,
            shipperDescription: !!this.formHouseBill.shipperDescription ? this.formHouseBill.shipperDescription.value : null,
            consigneeId: this.formHouseBill.consignee.value,
            consigneeDescription: !!this.formHouseBill.consigneeDescription.value ? this.formHouseBill.consigneeDescription.value : null,
            notifyPartyId: !!this.formHouseBill.notifyParty.value ? this.formHouseBill.notifyParty.value : null,
            notifyPartyDescription: !!this.formHouseBill.notifyPartyDescription.value ? this.formHouseBill.notifyPartyDescription.value : null,
            alsoNotifyPartyId: !!this.formHouseBill.alsoNotifyParty.value ? this.formHouseBill.alsoNotifyParty.value : null,
            alsoNotifyPartyDescription: !!this.formHouseBill.alsonotifyPartyDescription.value ? this.formHouseBill.alsonotifyPartyDescription.value : null,
            hwbno: this.formHouseBill.hwbno.value,

            pickupPlace: this.formHouseBill.pickupPlace.value,
            pol: this.formHouseBill.pol.value,
            pod: this.formHouseBill.pod.value,
            finalDestinationPlace: this.formHouseBill.finalDestinationPlace.value,
            coloaderId: !!this.formHouseBill.supplier.value ? this.formHouseBill.supplier.value : null,
            localVessel: this.formHouseBill.localVessel.value,
            localVoyNo: this.formHouseBill.localVoyNo.value,
            oceanVessel: this.formHouseBill.oceanVessel.value,
            documentNo: this.formHouseBill.documentNo.value,
            inWord: this.formHouseBill.inWord.value,
            shippingMark: this.formHouseBill.shippingMark.value,
            remark: this.formHouseBill.remark.value,
            issueHBLPlace: !!this.formHouseBill.placeOfIssues.value ? this.formHouseBill.placeOfIssues.value : null,
            referenceNo: this.formHouseBill.referenceNo.value,
            customerId: this.formHouseBill.customer.value,
            oceanVoyNo: this.formHouseBill.oceanVoyNo.value,
            csMawbcontainers: this.containers,
            commodity: this.hblGoodSummaryComponent.commodities,
            packageContainer: this.hblGoodSummaryComponent.containerDetail,
            desOfGoods: this.hblGoodSummaryComponent.description,
            cbm: this.hblGoodSummaryComponent.totalCBM,
            grossWeight: this.hblGoodSummaryComponent.grossWeight,
            netWeight: this.hblGoodSummaryComponent.netWeight,
            packageQty: this.hblGoodSummaryComponent.packageQty,
            packageType: +this.hblGoodSummaryComponent.selectedPackage,
            contSealNo: this.hblGoodSummaryComponent.containerDescription,
            incotermId: this.formHouseBill.incotermId.value,

            arrivalSecondNotice: null,
            arrivalNo: null,
            arrivalHeader: null,
            arrivalFooter: null,
            arrivalFirstNotice: null,
            deliveryOrderNo: null,
            deliveryOrderPrintedDate: null,
            dofooter: null,
            dosentTo1: null,
            dosentTo2: null,
            chargeWeight: this.hblGoodSummaryComponent.totalChargeWeight

        };
        return body;
    }

    updateInwordField(containers: Container[]): string {
        let containerDetail = '';

        const contObject = (containers || []).map((container: Container) => ({
            contType: container.containerTypeId,
            contName: container.description || '',
            quantity: container.quantity,
            isPartContainer: container.isPartOfContainer || false
        }));

        for (const item of contObject) {
            if (item.isPartContainer) {
                containerDetail += "A Part Of ";
            }
            containerDetail += this.handleStringCont(item);
        }
        containerDetail = containerDetail.trim().replace(/\&$/, "");
        containerDetail += " Onlys." + "\n" + "THC/CSC AND OTHER SURCHARGES AT DESTINATION ARE FOR RECEIVER'S ACCOUNT. ";

        return containerDetail || '';
    }

    handleStringCont(contOb: { contName: string, quantity: number }) {
        return this.utility.convertNumberToWords(contOb.quantity) + '' + contOb.contName + ' & ';
    }
}

