import { Injectable } from '@angular/core';
import { ApiService } from '../services';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExportRepo {
    exportCombineOps(criteria: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportCombineOps`, criteria, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    constructor(private _api: ApiService) {
    }

    exportCrystalReportPDF(data: any) {
        return this._api.postFormData(`${environment.HOST.EXPORT_CRYSTAL}`, `crystal=${JSON.stringify(data)}`);
    }

    exportCustomClearance(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/CustomsDeclaration/ExportCustomClearance`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }


    exportCompany(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/SystemReport/ExportCompany`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportDepartment(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/SystemReport/ExportDepartment`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    exportOffice(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/SystemReport/ExportOffice`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    exportGroup(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/SystemReport/ExportGroup`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportUser(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/SystemReport/ExportUser`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    exportEManifest(hblId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportEManifest`, null, { hblid: hblId }, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportGoodDeclare(hblId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportGoodsDeclare`, null, { hblid: hblId }, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    exportDangerousGoods(hblId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportDangerousGoods`, null, { hblid: hblId }, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportPartner(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportPartnerData`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportCurrency(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportCurrency`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportPortIndex(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportPortIndex`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportCommodity(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportCommodityList`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportCommodityGroup(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportCommodityGroup`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportCharge(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportCharge`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportStage(searchObject) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportStage`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportUnit(searchObject) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportUnit`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportCountry(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportCountry`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportProvince(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportProvince`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportDistrict(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportDistrict`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportTownWard(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportTownWard`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportSOAOPS(soaNo: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportSOAOPS`, null, { soaNo: soaNo }, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }


    exportBravoSOA(soaNo: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportBravoSOA`, null, { soaNo: soaNo }, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportAdvancePaymentDetail(advanceId: string, language: string) {
        return this._api.get(`${environment.HOST.EXPORT}/api/v1/${language}/AccountingReport/ExportDetailAdvancePayment?advanceId=${advanceId}&language=${language}`).pipe(
            map((data: any) => data)
        );
    }

    exportSOAAirFreight(soaNo: string, officeId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportSOAAirfreight`, null, { soaNo: soaNo, officeId: officeId }, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportSOAAirFreightWithHBL(soaNo: string, officeId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportSOAAirfreightWithHBL`, null, { soaNo: soaNo, officeId: officeId }, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportSOASupplierAirFreight(soaNo: string, officeId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportSOASupplierAirfreight`, null, { soaNo: soaNo, officeId: officeId }, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportSettlementPaymentDetail(settlementId: string, language: string) {
        return this._api.get(`${environment.HOST.EXPORT}/api/v1/${language}/AccountingReport/ExportDetailSettlementPayment?settlementId=${settlementId}&language=${language}`).pipe(
            catchError((error) => throwError(error)),
            map(data => data)
        );
    }

    exportSettlementPaymentDetailTemplate(settlementId: string, language: string) {
        return this._api.get(`${environment.HOST.EXPORT}/api/v1/${language}/AccountingReport/ExportDetailSettlementPaymentTemplate?settlementId=${settlementId}&language=${language}`).pipe(
            catchError((error) => throwError(error)),
            map(data => data)
        );
    }

    exportGeneralSettlementPayment(settlementId: string) {
        return this._api.get(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportGeneralSettlementPayment?settlementId=${settlementId}`).pipe(
            catchError((error) => throwError(error)),
            map(data => data)
        );
    }

    exportShipmentOverview(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportShipmentOverview`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportShipmentOverviewWithType(searchObject: any = {}, reportType: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportShipmentOverviewWithType`, searchObject, { reportType: reportType }, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportDetailSOA(soaNo: string, currency) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportDetailSOA`, null, { soaNo: soaNo, currency: currency }, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportMawbAirwayBill(jobId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportMAWBAirExport?jobId=${jobId}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportHawbAirwayBill(hblid: string, officeId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportHAWBAirExport?hblid=${hblid}&officeId=${officeId}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportAdvancePaymentShipment(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportAdvancePaymentShipment`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportSettlementPaymentShipment(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportSettlementPaymentShipment`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportSettlementPaymentShipmentDetail(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportSettlementPaymentDetailSurCharges`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportAcountingPaymentShipment(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportAccountingPayment`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportStatementReceivableCustomer(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportAccountingCustomerPayment`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportSCSCAirwayBill(jobId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportSCSCAirExport?jobId=${jobId}`, null, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportTCSAirwayBill(jobId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportTCSAirExport?jobId=${jobId}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportACSAirwayBill(jobId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportACSAirExport?jobId=${jobId}`, null, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportNCTSALSAirwayBill(jobId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportNCTSALSAirExport?jobId=${jobId}`, null, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportAccountingPLSheet(body: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportAccountingPlSheet`, body, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportJobProfitAnalysis(body: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportJobProfitAnalysis`, body, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportStandardGeneralReport(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportStandardGeneralReport`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportChartOfAccounts(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportChartOfAccounts`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportSummaryOfCostsIncurred(body: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/exportSummaryOfCostsIncurred`, body, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportSummaryOfRevenueIncurred(body: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/exportSummaryOfRevenueIncurred`, body, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportCostsByPartner(body: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/exportSummaryOfCostsPartner`, body, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportAccountingManagement(body: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportAccountingManagement`, body, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map(data => data)
        );
    }

    exportAccountingManagementDebCreInvoice(body: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportAccountingManagementDebCreInvoice`, body, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportHousebillDaily(issuedDate: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportHousebillDaily?issuedDate=${issuedDate}`).pipe(
            catchError((error) => throwError(error)),
            map(data => data)
        );
    }

    exportCDNote(jobId: string, cdNo: String, officeId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/en-US/Documentation/ExportOpsCdNote`, null, { jobId: jobId, cdNo: cdNo, officeId: officeId }, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportCommissionPRReport(searchObject: any = {}, currentUserId: string, rptType: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportCommissionPRReport`, searchObject, { currentUserId: currentUserId, rptType: rptType }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportIncentiveReport(searchObject: any = {}, currentUserId: string) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Documentation/ExportIncentiveReport`, searchObject, { currentUserId: currentUserId }, null, 'response');
    }

    exportCDNoteCombine(data: any[]) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/en-US/Documentation/ExportOpsCdNoteCombine`, data, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportUnlockRequest(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/SettingReport/ExportUnlockRequest`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map(data => data)
        );
    }

    previewExportPayment(id: string, language: string, moduleName: string, office: string = null) {
        if (moduleName === 'Settlement')
            window.open(`https://gbc-excel.officeapps.live.com/op/view.aspx?src=${environment.HOST.EXPORT}/api/v1/${language}/AccountingReport/ExportDetailSettlementPayment?settlementId=${id}&language=${language}&office=${office}`, '_blank');
        else if (moduleName === 'Advance')
            window.open(`https://gbc-excel.officeapps.live.com/op/view.aspx?src=${environment.HOST.EXPORT}/api/v1/${language}/AccountingReport/ExportDetailAdvancePayment?advanceId=${id}&language=${language}&office=${office}`, '_blank');
        else if (moduleName === 'Settlement_General')
            window.open(`https://gbc-excel.officeapps.live.com/op/view.aspx?src=${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportGeneralSettlementPayment?settlementId=${id}&office=${office}`, '_blank');
    }

    previewExport(url: string) {
        window.open(`https://gbc-excel.officeapps.live.com/op/view.aspx?src=${url}`, '_blank');
    }

    downloadExport(url: string) {
        window.open(`${url}`, '_blank');
    }

    previewExportPaymentTemplate(id: string, language: string, moduleName: string) {
        window.open(`https://gbc-excel.officeapps.live.com/op/view.aspx?src=${environment.HOST.EXPORT}/api/v1/${language}/AccountingReport/ExportDetailSettlementPaymentTemplate?settlementId=${id}&language=${language}`, '_blank');
    }

    exportBank(searchObject: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportBank`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    exportAccountingReceivableArSumary(searchObject: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportAccountingReceivableArSumary`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportAccountingReceivableDebitDetail(searchObject: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportDebitDetail`, searchObject).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportAgreementInfo(partnerSearchObj: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/Catalogue/ExportAgreementInfo`, partnerSearchObj, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportStatementReceivableAgency(searchObject: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportAccountingAgencyPayment`, searchObject, null, null, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportAdvanceReceipt(criteria: any) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportReceiptAdvance`, criteria, null, { "hideSpinner": "true" }, 'response').pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    exportAcountingPayableStandart(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportAccountingPayableStandartReport`, searchObject, null, {}, 'response');
    }

    exportAcountingTemplatePayable(searchObject: any = {}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportAccountingPayableAcctTemplateReport`, searchObject, null, {}, 'response');
    }

    exportDebitAmountDetailByContract(selectedTrialOfficial: any={}) {
        return this._api.downloadfile(`${environment.HOST.EXPORT}/api/v1/vi/AccountingReport/ExportDebitAmountDetailByContract`, selectedTrialOfficial, null, null, 'response');
    }
}

