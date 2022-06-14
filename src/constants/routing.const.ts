

export class RoutingConstants {

    public static readonly ROOT_COMMERCIAL: string = '/home/commercial';
    public static readonly ROOT_LOGISTICS: string = '/home/operation';
    public static readonly ROOT_DOC: string = '/home/documentation';
    public static readonly ROOT_ACC: string = '/home/accounting';
    public static readonly ROOT_CATALOGUE: string = '/home/catalogue';
    public static readonly ROOT_SYSTEM: string = '/home/system';
    public static readonly ROOT_TOOL: string = '/home/tool';
    public static readonly ROOT_REPORT: string = '/home/report';
    public static readonly ROOT_DESIGNS_ZONE: string = '/home/designs-zone';

    public static readonly COMMERCIAL = {
        AGENT: `${RoutingConstants.ROOT_COMMERCIAL}/agent`,
        CUSTOMER: `${RoutingConstants.ROOT_COMMERCIAL}/customer`,
        INCOTERM: `${RoutingConstants.ROOT_COMMERCIAL}/incoterm`,
        POTENTIAL: `${RoutingConstants.ROOT_COMMERCIAL}/potential-customer`,
    };

    public static readonly LOGISTICS = {
        JOB_MANAGEMENT: `${RoutingConstants.ROOT_LOGISTICS}/job-management`,
        JOB_DETAIL: `${RoutingConstants.ROOT_LOGISTICS}/job-management/job-edit`,
        JOB_DETAIL_LINK_FEE: `${RoutingConstants.ROOT_LOGISTICS}/job-management/job-edit-link-fee`,
        ASSIGNMENT: `${RoutingConstants.ROOT_LOGISTICS}/assigment`,
        TRUCKING_ASSIGNMENT: `${RoutingConstants.ROOT_LOGISTICS}/trucking-assigment`,
        CUSTOM_CLEARANCE: `${RoutingConstants.ROOT_LOGISTICS}/custom-clearance`,
    };

    public static readonly DOCUMENTATION = {
        AIR_EXPORT: `${RoutingConstants.ROOT_DOC}/air-export`,
        AIR_IMPORT: `${RoutingConstants.ROOT_DOC}/air-import`,
        SEA_CONSOL_EXPORT: `${RoutingConstants.ROOT_DOC}/sea-consol-export`,
        SEA_CONSOL_IMPORT: `${RoutingConstants.ROOT_DOC}/sea-consol-import`,
        SEA_FCL_EXPORT: `${RoutingConstants.ROOT_DOC}/sea-fcl-export`,
        SEA_FCL_IMPORT: `${RoutingConstants.ROOT_DOC}/sea-fcl-import`,
        SEA_LCL_EXPORT: `${RoutingConstants.ROOT_DOC}/sea-lcl-export`,
        SEA_LCL_IMPORT: `${RoutingConstants.ROOT_DOC}/sea-lcl-import`,
    };

    public static readonly ACCOUNTING = {
        ACCOUNT_RECEIVABLE_PAYABLE: `${RoutingConstants.ROOT_ACC}/account-receivable-payable`,
        ADVANCE_PAYMENT: `${RoutingConstants.ROOT_ACC}/advance-payment`,
        SETTLEMENT_PAYMENT: `${RoutingConstants.ROOT_ACC}/settlement-payment`,
        STATEMENT_OF_ACCOUNT: `${RoutingConstants.ROOT_ACC}/statement-of-account`,
        ACCOUNTING_MANAGEMENT: `${RoutingConstants.ROOT_ACC}/management`,
        COMBINE_BILLING: `${RoutingConstants.ROOT_ACC}/combine-billing`,
    };

    public static readonly CATALOGUE = {
        WAREHOUSE: `${RoutingConstants.ROOT_CATALOGUE}/ware-house`,
        PORT_INDEX: `${RoutingConstants.ROOT_CATALOGUE}/port-index`,
        PARTNER_DATA: `${RoutingConstants.ROOT_CATALOGUE}/partner-data`,
        COMMODITY: `${RoutingConstants.ROOT_CATALOGUE}/commodity`,
        STAGE_MANAGEMENT: `${RoutingConstants.ROOT_CATALOGUE}/stage-management`,
        UNIT: `${RoutingConstants.ROOT_CATALOGUE}/unit`,
        LOCATION: `${RoutingConstants.ROOT_CATALOGUE}/location`,
        CHARGE: `${RoutingConstants.ROOT_CATALOGUE}/charge`,
        CURRENCY: `${RoutingConstants.ROOT_CATALOGUE}/currency`,
        CHART_OF_ACCOUNTS: `${RoutingConstants.ROOT_CATALOGUE}/chart-of-accounts`,
    };

    public static readonly SYSTEM = {
        USER_MANAGEMENT: `${RoutingConstants.ROOT_SYSTEM}/user-management`,
        GROUP: `${RoutingConstants.ROOT_SYSTEM}/group`,
        ROLE: `${RoutingConstants.ROOT_SYSTEM}/role`,
        PERMISSION: `${RoutingConstants.ROOT_SYSTEM}/permission`,
        DEPARTMENT: `${RoutingConstants.ROOT_SYSTEM}/department`,
        COMPANY: `${RoutingConstants.ROOT_SYSTEM}/company`,
        OFFICE: `${RoutingConstants.ROOT_SYSTEM}/office`,
        AUTHORIZATION: `${RoutingConstants.ROOT_SYSTEM}/authorization`,
    };

    public static readonly TOOL = {
        ID_DEFINITION: `${RoutingConstants.ROOT_TOOL}/id-definition`,
        UNLOCK_REQUEST: `${RoutingConstants.ROOT_TOOL}/unlock-request`,
        TARIFF: `${RoutingConstants.ROOT_TOOL}/tariff`,
        EXCHANGE_RATE: `${RoutingConstants.ROOT_TOOL}/exchange-rate`,
        ECUS_CONNECTION: `${RoutingConstants.ROOT_TOOL}/ecus-connection`,
        KPI: `${RoutingConstants.ROOT_TOOL}/kpi`,
        SUPPLIER: `${RoutingConstants.ROOT_TOOL}/supplier`,
        LOG_VIEWER: `${RoutingConstants.ROOT_TOOL}/log-viewer`,
        UNLOCK: `${RoutingConstants.ROOT_TOOL}/unlock`,
    };

    public static readonly REPORT = {
        GENERAL_REPORT: `${RoutingConstants.ROOT_REPORT}/general-report`,
        SALE_REPORT: `${RoutingConstants.ROOT_REPORT}/sale-report`,
        ACCOUNTING_REPORT: `${RoutingConstants.ROOT_REPORT}/sheet-debit-report`,
    };

    public static readonly DESIGNS_ZONE = {
        FORM: `${RoutingConstants.ROOT_DESIGNS_ZONE}/form`,
        TABLE: `${RoutingConstants.ROOT_DESIGNS_ZONE}/table`,
    };

}

