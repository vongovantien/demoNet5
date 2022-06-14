import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';

import { AppForm } from '@app';
import { InfoPopupComponent, ConfirmPopupComponent } from '@common';
import { DocumentationRepo, CatalogueRepo } from '@repositories';
import { Container, CsTransactionDetail } from '@models';
import { SystemConstants, RoutingConstants } from '@constants';
import {
    ShareBusinessImportHouseBillDetailComponent,
    ShareBussinessHBLGoodSummaryFCLComponent,
    getTransactionPermission,
    ShareBusinessAttachListHouseBillComponent
} from '@share-bussiness';

import * as fromShareBussiness from './../../../../../share-business/store';
import { ShareSeaServiceFormCreateHouseBillSeaExportComponent } from 'src/app/business-modules/documentation/share-sea/components/form-create-hbl-sea-export/form-create-hbl-sea-export.component';

import { takeUntil, catchError, finalize, tap, switchMap } from 'rxjs/operators';
import _groupBy from 'lodash/groupBy';
import isUUID from 'validator/lib/isUUID';
import { ShareBusinessProofOfDelieveyComponent } from 'src/app/business-modules/share-business/components/hbl/proof-of-delivery/proof-of-delivery.component';
import { InjectViewContainerRefDirective } from '@directives';
import { of } from 'rxjs';

@Component({
    selector: 'app-create-hbl-fcl-export',
    templateUrl: './create-house-bill.component.html'
})

export class SeaFCLExportCreateHBLComponent extends AppForm {

    @ViewChild(ShareSeaServiceFormCreateHouseBillSeaExportComponent) formCreateHBLComponent: ShareSeaServiceFormCreateHouseBillSeaExportComponent;
    @ViewChild(ShareBussinessHBLGoodSummaryFCLComponent) goodSummaryComponent: ShareBussinessHBLGoodSummaryFCLComponent;
    @ViewChild(ShareBusinessImportHouseBillDetailComponent) importHouseBillPopup: ShareBusinessImportHouseBillDetailComponent;
    @ViewChild(ShareBusinessAttachListHouseBillComponent) attachListComponent: ShareBusinessAttachListHouseBillComponent;
    @ViewChild(ShareBusinessProofOfDelieveyComponent, { static: true }) proofOfDeliveryComponent: ShareBusinessProofOfDelieveyComponent;
    @ViewChild(InjectViewContainerRefDirective) viewContainerRef: InjectViewContainerRefDirective;

    jobId: string;
    containers: Container[] = [];

    selectedHbl: CsTransactionDetail;

    constructor(
        protected _activedRoute: ActivatedRoute,
        protected _store: Store<fromShareBussiness.IShareBussinessState>,
        protected _documentationRepo: DocumentationRepo,
        protected _catalogueRepo: CatalogueRepo,
        protected _toastService: ToastrService,
        protected _actionStoreSubject: ActionsSubject,
        protected _router: Router,
        protected _cd: ChangeDetectorRef

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

                        // * reset mblid in container.
                        if (!!this.containers) {
                            this.containers.forEach(c => {
                                c.id = c.mblid = SystemConstants.EMPTY_GUID;
                            });
                        }

                        console.log(this.containers);
                        // * Update field inword with container data.
                        this.formCreateHBLComponent.formCreate.controls["inWord"].setValue(this.updateInwordField(this.containers));
                    }
                });
    }

    ngOnInit() {
        this._activedRoute.params
            .subscribe((param: Params) => {
                if (param.jobId && isUUID(param.jobId)) {
                    this.jobId = param.jobId;
                    this._store.dispatch(new fromShareBussiness.TransactionGetDetailAction(this.jobId));

                    // * Get default containers from masterbill and dispatch for hbl container state.
                    this._store.dispatch(new fromShareBussiness.GetContainersHBLAction({ mblid: this.jobId }));
                    this.permissionShipments = this._store.select(getTransactionPermission);
                } else {
                    this.gotoList();
                }
            });
    }

    ngAfterViewInit() {
        this.importHouseBillPopup.typeFCL = 'Export';
        this.goodSummaryComponent.initContainer();
        this.goodSummaryComponent.containerPopup.isAdd = true;
        this.goodSummaryComponent.isExport = true;
        this.formCreateHBLComponent.type = 'SFE';
        this._cd.detectChanges();
    }

    showCreatepoup() {
        this.showPopupDynamicRender(ConfirmPopupComponent, this.viewContainerRef.viewContainerRef, {
            title: 'Save HBL',
            body: this.confirmCreateHblText,
            labelCancel: 'No',
            labelConfirm: 'Yes'

        }, () => { this.onSaveHBL() });
    }

    onSaveHBL() {
        this.formCreateHBLComponent.isSubmitted = true;

        if (!this.checkValidateForm()) {
            this.showPopupDynamicRender(InfoPopupComponent, this.viewContainerRef.viewContainerRef, {
                title: 'Cannot Update HBL',
                body: this.invalidFormText
            });
            return;
        }

        const modelAdd = this.getDataForm();

        this.createHbl(modelAdd);

    }

    getDataForm() {
        const form: any = this.formCreateHBLComponent.formCreate.getRawValue();
        const formData = {
            id: SystemConstants.EMPTY_GUID,
            jobId: this.jobId,
            sailingDate: !!form.sailingDate && !!form.sailingDate.startDate ? formatDate(form.sailingDate.startDate, 'yyyy-MM-dd', 'en') : null,
            closingDate: !!form.closingDate && !!form.closingDate.startDate ? formatDate(form.closingDate.startDate, 'yyyy-MM-dd', 'en') : null,
            issueHbldate: !!form.issueHbldate && !!form.issueHbldate.startDate ? formatDate(form.issueHbldate.startDate, 'yyyy-MM-dd', 'en') : null,

            mawb: form.mawb,
            shipperDescription: form.shipperDescription,
            consigneeDescription: form.consigneeDescription,
            notifyPartyDescription: form.notifyPartyDescription,
            hwbno: form.hwbno,
            customsBookingNo: form.bookingNo,
            localVoyNo: form.localVoyNo,
            oceanVoyNo: form.oceanVoyNo,
            pickupPlace: form.placeReceipt,
            deliveryPlace: form.placeDelivery,
            finalDestinationPlace: form.finalDestinationPlace,
            placeFreightPay: form.placeFreightPay,
            issueHblplace: form.issueHblplace,
            referenceNo: form.referenceNo,
            exportReferenceNo: form.exportReferenceNo,
            goodsDeliveryDescription: form.goodsDeliveryDescription,
            forwardingAgentDescription: form.forwardingAgentDescription,
            purchaseOrderNo: form.purchaseOrderNo,
            shippingMark: form.shippingMark,
            inWord: form.inWord,
            onBoardStatus: form.onBoardStatus,

            serviceType: form.serviceType,
            originBlnumber: form.originBlnumber,
            moveType: form.moveType,
            freightPayment: form.freightPayment,
            hbltype: form.hbltype,

            customerId: form.customer,
            saleManId: form.saleMan,
            shipperId: form.shipper,
            consigneeId: form.consignee,
            notifyPartyId: form.notifyParty,
            originCountryId: form.country,
            pol: form.pol,
            pod: form.pod,
            polDescription: form.polDescription,
            podDescription: form.podDescription,
            forwardingAgentId: form.forwardingAgent,
            goodsDeliveryId: form.goodsDelivery,
            incotermId: form.incotermId,

            // * containers summary
            csMawbcontainers: this.containers,
            commodity: this.goodSummaryComponent.commodities,
            packageContainer: this.goodSummaryComponent.containerDetail,
            desOfGoods: this.goodSummaryComponent.description,
            cbm: this.goodSummaryComponent.totalCBM,
            grossWeight: this.goodSummaryComponent.grossWeight,
            netWeight: this.goodSummaryComponent.netWeight,
            packageQty: this.goodSummaryComponent.packageQty,
            packageType: +this.goodSummaryComponent.selectedPackage,
            contSealNo: this.goodSummaryComponent.containerDescription,
            chargeWeight: this.goodSummaryComponent.totalChargeWeight,
            attachList: this.attachListComponent.attachList.replace(form.hwbno, '[[HBLNo]]'),
        };

        return formData;
    }

    onImport(selectedData: any) {
        this.selectedHbl = selectedData;
        if (!!this.selectedHbl) {
            this.formCreateHBLComponent.onUpdateDataToImport(this.selectedHbl);
        }
    }

    showImportPopup() {
        const dataSearch = { jobId: this.jobId };
        dataSearch.jobId = this.jobId;
        this.importHouseBillPopup.typeFCL = 'Export';
        this.importHouseBillPopup.selected = - 1;
        this.importHouseBillPopup.getHourseBill(dataSearch);
        this.importHouseBillPopup.show();

    }

    checkValidateForm() {
        let valid: boolean = true;
        if (!this.formCreateHBLComponent.formCreate.valid) {
            valid = false;
        }
        return valid;
    }

    createHbl(body: any) {
        const deliveryDate = {
            deliveryDate: !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate && !!this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate ? formatDate(this.proofOfDeliveryComponent.proofOfDelievey.deliveryDate.startDate, 'yyyy-MM-dd', 'en') : null,
        };
        body.deliveryPerson = this.proofOfDeliveryComponent.proofOfDelievey.deliveryPerson;
        body.note = this.proofOfDeliveryComponent.proofOfDelievey.note;
        body.referenceNoProof = this.proofOfDeliveryComponent.proofOfDelievey.referenceNo;

        this._documentationRepo.validateCheckPointContractPartner(body.customerId, SystemConstants.EMPTY_GUID, 'DOC', null, 6)
            .pipe(
                switchMap(
                    (res: CommonInterface.IResult) => {
                        if (!res.status) {
                            this._toastService.warning(res.message);
                            return of(false);
                        }
                        return this._documentationRepo.createHousebill(Object.assign({}, body, deliveryDate))
                            .pipe(
                                tap((result: any) => {
                                    if (this.proofOfDeliveryComponent.fileList !== null && this.proofOfDeliveryComponent.fileList.length !== 0 && this.proofOfDeliveryComponent.files !== null && Object.keys(this.proofOfDeliveryComponent.files).length === 0) {
                                        this.proofOfDeliveryComponent.hblid = result.data;
                                        this.proofOfDeliveryComponent.uploadFilePOD();
                                    }
                                }),
                                catchError(this.catchError),
                            )
                    }
                )
            )
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message, '');
                        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_FCL_EXPORT}/${this.jobId}/hbl/${res.data}`]);
                    }
                }
            );
    }

    mapObjectData(containers: Container[]) {
        const contObject = (containers || []).map((container: Container) => ({
            contName: container.description || '',
            quantity: container.quantity,
        }));
        return contObject;
    }

    updateInwordField(containers: Container[]): string {
        const objApartOf = containers.filter(x => x.isPartOfContainer === true);
        const contObject1 = this.mapObjectData(objApartOf);
        const objNotApartOf = containers.filter(x => x.isPartOfContainer === false);
        const contObject2 = this.mapObjectData(objNotApartOf);
        const contDataNotAprtOf = [];
        for (const item of Object.keys(_groupBy(contObject2, 'contName'))) {
            contDataNotAprtOf.push({
                contName: item,
                quantity: _groupBy(contObject2, 'contName')[item].map(i => i.quantity).reduce((a: any, b: any) => a += b),
            });
        }
        console.log(contDataNotAprtOf);
        let containerDetail = '';

        for (const item of contDataNotAprtOf) {
            containerDetail += this.handleStringCont(item);
        }
        for (const item of contObject1) {
            containerDetail += "A Part Of ";
            containerDetail += this.handleStringPackage(item);
        }
        containerDetail = containerDetail.trim().replace(/\&$/, "");
        containerDetail += " Only." + "\n" + " SHIPPER´S LOAD, STOW, COUNT & SEAL. ";
        return containerDetail || '';
    }

    handleStringCont(contOb: { contName: string, quantity: number }) {
        return this.utility.convertNumberToWords(contOb.quantity) + '' + contOb.contName + ' & ';
    }

    handleStringPackage(contOb: { contName: string, quantity: number }) {
        return contOb.quantity + ' ' + contOb.contName + ' & ';
    }

    gotoList() {
        this._router.navigate([`${RoutingConstants.DOCUMENTATION.SEA_FCL_EXPORT}/${this.jobId}/hbl`]);
    }

}
