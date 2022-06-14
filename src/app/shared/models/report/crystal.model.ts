export class Crystal{
    reportFile: string;
    reportName: string;
    formatType: number;
    dataSource: any[];
    subReports: SubReport[];
    parameter: any;
    allowPrint: boolean;
    allowExport: boolean;
    isLandscape: boolean;
    pathReportGenerate: string;
}

export class SubReport{
    name: string;
    dataSource: any[];
}