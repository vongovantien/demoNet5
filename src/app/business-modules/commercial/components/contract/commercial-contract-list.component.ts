import { Component, OnInit, ViewChild, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { catchError, finalize } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { Contract } from 'src/app/shared/models/catalogue/catContract.model';
import { CatalogueRepo, SystemFileManageRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { ConfirmPopupComponent, Permission403PopupComponent } from '@common';
import { NgProgress } from '@ngx-progressbar/core';
import { RoutingConstants, SystemConstants } from '@constants';
import { SortService } from '@services';
import { FormContractCommercialPopupComponent } from 'src/app/business-modules/share-modules/components';
import { Store } from '@ngrx/store';
import { IAppState, getMenuUserSpecialPermissionState } from '@store';

@Component({
    selector: 'commercial-contract-list',
    templateUrl: './commercial-contract-list.component.html',
})
export class CommercialContractListComponent extends AppList implements OnInit {
    @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
    @ViewChild(FormContractCommercialPopupComponent) formContractPopup: FormContractCommercialPopupComponent;
    @ViewChild(Permission403PopupComponent) permissionPopup: Permission403PopupComponent;
    @Input() partnerId: string;
    @Input() openOnPartner: boolean = false;
    @Output() onActiveContract: EventEmitter<any> = new EventEmitter<any>();
    contracts: Contract[] = [];
    //
    isActiveNewContract: boolean = true;
    //
    selectedContract: Contract = new Contract();
    indexToRemove: number = 0;
    indexlstContract: number = null;
    contract: Contract = new Contract();

    type: string = '';
    partnerLocation: string = null;

    constructor(private _router: Router,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService,
        private _ngProgressService: NgProgress,
        private _sortService: SortService,
        protected _activeRoute: ActivatedRoute,
        private _systemfileManageRepo: SystemFileManageRepo
    ) {
        super();
        this._progressRef = this._ngProgressService.ref();
        this.requestSort = this.sortLocal;
    }

    ngOnInit(): void {
        this._activeRoute.data.subscribe((result: { name: string, type: string }) => {
            this.type = result.type;

        });
        this.headers = [
            { title: 'Salesman', field: 'username', sortable: true },
            { title: 'Contract No', field: 'contractNo', sortable: true },
            { title: 'Contract Type', field: 'contractType', sortable: true },
            { title: 'Service', field: 'saleService', sortable: true },
            { title: 'Effective Date', field: 'trialEffectDate', sortable: true },
            { title: 'Expired Date', field: 'trialExpiredDate', sortable: true },
            { title: 'Status', field: 'active', sortable: true },
            { title: 'Office', field: 'officeNameEn', sortable: true },
            { title: 'Company', field: 'companyNameAbbr', sortable: true },
            { title: 'AR Confirmed', field: 'arconfirmed', sortable: true },
        ];

    }

    sortLocal(sort: string): void {
        this.contracts = this._sortService.sort(this.contracts, sort, this.order);
    }
    ngAfterViewInit() {
        if (this.type === 'Agent') {
            this.formContractPopup.contractTypes = this.formContractPopup.contractTypes.filter(x => x !== 'Cash');
        }
    }

    gotoCreateContract() {
        this.formContractPopup.formGroup.patchValue({
            officeId: [this.formContractPopup.offices[0]],
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
        });
        this.formContractPopup.files = null;
        this.formContractPopup.fileList = null;
        this.formContractPopup.isUpdate = false;
        this.formContractPopup.isSubmitted = false;
        this.formContractPopup.partnerId = this.partnerId;
        this.indexlstContract = null;
        if (!this.partnerId) {
            this.formContractPopup.isCreateNewCommercial = true;
        }
        this.formContractPopup.selectedContract = new Contract();
        const userLogged = JSON.parse(localStorage.getItem('id_token_claims_obj'));
        this.formContractPopup.salesmanId.setValue(userLogged.id + '-' + userLogged.groupId + '-' + userLogged.departmentId);
        this.formContractPopup.formGroup.controls['paymentTerm'].setValue(30);
        this.formContractPopup.formGroup.controls['creditLimitRate'].setValue(120);


        this.formContractPopup.autoExtendDays.setValue(0);
        this.formContractPopup.contractType.setValue('Trial');
        this.formContractPopup.baseOn.setValue('Invoice Date');

        if (this.type === 'Agent') {
            this.formContractPopup.vas.setValue([{ id: 'All', text: 'All' }]);
            this.formContractPopup.saleService.setValue([{ id: 'All', text: 'All' }]);
            this.formContractPopup.type = this.type;
            this.formContractPopup.saleService.disable();
            this.formContractPopup.paymentMethod.disable();
            this.formContractPopup.vas.disable();
        }

        this.formContractPopup.trialEffectDate.setValue(null);
        this.formContractPopup.trialExpiredDate.setValue(null);
        this.formContractPopup.effectiveDate.setValue(null);
        this.formContractPopup.partnerLocation = this.partnerLocation;
        console.log(this.formContractPopup.partnerLocation);
        this.formContractPopup.autoExtendDays.setValue(0);
        if (this.type === 'Agent') {
            this.formContractPopup.currencyId.setValue('USD');
            this.formContractPopup.creditCurrency.setValue('USD');
        } else {
            if (this.partnerLocation === "Domestic") {
                this.formContractPopup.currencyId.setValue('VND');
                this.formContractPopup.creditCurrency.setValue('VND');
            }
            if (this.partnerLocation === "Oversea") {
                this.formContractPopup.currencyId.setValue('USD');
                this.formContractPopup.creditCurrency.setValue('USD');
            }
        }
        this.formContractPopup.show();

    }

    getDetailContract(id: string, index: number) {
        this.formContractPopup.isUpdate = true;
        this.formContractPopup.partnerId = this.partnerId;
        this.formContractPopup.selectedContract.id = id;
        this.formContractPopup.openOnPartner = this.openOnPartner;
        this.indexlstContract = index;
        if (this.formContractPopup.selectedContract.id !== SystemConstants.EMPTY_GUID && this.formContractPopup.selectedContract.id !== "") {
            this.formContractPopup.getFileContract();
            this._catalogueRepo.getDetailContract(this.formContractPopup.selectedContract.id)
                .subscribe(
                    (res: Contract) => {
                        if (!!res) {
                            this.selectedContract = res;
                            if (this.selectedContract.viewDetail === null || this.selectedContract.viewDetail === false) {
                                this.permissionPopup.show();
                                return
                            }
                            this.formContractPopup.idContract = this.selectedContract.id;
                            this.formContractPopup.selectedContract = res;
                            this.formContractPopup.statusContract = this.formContractPopup.selectedContract.active;

                            this.formContractPopup.pachValueToFormContract();
                            this.formContractPopup.show();
                        }
                    }
                );
        } else {
            if (this.contracts.length > 0) {
                this.contract = new Contract(this.contracts[this.indexlstContract]);
                this.formContractPopup.selectedContract = this.contracts[this.indexlstContract];
                this.formContractPopup.contract = this.selectedContract;
                this.formContractPopup.indexDetailContract = this.indexlstContract;
                this.formContractPopup.fileList = this.formContractPopup.selectedContract.fileList;
            }
            this.formContractPopup.pachValueToFormContract();
            this.formContractPopup.show();
        }
    }

    getFileContract() {
        this.formContractPopup.isLoading = true;
        // this._catalogueRepo.getContractFilesAttach(this.partnerId, this.formContractPopup.selectedContract.id).
        //     pipe(catchError(this.catchError), finalize(() => {
        //         this._progressRef.complete();
        //         this.formContractPopup.isLoading = false;
        //     }))
        //     .subscribe(
        //         (res: any = []) => {
        //             this.formContractPopup.files = res;
        //             console.log(this.formContractPopup.files);
        //         }
        //     );
        this._systemfileManageRepo.getContractFilesAttach(this.formContractPopup.selectedContract.id).
            pipe(catchError(this.catchError), finalize(() => {
                this._progressRef.complete();
                this.formContractPopup.isLoading = false;
            }))
            .subscribe(
                (res: any = []) => {
                    this.formContractPopup.files = res;
                    console.log(this.formContractPopup.files);
                }
            );
    }

    showConfirmDelete(contract: Contract, index: number) {
        this.selectedContract = contract;
        this.indexToRemove = index;
        if (this.selectedContract.id === SystemConstants.EMPTY_GUID) {
            this.contracts = [...this.contracts.slice(0, index), ...this.contracts.slice(index + 1)];
        } else {
            this.confirmDeletePopup.show();
        }
    }

    onDelete() {
        this.confirmDeletePopup.hide();
        this._catalogueRepo.deleteContract(this.selectedContract.id, this.partnerId)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        this.getListContract(this.partnerId);
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    showDetail(contract: Contract) {
        this.selectedContract = contract;
        this._router.navigate([`${RoutingConstants.COMMERCIAL.CUSTOMER}/${this.partnerId}/contract/${this.selectedContract.id}`]);
    }
    getListContract(partneId: string) {
        this.isLoading = true;
        this._catalogueRepo.getListContract(partneId, false)
            .pipe(
                finalize(() => this.isLoading = false)
            )
            .subscribe(
                (res: Contract[]) => {
                    this.contracts = res || [];
                }
            );
    }

    onRequestContract($event: any) {
        // this.contract = $event;
        this.selectedContract = new Contract($event);
        const data = $event;
        if (!!this.selectedContract && !this.formContractPopup.isCreateNewCommercial) {
            this.getListContract(this.partnerId);
        } else {
            const checkUpdate = this.contracts.some(x => data.saleService.includes(x.saleService) && data.officeId.includes(x.officeId) && data.contractType === x.contractType && x.index !== data.index);
            const objCheckContract = !!this.selectedContract.contractNo && this.contracts.length >= 1 ? data.contractType === "Official" && this.contracts.some(x => x.contractNo === this.selectedContract.contractNo) : null;
            if (this.indexlstContract !== null) {
                if (!checkUpdate) {
                    this.contracts[this.indexlstContract] = this.selectedContract;
                    this.contracts = [...this.contracts];
                    this.formContractPopup.hide();
                } else {
                    this.contracts[this.indexlstContract] = this.contract;
                    this.contracts = [...this.contracts];
                    this._toastService.error('Duplicate service , Agreement Type, office ,salesman!');
                }
            } else {
                if (objCheckContract && objCheckContract != null) {
                    this.formContractPopup.isDuplicateContract = true;
                    this._toastService.error('Contract no has been existed!');
                } else {
                    const check = this.contracts.some(x => data.saleService.includes(x.saleService) && data.officeId.includes(x.officeId) && data.contractType == x.contractType);
                    if (!check) {
                        this.contracts = [...this.contracts, data];
                        this.formContractPopup.isDuplicateContract = false;
                        this.formContractPopup.hide();
                    } else {
                        this._toastService.error('Duplicate service , Agreement Type , office !');
                    }
                }
            }
        }
        this.formContractPopup.contracts = this.contracts;
        this.onActiveContract.emit(this.selectedContract);
    }


}
