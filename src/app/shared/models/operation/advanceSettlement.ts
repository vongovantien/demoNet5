export class AdvanceSettlementInfo {
    jobNo: string;

    advRequester: string;
    settleRequester: string;

    advanceNo: string;
    settlementCode: string;

    advanceStatusApproval: string;
    settleStatusApproval: string;

    advanceCurrency: string;
    settlementCurrency: string;

    advanceDate: Date;
    settlementDate: Date;

    balance: number;
    settlementAmount: number;
    advanceAmount: number;

    advanceVoucherNo: string;
    advanceSyncStatus: string;
    settlementSyncStatus: string;
    settlementVoucherNo: string;
    settlementVoucherDate: Date;
    advanceVoucherDate: Date;

}