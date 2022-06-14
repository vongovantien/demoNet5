namespace DocumentationInterface {
    export interface IDataSyncHBL {
        flightVesselName?: string;
        etd: string;
        eta: string;
        flightDate?: string;
        pol: string;
        pod: string;
        agentId?: string;
        issuedBy?: string;
        warehouseId?: string;
        [name: string]: any;
    }


}
