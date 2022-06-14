
export const environment = {
    eFMSVersion: require('../../package.json').version,
    production: false,
    uat: false,
    local: true,
    HOST: {
        WEB_URL: "localhost:",
        ACCOUNTING: "localhost:44368",
        DOCUMENTATION: "localhost:44366",
        CATALOGUE: "localhost:44361",
        OPERATION: "localhost:44365",
        SYSTEM: "localhost:44360",
        REPORT: "http://localhost:53717/Default.aspx",
        EXPORT: "localhost:63492",
        SETTING: "localhost:44363",
        INDENTITY_SERVER_URL: "https://localhost:44369",
        EXPORT_CRYSTAL: "http://localhost:53717/ExportCrystal.aspx",
        PARTNER_API: "http://localhost:52278",
        FILE_SYSTEM: "test.api-efms.itlvn.com/File",
        REPORT_MANAGEMENT: "localhost:61303"
    },
    AUTHORIZATION:
    {
        requireHttps: false
    },
    GOOGLE_ANALYTICS_ID: 'G-PMWVSS1EYP',

};
