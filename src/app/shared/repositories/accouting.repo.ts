import { Injectable } from "@angular/core";
import { ApiService } from "../services";
import { environment } from "src/environments/environment";
import { catchError, map } from "rxjs/operators";
import { throwError, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AccountingRepo {

    private VERSION: string = 'v1';
    constructor(protected _api: ApiService) {
    }

    createSOA(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AcctSOA/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    previewConfirmBilling(combineBillingNo: string) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/PreviewConfirmBilling`, {}, { combineBillingNo: combineBillingNo }).pipe(
            map((data: any) => data)
        );
    }
    getListSOA(page?: number, size?: number, body: any = {}) {
        if (!!page && !!size) {
            return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/paging`, body, {
                pageNumber: '' + page,
                pageSize: '' + size
            }, { "hideSpinner": "true" }).pipe(
                catchError((error) => throwError(error)),
                map((data: any) => data)
            );
        } else {
            return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA`).pipe(
                map((data: any) => data)
            );
        }
    }

    deleteSOA(soaId: string) {
        return this._api.delete(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/delete/${soaId}`)
            .pipe(
                map((data: any) => data)
            );
    }

    getDetaiLSOA(soaNO: string, currency: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/GetBySoaNo/${soaNO}&${currency}`)
            .pipe(
                map((data: any) => data)
            );
    }
    getDetaiLSOAUpdateExUsd(soaNO: string, currency: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/GetBySoaNoUpdateExUsd/${soaNO}&${currency}`)
            .pipe(
                map((data: any) => data)
            );
    }

    updateSOA(body: any = {}) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/update`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    getListShipmentAndCDNote(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/GetShipmentsAndCDdNotesNotExistInResultFilter`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    getListMoreCharge(dataSearch: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/GetListMoreChargeByCondition`, dataSearch)
            .pipe(
                map((data: any) => data)
            );
    }

    addMoreCharge(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/AddMoreCharge`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    getDetailSOAToExport(soaNO: string, currency: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/GetDataExportSOABySOANo`, { soaNo: soaNO, currencyLocal: currency })
            .pipe(
                map((data: any) => data)
            );
    }


    getListShipmentDocumentOperation() {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/GetShipments`)
            .pipe(
                map((data: any) => data)
            );
    }

    updateVoucherAdvancePayment(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/UpdatePaymentVoucher`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    checkExistedVoucherInAdvance(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AcctAdvancePayment/CheckExistedVoucherInAdvance`, body).pipe(
            map((data: any) => data)
        );
    }

    upLoadVoucherAdvanceFile(files: any) {
        return this._api.postFile(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/UploadFile`, files, "uploadedFile");
    }

    downloadVoucherAdvanceFile() {
        return this._api.downloadfile(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AcctAdvancePayment/downloadExcel`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    importVoucherAdvance(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AcctAdvancePayment/import`, body).pipe(
            map((data: any) => data)
        );
    }



    // add new advance payment with payment request
    addNewAdvancePayment(body: any = {}): Observable<any> {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/Add`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    updateAdvPayment(body: any = {}): Observable<any> {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/Update`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    sendRequestAdvPayment(body: any = {}): Observable<any> {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/SaveAndSendRequest`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    checkShipmentsExistInAdvancePament(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/CheckShipmentsExistInAdvancePament`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    getListAdvancePayment(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/paging`, body, {
            pageNumber: '' + page,
            pageSize: '' + size
        }, { "hideSpinner": "true" }).pipe(
            map((data: any) => data)
        );
    }

    getDetailAdvancePayment(advanceId: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/GetAdvancePaymentByAdvanceId`, { advanceId: advanceId }).pipe(
            map((data: any) => data)
        );
    }

    deleteAdvPayment(advanceNo: string) {
        return this._api.delete(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/Delete`, { advanceNo: advanceNo }).pipe(
            map((data: any) => data)
        );
    }

    getGroupRequestAdvPayment(advanceNo: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/GetGroupRequestsByAdvanceNo`, { advanceNo: advanceNo }).pipe(
            map((data: any) => data)
        );
    }

    previewAdvancePayment(param: any) {
        if (typeof param === 'string') {
            return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/PreviewAdvancePaymentRequestByAdvanceId`, null, { advanceId: param }).pipe(
                map((data: any) => data)
            );
        }
    }

    getInfoApprove(advanceNo: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/GetInfoApproveAdvanceByAdvanceNo`, { advanceNo: advanceNo }).pipe(
            map((data: any) => data)
        );
    }

    approveAdvPayment(advanceId: string) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/UpdateApprove`, {}, { advanceId: advanceId })
            .pipe(
                map((data: any) => data)
            );
    }

    deniedApprove(advanceId: string, comment: string) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/DeniedApprove`, {}, { advanceId: advanceId, comment: comment })
            .pipe(
                map((data: any) => data)
            );
    }

    addShipmentSurCharge(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/CsShipmentSurcharge/Add`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    getListSettlementPayment(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/paging`, body, {
            pageNumber: '' + page,
            pageSize: '' + size
        }, { "hideSpinner": "true" }).pipe(
            map((data: any) => data)
        );
    }

    getShipmentOfSettlements(settlementNo: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/GetShipmentOfSettlements`, { settlementNo: settlementNo }).pipe(
            map((data: any) => data)
        );
    }


    getExistingCharge(body: any = {}, settlementCode: string = null) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/GetExistsCharge`, body, { settlementCode: settlementCode }).pipe(
            map((data: any) => data)
        );
    }

    addNewSettlement(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/Add`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    getDetailSettlementPayment(settlementId: string, viewType: string = "list") {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/GetDetailSettlementPaymentById`, { settlementId: settlementId, view: viewType }).pipe(
            map((data: any) => data)
        );
    }

    updateSettlementPayment(body: any = {}) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/Update`, body).pipe(
            map((data: any) => data)
        );
    }

    saveAndSendRequestSettlemntPayment(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/SaveAndSendRequest`, body).pipe(
            map((data: any) => data)
        );
    }

    checkValidToSendRequestSettle(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/CheckValidToSendRequestSettle`, body).pipe(
            map((data: any) => data)
        );
    }

    updateAndSendMailApprovalSettlement(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/UpdateAndSendMailApprovalSettlement`, body).pipe(
            map((data: any) => data)
        );
    }

    deleteSettlement(settlementNo: string) {
        return this._api.delete(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/delete`, { settlementNo: settlementNo })
            .pipe(
                map((data: any) => data)
            );
    }

    getPaymentManagement(jobId: string, mbl: string, hbl: string, requester: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/GetPaymentManagementByShipment`, { JobId: jobId, mbl: mbl, hbl: hbl, requester: requester }).pipe(
            map((data: any) => data)
        );
    }

    checkDuplicateShipmentSettlement(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/CheckDuplicateShipmentSettlement`, body)
            .pipe(
                map((data: any) => data)
            );

    }

    getInfoApproveSettlement(settlementNo: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/GetInfoApproveSettlementBySettlementNo`, { settlementNo: settlementNo }).pipe(
            map((data: any) => data)
        );
    }

    approveSettlementPayment(settlementId: string) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/UpdateApprove`, {}, { settlementId: settlementId })
            .pipe(
                map((data: any) => data)
            );
    }

    deniedApproveSettlement(settlementId: string, comment: string) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/DeniedApprove`, {}, { settlementId: settlementId, comment: comment })
            .pipe(
                map((data: any) => data)
            );
    }

    previewSettlementPayment(settlementNo: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/Preview`, null, { settlementNo: settlementNo }).pipe(
            map((data: any) => data)
        );
    }

    getListChargeSettlementBySettlementNo(settlementNo: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/GetListSceneChargeSettlementBySettlementNo`, { settlementNo: settlementNo }).pipe(
            map((data: any) => data)
        );
    }

    copyChargeToShipment(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/CopyCharges`, body).pipe(
            map((data: any) => data)
        );
    }

    getListChargeShipment(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AcctSOA/ListChargeShipment`, body).pipe(
            map((data: any) => data)
        );
    }

    getAdvanceOfShipment(jobNo: string, hblId: string, settleCode: string = null): Observable<any> {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/GetAdvancesOfShipment`, { jobId: jobNo, hblid: hblId, settleCode: settleCode }).pipe(
            map((data: any) => data)
        );
    }

    getAdvancePaymentToUnlock(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AcctAdvancePayment/GetAdvancesToUnlock`, body).pipe(
            map((data: any) => data)
        );
    }

    getSettlementPaymentToUnlock(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AcctSettlementPayment/GetSettlePaymentsToUnlock`, body).pipe(
            map((data: any) => data)
        );
    }

    unlockSettlement(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AcctSettlementPayment/UnLock`, body).pipe(
            map((data: any) => data)
        );
    }

    unlockAdvance(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AcctAdvancePayment/UnLock`, body).pipe(
            map((data: any) => data)
        );
    }

    checkAllowDeleteAdvance(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/CheckAllowDelete/${id}`).pipe(
            map((data: any) => data)
        );
    }

    checkAllowGetDetailAdvance(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/CheckAllowDetail/${id}`).pipe(
            map((data: any) => data)
        );
    }

    checkAllowDeleteSettlement(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/CheckAllowDelete/${id}`).pipe(
            map((data: any) => data)
        );
    }

    checkAllowGetDetailSettlement(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/CheckAllowDetail/${id}`).pipe(
            map((data: any) => data)
        );
    }

    checkAllowUpdateDirectCharges(shipmentCharges: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/CheckAllowUpdateDirectCharges`, shipmentCharges).pipe(
            map((data: any) => data)
        );
    }

    checkAllowDenySettlement(ids: string[]) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/CheckAllowDenySettle`, ids).pipe(
            map((data: any) => data)
        );
    }

    checkAllowDeleteSOA(soaId: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/CheckAllowDelete/${soaId}`).pipe(
            map((data: any) => data)
        );
    }

    checkAllowGetDetailSOA(soaId: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/CheckAllowDetail/${soaId}`).pipe(
            map((data: any) => data)
        );
    }

    recallRequest(advanceId: string) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/RecallRequest`, {}, { advanceId: advanceId })
            .pipe(
                map((data: any) => data)
            );
    }

    RecallRequestSettlement(settlementId: string) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/RecallRequest`, {}, { settlementId: settlementId })
            .pipe(
                map((data: any) => data)
            );
    }

    previewAccountStatementFull(soaNo: string) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/PreviewAccountStatementFull`, {}, { soaNo: soaNo }).pipe(
            map((data: any) => data)
        );
    }

    checkAllowDeleteAcctMngt(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/CheckAllowDelete/`, { id: id }).pipe(
            map((data: any) => data)
        );
    }

    deleteAcctMngt(id: string) {
        return this._api.delete(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/`, { id: id })
            .pipe(
                map((data: any) => data)
            );
    }

    getChargeSellForInvoiceByCriteria(criteria: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/GetChargeSellForInvoiceByCriteria`, criteria)
            .pipe(
                map((data: any) => data)
            );
    }

    getChargeForVoucherByCriteria(criteria: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/GetChargeForVoucherByCriteria`, criteria)
            .pipe(
                map((data: any) => data)
            );
    }

    getListAcctMngt(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/Paging`, body, {
            pageNumber: '' + page,
            pageSize: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    addNewAcctMgnt(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    updateAcctMngt(body: any = {}): Observable<any> {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/Update`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    generateVoucherId(acctMngtType: string, voucherType: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/GenerateVoucherId`, { acctMngtType: acctMngtType, voucherType: voucherType })
            .pipe(
                map((data: any) => data)
            );
    }

    getDetailAcctMngt(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/GetById`, { id: id }).pipe(
            map((data: any) => data)
        );
    }

    generateInvoiceNoTemp() {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/GenerateInvoiceNoTemp`)
            .pipe(
                map((data: any) => data)
            );
    }

    checkVoucherIdExist(voucherId: string, acctId: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/CheckVoucherIdExist?voucherId=${voucherId}&acctId=${acctId}`).pipe(
            map((data: any) => data)
        );
    }

    checkInvoiceNoTempSerieExist(invoiceNoTemp: string, serie: string, acctId: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/CheckInvoiceNoTempSerieExist?invoiceNoTemp=${invoiceNoTemp}&serie=${serie}&acctId=${acctId}`).pipe(
            map((data: any) => data)
        );
    }

    downLoadVatInvoiceImportTemplate() {
        return this._api.downloadfile(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountingManagement/DownLoadVatInvoiceTemplate`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    uploadVatInvoiceImportFile(files: any) {
        return this._api.postFile(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/uploadVatInvoiceImportTemplate`, files, "uploadedFile");
    }

    importVatInvoice(body: any) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/ImportVatInvoice`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    checkDetailAcctMngtPermission(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/CheckPermission/${id}`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    upLoadInvoicePaymentFile(files: any) {
        return this._api.postFile(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingPayment/UploadInvoicePaymentFile`, files, "uploadedFile");
    }

    downloadInvoicePaymentFile() {
        return this._api.downloadfile(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountingPayment/DownloadInvoicePaymentExcel`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    downloadOBHPaymentFile() {
        return this._api.downloadfile(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountingPayment/DownloadOBHPaymentExcel`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    importInvoicePayment(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountingPayment/ImportInvoicePayment`, body).pipe(
            map((data: any) => data)
        );
    }
    importOBHPayment(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountingPayment/ImportSOAOBHPayment`, body).pipe(
            map((data: any) => data)
        );
    }

    getOBHPaymentImport(body: any) {
        return this._api.postFile(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountingPayment/UploadOBHPaymentFile`, body, 'file').pipe(
            map((data: any) => data)
        );
    }

    paymentPaging(page: number, size: number, body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingPayment/paging`, body, {
            pageNumber: '' + page,
            pageSize: '' + size
        }, { "hideSpinner": "true" }).pipe(
            map((data: any) => data)
        );
    }
    getPaymentByrefNo(refNo: string, type: string, invoiceNo: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingPayment/GetBy`, { refNo: refNo, type: type, invoiceNo: invoiceNo }).pipe(
            map((data: any) => data)
        );
    }

    getInvoiceExtendedDate(refNo: string, type: string, invoiceNo: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingPayment/GetInvoiceExtendedDate`, { refNo: refNo, type: type, invoiceNo: invoiceNo }).pipe(
            map((data: any) => data)
        );
    }

    updateExtendDate(body: any) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingPayment/UpdateExtendDate`, body).pipe(
            map((data: any) => data)
        )
    }

    deletePayment(id: string) {
        return this._api.delete(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingPayment/` + id)
            .pipe(
                map((data: any) => data)
            );
    }

    getOBHSOAExtendedDate(refId: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingPayment/GetOBHSOAExtendedDate`, { id: refId }).pipe(
            map((data: any) => data)
        );
    }

    getHistoryDeniedAdvancePayment(advanceNo: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/GetHistoryDeniedAdvancePayment`, { advanceNo: advanceNo }).pipe(
            map((data: any) => data)
        );
    }

    getHistoryDeniedSettlementPayment(settlementNo: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/GetHistoryDeniedSettlementPayment`, { settlementNo: settlementNo }).pipe(
            map((data: any) => data)
        );
    }

    // Tính công nợ theo {surchargeId, partnerId, office, service}
    calculatorReceivable(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountReceivable/CalculatorReceivable`, body, null, { "hideSpinner": "true" }).pipe(
            map((data: any) => data)
        );
    }

    calculatorDebitAmount(body: any, isHideSpinner: boolean = true) {
        if (!!isHideSpinner) {
            return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountReceivable/CalculateDebitAmount`, body, null, { "hideSpinner": "true" });
        }
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountReceivable/CalculateDebitAmount`, body);
    }

    // Tính công nợ theo {partnerId, office, service}
    insertOrUpdateReceivable(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountReceivable/InsertOrUpdateReceivable`, body).pipe(
            map((data: any) => data)
        );
    }

    getAgreementForInvoice(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountingManagement/GetContractForInvoice`, body);
    }

    receivablePaging(page: number, size: number, body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountReceivable/Paging`, body, {
            pageNumber: '' + page,
            pageSize: '' + size
        }, { "hideSpinner": "true" }).pipe(
            map((data: any) => data)
        );
    }

    getDetailReceivableByArgeementId(argeementId: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountReceivable/GetDetailAccountReceivableByArgeementId`, { argeementId: argeementId }).pipe(
            map((data: any) => data)
        );
    }

    // Chỉ sử dụng khi không có argeementId
    getDetailReceivableByPartnerId(partnerId: string, saleManId: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountReceivable/GetDetailAccountReceivableByPartnerId`, { partnerId: partnerId, saleManId: saleManId }).pipe(
            map((data: any) => data)
        );
    }

    calculateListChargeAccountingMngt(charges: any[]) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/vi/AccountingManagement/CalculateListChargeAccountingMngt`, charges);
    }

    previewAdvancePaymentMultiple(advanceIds: string[]) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/PreviewMultipleAdvancePaymentByAdvanceIds`, advanceIds).pipe(
            map((data: any) => data)
        );
    }

    previewSettlementPaymentMultiple(settlementNos: string[]) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/PreviewMultipleSettlementBySettlementNos`, settlementNos).pipe(
            map((data: any) => data)
        );
    }

    syncAdvanceToAccountant(list: any[]) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/SyncAdvanceToAccountantSystem`, list).pipe(
            map((data: any) => data)
        );
    }

    getListAdvanceSyncData(list: string[]) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/GetListAdvanceSyncData`, list).pipe(
            map((data: any) => data)
        );
    }

    syncCdNoteToAccountant(list: any[]) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/SyncListCdNoteToAccountant`, list).pipe(
            map((data: any) => data)
        );
    }

    syncSoaToAccountant(list: any[]) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/SyncListSoaToAccountant`, list).pipe(
            map((data: any) => data)
        );
    }

    getListVoucherToSync(ids: string[]) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/GetListVoucherSyncData`, ids).pipe(
            map((data: any) => data)
        );
    }

    syncVoucherToAccountant(list: any[]) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/SyncVoucherToAccountantSystem`, list).pipe(
            map((data: any) => data)
        );
    }

    getListInvoicePaymentToSync(list: any[]) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/GetListInvoicePaymentToSync`, list).pipe(
            map((data: any) => data)
        );
    }

    getListObhPaymentToSync(list: any[]) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/GetListObhPaymentToSync`, list).pipe(
            map((data: any) => data)
        );
    }

    getListSettleSyncData(ids: string[]) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/GetListSettlementSyncData`, ids).pipe(
            map((data: any) => data)
        );
    }

    syncSettleToAccountant(list: any[]) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/SyncSettlementToAccountantSystem`, list).pipe(
            map((data: any) => data)
        );
    }

    updatePaymentTerm(id: string, days: number) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/UpdatePaymentTerm`, null, { Id: id, days: days }).pipe(
            map((data: any) => data)
        );
    }
    /// Search Customer Payment

    getListConfirmBilling(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/ConfirmBillingPaging`, body, {
            pageNumber: '' + page,
            pageSize: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    UpdateConfirmBillingDate(invoiceIds: string[], billingDate: string) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/UpdateConfirmBillingDate`, invoiceIds, { billingDate: billingDate }).pipe(
            map((data: any) => data)
        );
    }

    getListCustomerPayment(page?: number, size?: number, body: any = {}) {
        if (!!page && !!size) {
            return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/Paging`, body, {
                page: '' + page,
                size: '' + size
            }, { "hideSpinner": "true" }).pipe(
                catchError((error) => throwError(error)),
                map((data: any) => data)
            );
        }
    }

    getDataIssueCustomerPayment(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/GetDataIssueCustomerPayment`, body).pipe(
            map((data: any) => data)
        );
    }

    getDataIssueAgencyPayment(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/GetDataIssueAgencyPayment`, body).pipe(
            map((data: any) => data)
        );
    }

    cancelReceipt(id: string) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/CancelReceipt/${id}`).pipe(
            map((data: any) => data)
        );
    }

    checkAllowDeleteCusPayment(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/CheckAllowDelete/${id}`).pipe(
            map((data: any) => data)
        );
    }
    deleteCusPayment(id: string) {
        return this._api.delete(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt`, { id: id })
            .pipe(
                map((data: any) => data)
            );
    }

    checkAllowGetDetailCPS(cps: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/CheckAllowDetail/${cps}`).pipe(
            map((data: any) => data)
        );
    }

    generateReceiptNo(body) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/GenerateReceiptNo`, body);
    }

    getInvoiceForReceipt(body) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/GetInvoiceForReceipt`, body);

    }

    processInvoiceReceipt(model) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/ProcessInvoice`, model);
    }

    saveReceipt(model: any, action: number) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/SaveReceipt`, model, { saveAction: action });
    }

    getDetailReceipt(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/GetById/`, { id: id });
    }

    rejectSoaCredit(model: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/RejectSoaCredit`, model).pipe(
            map((data: any) => data)
        );
    }

    checkCdNoteSynced(id: any) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/CheckCdNoteSynced/${id}`);
    }

    checkSoaSynced(id: any) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/CheckSoaSynced/${id}`);
    }

    checkVoucherSynced(id: any) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/CheckVoucherSynced/${id}`);
    }

    denyAdvancePayments(Ids: string[]) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctAdvancePayment/DenyAdvancePayments`, Ids);
    }

    denySettlePayments(Ids: string[]) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/DenySettlePayments`, Ids);
    }

    getPartnerForSettlement(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/GetPartnerForSettlement`, body).pipe(
            map((data: any) => data)
        );
    }

    checkSoaCDNoteIsSynced(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/CheckSoaCDNoteIsSynced`, body).pipe(
            map((data: any) => data)
        );
    }

    uploadAttachedFiles(folder: string, id: string, files: FileList[], child?: string) {
        if (!!child) {
            return this._api.putFile(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-US/AWSS3/UploadAttachedFiles/Accounting/${folder}/${id}`, files, 'files', { child: child });
        }
        return this._api.putFile(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-US/AWSS3/UploadAttachedFiles/Accounting/${folder}/${id}`, files, 'files');
    }

    getAttachedFiles(folder: string, id: string, child?: string) {
        if (!!child) {
            return this._api.get(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-Us/AWSS3/GetAttachedFiles/Accounting/${folder}/${id}`, { child: child });
        }
        return this._api.get(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-Us/AWSS3/GetAttachedFiles/Accounting/${folder}/${id}`);

    }
    deleteAttachedFile(folder: string, id: string) {
        return this._api.delete(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-Us/AWSS3/DeleteAttachedFile/Accounting/${folder}/${id}`);
    }

    dowloadallAttach(body: any) {
        return this._api.downloadfile(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-US/AWSS3/DowloadAllFileAttached`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    // getAttachedFiles(folder: string, id: string, child?: string) {
    //     if (!!child) {
    //         return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-Us/Accounting/GetAttachedFiles/${folder}/${id}`, { child: child });
    //     }
    //     return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-Us/Accounting/GetAttachedFiles/${folder}/${id}`);

    // }

    // deleteAttachedFile(folder: string, id: string) {
    //     return this._api.delete(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-Us/Accounting/DeleteAttachedFile/${folder}/${id}`);
    // }

    // dowloadallAttach(body: any) {
    //     return this._api.downloadfile(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/DowloadAllFileAttached`, body).pipe(
    //         catchError((error) => throwError(error)),
    //         map((data: any) => data)
    //     );
    // }

    // uploadAttachedFiles(folder: string, id: string, files: FileList[], child?: string) {
    //     if (!!child) {
    //         return this._api.putFile(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/UploadAttachedFiles/${folder}/${id}`, files, 'files', { child: child });
    //     }
    //     return this._api.putFile(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/UploadAttachedFiles/${folder}/${id}`, files, 'files');
    // }

    getListAdvanceNoForShipment(hblId: string, payeeId: string = '', requester: string = '', settlementCode: string = null) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/GetListAdvanceNoForShipment`, { hblId: hblId, payeeId: payeeId, requester: requester, settlementCode: settlementCode }).pipe(
            map((data: any) => data)
        );
    }

    syncReceiptToAccountant(list: any[]) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/Accounting/SyncListReceiptToAccountant`, list);
    }

    checkVoucherIdDuplicate(voucherId: string, acctId: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountingManagement/CheckDuplicateVoucherId?voucherId=${voucherId}&acctId=${acctId}`).pipe(
            map((data: any) => data)
        );
    }



    getDataDebitDetail(agreementId: any, option: any, officeId: any, serviceCode: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-us/AccountReceivable/GetDebitDetail`, { argeementId: agreementId, option: option, officeId: officeId, serviceCode: serviceCode }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    getDataDebitDetailList(body: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-us/AccountReceivable/GetDebitDetail`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getListCombineBilling(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/Paging`, body, {
            pageNumber: '' + page,
            pageSize: '' + size
        }, { "hideSpinner": "true" }).pipe(
            map((data: any) => data)
        );
    }

    generateCombineBillingNo() {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/GenerateCombineBillingNo`).pipe(
            catchError((error) => throwError(error)),
            map((data: { billingNo: string }) => data.billingNo)
        );
    }

    checkDocumentNoExisted(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/CheckDocumentNoExisted`, body).pipe(
            map((data: any) => data)
        );
    }

    getListShipmentInfo(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/GetListShipmentInfo`, body).pipe(
            map((data: any) => data)
        );
    }

    saveCombineBilling(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    updateCombineBilling(body: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/Update`, body).pipe(
            map((data: any) => data)
        );
    }

    getDetailByCombineId(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/GetDetailByCombineId/${id}`)
            .pipe(
                map((data: any) => data)
            );
    }

    checkExistingCombine(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/CheckExisting/${id}`).pipe(
            map((data: any) => data)
        );
    }

    deleteCombineBilling(id: string) {
        return this._api.delete(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/Delete`, { id: id })
            .pipe(
                map((data: any) => data)
            );
    }

    previewCombineDebitTemplate(data: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/PreviewCombineDebitTemplate`, data).pipe(
            catchError((error) => throwError(error)),
            map((res: any) => {
                return res;
            })
        );
    }

    quickUpdateReceipt(receiptId: string, body: any) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctReceipt/${receiptId}/QuickUpdate`, body);
    }

    checkAllowViewDetailCombine(id: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctCombineBilling/CheckAllowViewDetailCombine/${id}`).pipe(
            map((data: any) => data)
        );
    }

    payablePaging(page: number, size: number, body: any) {
        console.log('payablePaging', body)
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctPayable/Paging`, body, {
            pageNumber: '' + page,
            pageSize: '' + size
        }, { "hideSpinner": "true" }).pipe(
            map((data: any) => data)
        );
    }

    getPayablePaymentByRefNo(data: any = {}) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctPayable/GetBy`, data).pipe(
            map((data: any) => data)
        );
    }

    getListSurchargeDetailSettlement(settleNo: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/getListSurchargeDetailSettlement`, { settlementNo: settleNo });
    }

    getListJobGroupSurchargeDetailSettlement(settleNo: string) {
        return this._api.get(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSettlementPayment/GetListJobGroupSurchargeDetailSettlement`, { settlementNo: settleNo }, { "hideSpinner": "true" });
    }

    getAdjustDebitValue(model: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/GetAdjustDebitValue`, model).pipe(
            map((data: any) => data)
        );
    }

    updateAdjustDebitValue(data: any) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AcctSOA/UpdateAdjustDebitValue`, data).pipe(
            map((data: any) => data)
        );
    }

    getDataDebitDetailListPartnerId(partnerId: any, option: any, officeId: string, serviceCode: string, overDueDay: number, arSalesManId: string) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-us/AccountReceivable/GetDebitDetailByPartnerId`, { partnerId: partnerId, option: option, officeId: officeId, serviceCode: serviceCode, overDueDay: overDueDay, arSalesManId: arSalesManId }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getDataDebitDetailByPartnerId(partnerId: string, option: any, officeId: any, serviceCode: any, arSalesManId: string) {
        return this._api.post(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-us/AccountReceivable/GetDebitDetailByPartnerId`, { partnerId: partnerId, option: option, officeId: officeId, serviceCode: serviceCode, arSalesManId: arSalesManId }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    calculateOverDue1To15(partnerIds: string[]) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountReceivable/CalculateOverDue1To15`, partnerIds);
    }

    calculateOverDue15To30(partnerIds: string[]) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountReceivable/CalculateOverDue15To30`, partnerIds);
    }

    calculateOverDue30(partnerIds: string[]) {
        return this._api.put(`${environment.HOST.ACCOUNTING}/api/${this.VERSION}/en-US/AccountReceivable/CalculateOverDue30`, partnerIds);
    }
}
