import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';

import { CatPlaceModel } from 'src/app/shared/models/catalogue/catPlace.model';
import { PopupBase } from 'src/app/popup.base';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { CommonEnum } from 'src/app/shared/enums/common.enum';

import { catchError, finalize } from 'rxjs/operators';


@Component({
    selector: 'app-add-ward',
    templateUrl: './add-ward.component.html'
})
export class AddWardPopupComponent extends PopupBase implements OnInit {

    @Output() onChange = new EventEmitter<boolean>();
    wardToAdd = new CatPlaceModel();

    formAddWard: FormGroup;
    code: AbstractControl;
    nameEn: AbstractControl;
    nameVn: AbstractControl;
    countryID: AbstractControl;
    id: AbstractControl;
    active: AbstractControl;
    provinceID: AbstractControl;
    districtID: AbstractControl;

    provinces: any[] = [];
    districts: any[] = [];
    countries: any[] = [];
    initProvince: any[] = [];
    initDistrict: any[] = [];

    isUpdate: boolean = false;
    isSubmitted = false;

    constructor(private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        protected _progressService: NgProgress,
        private _toastService: ToastrService) {
        super();
        this._progressRef = this._progressService.ref();
    }

    ngOnInit() {
        this.initForm();
        this.getCountry();
        this.getProvince();
        this.getDistrict();
    }

    initForm() {
        this.formAddWard = this._fb.group({
            code: ['', Validators.compose([
                Validators.required
            ])],
            nameEn: ['', Validators.compose([
                Validators.required
            ])],
            nameVn: ['', Validators.compose([
                Validators.required
            ])],
            countryID: ['', Validators.compose([
                Validators.required
            ])],
            provinceID: ['', Validators.compose([
                Validators.required
            ])],
            districtID: ['', Validators.compose([
                Validators.required
            ])],
            active: [true],
            id: [],
        });
        this.code = this.formAddWard.controls['code'];
        this.nameEn = this.formAddWard.controls['nameEn'];
        this.nameVn = this.formAddWard.controls['nameVn'];
        this.countryID = this.formAddWard.controls['countryID'];
        this.provinceID = this.formAddWard.controls['provinceID'];
        this.districtID = this.formAddWard.controls['districtID'];
        this.active = this.formAddWard.controls['active'];
        this.id = this.formAddWard.controls['id'];
    }

    getCountry() {
        this._catalogueRepo.getListAllCountry()
            .subscribe(
                (res: any) => {
                    this.countries = res;
                }
            );
    }

    getProvince() {
        this._catalogueRepo.getAllProvinces()
            .subscribe(
                (res: any) => {
                    this.provinces = this.initProvince = res;
                }
            );
    }

    getDistrict() {
        this._catalogueRepo.getPlace({ placeType: CommonEnum.PlaceTypeEnum.District })
            .subscribe(
                (res: any) => {
                    this.districts = this.initDistrict = res;
                }
            );
    }

    saveWard() {
        this.isSubmitted = true;
        if (this.formAddWard.valid) {

            const formData = this.formAddWard.getRawValue();
            const body = {
                placeType: CommonEnum.PlaceTypeEnum.Ward,
                code: formData.code,
                nameEn: formData.nameEn,
                nameVn: formData.nameVn,
                id: formData.id,
                active: !!this.isUpdate ? formData.active : true,
                countryID: formData.countryID,
                provinceID: formData.provinceID,
                districtID: formData.districtID,
                placeTypeId: 'Ward'
            };

            if (!!this.isUpdate) {
                this._catalogueRepo.updatePlace(formData.id, body)
                    .pipe(
                        catchError(this.catchError),
                        finalize(() => {
                            this._progressRef.complete();
                        })
                    )
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            } else {
                this._catalogueRepo.addPlace(body)
                    .pipe(
                        catchError(this.catchError),
                        finalize(() => {
                            this._progressRef.complete();
                        })
                    )
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            }
        }
    }

    cancelAdd() {
        this.hide();
        this.isSubmitted = false;
        this.formAddWard.reset();
    }

    onHandleResult(res: CommonInterface.IResult) {
        if (res.status) {
            this.hide();

            this._toastService.success(res.message);
            this.onChange.emit(true);
        } else {
            this._toastService.error(res.message);
        }
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'country':
                this.countryID.setValue(data.id);
                this.provinceID.setValue(null);
                this.districtID.setValue(null);

                this.provinces = this.getProvinceByCountryId(data.id, this.initProvince);
                break;
            case 'province':
                this.provinceID.setValue(data.id);
                this.districtID.setValue(null);

                this.districts = this.getDistricyByProvinceId(data.id, this.initDistrict);
                console.log(this.districts);
                break;
            case 'district':
                this.districtID.setValue(data.id);
                break;
            default:
                break;
        }
    }

    getProvinceByCountryId(id: string, sources: any[]) {
        return sources.filter(x => x.countryID === id);
    }

    getDistricyByProvinceId(id: string, sources: any[]) {
        return sources.filter(x => x.provinceID === id);
    }
}
