export const environment = {
  eFMSVersion: require('../../package.json').version,
  production: true,
  uat: false,
  local: false,
  HOST: {
    WEB_URL: "api-efms.itlvn.com",
    ACCOUNTING: "api-efms.itlvn.com/Accounting",
    DOCUMENTATION: "api-efms.itlvn.com/Documentation",
    CATALOGUE: "api-efms.itlvn.com/Catalogue",
    OPERATION: "api-efms.itlvn.com/Operation",
    SYSTEM: "api-efms.itlvn.com/System",
    REPORT: "https://api-efms.itlvn.com/ReportPreview/Default.aspx",
    EXPORT: "api-efms.itlvn.com/Export",
    SETTING: "api-efms.itlvn.com/Setting",
    INDENTITY_SERVER_URL: "https://api-efms.itlvn.com/identityserver",
    EXPORT_CRYSTAL: "https://api-efms.itlvn.com/ReportPreview/ExportCrystal.aspx",
    PARTNER_API: "api-efms.itlvn.com/partner",
    FILE_SYSTEM: "api-efms.itlvn.com/File",
    REPORT_MANAGEMENT: "api-efms.itlvn.com/Report"
  },
  AUTHORIZATION:
  {
    requireHttps: true
  },
  GOOGLE_ANALYTICS_ID: 'UA-192958167-1',
};