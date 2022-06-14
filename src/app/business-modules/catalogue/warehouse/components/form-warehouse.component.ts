import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Warehouse } from 'src/app/shared/models/catalogue/ware-house.model';
import { PopupBase } from 'src/app/popup.base';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { catchError, finalize } from 'rxjs/operators';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { FormValidators } from 'src/app/shared/validators/form.validator';
import { CommonEnum } from '@enums';

@Component({
    selector: 'form-warehouse',
    templateUrl: './form-warehouse.component.html'
})
export class FormWarehouseComponent extends PopupBase implements OnInit {
    @Output() saveSuccess: EventEmitter<boolean> = new EventEmitter<boolean>();
    warehouse: Warehouse = new Warehouse();
    warehouseForm: FormGroup;
    title: string;
    countries: any[] = [];
    provinces: any[] = [];
    districts: any[] = [];

    code: AbstractControl;
    warehouseNameEN: AbstractControl;
    warehouseNameVN: AbstractControl;
    country: AbstractControl;
    province: AbstractControl;
    district: AbstractControl;
    address: AbstractControl;
    active: AbstractControl;
    flightVesselNo: AbstractControl;

    isSubmitted: boolean = false;
    isUpdate: boolean = false;
    isShowUpdate: boolean = true;

    constructor(private _fb: FormBuilder,
        private _toastService: ToastrService,
        private _catalogueRepo: CatalogueRepo,
        private _progressService: NgProgress) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.warehouseForm = this._fb.group({
            code: [{ value: null, disabled: true }, FormValidators.required],
            warehouseNameEN: [null, FormValidators.required],
            warehouseNameVN: [null, FormValidators.required],
            displayName: [],
            country: [null, Validators.required],
            province: [null, Validators.required],
            district: [],
            address: [null, FormValidators.required],
            flightVesselNo: [],
            active: [true]
        });
        this.code = this.warehouseForm.controls['code'];
        this.warehouseNameEN = this.warehouseForm.controls['warehouseNameEN'];
        this.warehouseNameVN = this.warehouseForm.controls['warehouseNameVN'];
        this.country = this.warehouseForm.controls['country'];
        this.province = this.warehouseForm.controls['province'];
        this.district = this.warehouseForm.controls['district'];
        this.address = this.warehouseForm.controls['address'];
        this.flightVesselNo = this.warehouseForm.controls['flightVesselNo'];
        this.active = this.warehouseForm.controls['active'];
    }

    setFormValue(res: Warehouse) {
        this.warehouseForm.setValue({
            code: res.code,
            warehouseNameEN: res.nameEn,
            warehouseNameVN: res.nameVn,
            country: { id: res.countryId, text: !!this.countries.find(x => x.id === res.countryId) ? this.countries.find(x => x.id === res.countryId).text : null },
            province: { id: res.provinceId, text: !!this.provinces.find(x => x.id === res.provinceId) ? this.provinces.find(x => x.id === res.provinceId).text : null },
            district: res.districtId,
            address: res.address,
            active: res.active,
            flightVesselNo: res.flightVesselNo,
            displayName: res.displayName
        });
    }

    onSubmit() {
        this.isSubmitted = true;
        const formData = this.warehouseForm.getRawValue();
        this.district.setErrors(null);
        this.trimInputForm(formData);
        if (this.warehouseForm.valid) {
            this.setWarehouseModel();
            if (this.isUpdate) {
                this._catalogueRepo.updatePlace(this.warehouse.id, this.warehouse)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            } else {
                this._catalogueRepo.addPlace(this.warehouse)
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            }
        } else {
            console.log("invalid: ", this.warehouseForm);
        }
    }
    setWarehouseModel() {
        this.warehouse.placeType = CommonEnum.PlaceTypeEnum.Warehouse;
        this.warehouse.code = this.code.value;
        this.warehouse.nameEn = this.warehouseNameEN.value;
        this.warehouse.nameVn = this.warehouseNameVN.value;
        this.warehouse.countryId = this.country.value.id;
        this.warehouse.provinceId = this.province.value.id;
        this.warehouse.districtId = this.district.value;
        this.warehouse.address = this.address.value;
        this.warehouse.flightVesselNo = this.flightVesselNo.value;
        this.warehouse.active = !!this.isUpdate ? this.active.value : true;
        this.warehouse.displayName = this.warehouseForm.controls["displayName"].value;
    }
    trimInputForm(formData: any) {
        this.trimInputValue(this.code, formData.code);
        this.trimInputValue(this.warehouseNameEN, formData.warehouseNameEN);
        this.trimInputValue(this.warehouseNameVN, formData.warehouseNameVN);
        this.trimInputValue(this.address, formData.address);
    }
    onHandleResult(res: CommonInterface.IResult) {
        if (res.status) {
            this._toastService.success(res.message);
            this.hide();
            this.saveSuccess.emit(true);
        } else {
            this._toastService.error(res.message);
        }
    }
    onCancel() {
        this.hide();
    }

    onChange(event: any, type: string) {
        switch (type) {
            case 'country':
                this.province.setValue(null);
                this.district.setValue(null);
                this.districts = [];
                if (!!event) {
                    this.getProvinces(event.id);
                } else {
                    this.warehouseForm.controls['province'].setValue(null);
                }
                break;
            case 'province':
                this.district.setValue(null);
                if (!!event) {
                    this.getDistricts(event.id);
                } else {
                    this.warehouseForm.controls['district'].setValue(null);
                }
                break;
        }
    }

    getProvinces(countryId?: number) {
        if (countryId) {
            this._catalogueRepo.getProvincesBycountry(countryId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.provinces = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        } else {
            this._catalogueRepo.getProvinces()
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.provinces = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        }
    }
    getDistricts(provinceId?: any) {
        if (provinceId) {
            this._catalogueRepo.getDistrictsByProvince(provinceId)
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.districts = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        } else {
            this._catalogueRepo.getDistricts()
                .pipe(catchError(this.catchError), finalize(() => { }))
                .subscribe(
                    (res) => {
                        this.districts = this.utility.prepareNg2SelectData(res || [], 'id', 'name_VN');
                    }
                );
        }
    }
}
