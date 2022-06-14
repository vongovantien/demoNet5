import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AppPage } from 'src/app/app.base';

import { DocumentationRepo, OperationRepo } from '@repositories';

import { CustomClearanceFormDetailComponent } from '../components/form-detail-clearance/form-detail-clearance.component';
import { CustomClearance } from 'src/app/shared/models/tool-setting/custom-clearance.model';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-custom-clearance-addnew',
    templateUrl: './custom-clearance-addnew.component.html',
})
export class CustomClearanceAddnewComponent extends AppPage implements OnInit {

    @ViewChild(CustomClearanceFormDetailComponent) detailComponent: CustomClearanceFormDetailComponent;
    customDeclaration: CustomClearance = new CustomClearance();

    constructor(private _location: Location,
        private _operationRepo: OperationRepo,
        private _documentation: DocumentationRepo,
        private _toastr: ToastrService) {
        super();
    }

    ngOnInit() {
    }

    addClearance() {
        this.detailComponent.isSubmitted = true;
        this.detailComponent.isConvertJob = false;

        if (!this.detailComponent.isDisableCargo && !this.detailComponent.cargoType.value) {
            return;
        }
        if (this.detailComponent.formGroup.invalid || (!!this.detailComponent.clearanceDate.value && !this.detailComponent.clearanceDate.value.startDate)) {
            return;
        }
        this.detailComponent.getClearance();
        this.addCustomClearance();
    }

    addCustomClearance() {
        this._operationRepo.addCustomDeclaration(this.detailComponent.customDeclaration)
            .subscribe(respone => {
                if (respone['status'] === true) {
                    this._toastr.success(respone['message']);
                    this._location.back();
                }
            });

    }

    convertClearance(isReplicate: boolean) {
        this.detailComponent.isSubmitted = true;
        this.detailComponent.isConvertJob = true;

        if (!this.detailComponent.isDisableCargo && !this.detailComponent.cargoType.value) {
            return;
        }
        if (this.detailComponent.formGroup.invalid || (!!this.detailComponent.clearanceDate.value && !this.detailComponent.clearanceDate.value.startDate)) {
            return;
        } else {
            if (!this.detailComponent.mblid.value || !this.detailComponent.hblid.value) {
                return;
            }
        }
        this.detailComponent.getClearance();
        this.detailComponent.customDeclaration.isReplicate = isReplicate;
        this.saveAndConvertClearance(this.detailComponent.customDeclaration);
    }

    saveAndConvertClearance(body: CustomClearance) {
        this._documentation.validateCheckPointContractPartner(body.customerId, '', 'CL', null, 1)
            .pipe(
                switchMap((res: CommonInterface.IResult) => {
                    if (!res.status) {
                        this._toastr.warning(res.message);
                        return of(false);
                    }
                    return this._documentation.convertClearanceToJob(body);
                })
            )
            .subscribe(
                (response: any) => {
                    if (!!response && response.status) {
                        this._toastr.success(`Convert ${body.clearanceNo} Successfull`);
                        this._location.back();
                    }
                });
    }
}
