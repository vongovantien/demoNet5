namespace OperationInteface {
    export interface IShipment {
        jobId: string;
        hbl: string;
        mbl: string;
        id?: string;
        customerId?: string;
        agentId?: string;
        carrierId?: string;
        hblid?: string;
        service?: string;
        customNo?: string;
        advanceNo?: string;
    }

    export interface IInputShipment {
        type: string;
        keyword: string;
    }
}
