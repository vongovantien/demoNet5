import { Component } from '@angular/core';
import { AppForm } from '@app';
import { ProofOfDelivery } from 'src/app/shared/models/document/proof-of-delivery';
import { ActivatedRoute, Params } from '@angular/router';
import { takeUntil, map, switchMap, concatMap, catchError, finalize } from 'rxjs/operators';
import { SystemConstants } from '@constants';
import { of } from 'rxjs';
import { DocumentationRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { IAppState } from '@store';
import { formatDate } from '@angular/common';
import { NgProgress } from '@ngx-progressbar/core';
import { SystemFileManageRepo } from 'src/app/shared/repositories/system-file-manage.repo';
@Component({
    selector: 'hbl-proof-of-delivery',
    templateUrl: './proof-of-delivery.component.html'
})

export class ShareBusinessProofOfDelieveyComponent extends AppForm {
    constructor(
        protected _activedRoute: ActivatedRoute,
        private _documentRepo: DocumentationRepo,
        private _systemFileManageRepo: SystemFileManageRepo,
        private _toastService: ToastrService,
        private _store: Store<IAppState>,
        private _ngProgress: NgProgress,
    ) {
        super();
        this._progressRef = this._ngProgress.ref();
    }
    hblid: string = '';
    proofOfDelievey: ProofOfDelivery = new ProofOfDelivery();
    fileList: any = null;
    files: any = {};

    ngOnInit() {
        this._activedRoute.params
            .pipe(
                takeUntil(this.ngUnsubscribe),
                map((p: Params) => {
                    if (p.hblId) {
                        this.hblid = p.hblId;
                        this.getFilePOD();
                    } else {
                        this.hblid = SystemConstants.EMPTY_GUID;
                    }
                    return of(this.hblid);
                }),
                // * Get data delivery order
                switchMap((p) => {
                    return this._documentRepo.getProofOfDelivery(this.hblid);
                }),
                concatMap((data: ProofOfDelivery) => {
                    // * Update deliveryOrder model from dataDefault.
                    this.proofOfDelievey.deliveryDate = data.deliveryDate;
                    this.proofOfDelievey.referenceNo = data.referenceNo;
                    this.proofOfDelievey.deliveryPerson = data.deliveryPerson;
                    this.proofOfDelievey.note = data.note;
                    return of(this.proofOfDelievey);

                })
            )
            .subscribe((res) => { console.log("subscribe", res); });

    }

    saveProofOfDelivery() {
        this._progressRef.start();
        const deliveryDate = {
            deliveryDate: !!this.proofOfDelievey.deliveryDate && !!this.proofOfDelievey.deliveryDate.startDate ? formatDate(this.proofOfDelievey.deliveryDate.startDate, 'yyyy-MM-dd', 'en') : this.proofOfDelievey.deliveryDate.startDate == null ? null : this.proofOfDelievey.deliveryDate,
        };
        this.proofOfDelievey.hblid = this.hblid !== SystemConstants.EMPTY_GUID ? this.hblid : this.proofOfDelievey.hblid;
        this._documentRepo.updateProofOfDelivery(Object.assign({}, this.proofOfDelievey, deliveryDate))
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                        if (this.fileList !== null && this.fileList.length !== 0 && Object.keys(this.files).length === 0) {
                            this.uploadFilePOD();
                        }
                    } else {
                        this._toastService.error(res.message);
                    }
                }
            );
    }

    handleFileInput(event: any) {
        this.fileList = event.target['files'];
        // if (!!this.proofOfDelievey.hblid || this.hblid != SystemConstants.EMPTY_GUID) {
        //     if (!!this.files && !!this.files.id && this.fileList.length > 0) {
        //         this.deleteFilePOD();
        //     } else {
        //         this.uploadFilePOD();
        //     }
        // }
        this.uploadFilePOD();
    }

    uploadFilePOD() {
        const hblId = this.hblid !== SystemConstants.EMPTY_GUID ? this.hblid : this.proofOfDelievey.hblid;
        // this._documentRepo.uploadFileProofOfDelivery(hblId, this.fileList)
        //     .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
        //     .subscribe(
        //         (res: CommonInterface.IResult) => {
        //             if (res.status) {
        //                 this.fileList = null;
        //                 this._toastService.success("Upload file successfully!");
        //                 if (!!hblId) {
        //                     this.getFilePOD();
        //                 }
        //             }
        //         }
        //     );
        this._systemFileManageRepo.uploadFileShipment(hblId, this.fileList)
            .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this.fileList = null;
                        this._toastService.success("Upload file successfully!");
                        if (!!hblId) {
                            this.getFilePOD();
                        }
                    }
                }
            );
    }

    deleteFilePOD(fileName: string) {
        this._progressRef.start();
        const hblId = this.hblid !== SystemConstants.EMPTY_GUID ? this.hblid : this.proofOfDelievey.hblid;
        // this._documentRepo.deletePODFilesAttach(this.files.id)
        //     .pipe(catchError(this.catchError), finalize(() => {
        //         this._progressRef.complete();
        //         this.isLoading = false;
        //     }))
        //     .subscribe(
        //         (res: any) => {
        //             if (res.result.success) {
        //                 this.uploadFilePOD();
        //             } else {
        //                 this._toastService.error("some thing wrong");
        //             }
        //         }
        //     );
        this._systemFileManageRepo.deleteShipmentFilesAttach(hblId, fileName)
            .pipe(catchError(this.catchError), finalize(() => {
                this._progressRef.complete();
                this.isLoading = false;
            }))
            .subscribe(
                (res: any) => {
                    console.log(res);
                    
                    if (res.status===true) {
                        //this.uploadFilePOD();
                        this._toastService.success("Delete Success");
                        this.getFilePOD();
                    } else {
                        this._toastService.error("Some Thing Wrong");
                    }
                }
            );
    }

    getFilePOD() {
        this.isLoading = true;
        // this._documentRepo.getPODFilesAttach(this.hblid !== SystemConstants.EMPTY_GUID ? this.hblid : this.proofOfDelievey.hblid).
        //     pipe(catchError(this.catchError), finalize(() => {
        //         this._progressRef.complete();
        //         this.isLoading = false;
        //     }))
        //     .subscribe(
        //         (res: any = []) => {
        //             this.files = res;
        //         }
        //     );
        this._systemFileManageRepo.getShipmentFilesAttach(this.hblid !== SystemConstants.EMPTY_GUID ? this.hblid : this.proofOfDelievey.hblid).
            pipe(catchError(this.catchError), finalize(() => {
                this._progressRef.complete();
                this.isLoading = false;
            }))
            .subscribe(
                (res: any = []) => {
                    this.files = res;
                    console.log(this.files);
                }
            );
    }


}



