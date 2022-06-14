namespace AccountingInterface {
    export interface IPartnerOfAccountingManagementRef {
        cdNotes: string[];
        soaNos: string[];
        jobNos: string[];
        hbls: string[];
        mbls: string[];
        settlementCodes: string[];
    }

    export interface IAccReceivableSearch {
        arType: number;
        acRefId: string;
        overDueDay: number;
        debitRateFrom?: number;
        debitRateTo?: number;
        agreementStatus: string;
        agreementExpiredDay: string;
        salesmanId: string;
        officeId: string[];
        fromOverdueDays: number;
        toOverdueDays: number;
        debitRate: number;
        partnerType: string;
        officeIds: string[];
        staffs: string[];
    }

    export interface IDefaultSearchAcctMngt {
        typeOfAcctManagement: string;
        fromIssuedDate: string;
        toIssuedDate: string;
    }

    export interface IRequestGuid {
        Id: string;
        action: string;
    }

    export interface IRequestString {
        id: string;
        action: string;
    }

    export interface IRequestGuidType extends IRequestGuid {
        type: string;
        paymentMethod: string;
    }

    export interface IRequestStringType extends IRequestString {
        type: string;
        paymentMethod: string;
    }

    export interface IRequestFileType extends IRequestGuid {
        fileName: string;
    }
}
