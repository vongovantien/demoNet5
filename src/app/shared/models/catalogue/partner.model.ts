import { PermissionPartner } from "./permissionPartner";
import { Contract } from "./catContract.model";
import { PartnerEmail } from "./partnerEmail.model";

export class Partner {
    id: string = '';
    partnerGroup: string = '';
    partnerNameVn: string = '';
    partnerNameEn: string = '';
    contactPerson: string = '';
    addressVn: string = '';
    addressEn: string = '';
    addressShippingVn: string = '';
    addressShippingEn: string = '';
    shortName: string = '';
    countryId: number = 0;
    countryShippingId: number = 0;
    accountNo: string = '';
    tel: string = '';
    fax: string = '';
    taxCode: string = '';
    email: string = '';
    website: string = '';
    bankAccountNo: string = '';
    bankAccountName: string = '';
    bankAccountAddress: string = '';
    note: string = '';
    salePersonId: string = null;
    public: boolean = false;
    creditAmount: 0;
    debitAmount: 0;
    refuseEmail: true;
    receiveAttachedWaybill: true;
    roundedSoamethod: string = '';
    taxExemption: true;
    receiveEtaemail: true;
    showInDashboard: true;
    provinceId: string = '';
    provinceName: string = '';
    provinceShippingId: string = '';
    provinceShippingName: string = ''
    parentId: string = '';
    percentCredit: number = 0;
    alertPercentCreditEmail: boolean = false;
    paymentBeneficiary: string = '';
    usingParrentRateCard: boolean = false;
    sugarId: string = '';
    bookingOverdueDay: number = 0;
    fixRevenueByProject: boolean = false;
    zipCode: string = '';
    zipCodeShipping: string = '';
    swiftCode: string = '';
    userCreated: string = '';
    datetimeCreated: string = '';
    userModified: string = '';
    datetimeModified: string = '';
    active?: boolean = true;
    inactiveOn?: string = '';
    workPlaceId: string = '';
    userCreatedName: string = '';
    userModifiedName: string = '';
    internalReferenceNo: string = '';
    coLoaderCode: string = '';
    workPhoneEx: string = '';
    roundUpMethod: string = '';
    applyDim: string = '';
    //
    billingEmail: string = '';
    billingPhone: string = '';


    saleManRequests: SaleManRequest[] = [];
    contracts: Contract[] = [];
    partnerEmails: PartnerEmail[] = [];



    partnerType: string = '';
    partnerMode: string = '';
    partnerLocation: string = '';
    internalCode: string = '';
    creditPayment: string = '';

    isRequestApproval: boolean = false;
    bankName: string = '';
    bankCode: string = '';

    permission: PermissionPartner = new PermissionPartner();

    countryShippingName: string = null;
    countryName: string = null;
    constructor(data?: any) {
        const self = this;
        for (const key in data) {
            if (self.hasOwnProperty(key)) {
                self[key] = data[key];
            }

        }
    }
}


export class SaleManRequest {
    id: string = "00000000-0000-0000-0000-000000000000";
    saleman_id: string = '';
    office: string = '';
    company: string = '';
    service: number = 0;
    partnerId: string = '';
    effectDate: any = '';
    description: string = '';
    status: boolean = false;
    createDate: any = '';
    userModified: string = '';
}