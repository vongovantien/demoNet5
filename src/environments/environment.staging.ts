

export const environment = {
    eFMSVersion: require('../../package.json').version,
    production: false,
    uat: true,
    local: false,
    HOST: {
        WEB_URL: "efms-demo-api.logtechub.com",
        ACCOUNTING: "efms-demo-api.logtechub.com/Accounting",
        DOCUMENTATION: "efms-demo-api.logtechub.com/Documentation",
        CATALOGUE: "efms-demo-api.logtechub.com/Catalogue",
        OPERATION: "efms-demo-api.logtechub.com/Operation",
        SYSTEM: "efms-demo-api.logtechub.com/System",
        REPORT: "https://efms-demo-api.logtechub.com/ReportPreview/Default.aspx",
        EXPORT: "efms-demo-api.logtechub.com/Export",
        SETTING: "efms-demo-api.logtechub.com/Setting",
        INDENTITY_SERVER_URL: "https://efms-demo-api.logtechub.com/identityserver",
        // INDENTITY_SERVER_URL: "https://localhost:44369",
        EXPORT_CRYSTAL: "https://efms-demo-api.logtechub.com/ReportPreview/ExportCrystal.aspx",
        PARTNER_API: "efms-demo-api.logtechub.com/partner",
        FILE_SYSTEM: "tefms-demo-api.logtechub.com/File",
        REPORT_MANAGEMENT: "efms-demo-api.logtechub.com/Report"


    },
    AUTHORIZATION:
    {
        requireHttps: true
    },
    GOOGLE_ANALYTICS_ID: 'G-PMWVSS1EYP',

}

