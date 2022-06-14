

export const environment = {
    eFMSVersion: require('../../package.json').version,
    production: false,
    uat: true,
    local: false,
    HOST: {
        WEB_URL: "efms-uat.sotrans.com.vn ",
        ACCOUNTING: "efms-uat-api.sotrans.com.vn/Accounting",
        DOCUMENTATION: "efms-uat-api.sotrans.com.vn/Documentation",
        CATALOGUE: "efms-uat-api.sotrans.com.vn/Catalogue",
        OPERATION: "efms-uat-api.sotrans.com.vn/Operation",
        SYSTEM: "efms-uat-api.sotrans.com.vn/System",
        REPORT: "https://efms-uat-api.sotrans.com.vn/ReportPreview/Default.aspx",
        EXPORT: "efms-uat-api.sotrans.com.vn/Export",
        SETTING: "efms-uat-api.sotrans.com.vn/Setting",
        INDENTITY_SERVER_URL: "https://efms-uat-api.sotrans.com.vn/identityserver",
        EXPORT_CRYSTAL: "https://efms-uat-api.sotrans.com.vn/ReportPreview/ExportCrystal.aspx",
        PARTNER_API: "efms-uat-api.sotrans.com.vn/partner",
        FILE_SYSTEM: "efms-uat-api.sotrans.com.vn/File",
        REPORT_MANAGEMENT: "efms-uat-api.sotrans.com.vn/Report"
    },
    AUTHORIZATION:
    {
        requireHttps: true
    },
    GOOGLE_ANALYTICS_ID: 'UA-192958167-1',
}

