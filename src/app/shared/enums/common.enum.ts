export namespace CommonEnum {
    export enum UnitType {
        'CONTAINER' = "Container",
        'PACKAGE' = "Package",
        'WEIGHT' = "Weight",
        'LENGTH' = "Length",
        'VOLUMN' = "Volumn",
    }
    export enum Agreement {
        ALL = 0,
        SALEMANNAME = 1,
        CONTRACTNO = 2,
        CONTRACTTYPE = 3,
    }

    export enum PartnerGroupEnum {
        ALL = 0,
        AGENT = 1,
        CONSIGNEE = 2,
        CUSTOMER = 3,
        PAYMENTOBJECT = 4,
        PETROLSTATION = 5,
        SHIPPER = 6,
        SHIPPINGLINE = 7,
        SUPPLIER = 8,
        SUPPLIERMATERIAL = 9,
        CARRIER = 10,
        AIRSHIPSUP = 11
    }

    export enum TransactionTypeEnum {
        InlandTrucking = 1,
        AirExport = 2,
        AirImport = 3,
        SeaConsolExport = 4,
        SeaConsolImport = 5,
        SeaFCLExport = 6,
        SeaFCLImport = 7,
        SeaLCLExport = 8,
        SeaLCLImport = 9,
        CustomLogistic = 10
    }

    export enum PlaceTypeEnum {
        BorderGate = 1,
        Branch = 2,
        Depot = 3,
        District = 4,
        Hub = 5,
        IndustrialZone = 6,
        Other = 7,
        Port = 8,
        Province = 9,
        Station = 10,
        Ward = 11,
        Warehouse = 12
    }

    export enum ButtonType {
        add = "add",
        edit = "edit",
        delete = "delete",
        import = "import",
        export = "export",
        save = "save",
        cancel = "cancel",
        reset = "reset",
        detail = "detail",
        closeModal = "closeModal",
        search = "search",
        searchMultiple = 'searchMultiple'
    }

    export enum TypeSearch {
        intab = "intab",
        outtab = "outtab"
    }

    export enum SurchargeTypeEnum {
        BUYING_RATE = "BUY",
        SELLING_RATE = "SELL",
        OBH = "OBH",
        CHARGE = "CHARGE",
        OTHER = "OTHER"
    }

    export enum TableActions {
        EDIT = 'EDIT',
        DELETE = 'DELETE'
    }

    export enum QUANTITY_TYPE {
        GW = 'gw',
        NW = 'nw',
        CW = 'cw',
        CBM = 'cbm',
        PACKAGE = 'package',
        CONT = 'cont',
        HW = 'hw'
    }

    export enum CHARGE_TYPE {
        DEBIT = 'DEBIT',  // * BUYING - Phí chi
        CREDIT = 'CREDIT', // * SELLING - Phí thu
        OBH = "OBH", // * OBH - Phí thu hộ,
        OTHER = "OTHER"
    }

    export enum TRANSPORT_MODE {
        AIR = 'AIR',
        SEA = 'SEA',
        INLAND = 'INLAND',
        AIR_SEA = 'AIR - SEA',
        INLAND_SEA = 'INLAND - SEA',
        AIR_INLAND = 'AIR - INLAND',
        INALAND_AIR_SEA = 'INLAND - AIR - SEA'
    }

    export enum PORT_TYPE {
        AIR = 1,
        SEA = 2,
    }
    export enum SALE_REPORT_TYPE {
        SR_MONTHLY = 'SR_MONTHLY',
        SR_DEPARTMENT = 'SR_DEPARTMENT',
        SR_QUARTER = 'SR_QUARTER',
        SR_SUMMARY = 'SR_SUMMARY',
        SR_COMBINATION = 'SR_COMBINATION',
        SR_KICKBACK = 'SR_KICKBACK'
    }

    export enum COMMISSION_INCENTIVE_TYPE {
        COMMISSION_PR_AS = 'COMMISSION_PR_AS',
        COMMISSION_PR_OPS = 'COMMISSION_PR_OPS',
        INCENTIVE_RPT = 'INCENTIVE_RPT'
    }

    export enum SHEET_DEBIT_REPORT_TYPE {
        ACCNT_PL_SHEET = 'ACCNT_PL_SHEET',
        SUMMARY_OF_COST = 'SUMMARY_OF_COST',
        SUMMARY_OF_REVENUE = 'SUMMARY_OF_REVENUE',
        COSTS_BY_PARTNER = 'COSTS_BY_PARTNER'
    }

    export enum JOB_PROFIT_ANALYSIS_TYPE {
        JOB_PROFIT_ANALYSIS = 'JOB_PROFIT_ANALYSIS'
    }

    export enum ROUND_DIM {
        HALF = '0.5',
        ONE = '1.0',
        STANDARD = 'Standard'
    }
    export enum APPLY_DIM {
        TOTAL = 'Total',
        SINGLE = 'Single'
    }

    // export enum UnlockTypeEnum {
    //     SHIPMENT = 'Shipment',
    //     ADVANCE = 'Advance',
    //     SETTEMENT = 'Settlement',
    //     CHANGESERVICEDATE = 'Change Service Date',
    // }

    export enum UnlockTypeEnum {
        SHIPMENT = 1,
        ADVANCE = 2,
        SETTEMENT = 3,
        CHANGESERVICEDATE = 4,
    }

    export enum FEE_TYPE {
        HANDLING = "Handling",
        FREIGHT = "Freight",
        OTHER = "Other",
        LOCALCHARGE = "LocalCharge",
        LOGISTICS = "Logistics",
        FUEL = "Fuel",
        TRUCKING = "Trucking",
    }

    export enum TabTypeAccountReceivableEnum {
        TrialOrOffical = 1,
        Guarantee = 2,
        Other = 3,
        NoAgreement = 4,
    }

    export enum ClassColor {
        PRIMARY = 'primary',
        SUCCESS = 'success',
        DANGER = 'danger',
        INFO = 'info',
        SECONDARY = 'secondary',
        MUTED = 'muted',
        DARK = 'dark',
    }
}


