import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';

import { PopupBase } from 'src/app/popup.base';
import { CatalogueRepo } from 'src/app/shared/repositories';

@Component({
    selector: 'form-unit',
    templateUrl: './form-unit.popup.html'
})

export class FormCreateUnitPopupComponent extends PopupBase implements OnInit {

    @Output() onChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    form: FormGroup;
    code: AbstractControl;
    unitNameEn: AbstractControl;
    unitNameVn: AbstractControl;
    unitType: AbstractControl;
    descriptionEn: AbstractControl;
    descriptionVn: AbstractControl;
    active: AbstractControl;
    id: AbstractControl;

    unitTypes: any[] = [];

    isSubmitted: boolean = false;
    isUpdate: boolean = false;

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService
    ) {
        super();
    }

    ngOnInit() {
        this.form = this._fb.group({
            code: [null, Validators.required],
            unitNameEn: ['', Validators.required],
            unitNameVn: ['', Validators.required],
            unitType: [null, Validators.required],
            descriptionEn: [],
            descriptionVn: [],
            active: [],
            id: [123]
        });

        this.code = this.form.controls['code'];
        this.unitNameEn = this.form.controls['unitNameEn'];
        this.unitNameVn = this.form.controls['unitNameVn'];
        this.unitType = this.form.controls['unitType'];
        this.descriptionEn = this.form.controls['descriptionEn'];
        this.descriptionVn = this.form.controls['descriptionVn'];
        this.active = this.form.controls['active'];

        this.getUnitType();
    }

    getUnitType() {
        this._catalogueRepo.getUnitTypes()
            .subscribe(
                (res: CommonInterface.IValueDisplay[]) => {
                    this.unitTypes = res.map((x: CommonInterface.IValueDisplay) => ({ "text": x.displayName, "id": x.value }));
                }
            );
    }

    onSubmit() {
        this.isSubmitted = true;
        if (!this.form.valid) {
            return;
        }
        const formData = this.form.getRawValue();
        if (this.form.valid) {
            const body: IUnit = {
                id: formData.id,
                code: formData.code,
                unitNameEn: formData.unitNameEn,
                unitNameVn: formData.unitNameVn,
                descriptionEn: formData.descriptionEn,
                descriptionVn: formData.descriptionVn,
                active: !!this.isUpdate ? formData.active : true,
                unitType: formData.unitType.id,
            };
            if (!this.isUpdate) {
                this._catalogueRepo.addUnit(Object.assign({}, body, { id: 0 }))
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            } else {
                this._catalogueRepo.updateUnit(body)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            }
        }
    }

    onHandleResult(res: CommonInterface.IResult) {
        if (res.status) {
            this._toastService.success(res.message);

            this.hide();
            this.onChange.emit(true);
        } else {
            this._toastService.error(res.message);
        }
    }

    closePopup() {
        this.hide();
        this.isSubmitted = false;
        this.form.reset();
    }

}

export interface IUnit {
    id?: string;
    code: string;
    unitNameEn: string;
    unitNameVn: string;
    unitType: string;
    descriptionEn: string;
    descriptionVn: string;
    active: boolean;
}
