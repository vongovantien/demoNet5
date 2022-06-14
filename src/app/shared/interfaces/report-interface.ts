export namespace ReportInterface {
    export interface INg2Select {
        id: any;
        text: any;
    }
    
    export interface ISaleReportCriteria {
        serviceDateFrom: string;
        serviceDateTo: string;
        createdDateFrom: string;
        createdDateTo: string;
        customerId: string;
        service: string;
        currency: string;
        jobId: string;
        mawb: string;
        hawb: string;
        officeId: string;
        departmentId: string;
        groupId: string;
        personInCharge: string;
        salesMan: string;
        creator: string;
        carrierId: string;
        agentId: string;
        pol: string;
        pod: string;
        typeReport: string;
    }

    export interface ICommissionReportCriteria {
        serviceDateFrom: string;
        serviceDateTo: string;
        createdDateFrom: string;
        createdDateTo: string;
        customerId: string;
        service: string;
        currency: string;
        jobId: string;
        mawb: string;
        hawb: string;
        officeId: string;
        departmentId: string;
        groupId: string;
        personInCharge: string;
        salesMan: string;
        creator: string;
        carrierId: string;
        agentId: string;
        pol: string;
        pod: string;
        customNo: string;
        beneficiary: string;
        exchangeRate: number;
        typeReport: string;
    }
    export interface ISearchDataCriteria {
        serviceDateFrom: string;
        serviceDateTo: string;
        createdDateFrom: string;
        createdDateTo: string;
        customerId: string;
        service: string;
        currency: string;
        jobId: string;
        mawb: string;
        hawb: string;
        officeId: string;
        departmentId: string;
        groupId: string;
        personInCharge: string;
        salesMan: string;
        creator: string;
        carrierId: string;
        agentId: string;
        pol: string;
        pod: string;
    }
}

export interface ICrystalReport {
    showReport(): void;
}
