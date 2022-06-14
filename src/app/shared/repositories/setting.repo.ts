import { Injectable } from '@angular/core';
import { ApiService } from '../services';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingRepo {
    private VERSION: string = 'v1';
    constructor(private _api: ApiService) {
    }

    getTariff(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/paging`, body, {
            page: '' + page,
            size: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    deleteTariff(tariffId: string) {
        return this._api.delete(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/Delete`, { id: tariffId }).pipe(
            map((data: any) => data)
        );
    }

    addTariff(body: any) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    getDetailTariff(id: string) {
        return this._api.get(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/GetTariff`, { tariffId: id }).pipe(
            map((data: any) => data)
        );
    }

    updateTariff(body: any) {
        return this._api.put(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/Update`, body).pipe(
            map((data: any) => data)
        );
    }

    checkPermissionAllowDetail(id: string) {
        return this._api.get(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/CheckAllowDetail/${id}`).pipe(
            map((data: any) => data)
        );
    }

    checkPermissionAllowDelete(id: string) {
        return this._api.get(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/Tariff/CheckAllowDelete/${id}`).pipe(
            map((data: any) => data)
        );
    }

    getJobToUnlockRequest(criteria: any) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequest/GetJobToUnlockRequest`, criteria)
            .pipe(
                map((data: any) => data)
            );
    }

    addNewUnlockRequest(body: any = {}) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequest/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    updateUnlockRequest(body: any = {}) {
        return this._api.put(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequest/Update`, body)
            .pipe(
                map((data: any) => data)
            );
    }

    getListUnlockRequest(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequest/Paging`, body, {
            pageNumber: '' + page,
            pageSize: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    deleteUnlockRequest(id: string) {
        return this._api.delete(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequest/Delete`, { id: id }).pipe(
            map((data: any) => data)
        );
    }

    getDetailUnlockRequest(id: string) {
        return this._api.get(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequest/GetById`, { id: id }).pipe(
            map((data: any) => data)
        );
    }

    checkExistVoucherInvoiceOfSettlementAdvance(criteria: any) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequest/CheckExistVoucherInvoiceOfSettlementAdvance`, criteria)
            .pipe(
                map((data: any) => data)
            );
    }

    getInfoApproveUnlockRequest(id: string) {
        return this._api.get(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequestApprove/GetInfoApproveUnlockRequest`, { id: id }).pipe(
            map((data: any) => data)
        );
    }

    getHistoryDenied(id: string) {
        return this._api.get(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequestApprove/GetHistoryDenied`, { id: id }).pipe(
            map((data: any) => data)
        );
    }

    sendRequestUnlock(body: any = {}) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequest/SaveAndSendRequest`, body).pipe(
            map((data: any) => data)
        );
    }

    approveUnlockRequest(id: string) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequestApprove/UpdateApprove`, {}, { id: id })
            .pipe(
                map((data: any) => data)
            );
    }

    deniedApproveUnlockRequest(id: string, comment: string) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequestApprove/DeniedApprove`, {}, { id: id, comment: comment })
            .pipe(
                map((data: any) => data)
            );
    }

    cancelRequestUnlockRequest(id: string) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequestApprove/CancelRequest`, {}, { id: id })
            .pipe(
                map((data: any) => data)
            );
    }

    generatePaymentId(paymentNo: string, type: number){
        return this._api.put(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/UnlockRequest/GeneratePaymentId/`,{paymentNo:paymentNo,type:type})
        .pipe(
            map((data: any) => data)
        );
    }

    getRule(page?: number, size?: number, body: any = {}) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/RuleLinkFee/Paging`, body, {
            pageNumber: '' + page,
            pageSize: '' + size
        }).pipe(
            map((data: any) => data)
        );
    }

    deleteRule(ruleId: string) {
        return this._api.delete(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/RuleLinkFee/Delete`, { id: ruleId }).pipe(
            map((data: any) => data)
        );
    }

    addRule(body: any) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/RuleLinkFee/Add`, body).pipe(
            map((data: any) => data)
        );
    }

    getDetailRule(ruleId: string) {
        return this._api.get(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/RuleLinkFee/getRuleByID`, { id: ruleId }).pipe(
            map((data: any) => data)
        );
    }

    updateRule(body: any) {
        return this._api.put(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/RuleLinkFee/Update`, body).pipe(
            map((data: any) => data)
        );
    }

    upLoadRuleLinkFeeFile(files: any) {
        return this._api.postFile(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/RuleLinkFee/UploadFile`, files, "uploadedFile");
    }

    importRuleLinkFee(body: any) {
        return this._api.post(`${environment.HOST.SETTING}/api/${this.VERSION}/en-US/RuleLinkFee/Import`, body).pipe(
            map((data: any) => data)
        );
    }

    downloadRuleLinkFeeExcel() {
        return this._api.downloadfile(`${environment.HOST.SETTING}/api/${this.VERSION}/vi/RuleLinkFee/DownloadExcel`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
}



