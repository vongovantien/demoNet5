

export const environment = {
    eFMSVersion: require('../../package.json').version,
    production: false,
    uat: true,
    local: false,
    HOST: {
        WEB_URL: "uat-api-efms.itlvn.com",
        ACCOUNTING: "uat-api-efms.itlvn.com/Accounting",
        // ACCOUNTING: "localhost:44300",

        DOCUMENTATION: "uat-api-efms.itlvn.com/Documentation",
        // DOCUMENTATION: "localhost:44324/",
        CATALOGUE: "uat-api-efms.itlvn.com/Catalogue",
        OPERATION: "uat-api-efms.itlvn.com/Operation",
        SYSTEM: "uat-api-efms.itlvn.com/System",
        REPORT: "https://uat-api-efms.itlvn.com/ReportPreview/Default.aspx",
        EXPORT: "uat-api-efms.itlvn.com/Export",
        SETTING: "uat-api-efms.itlvn.com/Setting",
        INDENTITY_SERVER_URL: "https://uat-api-efms.itlvn.com/identityserver",
        EXPORT_CRYSTAL: "https://uat-api-efms.itlvn.com/ReportPreview/ExportCrystal.aspx",
        PARTNER_API: "uat-api-efms.itlvn.com/partner",
        FILE_SYSTEM: "uat-api-efms.itlvn.com/File",
        REPORT_MANAGEMENT: "uat-api-efms.itlvn.com/Report"
    },
    AUTHORIZATION:
    {
        requireHttps: true
    },
    GOOGLE_ANALYTICS_ID: 'UA-192958167-1',
}

