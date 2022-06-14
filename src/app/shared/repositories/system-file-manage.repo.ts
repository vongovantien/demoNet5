import { Injectable } from "@angular/core";
import { ApiService } from "../services";
import { environment } from "src/environments/environment";
import { catchError, map } from "rxjs/operators";
import { throwError, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class SystemFileManageRepo {
    private VERSION: string = 'v1';
    constructor(protected _api: ApiService) {
    }

    uploadFileContract(id: string, files: any) {
        return this._api.putFile(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-US/AWSS3/UploadAttachedFiles/Catalogue/CatContract/${id}`, files, 'files').pipe(
            map((data: any) => data)
        );
    }

    uploadFileShipment(jobId: string, body: any) {
        return this._api.putFile(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-US/AWSS3/UploadAttachedFiles/Document/Shipment/${jobId}`, body, 'files').pipe(
            map((data: any) => data)
        );
    }

    deleteShipmentFilesAttach(jobId: string, fileName: string) {
        return this._api.delete(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-US/AWSS3/DeleteSpecificFile/Document/Shipment/${jobId}/${fileName}`).pipe(
            map((data: any) => data)
        );
    }

    getShipmentFilesAttach(jobId: string) {
        return this._api.get(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-US/AWSS3/GetAttachedFiles/Document/Shipment/${jobId}`).pipe(
            map((data: any) => data)
        );
    }

    dowloadallAttach(body:any) {
        return this._api.downloadfile(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-US/AWSS3/DowloadAllFileAttached`,body).pipe(
            catchError((error) => throwError(error)),
            map((data: any) => data)
        );
    }

    getContractFilesAttach(contractId: string) {
        return this._api.get(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-US/AWSS3/GetAttachedFiles/Catalogue/CatContract/${contractId}`).pipe(
            map((data: any) => data)
        );
    }

    deleteContractFilesAttach(contractId: string, fileName: string) {
        return this._api.delete(`${environment.HOST.FILE_SYSTEM}/api/${this.VERSION}/en-US/AWSS3/DeleteSpecificFile/Catalogue/CatContract/${contractId}/${fileName}`).pipe(
            map((data: any) => data)
        );
    }

}