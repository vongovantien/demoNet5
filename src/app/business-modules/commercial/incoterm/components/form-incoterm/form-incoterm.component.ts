import { Component, OnInit } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormGroup, FormControl, FormBuilder, AbstractControl, Validators } from '@angular/forms';
import { ChargeConstants } from '@constants';
import { DataService } from '@services';

@Component({
    selector: 'form-incoterm',
    templateUrl: './form-incoterm.component.html',
})
export class CommercialFormIncotermComponent extends AppForm implements OnInit {

    formGroup: FormGroup;
    code: AbstractControl;
    service: AbstractControl;
    nameEn: AbstractControl;
    active: AbstractControl;

    services: CommonInterface.INg2Select[] = [
        { text: ChargeConstants.IT_DES, id: ChargeConstants.IT_CODE },
        { text: ChargeConstants.AI_DES, id: ChargeConstants.AI_CODE },
        { text: ChargeConstants.AE_DES, id: ChargeConstants.AE_CODE },
        { text: ChargeConstants.SFE_DES, id: ChargeConstants.SFE_CODE },
        { text: ChargeConstants.SFI_DES, id: ChargeConstants.SFI_CODE },
        { text: ChargeConstants.SLE_DES, id: ChargeConstants.SLE_CODE },
        { text: ChargeConstants.SLI_DES, id: ChargeConstants.SLI_CODE },
        { text: ChargeConstants.SCE_DES, id: ChargeConstants.SCE_CODE },
        { text: ChargeConstants.SCI_DES, id: ChargeConstants.SCI_CODE },
        { text: ChargeConstants.CL_DES, id: ChargeConstants.CL_CODE }
    ];

    constructor(
        private _fb: FormBuilder,
        private _dataService: DataService
    ) {
        super();
    }

    ngOnInit(): void {
        this.initForm();
    }

    initForm() {
        this.formGroup = this._fb.group({
            code: [null, Validators.required],
            service: [null, Validators.required],
            nameEn: [null, Validators.required],
            nameLocal: [],
            active: [true],
            descriptionEn: [],
            descriptionLocal: [],
        });

        this.active = this.formGroup.controls['active'];
        this.nameEn = this.formGroup.controls['nameEn'];
        this.service = this.formGroup.controls['service'];
        this.code = this.formGroup.controls['code'];
    }

    onSelectService(service: any) {
        console.log(service);
        if (!!service) {
            this._dataService.setData('incotermService', service.id);
        }
    }

}
