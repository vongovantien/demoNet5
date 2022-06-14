import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Partner } from 'src/app/shared/models/catalogue/partner.model';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { SortService } from 'src/app/shared/services/sort.service';
import { Saleman } from 'src/app/shared/models/catalogue/saleman.model';
import { SalemanAdd } from 'src/app/shared/models/catalogue/salemanadd.model';
import { CatalogueRepo, SystemRepo } from 'src/app/shared/repositories';
import { ConfirmPopupComponent, InfoPopupComponent } from 'src/app/shared/common/popup';
import { catchError, finalize } from "rxjs/operators";
import { AppList } from 'src/app/app.list';
import { ToastrService } from 'ngx-toastr';
import { SalemanPopupComponent } from '../components/saleman-popup.component';
import { forkJoin } from 'rxjs';
import { FormAddPartnerComponent } from '../components/form-add-partner/form-add-partner.component';
import { Company } from '@models';
import { FormContractCommercialPopupComponent } from 'src/app/business-modules/share-modules/components';
import { Contract } from 'src/app/shared/models/catalogue/catContract.model';
import { RoutingConstants, SystemConstants } from '@constants';
import { CommercialContractListComponent } from 'src/app/business-modules/commercial/components/contract/commercial-contract-list.component';
import _merge from 'lodash/merge';
import { CommercialEmailListComponent } from 'src/app/business-modules/commercial/components/email/commercial-email-list.component';

@Component({
    selector: 'app-partner-data-add',
    templateUrl: './add-partner.component.html',
    styleUrls: ['./add-partner.component.scss']
})
export class AddPartnerDataComponent extends AppList {
    @ViewChild(FormAddPartnerComponent) formPartnerComponent: FormAddPartnerComponent;
    @ViewChild(SalemanPopupComponent) poupSaleman: SalemanPopupComponent;
    @ViewChild(FormContractCommercialPopupComponent) formContractPopup: FormContractCommercialPopupComponent;
    @ViewChild(CommercialContractListComponent) contractList: CommercialContractListComponent;
    @ViewChild('internalReferenceConfirmPopup') confirmTaxcode: ConfirmPopupComponent;
    @ViewChild('duplicatePartnerPopup') confirmDuplicatePartner: InfoPopupComponent;
    @ViewChild(CommercialEmailListComponent) partnerEmailList: CommercialEmailListComponent;


    contracts: Contract[] = [];
    selectedContract: Contract = new Contract();
    contract: Contract = new Contract();

    indexToRemove: number = 0;
    indexlstContract: number = null;

    saleMans = [];
    activeNg: boolean = true;
    partner: Partner = new Partner();
    partnerGroupActives: any = [];
    partnerType: any;
    saleMandetail: any[] = [];
    headerSaleman: CommonInterface.IHeaderTable[];
    services: any[] = [];
    status: CommonInterface.ICommonTitleValue[] = [];
    offices: any[] = [];
    salemanToAdd: SalemanAdd = new SalemanAdd();
    strOfficeCurrent: any = '';
    strSalemanCurrent: any = '';
    selectedStatus: any = {};
    selectedService: any = {};
    deleteMessage: string = '';
    selectedSaleman: Saleman = null;
    saleMantoView: Saleman = new Saleman();
    dataSearchSaleman: any = {};
    isShowSaleMan: boolean = false;
    index: number = 0;
    company: Company[] = [];

    list: any[] = [];

    isDup: boolean = false;
    name: string;

    constructor(private route: ActivatedRoute,
        private _catalogueRepo: CatalogueRepo,
        private _sortService: SortService,
        private _systemRepo: SystemRepo,
        private _cd: ChangeDetectorRef,
        private _toastService: ToastrService,
        protected _router: Router,
    ) {
        super();
        this.requestSort = this.sortLocal;
    }

    sortLocal(sort: string): void {
        this.contracts = this._sortService.sort(this.contracts, sort, this.order);
    }

    ngOnInit() {
        this.getComboboxData();
        this.initHeaderSalemanTable();
        this.route.queryParams.subscribe(prams => {
            if (prams.partnerType !== undefined) {
                if (localStorage.getItem('success_add_sub') === "true") {
                    this.back();
                }
                this.partnerType = Number(prams.partnerType);
                if (this.partnerType === '3') {
                    this.isShowSaleMan = true;
                    this.formPartnerComponent.groups = 'ALL';
                }
            }
        });
    }

    ngAfterViewInit() {
        this.contractList.isActiveNewContract = false;
        this.formPartnerComponent.isUpdate = false;
        this.formPartnerComponent.creditPayment.setValue('Credit');
        this._cd.detectChanges();
    }

    initHeaderSalemanTable() {
        this.headerSaleman = [
            { title: 'Salesman', field: 'username', sortable: true },
            { title: 'Contract No', field: 'username', sortable: true },
            { title: 'Contract Type', field: 'username', sortable: true },
            { title: 'Service', field: 'username', sortable: true },
            { title: 'Effective Date', field: 'username', sortable: true },
            { title: 'Expired Date', field: 'username', sortable: true },
            { title: 'Status', field: 'status', sortable: true },
            { title: 'Office', field: 'officeName', sortable: true },
            { title: 'Company', field: 'companyName', sortable: true },
        ];
    }

    getDataCombobox() {
        forkJoin([
            this._catalogueRepo.getCountryByLanguage(),
            this._catalogueRepo.getProvinces()
        ])
            .pipe(catchError(this.catchError))
            .subscribe(
                ([countries, provinces]) => {
                    this.formPartnerComponent.countries = this.utility.prepareNg2SelectData(countries || [], 'id', 'name');
                    this.formPartnerComponent.billingProvinces = this.utility.prepareNg2SelectData(provinces || [], 'id', 'name_VN');
                    this.formPartnerComponent.shippingProvinces = this.utility.prepareNg2SelectData(provinces || [], 'id', 'name_VN');
                },
                () => { },

            );
    }
    getComboboxData(): any {
        this.getPartnerGroups();
        this.getWorkPlaces();
        this.getparentCustomers();
        this.getService();
        this.getOffice();
        this.getCompany();
        this.getStatus();
    }

    getService() {
        this._catalogueRepo.getListService()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.services = this.utility.prepareNg2SelectData(res, 'value', 'displayName');

                    }
                },
            );
    }

    getOffice() {
        this._systemRepo.getListOffices()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.offices = res;
                    }
                },
            );
    }

    getCompany() {
        this._systemRepo.getListCompany()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.company = res;
                    }
                },
            );
    }


    getStatus(): CommonInterface.ICommonTitleValue[] {
        return [
            { title: 'Active', value: true },
            { title: 'Inactive', value: false },
        ];
    }
    getEmployee(userId: any): any {
        this._systemRepo.getEmployeeByUserId(userId)
            .pipe(catchError(this.catchError), finalize(() => { }))
            .subscribe(
                (res) => {
                    if (res) {
                        this.formPartnerComponent.partnerForm.controls['employeeWorkPhone'].setValue(res.tel);
                        this.formPartnerComponent.partnerForm.controls['email'].setValue(res.email);
                    }
                }
            );
    }
    getparentCustomers() {
        this._catalogueRepo.getPartnersByType(PartnerGroupEnum.ALL)
            .pipe(catchError(this.catchError), finalize(() => { }))
            .subscribe(
                (res) => {
                    if (res) {
                        this.formPartnerComponent.parentCustomers = res;
                    } else { this.formPartnerComponent.parentCustomers = []; }
                }
            );
    }
    getWorkPlaces() {
        this._systemRepo.getAllOffice()
            .pipe(catchError(this.catchError), finalize(() => { }))
            .subscribe(
                (res) => {
                    if (res) {
                        this.formPartnerComponent.workPlaces = res.map(x => ({ "text": x.code + ' - ' + x.branchNameEn, "id": x.id }));
                    } else { this.formPartnerComponent.workPlaces = []; }
                }
            );
    }
    getPartnerGroups(): any {
        this._catalogueRepo.getPartnerGroup().subscribe((response: any) => {
            if (response != null) {

                this.formPartnerComponent.partnerGroups = response.map(x => ({ "text": x.id, "id": x.id }));
                this.getPartnerGroupActive(this.partnerType);
            }
        }, err => {
        });
    }
    getPartnerGroupActive(partnerGroup: any): any {
        if (partnerGroup === PartnerGroupEnum.AGENT) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "AGENT"));
        }
        if (partnerGroup === PartnerGroupEnum.AIRSHIPSUP) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "AIRSHIPSUP"));
        }
        if (partnerGroup === PartnerGroupEnum.CARRIER) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "CARRIER"));
        }
        if (partnerGroup === PartnerGroupEnum.CONSIGNEE) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "CONSIGNEE"));
        }
        if (partnerGroup === PartnerGroupEnum.CUSTOMER) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "CUSTOMER"));
            this.isShowSaleMan = true;
        }
        if (partnerGroup === PartnerGroupEnum.SHIPPER) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "SHIPPER"));
        }
        if (partnerGroup === PartnerGroupEnum.SUPPLIER) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "SUPPLIER"));
        }
        if (partnerGroup === PartnerGroupEnum.STAFF) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "STAFF"));
        }
        if (partnerGroup === PartnerGroupEnum.PERSONAL) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "PERSONAL"));
        }
        if (partnerGroup === PartnerGroupEnum.ALL) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "ALL"));
        }
        if (partnerGroup === -1) {
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "CARRIER"));
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "CONSIGNEE"));
            this.partnerGroupActives.push(this.formPartnerComponent.partnerGroups.find(x => x.id === "SHIPPER"));
        }

        if (this.partnerGroupActives.find(x => x.id === "ALL")) {
            this.partner.partnerGroup = 'CARRIER;CONSIGNEE;SHIPPER;SUPPLIER;STAFF;PERSONAL';
            this.isShowSaleMan = true;
        }
        this.formPartnerComponent.partnerForm.controls['partnerGroup'].setValue(this.partnerGroupActives);
    }


    onSubmit() {
        this.formPartnerComponent.isSubmitted = true;
        this.formPartnerComponent.applyDim.setErrors(null);
        this.formPartnerComponent.roundUpMethod.setErrors(null);
        this.formPartnerComponent.partnerMode.setErrors(null);
        if (!this.formPartnerComponent.partnerForm.valid) {
            return;
        }
        this.getFormPartnerData();
    }
    getFormPartnerData() {
        const formBody = this.formPartnerComponent.partnerForm.getRawValue();

        this.trimInputForm(formBody);
        this.partner.partnerGroup = !!formBody.partnerGroup ? formBody.partnerGroup[0].id : null;
        if (formBody.partnerGroup != null) {
            if (formBody.partnerGroup.find(x => x.id === "ALL")) {
                this.partner.partnerGroup = 'CARRIER;CONSIGNEE;SHIPPER;SUPPLIER;STAFF;PERSONAL';
            } else {
                let s = '';
                for (const item of formBody.partnerGroup) {
                    s += (item['id'] === undefined ? item : item['id']) + ';';
                }
                this.partner.partnerGroup = s.substring(0, s.length - 1);
            }
        }
        //
        const cloneObject = {
            countryId: formBody.countryId,
            provinceId: formBody.provinceId,
            countryShippingId: formBody.countryShippingId,
            provinceShippingId: formBody.provinceShippingId,
            parentId: formBody.partnerAccountRef,

            roundUpMethod: formBody.roundUpMethod ? formBody.roundUpMethod.id : null,
            applyDim: !!formBody.applyDim ? formBody.applyDim.id : null,
            partnerMode: !!formBody.partnerMode ? formBody.partnerMode.id : null,
            partnerLocation: !!formBody.partnerLocation ? formBody.partnerLocation.id : null,

            partnerGroup: this.partner.partnerGroup,
            id: this.partner.id,
            partnerType: 'Supplier',
            creditPayment: !!formBody.creditPayment ? formBody.creditPayment : null
        };

        const mergeObj = Object.assign(_merge(formBody, cloneObject));
        //merge clone & this.partner.
        const mergeObjPartner = Object.assign(_merge(this.partner, mergeObj));
        console.log(mergeObjPartner);
        mergeObjPartner.partnerEmails = [...this.partnerEmailList.partnerEmails];
        //
        this.onCreatePartner(mergeObjPartner);
    }

    trimInputForm(formBody) {
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerNameEn, formBody.partnerNameEn);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.partnerNameVn, formBody.partnerNameVn);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.shortName, formBody.shortName);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.taxCode, formBody.taxCode);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.addressEn, formBody.addressEn);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.addressVn, formBody.addressVn);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.zipCode, formBody.zipCode);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.addressShippingEn, formBody.addressShippingEn);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.addressShippingVn, formBody.addressShippingVn);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.zipCodeShipping, formBody.zipCodeShipping);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.internalReferenceNo, formBody.internalReferenceNo);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.coLoaderCode, formBody.coLoaderCode);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.contactPerson, formBody.contactPerson);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.tel, formBody.tel);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.fax, formBody.fax);

        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.bankAccountNo, formBody.bankAccountNo);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.bankAccountName, formBody.bankAccountNo);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.bankAccountAddress, formBody.bankAccountAddress);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.swiftCode, formBody.swiffCode);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.note, formBody.note);
    }

    onCreatePartner(body: any) {
        this._catalogueRepo.checkTaxCode(body)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.formPartnerComponent.isExistedTaxcode = true;
                        if (!!res.internalReferenceNo) {
                            this.deleteMessage = `This Partner is existed, please you check again!`;
                            this.confirmDuplicatePartner.show();
                        } else {
                            this.deleteMessage = `This <b>Taxcode</b> already <b>Existed</b> in  <b>${res.shortName}</b>, If you want to Create Internal account, Please fill info to <b>Internal Reference Info</b>.`;
                            this.confirmTaxcode.show();
                        }
                    } else {
                        this.onSave(body);
                    }
                },
            );
    }

    onFocusInternalReference() {
        this.confirmTaxcode.hide();

        //
        this.formPartnerComponent.handleFocusInternalReference();
    }

    onSave(body: any) {
        this._catalogueRepo.createPartner(body)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (res.result.success) {
                        this._toastService.success("New data added");
                        this._router.navigate([`${RoutingConstants.CATALOGUE.PARTNER_DATA}/detail/${res.model.id}`]);
                    } else {
                        this._toastService.error("Opps", "Something getting error!");
                    }

                }, err => {
                });
    }
    sortBySaleMan(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.saleMandetail = this._sortService.sort(this.saleMandetail, sortData.sortField, sortData.order);
        }
    }

    showDetailSaleMan(saleman: Saleman, id: any) {
        this.poupSaleman.isDetail = true;
        const saleMane: any = {
            description: saleman.description,
            office: saleman.office,
            effectDate: saleman.effectDate,
            status: saleman.status,
            partnerId: null,
            saleManId: saleman.saleManId,
            service: saleman.service,
            createDate: saleman.createDate,
            freightPayment: saleman.freightPayment,
            serviceName: saleman.serviceName
        };
        this.poupSaleman.showSaleman(saleMane);
        this.poupSaleman.show();
    }

    getListContract(partneId: string) {
        this.isLoading = true;
        this._catalogueRepo.getListContract(partneId)
            .pipe(
                finalize(() => this.isLoading = false)
            )
            .subscribe(
                (res: any[]) => {
                    this.contracts = res || [];
                }
            );
    }

    onRequestContract($event: any) {
        this.contract = $event;
        this.selectedContract = new Contract(this.contract);
        if (!!this.selectedContract && !this.formContractPopup.isCreateNewCommercial) {
            this.getListContract(null);
        } else {

            const objCheckContract = !!this.selectedContract.contractNo && this.contracts.length >= 1 ? this.contracts.some(x => x.contractNo === this.selectedContract.contractNo) : null;
            if (this.indexlstContract !== null) {
                this.contracts[this.indexlstContract] = this.selectedContract;
                this.formContractPopup.hide();
            } else {
                if (objCheckContract && objCheckContract != null) {
                    this.formContractPopup.isDuplicateContract = true;
                    this._toastService.error('Contract no has been existed!');
                } else {
                    this.formContractPopup.isDuplicateContract = false;
                    this.contracts.push(this.selectedContract);
                }
            }
        }
        this.formContractPopup.contracts = this.contracts;
    }

    getDetailContract(id: string, index: number) {
        this.formContractPopup.isUpdate = true;
        this.formContractPopup.partnerId = null;
        this.formContractPopup.selectedContract.id = id;
        this.indexlstContract = index;
        if (this.formContractPopup.selectedContract.id !== SystemConstants.EMPTY_GUID && this.formContractPopup.selectedContract.id !== "") {
            this.formContractPopup.getFileContract();
            this._catalogueRepo.getDetailContract(this.formContractPopup.selectedContract.id)
                .subscribe(
                    (res: Contract) => {
                        this.selectedContract = res;
                        this.formContractPopup.idContract = this.selectedContract.id;
                        this.formContractPopup.selectedContract = res;
                        this.formContractPopup.pachValueToFormContract();
                        this.formContractPopup.show();
                    }
                );
        } else {
            if (this.contracts.length > 0) {
                this.formContractPopup.selectedContract = this.contracts[this.indexlstContract];
                this.formContractPopup.indexDetailContract = this.indexlstContract;
                this.formContractPopup.fileList = this.formContractPopup.selectedContract.fileList;
            }
            this.formContractPopup.pachValueToFormContract();
            this.formContractPopup.show();
        }
    }

    showConfirmDelete(contract: Contract, index: number) {
        this.selectedContract = contract;
        this.indexToRemove = index;
        if (this.selectedContract.id === SystemConstants.EMPTY_GUID) {
            this.contracts = [...this.contracts.slice(0, index), ...this.contracts.slice(index + 1)];
        }
    }


    gotoCreateContract() {
        this.formContractPopup.formGroup.patchValue({
            salesmanId: null,
            officeId: null,
            contractNo: null,
            effectiveDate: null,
            expiredDate: null,
            paymentTerm: null,
            creditLimit: null,
            creditLimitRate: null,
            trialCreditLimit: null,
            trialCreditDays: null,
            trialEffectDate: null,
            trialExpiredDate: null,
            creditAmount: null,
            billingAmount: null,
            paidAmount: null,
            unpaidAmount: null,
            customerAmount: null,
            creditRate: null,
            description: null,
            vas: null,
            saleService: null,
            autoExtendDays: null
        });
        this.formContractPopup.files = null;
        this.formContractPopup.fileList = null;
        this.formContractPopup.isUpdate = false;
        this.formContractPopup.isSubmitted = false;
        this.formContractPopup.partnerId = null;
        this.indexlstContract = null;
        this.formContractPopup.isCreateNewCommercial = true;
        this.formContractPopup.show();
    }




}
