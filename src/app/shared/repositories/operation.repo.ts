import { Injectable } from "@angular/core";
import { ApiService } from "../services";
import { environment } from "src/environments/environment";
import { throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
export class OperationRepo {

    private VERSION: string = 'v1';
    constructor(protected _api: ApiService) {
    }


    getCustomDeclaration(jobNo: string) {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/GetBy`, { jobNo: jobNo }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getListCustomsDeclaration() {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/CustomsDeclaration`)
            .pipe(
                map((data: any) => data)
            );
    }

    getListCustomDeclaration(page: number, pageSize: number, body: any) {
        return this._api.post(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/CustomsDeclaration/Paging`, body, {
            pageNumber: '' + page,
            pageSize: '' + pageSize
        }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getListEcus(page: number, pageSize: number, body: any) {
        return this._api.post(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/EcusConnection/Paging`, body, {
            pageNumber: '' + page,
            pageSize: '' + pageSize
        }).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    checkDeletePermissionEcus(id: number) {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/EcusConnection/CheckAllowDelete/${id}`)
            .pipe(
                map((data: any) => data)
            );
    }

    checkDetailPermissionEcus(id: number) {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/EcusConnection/CheckAllowDetail/${id}`)
            .pipe(
                map((data: any) => data)
            );
    }

    addNewEcus(body: any) {
        return this._api.post(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/EcusConnection/Add`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    updateEcus(body: any) {
        return this._api.put(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/EcusConnection/Update`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    deleteEcus(id: number) {
        return this._api.delete(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/EcusConnection/Delete`, { id: id })
            .pipe(
                map((data: any) => data)
            );
    }

    getDetailEcus(id: number) {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/EcusConnection/GetDetails`, { id: id })
            .pipe(
                map((data: any) => data)
            );
    }

    importCustomClearanceFromEcus() {
        return this._api.post(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/CustomsDeclaration/ImportClearancesFromEcus`, {}).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    importCustomClearanceOlaFromEcus() {
        return this._api.post(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/CustomsDeclaration/ImportClearancesOlaFromEcus`, {}).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    deleteMultipleClearance(body: any[] = []) {
        return this._api.put(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/CustomsDeclaration/DeleteMultiple`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    checkDeletePermission(body) {
        return this._api.post(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/CustomsDeclaration/CheckDeletePermission`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    getClearanceType() {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/CustomsDeclaration/GetClearanceTypes`)
            .pipe(
                map((data: any) => data)
            );
    }

    getListImportedInJob(jobNo: string) {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/GetBy?jobNo=` + jobNo);
    }

    getListNotImportToJob(strKeySearch: string, customerNo: string, isImported: boolean, page: number, size: number) {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/CustomDeclaration`, { keySearch: strKeySearch, customerNo: customerNo, imporTed: isImported, page: page, size: size }).pipe(
            map((data: any) => data)
        );
    }

    getListStageOfJob(jobId: string) {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/OpsStageAssigned/GetBy`, { jobId: jobId });
    }

    getDetailStageOfJob(stageId: string) {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/OpsStageAssigned/${stageId}`);
    }

    getListStageNotAssigned(jobId: string) {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/OpsStageAssigned/GetNotAssigned`, { jobId: jobId });
    }

    addStageToJob(jobId: string, body: any = {}) {
        return this._api.put(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/OpsStageAssigned/AddMultipleStage`, body, { jobId: jobId });
    }

    updateStageToJob(body: any = {}) {
        return this._api.put(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/OpsStageAssigned/Update`, body);
    }

    assignStageOPS(body: any) {
        return this._api.post(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/OpsStageAssigned/Add`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    deleteStageAssigned(id: string) {
        return this._api.delete(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/OpsStageAssigned/Delete`, { id: id })
            .pipe(
                map((data: any) => data)
            );
    }

    getCustomsShipmentNotLocked(): any {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/GetCustomsShipmentNotLocked`);

    }

    getDetailCustomsDeclaration(id: number) {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/GetById/${id}`);
    }

    checkViewDetailPermission(id: number) {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/CheckPermission/${id}`);
    }

    addCustomDeclaration(body: any) {
        return this._api.post(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/Add`, body);
    }

    updateCustomDeclaration(body: any) {
        return this._api.put(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/Update`, body);
    }

    upLoadClearanceFile(files: any) {
        return this._api.postFile(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/CustomsDeclaration/uploadFile`, files, "uploadedFile");
    }

    downloadCustomClearanceExcel() {
        return this._api.downloadfile(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/DownloadExcel`).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }
    importCustomClearance(body: any) {
        return this._api.post(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/Import`, body).pipe(
            map((data: any) => data)
        );
    }
    getClearanceTypes() {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/GetClearanceTypes`);
    }

    updateJobToClearances(body: any) {
        return this._api.post(`${environment.HOST.OPERATION}/api/${this.VERSION}/en-US/CustomsDeclaration/UpdateJobToClearances`, body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getListCustomNoAsignPIC(): any {
        return this._api.get(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/GetListCustomNoAsignPIC`, null, { "hideSpinner": "true" });
    }

    replicateClearance(id: number) {
        return this._api.put(`${environment.HOST.OPERATION}/api/${this.VERSION}/vi/CustomsDeclaration/ReplicateClearance`, null, { id });

    }
}


