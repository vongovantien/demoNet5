

export const environment = {
    eFMSVersion: require('../../package.json').version,
    production: false,
    uat: false,
    local: false,
    HOST: {
        WEB_URL: "test.api-efms.itlvn.com",
        ACCOUNTING: "test.api-efms.itlvn.com/Accounting",
        DOCUMENTATION: "test.api-efms.itlvn.com/Documentation",
        CATALOGUE: "test.api-efms.itlvn.com/Catalogue",
        OPERATION: "test.api-efms.itlvn.com/Operation",
        SYSTEM: "test.api-efms.itlvn.com/System",
        REPORT: "http://test.api-efms.itlvn.com/ReportPreview/Default.aspx",
        EXPORT: "test.api-efms.itlvn.com/Export",
        SETTING: "test.api-efms.itlvn.com/Setting",
        INDENTITY_SERVER_URL: "http://test.api-efms.itlvn.com/identityserver",
        EXPORT_CRYSTAL: "http://test.api-efms.itlvn.com/ReportPreview/ExportCrystal.aspx",
        FILE_SYSTEM: "test.api-efms.itlvn.com/File",
        REPORT_MANAGEMENT: "test.api-efms.itlvn.com/Report"


    },
    AUTHORIZATION:
    {
        requireHttps: false
    },
    GOOGLE_ANALYTICS_ID: 'G-PMWVSS1EYP',


};   
