import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { catchError, finalize, skip, takeUntil } from 'rxjs/operators';
import { DocumentationRepo, SystemFileManageRepo } from '@repositories';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { IAppState } from '@store';
import { Params, ActivatedRoute } from '@angular/router';
import { ConfirmPopupComponent } from '@common';
import { getTransactionDetailCsTransactionState, getTransactionLocked, getTransactionPermission } from '../../store';
import { CsTransaction } from '@models';


@Component({
    selector: 'files-attach',
    templateUrl: './files-attach.component.html',
    styleUrls: ['./files-attach.component.scss']
})
export class ShareBussinessFilesAttachComponent extends AppForm implements OnInit {

    @ViewChild('confirmDelete') confirmDeletePopup: ConfirmPopupComponent;

    jobId: string;

    files: IShipmentAttachFile[] = [];
    selectedFile: IShipmentAttachFile;

    fileNo: string;

    constructor(
        private _documentRepo: DocumentationRepo,
        private _toastService: ToastrService,
        private _store: Store<IAppState>,
        private _activedRoute: ActivatedRoute,
        private _systemFileManagerRepo: SystemFileManageRepo,
    ) {
        super();

        this.isLocked = this._store.select(getTransactionLocked);

        this.permissionShipments = this._store.select(getTransactionPermission);

    }

    ngOnInit(): void {
        this._activedRoute.params
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((params: Params) => {
                if (params.jobId) {
                    this.jobId = params.jobId;
                    this.getFileShipment(this.jobId);
                }
            });

        this._store.select(getTransactionDetailCsTransactionState)
            .pipe(skip(1), takeUntil(this.ngUnsubscribe))
            .subscribe(
                (res: CsTransaction) => {
                   this.fileNo = res.jobNo;
                }
            );
    }

    chooseFile(event: any) {
        const fileList = event.target['files'];
        if (fileList.length > 0) {
            let validSize: boolean = true;
            for (let i = 0; i <= fileList.length - 1; i++) {
                const fileSize: number = fileList[i].size / Math.pow(1024, 2); //TODO Verify BE
                if (fileSize >= 100) {
                    validSize = false;
                    break;
                }
            }
            if (!validSize) {
                this._toastService.warning("maximum file size < 100Mb");
                return;
            }
            // this._documentRepo.uploadFileShipment(this.jobId, false, fileList)
            //     .pipe(catchError(this.catchError))
            //     .subscribe(
            //         (res: CommonInterface.IResult) => {
            //             if (res.status) {
            //                 this._toastService.success("Upload file successfully!");
            //                 if (!!this.jobId) {
            //                     this.getFileShipment(this.jobId);
            //                 }
            //             }
            //         }
            //     );
            this._systemFileManagerRepo.uploadFileShipment(this.jobId, fileList)
                .pipe(catchError(this.catchError))
                .subscribe(
                    (res: CommonInterface.IResult) => {
                        if (res.status) {
                            this._toastService.success("Upload file successfully!");
                            if (!!this.jobId) {
                                this.getFileShipment(this.jobId);
                            }
                        }
                    }
                );
        }
    }

    getFileShipment(jobId: string) {
        this.isLoading = true;
        this._systemFileManagerRepo.getShipmentFilesAttach(jobId).
            pipe(catchError(this.catchError), finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(
                (res: IShipmentAttachFile[] = []) => {
                    this.files = res;
                    this.filterViewFile();
                    this.files.forEach(f => f.extension = f.name.split("/").pop().split('.').pop());
                }
            );
    }

    deleteFile(file: IShipmentAttachFile) {
        if (!!file) {
            this.selectedFile = file;
            console.log(this.selectedFile);
            this.confirmDeletePopup.show();
        }
    }

    onDeleteFile() {
        this.confirmDeletePopup.hide();
        this._systemFileManagerRepo.deleteShipmentFilesAttach(this.jobId,this.selectedFile.name)
            .pipe(catchError(this.catchError), finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(
                (res: any) => {
                    if (res.status) {
                        this._toastService.success("File deleted successfully!");
                        this.getFileShipment(this.jobId);
                    } else {
                        this._toastService.error("some thing wrong");
                    }
                }
            );
    }
    dowloadAllAttach() {
        if (this.fileNo) {
            let arr = this.fileNo.split("/");
            let model = {
                folderName: "Shipment",
                objectId: this.jobId,
                fileName: arr[0] + "_" + arr[1] + ".zip"
            }
            this._systemFileManagerRepo.dowloadallAttach(model)
                .subscribe(
                    (res: any) => {
                        this.downLoadFile(res, "application/zip", model.fileName);
                    }
                )
        }
    }
    filterViewFile() {
        if (this.files) {
            let type = ["xlsx", "xls", "doc", "docx"];
            for (let i = 0; i < this.files.length; i++) {
                let f = this.files[i];
                if (type.includes(f.name.split('.').pop())) {
                    f.dowFile = true
                    f.viewFileUrl = `https://gbc-excel.officeapps.live.com/op/view.aspx?src=${f.url}`;
                }
                else {
                    f.dowFile = false;
                    f.viewFileUrl = f.url;
                }
            }
        }
    }
}


interface IShipmentAttachFile {
    id: string;
    name: string;
    thumb: string;
    url: string;
    folder: string;
    objectId: string;
    extension: string;
    userCreated: string;
    dateTimeCreated: string;
    fileName: string;
    dowFile :boolean;
    viewFileUrl:string;
}
