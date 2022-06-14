
import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Partner } from 'src/app/shared/models/catalogue/partner.model';
import { PartnerGroupEnum } from 'src/app/shared/enums/partnerGroup.enum';
import { SortService } from 'src/app/shared/services/sort.service';
import { Saleman } from 'src/app/shared/models/catalogue/saleman.model';
import { SalemanAdd } from 'src/app/shared/models/catalogue/salemanadd.model';
import { CatalogueRepo, SystemRepo } from 'src/app/shared/repositories';
import { ConfirmPopupComponent, InfoPopupComponent } from 'src/app/shared/common/popup';
import { catchError, finalize, map, takeUntil } from "rxjs/operators";
import { AppList } from 'src/app/app.list';
import { ToastrService } from 'ngx-toastr';
import { SalemanPopupComponent } from '../components/saleman-popup.component';
import { forkJoin, Observable, combineLatest } from 'rxjs';
import { FormAddPartnerComponent } from '../components/form-add-partner/form-add-partner.component';
import { NgProgress } from '@ngx-progressbar/core';
import { SystemConstants } from 'src/constants/system.const';
import { Company } from '@models';
import { Contract } from 'src/app/shared/models/catalogue/catContract.model';
import { CommercialContractListComponent } from 'src/app/business-modules/commercial/components/contract/commercial-contract-list.component';
import { CommercialBranchSubListComponent } from 'src/app/business-modules/commercial/components/branch-sub/commercial-branch-sub-list.component';
import _merge from 'lodash/merge';
import { getMenuUserPermissionState, getMenuUserSpecialPermissionState, IAppState } from '@store';
import { Store } from '@ngrx/store';
import { RoutingConstants } from '@constants';
import { FormContractCommercialPopupComponent, PartnerRejectPopupComponent } from 'src/app/business-modules/share-modules/components';
import { CommercialEmailListComponent } from 'src/app/business-modules/commercial/components/email/commercial-email-list.component';
import { UserCreatePopupComponent } from '../components/user-create-popup/user-create-popup.component';


@Component({
    selector: 'app-partner-detail',
    templateUrl: './detail-partner.component.html',
    styleUrls: ['./detail-partner.component.scss']
})
export class PartnerDetailComponent extends AppList {
    @ViewChild(FormAddPartnerComponent) formPartnerComponent: FormAddPartnerComponent;
    @ViewChild("popupDeleteSaleman") confirmDeleteSalemanPopup: ConfirmPopupComponent;
    @ViewChild("popupDeleteContract") confirmDeleteContract: ConfirmPopupComponent;

    @ViewChild("popupDeletePartner") confirmDeletePartnerPopup: ConfirmPopupComponent;
    @ViewChild('internalReferenceConfirmPopup') confirmTaxcode: ConfirmPopupComponent;
    @ViewChild('duplicatePartnerPopup') confirmDuplicatePartner: InfoPopupComponent;
    @ViewChild(InfoPopupComponent) canNotDeleteJobPopup: InfoPopupComponent;
    @ViewChild(SalemanPopupComponent) poupSaleman: SalemanPopupComponent;
    @ViewChild(FormContractCommercialPopupComponent) formContractPopup: FormContractCommercialPopupComponent;
    @ViewChild(PartnerRejectPopupComponent) popupRejectPartner: PartnerRejectPopupComponent;
    @ViewChild(CommercialContractListComponent) listContract: CommercialContractListComponent;
    @ViewChild(CommercialBranchSubListComponent) listSubPartner: CommercialBranchSubListComponent;
    @ViewChild(CommercialEmailListComponent) partnerEmailList: CommercialEmailListComponent;
    @ViewChild(UserCreatePopupComponent) userCreatePopup: UserCreatePopupComponent;

    public originRoute: string = null;
    contracts: Contract[] = [];
    selectedContract: Contract = new Contract();
    contract: Contract = new Contract();

    indexToRemove: number = 0;
    indexlstContract: number = null;

    activeNg: boolean = true;
    partner: Partner = new Partner();
    partnerGroupActives: any = [];
    partnerType: any;
    saleMandetail: any[] = [];
    headerSaleman: CommonInterface.IHeaderTable[];
    services: any[] = [];
    status: CommonInterface.ICommonTitleValue[] = [];
    offices: any[] = [];
    strOfficeCurrent: any = '';
    strSalemanCurrent: any = '';
    selectedStatus: any = {};
    selectedService: any = {};
    deleteMessage: string = '';
    saleMantoView: Saleman = new Saleman();
    dataSearchSaleman: any = {};
    isShowSaleMan: boolean = false;
    index: number = 0;
    isExistedTaxcode: boolean = false;
    currenctUser: any = '';
    company: Company[] = [];
    salemansId: string = null;
    allowDelete: boolean = true;
    allowUpdate: boolean = true;

    list: any[] = [];

    isDup: boolean = false;
    isAddSubPartner: boolean = false;

    menuSpecialPermission: Observable<any[]>;

    constructor(private route: ActivatedRoute,
        private router: Router,
        private _catalogueRepo: CatalogueRepo,
        private _sortService: SortService,
        private toastr: ToastrService,
        private _systemRepo: SystemRepo,
        private _progressService: NgProgress,
        private _toastService: ToastrService,
        private _cd: ChangeDetectorRef,
        private _store: Store<IAppState>
    ) {
        super();
        this._progressRef = this._progressService.ref();
        this.requestSort = this.sortLocal;
    }

    sortLocal(sort: string): void {
        this.contracts = this._sortService.sort(this.contracts, sort, this.order);
    }

    ngOnInit() {
        this.initHeaderSalemanTable();
        combineLatest([
            this.route.params,
            this.route.data,
        ]).pipe(
            map(([p, d]) => ({ ...p, ...d }))
        ).subscribe(
            (res: any) => {
                if (!!res.id) {
                    this.partner.id = res.id;
                }
                if (res.action) {
                    if (localStorage.getItem('success_add_sub') === "true") {
                        localStorage.removeItem('success_add_sub');
                        this.back();
                    }
                    this.isAddSubPartner = res.action;
                } else {
                    localStorage.removeItem('success_add_sub');
                }
                this.getDataCombobox();
                if (this.isAddSubPartner) {
                    this.getListContract(null);
                } else {
                    this.getListContract(this.partner.id);
                }
            });

        this.menuSpecialPermission = this._store.select(getMenuUserSpecialPermissionState);
        const claim = localStorage.getItem(SystemConstants.USER_CLAIMS);
        this.currenctUser = JSON.parse(claim)["id"];
    }

    ngAfterViewInit() {
        this.formPartnerComponent.isUpdate = !this.isAddSubPartner;
        this.partnerEmailList.getEmailPartner(this.partner.id);
        this.partnerEmailList.partnerId = this.partner.id;
        this._cd.detectChanges();
    }

    getParnerDetails() {
        this._progressRef.start();
        this._catalogueRepo.getDetailPartner(this.partner.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.partner = res;
                        this.allowDelete = this.partner.permission.allowDelete;
                        this.allowUpdate = this.partner.permission.allowUpdate;
                        this.formPartnerComponent.isAddBranchSub = this.isAddSubPartner;
                        this.formPartnerComponent.groups = this.partner.partnerGroup;
                        console.log("res: ", res);
                        this.formPartnerComponent.setFormData(this.partner);
                        if (this.isAddSubPartner) {
                            this.formPartnerComponent.getACRefName(this.partner.id);
                        } else {
                            this.getParentCustomers();
                            this.formPartnerComponent.getACRefName(this.partner.parentId);
                        }
                        console.log(this.partner.partnerMode);
                        if (this.partner.partnerMode === 'External') {
                            this.formPartnerComponent.isDisabledInternalCode = true;
                        }
                        if (!!this.partner.partnerType && !this.isAddSubPartner) {
                            this.getSubListPartner(this.partner.id);
                        }
                        this.formPartnerComponent.activePartner = this.partner.active;

                        this.userCreatePopup.partnerId = this.partner.id;
                        this._store.select(getMenuUserPermissionState)
                        .pipe(takeUntil(this.ngUnsubscribe))
                        .subscribe(x=>{
                            if(!x.specialActions.length){getMenuUserPermissionState
                                const changeUser = x.specialActions.filter( permiss => permiss['action'] === 'ChangeInfo' && permiss['isAllow']).length;
                                if(changeUser && !this.isAddSubPartner){
                                    this.userCreatePopup.partnerId = this.partner.id;
                                }
                            }
                        });
                    }
                }
            );

    }

    getParentCustomers() {
        this._catalogueRepo.getPartnersByType(PartnerGroupEnum.ALL, true, this.partner.id)
            .pipe(catchError(this.catchError), finalize(() => { }))
            .subscribe(
                (res) => {
                    if (res) {
                        this.formPartnerComponent.parentCustomers = res;
                    } else { this.formPartnerComponent.parentCustomers = []; }
                }
            );
    }

    checkRequireSaleman(partnerGroup: string): boolean {
        if (partnerGroup != null) {
            if (partnerGroup.includes('CUSTOMER') || partnerGroup.includes('ALL')) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    getSalemanPagingByPartnerId(dataSearchSaleman?: any) {
        this.isLoading = true;
        this._catalogueRepo.getListSaleManDetail(Object.assign({}, dataSearchSaleman, { partnerId: this.partner.id }))
            .pipe(
                catchError(this.catchError),
                finalize(() => { this.isLoading = false; })
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        console.log(res);
                        this.saleMandetail = (res || []).map((item: Saleman) => new Saleman(item));
                        if (this.saleMandetail.length > 0) {
                            for (const it of this.saleMandetail) {
                                this.services.forEach(item => {
                                    if (it.service === item.id) {
                                        it.serviceName = item.text;
                                    }
                                });
                                this.offices.forEach(item => {
                                    if (it.office === item.id) {
                                        it.officeName = item.branchNameEn;
                                    }
                                    if (it.company === item.buid) {
                                        const objCompany = this.company.find(x => x.id === item.buid);
                                        it.companyName = objCompany.bunameAbbr;
                                    }
                                });
                            }
                        }
                    }

                },
            );
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
            this._catalogueRepo.getProvinces(),
            this._catalogueRepo.getPartnersByType(PartnerGroupEnum.ALL, true, this.partner.id),
            this._catalogueRepo.getPartnerGroup(),
            this._systemRepo.getAllOffice(),
            this._catalogueRepo.getPartnerCharge(this.partner.id)
        ])
            .pipe(catchError(this.catchError))
            .subscribe(
                ([countries, provinces, customers, partnerGroups, workPlaces, partnerCharge]) => {
                    this.formPartnerComponent.countries = this.utility.prepareNg2SelectData(countries || [], 'id', 'name');
                    this.formPartnerComponent.billingProvinces = this.utility.prepareNg2SelectData(provinces || [], 'id', 'name_VN');
                    this.formPartnerComponent.shippingProvinces = this.utility.prepareNg2SelectData(provinces || [], 'id', 'name_VN');
                    // this.formPartnerComponent.parentCustomers = this.utility.prepareNg2SelectData(customers || [], 'id', 'partnerNameVn');
                    this.formPartnerComponent.parentCustomers = customers;
                    this.formPartnerComponent.partnerGroups = this.utility.prepareNg2SelectData(partnerGroups || [], 'id', 'id');
                    this.getPartnerGroupActive(this.partnerType);
                    this.formPartnerComponent.workPlaces = workPlaces.map(x => ({ "text": x.code + ' - ' + x.branchNameEn, "id": x.id }));
                    this.getParnerDetails();


                    // * Update other charge.
                    this.formPartnerComponent.otherChargePopup.initCharges = partnerCharge || [];
                    this.formPartnerComponent.otherChargePopup.charges = partnerCharge || [];

                },
                () => { },

            );
    }


    getService() {
        this._catalogueRepo.getListService()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.services = this.utility.prepareNg2SelectData(res, 'value', 'displayName');
                        this.getSalemanPagingByPartnerId(this.dataSearchSaleman);
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
        if (this.partnerGroupActives.find(x => x.id === "ALL")) {
            this.partner.partnerGroup = 'CARRIER;CONSIGNEE;SHIPPER;SUPPLIER;STAFF;PERSONAL';
            this.isShowSaleMan = true;
        }
        this.formPartnerComponent.partnerForm.controls['partnerGroup'].setValue(this.partnerGroupActives);
    }

    onSubmit() {
        this.formPartnerComponent.isSubmitted = true;
        if (this.isAddSubPartner) {
            this.formPartnerComponent.applyDim.setErrors(null);
            this.formPartnerComponent.roundUpMethod.setErrors(null);
            this.formPartnerComponent.partnerMode.setErrors(null);
        }
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
        const cloneObject = {
            countryId: formBody.countryId,
            provinceId: formBody.provinceId,
            countryShippingId: formBody.countryShippingId,
            provinceShippingId: formBody.provinceShippingId,
            parentId: formBody.partnerAccountRef,

            roundUpMethod: formBody.roundUpMethod ? formBody.roundUpMethod.id : null,
            applyDim: !!formBody.applyDim ? formBody.applyDim.id : null,
            partnerGroup: this.partner.partnerGroup,
            partnerMode: !!formBody.partnerMode ? formBody.partnerMode.id : null,
            partnerLocation: !!formBody.partnerLocation ? formBody.partnerLocation.id : null,
            id: this.isAddSubPartner ? null : this.partner.id,
            creditPayment: !!formBody.creditPayment ? formBody.creditPayment.id : null,
        };
        console.log("formBody: ", formBody);
        console.log("clone: ", cloneObject);
        const mergeObj = Object.assign(_merge(formBody, cloneObject));
        // merge clone & this.partner.
        const mergeObjPartner = Object.assign(_merge(this.partner, mergeObj));

        console.log("merge2: ", mergeObjPartner);
        //
        this.updatePartner(mergeObjPartner);
    }
    trimInputForm(formBody: any) {
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
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.bankAccountName, formBody.bankAccountName);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.bankAccountAddress, formBody.bankAccountAddress);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.swiftCode, formBody.swiftCode);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.note, formBody.note);
        //
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.billingEmail, formBody.billingEmail);
        this.formPartnerComponent.trimInputValue(this.formPartnerComponent.billingPhone, formBody.billingPhone);
    }

    onFocusInternalReference() {
        this.confirmTaxcode.hide();
        //
        this.formPartnerComponent.handleFocusInternalReference();
    }

    updatePartner(body: any) {
        this._catalogueRepo.checkTaxCode(body)
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    console.log("res check: ", res);

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
    onSave(body: any) {

        this._progressRef.start();
        if (!this.isAddSubPartner) {
            this._catalogueRepo.updatePartner(body.id, body)
                .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this.formPartnerComponent.activePartner = this.partner.active;
                            this.getParentCustomers();
                            this._toastService.success(res.message);
                        } else {
                            this._toastService.warning(res.message);
                        }
                    }
                );
        } else {
            this._catalogueRepo.createPartner(body)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: any) => {
                        if (res.result.success) {
                            this._toastService.success("New data added");
                            this.router.navigate([`${RoutingConstants.CATALOGUE.PARTNER_DATA}/detail/${res.model.id}`]);
                        } else {
                            this._toastService.error("Opps", "Something getting error!");
                        }

                    }, err => {
                    });
        }
    }

    sortBySaleMan(sortData: CommonInterface.ISortData): void {
        if (!!sortData.sortField) {
            this.saleMandetail = this._sortService.sort(this.saleMandetail, sortData.sortField, sortData.order);
        }
    }

    showConfirmDelete() {
        this._catalogueRepo.getDetailPartner(this.partner.id)
            .subscribe(
                (res: any) => {
                    if (!res) {
                        this._toastService.warning("This Partner has been deleted, Please check again!");
                    } else {
                        if (res.active) {
                            this._toastService.warning("This Partner can't delete, Please reload Partner!");
                        } else {
                            this.deleteMessage = `Do you want to delete this partner  ${this.partner.partnerNameEn}?`;
                            this.confirmDeletePartnerPopup.show();
                        }
                    }
                });

    }

    onDelete() {
        this._catalogueRepo.deletePartner(this.partner.id)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.confirmDeletePartnerPopup.hide();
                        localStorage.setItem('success_add_sub', "true");
                        this.back();
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    getListContract(partneId: string) {
        this.isLoading = true;
        this._catalogueRepo.getListContract(partneId, false)
            .pipe(
                finalize(() => this.isLoading = false)
            )
            .subscribe(
                (res: any[]) => {
                    this.listContract.contracts = res || [];
                    this.listContract.isActiveNewContract = false;
                }
            );
    }

    getSubListPartner(partnerId: string) {
        this.isLoading = true;
        this._catalogueRepo.getSubListPartner(partnerId)
            .pipe(catchError(this.catchError), finalize(() => {
                this.isLoading = false;
            })).subscribe(
                (res: Partner[]) => {
                    this.listSubPartner.partners = res || [];
                    this.listSubPartner.parentId = partnerId;
                    this.listSubPartner.partnerType = this.partner.partnerType;
                }
            );
    }

    onRequestContract($event: any) {
        this.contract = $event;
        this.selectedContract = new Contract(this.contract);
        if (!!this.selectedContract && !this.formContractPopup.isCreateNewCommercial) {
            this.getListContract(this.partner.id);
        } else {
            console.log(this.selectedContract);
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

    showRejectCommentPopup() {
        this.popupRejectPartner.comment = '';
        this.popupRejectPartner.show();
    }

    onSaveReject($event: string) {
        const comment = $event;
        console.log(comment);
        this._progressRef.start();
        this._catalogueRepo.rejectComment(this.partner.id, comment)
            .pipe(
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: boolean) => {
                    if (res === true) {
                        this._toastService.success('Sent Successfully!');
                    } else {
                        this._toastService.error('something went wrong!');
                    }
                }
            );


    }

    onRequestApproval() {
        this._progressRef.start();
        this._catalogueRepo.requestApproval(this.partner.id)
            .pipe(
                finalize(() => this._progressRef.complete())
            )
            .subscribe(
                (res: boolean) => {
                    if (res === true) {
                        this._toastService.success('Request Approval Successfully!');
                    } else {
                        this._toastService.error('something went wrong!');
                    }
                }
            );


    }

    gotoList() {
        localStorage.setItem('success_add_sub', "true");
        this.back();
    }

    onChangeCreator() {
        this.userCreatePopup.show();
    }
}
