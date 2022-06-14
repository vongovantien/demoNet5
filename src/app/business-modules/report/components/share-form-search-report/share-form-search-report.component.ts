import { Component, Output, EventEmitter, ViewChild, Input } from "@angular/core";
import { AppForm } from "src/app/app.form";
import { FormBuilder, FormGroup, AbstractControl, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { Customer, PortIndex, Partner } from "@models";
import { CatalogueRepo, SystemRepo } from "@repositories";
import { Store } from "@ngrx/store";
import { IAppState, getMenuUserPermissionState } from "@store";
import { formatDate } from "@angular/common";
import { catchError, finalize, takeUntil } from "rxjs/operators";
import { CommonEnum } from "@enums";
import { SystemConstants } from "src/constants/system.const";
import { ReportInterface } from "src/app/shared/interfaces/report-interface";
import { ShareModulesInputShipmentPopupComponent } from "src/app/business-modules/share-modules/components";
import { PartnerGroupEnum } from "src/app/shared/enums/partnerGroup.enum";
import { FormValidators } from "@validators";


@Component({
    selector: 'share-report-form-search',
    templateUrl: './share-form-search-report.component.html'
})
export class ShareFormSearchReportComponent extends AppForm {
    @Output() onSearch: EventEmitter<ReportInterface.ISaleReportCriteria> = new EventEmitter<ReportInterface.ISaleReportCriteria>();
    @Output() onSearchCom: EventEmitter<ReportInterface.ICommissionReportCriteria> = new EventEmitter<ReportInterface.ICommissionReportCriteria>();
    @Output() onGeneralSearch: EventEmitter<ReportInterface.ISearchDataCriteria> = new EventEmitter<ReportInterface.ISearchDataCriteria>();

    @ViewChild(ShareModulesInputShipmentPopupComponent, { static: false }) inputShipmentPopup: ShareModulesInputShipmentPopupComponent;

    @Input() isCommissionIncentive: boolean = false;
    @Input() isGeneralReport: boolean = false;
    @Input() isSheetDebitRpt: boolean = false;
    menuPermission: SystemInterface.IUserPermission;

    formSearch: FormGroup;
    serviceDate: AbstractControl;
    dateType: AbstractControl;
    customer: AbstractControl;
    carrier: AbstractControl;
    agent: AbstractControl;
    service: AbstractControl;
    currency: AbstractControl;
    refNo: AbstractControl;
    refNoType: AbstractControl;
    office: AbstractControl;
    department: AbstractControl;
    group: AbstractControl;
    staff: AbstractControl;
    staffType: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    typeReport: AbstractControl;
    partnerAccount: AbstractControl;
    exchangeRate: AbstractControl;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = [
        { field: 'accountNo', label: 'Tax Code' },
        { field: 'shortName', label: 'Name ABBR' }
    ];

    displayFieldPort: CommonInterface.IComboGridDisplayField[] = [
        { field: 'code', label: 'Port Code' },
        { field: 'nameEn', label: 'Port Name' }
    ];

    displayFieldsPartner: CommonInterface.IComboGridDisplayField[] = [
        { field: 'partnerNameVn', label: 'Partner Name' },
        { field: 'accountNo', label: 'Tax Code' }
    ];

    customers: Observable<Customer[]>;
    carriers: Observable<Customer[]>;
    agents: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;
    partners: Observable<Partner[]>;

    dateTypeList: ReportInterface.INg2Select[] = [
        { id: "ServiceDate", text: "Service Date" },
        { id: "CreatedDate", text: "Created Date" }
    ];

    refNoTypeList: ReportInterface.INg2Select[] = [
        { id: 'JOBID', text: 'JOB JD' },
        { id: 'HBL', text: 'HBL/HAWB' },
        { id: 'MBL', text: 'MBL/MAWB' }
    ];

    staffTypeList: ReportInterface.INg2Select[] = [
        { id: 'PIC', text: 'Person In Charge' },
        { id: 'SALESMAN', text: 'Salesman' },
        { id: 'CREATOR', text: 'Creator' }
    ];
    serviceList: any[] = [];
    serviceActive: any[] = [];
    customerActive: any[] = [];
    currencyList: any[] = [];
    officeList: any[] = [];
    officeActive: any[] = [];
    departmentList: any[] = [];
    departmentActive: any[] = [];
    groupList: any[] = [];
    groupActive: any[] = [];
    staffList: any[] = [];
    staffActive: any[] = [];

    typeAccReportList: ReportInterface.INg2Select[] = [
        { id: CommonEnum.SHEET_DEBIT_REPORT_TYPE.ACCNT_PL_SHEET, text: 'Accountant P/L Sheet' },
        { id: CommonEnum.JOB_PROFIT_ANALYSIS_TYPE.JOB_PROFIT_ANALYSIS, text: 'Job Profit Analysis' },
        { id: CommonEnum.SHEET_DEBIT_REPORT_TYPE.SUMMARY_OF_COST, text: 'Summary Of Costs Incurred' },
        { id: CommonEnum.SHEET_DEBIT_REPORT_TYPE.SUMMARY_OF_REVENUE, text: 'Summary Of Revenue Incurred' },
        { id: CommonEnum.SHEET_DEBIT_REPORT_TYPE.COSTS_BY_PARTNER, text: 'Costs By Partner' }
    ];

    typeReportList: ReportInterface.INg2Select[] = [
        { id: CommonEnum.SALE_REPORT_TYPE.SR_MONTHLY, text: 'Monthly Sale Report' },
        { id: CommonEnum.SALE_REPORT_TYPE.SR_DEPARTMENT, text: 'Sale Report By Department' },
        { id: CommonEnum.SALE_REPORT_TYPE.SR_QUARTER, text: 'Sale Report By Quarter' },
        { id: CommonEnum.SALE_REPORT_TYPE.SR_SUMMARY, text: 'Summary Sale Report' },
        { id: CommonEnum.SALE_REPORT_TYPE.SR_COMBINATION, text: 'Combination Statistic Report' },
        { id: CommonEnum.SALE_REPORT_TYPE.SR_KICKBACK, text: 'Sale KickBack Report' }
    ];

    typeComReportList: ReportInterface.INg2Select[] = [
        { text: 'Commission PR for Air/Sea', id: CommonEnum.COMMISSION_INCENTIVE_TYPE.COMMISSION_PR_AS },
        { text: 'Commission PR for OPS', id: CommonEnum.COMMISSION_INCENTIVE_TYPE.COMMISSION_PR_OPS },
        { text: 'Incentive', id: CommonEnum.COMMISSION_INCENTIVE_TYPE.INCENTIVE_RPT }
    ];

    typeReportActive: any[] = [];

    userLogged: any;

    officesInit: any[] = [];
    departmentsInit: any[] = [];
    groupsInit: any[] = [];
    staffsInit: any[] = [];

    groupSpecial: any[] = [];
    numberOfShipment: number = 0;
    shipmentInput: OperationInteface.IInputShipment;
    inValidIncentiveRpt: boolean = false;

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _store: Store<IAppState>,
        private _systemRepo: SystemRepo,
    ) {
        super();
    }

    ngOnInit() {
        this.initDataInform();
        this.initFormSearch();
        this.ports = this._catalogueRepo.getListPort({ placeType: CommonEnum.PlaceTypeEnum.Port });

        this.userLogged = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));
        this._store.select(getMenuUserPermissionState)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((res: SystemInterface.IUserPermission) => {
                if (res !== null && res !== undefined && Object.keys(res).length !== 0) {
                    this.menuPermission = res;
                    if (this.menuPermission.list !== 'None') {
                        if (this.menuPermission.list === 'All' || this.menuPermission.list === 'Company') {
                            this.getAllOffice();
                            this.getAllDepartment();
                            this.getAllGroup();
                        } else if (this.menuPermission.list === 'All' || this.menuPermission.list === 'Company' || this.menuPermission.list === 'Office') {
                            this.getAllDepartment();
                            this.getAllGroup();
                        } else if (this.menuPermission.list === 'All' || this.menuPermission.list === 'Company' || this.menuPermission.list === 'Office' || this.menuPermission.list === 'Department') {
                            this.getAllGroup();
                        }
                        this.getDataUserLever();
                        this.getAllStaff();
                    }
                }
            });
    }

    initFormSearch() {
        const staffTypeInit = this.isGeneralReport || this.isSheetDebitRpt ? [this.staffTypeList[0].id] : [this.staffTypeList[1].id];
        this.formSearch = this._fb.group({
            serviceDate: [{
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
            }],
            dateType: [this.dateTypeList[0].id],
            customer: (this.isCommissionIncentive && (!!this.typeReport && this.typeReport.value == this.typeComReportList[2].id)) ? [null, Validators.required] : [],// require customer cho report incentive
            carrier: [],
            agent: [],
            service: [this.serviceActive],
            currency: [],
            refNo: [],
            refNoType: [this.refNoTypeList[0].id],
            office: [this.officeActive],
            department: [this.departmentActive],
            group: [this.groupActive],
            staff: [this.staffActive],
            staffType: staffTypeInit,
            pol: [],
            pod: [],
            partnerAccount: [null, Validators.compose([
                FormValidators.required,
            ])],
            exchangeRate: 20000,
            typeReport: this.isGeneralReport ? [] : [this.typeReportActive[0].id],
        });

        this.serviceDate = this.formSearch.controls['serviceDate'];
        this.dateType = this.formSearch.controls['dateType'];
        this.customer = this.formSearch.controls['customer'];
        this.carrier = this.formSearch.controls['carrier'];
        this.agent = this.formSearch.controls['agent'];
        this.service = this.formSearch.controls['service'];
        this.currency = this.formSearch.controls['currency'];
        this.refNo = this.formSearch.controls['refNo'];
        this.refNoType = this.formSearch.controls['refNoType'];
        this.office = this.formSearch.controls['office'];
        this.department = this.formSearch.controls['department'];
        this.group = this.formSearch.controls['group'];
        this.staff = this.formSearch.controls['staff'];
        this.staffType = this.formSearch.controls['staffType'];
        this.pol = this.formSearch.controls['pol'];
        this.pod = this.formSearch.controls['pod'];
        this.partnerAccount = this.formSearch.controls['partnerAccount'];
        this.exchangeRate = this.formSearch.controls['exchangeRate'];
        this.typeReport = this.formSearch.controls['typeReport'];
    }

    initDataInform() {
        this.getService();
        this.getCurrency();
        if (!this.isGeneralReport) {
            this.getTypeReportList();
        }
    }

    getTypeReportList() {
        if (this.isSheetDebitRpt) {
            this.typeReportActive = this.typeAccReportList;
        } else if (this.isCommissionIncentive) {
            this.typeReportActive = this.typeComReportList;
        } else {
            this.typeReportActive = this.typeReportList;
        }
    }

    // Check if choose All
    selectAllDataInForm(data: any) {
        if (data.length === 1) {
            return data[0].id === 'All';
        } else {
            return data.findIndex(x => x.id === 'All') > 0;
        }
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'carrier':
                this.carrier.setValue(data.id);
                break;
            case 'agent':
                this.agent.setValue(data.id);
                break;
            case 'pol':
                this.pol.setValue(data.id);
                break;
            case 'pod':
                this.pod.setValue(data.id);
                break;
            case 'service':
                if (data.id === 'All') {
                    this.serviceActive.length = 0;
                    this.serviceActive = [...this.serviceActive, 'All'];
                } else {
                    this.detectServiceWithAllOption('service', data.id);
                }
                break;
            case 'office':
                if (this.selectAllDataInForm(data)) {
                    this.officeActive.length = 0;
                    this.officeActive = [...this.officeActive, 'All'];
                } else {
                    this.detectServiceWithAllOption('office', data);
                }
                // Reload deparment
                this.getDepartment(this.departmentsInit);
                break;
            case 'department':
                if (this.selectAllDataInForm(data)) {
                    this.departmentActive.length = 0;
                    this.departmentActive = [...this.departmentActive, 'All'];
                } else {
                    this.detectServiceWithAllOption('department', data);
                }
                // Reload group
                this.getGroup(this.groupsInit);
                break;
            case 'group':
                if (this.selectAllDataInForm(data)) {
                    this.groupActive.length = 0;
                    this.groupActive = [...this.groupActive, 'All'];
                } else {
                    this.detectServiceWithAllOption('group', data);
                }
                // Reload staff
                this.getStaff(this.staffsInit);
                break;
            case 'staff':
                if (this.selectAllDataInForm(data)) {
                    this.staffActive.length = 0;
                    this.staffActive = [...this.staffActive, 'All'];
                } else {
                    this.detectServiceWithAllOption('staff', data);
                }
                break;
            case 'typeReport':
                this.typeReport.setValue(data.id);
                break;
            case 'acPartner':
                this.partnerAccount.setValue(data.id);
                break;
            default:
                break;
        }
    }

    onRemoveDataFormInfo(data: any, type: string) {
        // if (type === 'service') {
        //     const id = !!data.id ? data.id : data.value.id;
        //     this.serviceActive.splice(this.serviceActive.findIndex((item) => item.id === id), 1);
        // }
        if (type === 'office') {
            this.officeActive.splice(this.officeActive.findIndex((item) => item.id === data.id), 1);
            if (this.officeActive.length === 0) {
                this.department.setValue([]);
                this.departmentActive = [];
                this.group.setValue([]);
                this.groupActive = [];
                this.staff.setValue([]);
                this.staffActive = [];
            }
        }
        if (type === 'department') {
            this.departmentActive.splice(this.departmentActive.findIndex((item) => item.id === data.id), 1);
            if (this.departmentActive.length === 0) {
                this.groupActive = [];
                this.staffActive = [];
            }
        }
        if (type === 'group') {
            this.groupActive.splice(this.groupActive.findIndex((item) => item.id === data.id), 1);
            if (this.groupActive.length === 0) {
                this.staffActive = [];
            }
        }
        if (type === 'staff') {
            this.staffActive.splice(this.staffActive.findIndex((item) => item.id === data.id), 1);
        }
        this.detectServiceWithAllOption(type);
    }

    detectChangeDataInfo(data: any, type: string) {
        if (data.length > 0) {
            this.onSelectDataFormInfo(data, type);
        } else {
            this.onRemoveDataFormInfo(data, type);
        }
    }

    detectServiceWithAllOption(type: string, data?: any) {
        if (type === "service") {
            if (!this.serviceActive.every((value) => value !== 'All')) {
                this.serviceActive.splice(this.serviceActive.findIndex((item) => item === 'All'), 1);
                this.serviceActive = [];
                this.serviceActive.push(data);
            }
        } else if (type === 'office') {
            if (!this.officeActive.every((value) => value !== 'All')) {
                this.officeActive.splice(this.officeActive.findIndex((item) => item === 'All'), 1);
                this.officeActive = [];
                if (data.length > 0) {
                    this.officeActive = [data.filter(x => x.id !== 'All')[0].id];
                }
            }
            // Call back Get Department            
            this.getDepartment(this.departmentsInit);
        } else if (type === 'department') {
            if (!this.departmentActive.every((value) => value !== 'All')) {
                this.departmentActive.splice(this.departmentActive.findIndex((item) => item === 'All'), 1);
                this.departmentActive = [];
                if (data.length > 0) {
                    this.departmentActive = [data.filter(x => x.id !== 'All')[0].id];
                }
            }
            // Call back Get Group
            this.getGroup(this.groupsInit);
        } else if (type === 'group') {
            if (!this.groupActive.every((value) => value !== 'All')) {
                this.groupActive.splice(this.groupActive.findIndex((item) => item === 'All'), 1);
                this.groupActive = [];
                if (data.length > 0) {
                    this.groupActive = [data.filter(x => x.id !== 'All')[0].id];
                }
            }
            // Call back Get Staff
            this.getStaff(this.staffsInit);
        } else if (type === 'staff') {
            if (!this.staffActive.every((value) => value !== 'All')) {
                this.staffActive.splice(this.staffActive.findIndex((item) => item === 'All'), 1);
                this.staffActive = [];
                if (data.length > 0) {
                    this.staffActive = [data.filter(x => x.id !== 'All')[0].id];
                }
            }
        }
    }

    getService() {
        this._systemRepo.getListServiceByPermision()
            .pipe(catchError(this.catchError))
            .subscribe(
                (res: any) => {
                    if (!!res) {
                        this.serviceList = this.utility.prepareNg2SelectData(res, 'value', 'displayName');
                        this.serviceList = this.serviceList.sort((one, two) => (one.text > two.text ? 1 : -1));
                        this.serviceList.unshift({ id: 'All', text: 'All' });
                        this.serviceActive = [this.serviceList[0].id];
                    }
                },
            );
    }

    getCurrency() {
        this._catalogueRepo.getListCurrency()
            .pipe(catchError(this.catchError))
            .subscribe(
                (data: any) => {
                    if (!!data) {
                        this.currencyList = data.map((item) => ({ id: item.id }));
                        // Default value: USD .filter((curr) => curr.id === "USD")
                        this.currency.setValue(this.currencyList.filter((curr) => curr.id === "USD")[0].id);
                    }
                },
            );
    }

    getDataUserLever() {
        this._systemRepo.getListUserLevelByUserId(this.userLogged.id)
            .pipe(
                catchError(this.catchError),
                finalize(() => { }),
            ).subscribe(
                (res: any) => {
                    if (!!res) {
                        if (this.menuPermission.list !== 'All' && this.menuPermission.list !== 'Company') {
                            const office = res.map((item: any) => ({ companyId: item.companyId, officeId: item.officeId, officeAbbrName: item.officeAbbrName }));
                            this.officesInit = office;
                            this.getOffice(office);
                        }

                        if (this.menuPermission.list !== 'All' && this.menuPermission.list !== 'Company' && this.menuPermission.list !== 'Office') {
                            const department = res.map((item: any) => ({ officeId: item.officeId, departmentId: item.departmentId, departmentAbbrName: item.departmentAbbrName }));
                            this.departmentsInit = department;
                            this.getDepartment(department);
                        }

                        if (this.menuPermission.list !== 'All' && this.menuPermission.list !== 'Company' && this.menuPermission.list !== 'Office' && this.menuPermission.list !== 'Department') {
                            const group = res.map((item: any) => ({ departmentId: item.departmentId, groupId: item.groupId, groupAbbrName: item.groupAbbrName }));
                            this.groupsInit = group;
                            this.getGroup(group);
                        }
                    }
                },
            );
    }

    getOffice(data: any) {
        if (this.menuPermission.list === 'All') {
            data = data;
        } else if (this.menuPermission.list === 'Company') {
            data = data.filter(f => f.officeId !== null && f.companyId === this.userLogged.companyId);
        } else {
            data = data.filter(f => f.officeId !== null && f.officeId === this.userLogged.officeId);
        }

        this.officeList = data
            .map((item: any) => ({ text: item.officeAbbrName, id: item.officeId }))
            .filter((o, i, arr) => arr.findIndex(t => t.id === o.id) === i); // Distinct office
        if (this.officeList.length > 0) {
            this.officeList.unshift({ id: 'All', text: 'All' });
            if (this.menuPermission.list === 'Office'
                || this.menuPermission.list === 'Company'
                || this.menuPermission.list === 'All') {
                this.officeActive = [this.officeList[0].id];
            } else {
                const offiUserCurr = this.officeList.filter(off => off.id === this.userLogged.officeId);
                if (offiUserCurr.length > 0) {
                    this.officeActive = [offiUserCurr[0].id];
                }
            }
        } else {
            this.officeActive = [];
        }

        this.getDepartment(this.departmentsInit);
    }

    getDepartment(data: any) {
        let officeSelected = [];
        if (this.officeActive.length > 0) {
            if (this.officeActive.map(i => i).includes('All')) {
                officeSelected = this.officeList.map(i => i.id);
            } else {
                officeSelected = this.officeActive.map(i => i);
            }
            data = data.filter(f => f.departmentId !== null && officeSelected.includes(f.officeId));
        }
        else {
            // Nếu Office không selected giá trị -> Lấy tất cả các Department có trong list Office hiện tại
            officeSelected = this.officeList.map(i => i.id);
            data = data.filter(f => f.departmentId !== null && officeSelected.includes(f.officeId));
        }

        this.departmentList = data
            .map((item: any) => ({ text: item.departmentAbbrName, id: item.departmentId.toString() }))
            .filter((d, i, arr) => arr.findIndex(t => t.id === d.id) === i); // Distinct department

        if (this.departmentList.length > 0) {
            this.departmentList.unshift({ id: 'All', text: 'All' });
            if (this.officeActive.length > 0) {
                if (this.menuPermission.list === 'Department'
                    || this.menuPermission.list === 'Office'
                    || this.menuPermission.list === 'Company'
                    || this.menuPermission.list === 'All') {
                    this.departmentActive = [this.departmentList[0].id];
                } else {
                    const deptUserCurr = this.departmentList.filter(dept => dept.id === this.userLogged.departmentId);
                    if (deptUserCurr.length > 0) {
                        this.departmentActive = [deptUserCurr[0].id];
                    }
                }
            }
        } else {
            this.departmentActive = [];
        }

        this.getGroup(this.groupsInit);
    }

    getGroup(data: any) {
        let deparmentSelected = [];
        if (this.departmentActive.length > 0) {
            if (this.departmentActive.map(i => i).includes('All')) {
                deparmentSelected = this.departmentList.map(i => i.id);
            } else {
                deparmentSelected = this.departmentActive.map(i => i);
            }
            data = data.filter(f => f.groupId !== null && f.departmentId !== null && deparmentSelected.includes(f.departmentId.toString()));
        }
        else {
            // Nếu Department không selected giá trị -> Lấy tất cả các Group có trong list Group hiện tại
            deparmentSelected = this.departmentList.map(i => i.id);
            data = data.filter(f => f.groupId !== null && f.departmentId !== null && deparmentSelected.includes(f.departmentId.toString()));
        }

        this.groupList = data
            .map((item: any) => ({ text: item.groupAbbrName, id: item.groupId.toString() }))
            .filter((g, i, arr) => arr.findIndex(t => t.id === g.id) === i); // Distinct group

        if (this.groupList.length > 0) {
            this.groupList.unshift({ id: 'All', text: 'All' });
            if (this.departmentActive.length > 0) {
                if (this.menuPermission.list === 'Group'
                    || this.menuPermission.list === 'Department'
                    || this.menuPermission.list === 'Office'
                    || this.menuPermission.list === 'Company'
                    || this.menuPermission.list === 'All') {
                    this.groupActive = [this.groupList[0].id];
                } else {
                    const grpUserCurr = this.groupList.filter((grp) => grp.id === this.userLogged.groupId);
                    if (grpUserCurr.length > 0) {
                        this.groupActive = [grpUserCurr[0].id];
                    }
                }
            }
        } else {
            this.groupActive = [];
        }

        this.getStaff(this.staffsInit);
    }

    getStaff(data: any) {
        if (this.groupActive.length > 0) {
            let groupSelected = [];
            if (this.groupActive.map(i => i).includes('All')) {
                groupSelected = this.groupList.map(i => i.id);
            } else {
                groupSelected = this.groupActive.map(i => i);
            }

            let deparmentSelected = [];
            if (this.departmentActive.length > 0) {
                if (this.departmentActive.map(i => i).includes('All')) {
                    deparmentSelected = this.departmentList.map(i => i.id);
                } else {
                    deparmentSelected = this.departmentActive.map(i => i);
                }
            } else {
                deparmentSelected = this.departmentList.map(i => i.id);
            }

            data = data.filter(f => f.userId !== null && f.groupId !== null && f.departmentId !== null
                && deparmentSelected.includes(f.departmentId.toString())
                && groupSelected.includes(f.groupId.toString()));
        }

        this.staffList = data
            .map(item => ({ text: item.userName, id: item.userId }))
            .filter((g, i, arr) => arr.findIndex(t => t.id === g.id) === i); // Distinct user

        if (this.staffList.length > 0) {
            this.staffList.unshift({ id: 'All', text: 'All' });
            if (this.groupActive.length > 0) {
                if (this.menuPermission.list === 'Owner') {
                    this.staffActive = [this.staffList.filter(stf => stf.id === this.userLogged.id)[0].id];
                } else {
                    this.staffActive = [this.staffList[0].id];
                }
            }
        } else {
            this.staffActive = [];
        }
    }

    searchReport() {
        this.isSubmitted = true;
        // report commission thì require Beneficiary, report incentive require customer
        if (this.isCommissionIncentive && 
            ((!this.partnerAccount.value && this.typeReport.value !== this.typeComReportList[2].id) || 
            ((!this.customerActive || !this.customerActive.length) && this.typeReport.value === this.typeComReportList[2].id))) {
                return;
        }
        if (this.isGeneralReport) {
            this.onGeneralSearch.emit(this.getGeneralSearchBody());
        } else if (this.isCommissionIncentive) {
            this.onSearchCom.emit(this.getCommissionSearchBody());
        } else {
            this.onSearch.emit(this.getSaleSearchBody());
        }
    }

    getGeneralSearchBody() {
        const body: ReportInterface.ISearchDataCriteria = {
            serviceDateFrom: this.dateType.value === "ServiceDate" ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDateTo: this.dateType.value === "ServiceDate" ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            createdDateFrom: this.dateType.value === "CreatedDate" ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            createdDateTo: this.dateType.value === "CreatedDate" ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            customerId: this.customerActive != null && this.customerActive.length > 0 ? this.customerActive.join(";") : null,
            service: this.mapObject(this.serviceActive, this.serviceList), // ---*
            currency: this.currency.value, // ---**
            jobId: this.refNoType.value === "JOBID" && this.refNo.value !== null ? this.refNo.value.trim() : null,
            mawb: this.refNoType.value === "MBL" && this.refNo.value !== null ? this.refNo.value.trim() : null,
            hawb: this.refNoType.value === "HBL" && this.refNo.value !== null ? this.refNo.value.trim() : null,
            officeId: this.mapObject(this.officeActive, this.officeList), // ---*
            departmentId: this.mapObject(this.department.value, this.departmentList), // ---*
            groupId: this.mapObject(this.groupActive, this.groupList), // ---*
            personInCharge: this.staffType.value === "PIC" ? this.mapObject(this.staffActive, this.staffList) : null,
            salesMan: this.staffType.value === "SALESMAN" ? this.mapObject(this.staffActive, this.staffList) : null,
            creator: this.staffType.value === "CREATOR" ? this.mapObject(this.staffActive, this.staffList) : null,
            carrierId: this.carrier.value,
            agentId: this.agent.value,
            pol: this.pol.value,
            pod: this.pod.value
        };
        return body;
    }

    getSaleSearchBody() {
        const body: ReportInterface.ISaleReportCriteria = {
            serviceDateFrom: this.dateType.value === "ServiceDate" ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDateTo: this.dateType.value === "ServiceDate" ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            createdDateFrom: this.dateType.value === "CreatedDate" ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            createdDateTo: this.dateType.value === "CreatedDate" ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            customerId: this.customerActive != null && this.customerActive.length > 0 ? this.customerActive.join(";") : null,
            service: this.mapObject(this.serviceActive, this.serviceList), // ---*
            currency: this.currency.value, // ---**
            jobId: this.refNoType.value === "JOBID" && this.refNo.value !== null ? this.refNo.value.trim() : null,
            mawb: this.refNoType.value === "MBL" && this.refNo.value !== null ? this.refNo.value.trim() : null,
            hawb: this.refNoType.value === "HBL" && this.refNo.value !== null ? this.refNo.value.trim() : null,
            officeId: this.mapObject(this.officeActive, this.officeList), // ---*
            departmentId: this.mapObject(this.departmentActive, this.departmentList), // ---*
            groupId: this.mapObject(this.groupActive, this.groupList), // ---*
            personInCharge: this.staffType.value === "PIC" ? this.mapObject(this.staffActive, this.staffList) : null,
            salesMan: this.staffType.value === "SALESMAN" ? this.mapObject(this.staffActive, this.staffList) : null,
            creator: this.staffType.value === "CREATOR" ? this.mapObject(this.staffActive, this.staffList) : null,
            carrierId: this.carrier.value,
            agentId: this.agent.value,
            pol: this.pol.value,
            pod: this.pod.value,
            typeReport: this.typeReport.value
        };
        return body;
    }

    getCommissionSearchBody() {
        const body: ReportInterface.ICommissionReportCriteria = {
            serviceDateFrom: this.dateType.value === "ServiceDate" ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            serviceDateTo: this.dateType.value === "ServiceDate" ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            createdDateFrom: this.dateType.value === "CreatedDate" ? formatDate(this.serviceDate.value.startDate, 'yyyy-MM-dd', 'en') : null,
            createdDateTo: this.dateType.value === "CreatedDate" ? formatDate(this.serviceDate.value.endDate, 'yyyy-MM-dd', 'en') : null,
            customerId: this.customerActive != null && this.customerActive.length > 0 ? this.customerActive.join(";") : null,
            service: this.mapObject(this.serviceActive, this.serviceList),
            currency: this.typeReport.value === this.typeComReportList[1].id ? "VND" : "USD",
            jobId: this.mapShipment('JOBID'),
            mawb: this.mapShipment('MBL'),
            hawb: this.mapShipment('HBL'),
            officeId: this.mapObject(this.officeActive, this.officeList),
            departmentId: this.mapObject(this.departmentActive, this.departmentList),
            groupId: this.mapObject(this.groupActive, this.groupList),
            personInCharge: this.staffType.value === "PIC" ? this.mapObject(this.staffActive, this.staffList) : null,
            salesMan: this.staffType.value === "SALESMAN" ? this.mapObject(this.staffActive, this.staffList) : null,
            creator: this.staffType.value === "CREATOR" ? this.mapObject(this.staffActive, this.staffList) : null,
            carrierId: this.carrier.value,
            agentId: this.agent.value,
            pol: this.pol.value,
            pod: this.pod.value,
            customNo: this.mapShipment('CustomNo'),
            beneficiary: this.partnerAccount.value,
            exchangeRate: this.exchangeRate.value === null ? 0 : this.exchangeRate.value,
            typeReport: this.typeReport.value
        };
        return body;
    }

    mapObject(dataSelected: any[], dataList: any[]) {
        let result = '';
        if (dataSelected.length > 0) {
            if (dataSelected[0] === 'All') {
                const list = dataList.filter(f => f.id !== 'All');
                result = list.map((item: any) => item.id).toString().replace(/(?:,)/g, ';');
            } else {
                result = dataSelected.map((item: any) => item).toString().replace(/(?:,)/g, ';');
            }
        } else {
            const list = dataList.filter(f => f.id !== 'All');
            result = list.map((item: any) => item.id).toString().replace(/(?:,)/g, ';');
        }
        return result;
    }

    resetSearch() {
        this.isSubmitted = false;
        this.formSearch.reset();
        this.resetFormControl(this.customer);
        this.resetFormControl(this.carrier);
        this.resetFormControl(this.agent);
        this.resetFormControl(this.pol);
        this.resetFormControl(this.pod);
        if (this.isGeneralReport) {
            this.onGeneralSearch.emit(<any>{});
        } else if (this.isCommissionIncentive) {
            this.onSearchCom.emit(<any>{});
        } else {
            this.onSearch.emit(<any>{});
        }

        this.dateType.setValue(this.dateTypeList[0].id);

        this.serviceActive = [this.serviceList[0].id];
        this.service.setValue(this.serviceActive);

        if (!this.isCommissionIncentive) {
            this.currency.setValue(this.currencyList.filter((curr) => curr.id === "USD")[0].id);
        }

        this.refNoType.setValue(this.refNoTypeList[0].id);

        if (this.isGeneralReport) {
            this.staffType.setValue(this.staffTypeList[0].id);
        } else {
            this.staffType.setValue(this.staffTypeList[1].id);
        }

        if (this.menuPermission.list !== 'None') {
            this.officeActive = [this.officeList.filter((off) => off.id === this.userLogged.officeId)[0].id];
            this.office.setValue(this.officeActive);
            this.getDepartment(this.departmentsInit);
        }

        if (!this.isGeneralReport) {
            this.typeReport.setValue(this.typeReportActive[0].id);
        }

        this.serviceDate.setValue({
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        });

        if (this.isCommissionIncentive) {
            this.resetFormControl(this.partnerAccount);
            this.exchangeRate.setValue(20000);
            this.resetFormShipmentInput();
        }
    }

    getAllOffice() {
        this._systemRepo.getAllOffice()
            .pipe(
                catchError(this.catchError),
                finalize(() => { }),
            ).subscribe(
                (office: any) => {
                    if (!!office) {
                        office = office.map((item: any) => ({ companyId: item.buid, officeId: item.id, officeAbbrName: item.shortName }));
                        this.officesInit = office;
                        this.getOffice(office);
                    }
                },
            );
    }

    getAllDepartment() {
        this._systemRepo.getAllDepartment()
            .pipe(
                catchError(this.catchError),
                finalize(() => { }),
            ).subscribe(
                (department: any) => {
                    if (!!department) {
                        department = department.map((item: any) => ({ officeId: item.branchId, departmentId: item.id, departmentAbbrName: item.deptNameAbbr }));

                        department.forEach(dept => {
                            this.groupSpecial.push({ departmentId: dept.departmentId, groupId: 11, groupAbbrName: 'Manager' });
                        });

                        this.departmentsInit = department;
                        this.getDepartment(department);
                    }
                },
            );
    }

    getAllGroup() {
        this._systemRepo.getAllGroup()
            .pipe(
                catchError(this.catchError),
                finalize(() => { }),
            ).subscribe(
                (group: any) => {
                    //Add group 11 cho department hiện hành của User
                    this.groupSpecial.push({ departmentId: this.userLogged.departmentId, groupId: 11, groupAbbrName: 'Manager' });
                    if (!!group) {
                        group = group.map((item: any) => ({ departmentId: item.departmentId, groupId: item.id, groupAbbrName: item.shortName }));
                        group.forEach(element => {
                            this.groupSpecial.push({ departmentId: element.departmentId, groupId: element.groupId, groupAbbrName: element.groupAbbrName });
                            //Add group 11 cho mỗi department trong list group
                            this.groupSpecial.push({ departmentId: element.departmentId, groupId: 11, groupAbbrName: 'Manager' });
                        });
                    }
                    this.groupsInit = this.groupSpecial;
                    this.getGroup(this.groupSpecial);
                },
            );
    }

    getAllStaff() {
        this._systemRepo.getUserLevelByType({ type: 'All' })
            .pipe(
                catchError(this.catchError),
                finalize(() => { }),
            ).subscribe(
                (staff: any) => {
                    this.staffsInit = staff;
                    this.getStaff(staff);
                },
            );
    }

    openInputShipment() {
        this.inputShipmentPopup.show();
    }

    onShipmentList(data: any) {
        this.shipmentInput = data;
        if (data) {
            this.numberOfShipment = this.shipmentInput.keyword.split(/\n/).filter(item => item.trim() !== '').map(item => item.trim()).length;
        } else {
            this.numberOfShipment = 0;
        }
    }

    resetFormShipmentInput() {
        this.numberOfShipment = 0;
        this.inputShipmentPopup.shipmentSearch = '';
        this.shipmentInput = null;
        this.inputShipmentPopup.selectedShipmentType = "JOBID";
    }

    mapShipment(type: string) {
        let _shipment = '';
        if (this.shipmentInput) {
            if (this.shipmentInput.keyword.length > 0) {
                const _keyword = this.shipmentInput.keyword.split(/\n/).filter(item => item.trim() !== '').map(item => item.trim()).join(';');
                if (this.shipmentInput.type === type) {
                    _shipment = _keyword;
                }
            }
        }
        return _shipment;
    }

    async getPartnerData(type: string) {
        switch (type) {
            case 'customer':
                if (!this.isGeneralReport) { // Partner for Accountant Report
                    // Get All Partner
                    this.customers = await this._catalogueRepo.getPartnerByGroups(null, null);
                } else {
                    this.customers = await this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CUSTOMER, null);
                }
                break;
            case 'agent':
                this.agents = await this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.AGENT, null);
                break;
            case 'carrier':
                this.carriers = await this._catalogueRepo.getPartnersByType(CommonEnum.PartnerGroupEnum.CARRIER, null);
                break;
            case 'partner':
                if (this.isCommissionIncentive) {
                    this.partners = await this._catalogueRepo.getListPartner(null, null, { partnerGroup: PartnerGroupEnum.ALL });
                }
                break;
        }
    }
}

