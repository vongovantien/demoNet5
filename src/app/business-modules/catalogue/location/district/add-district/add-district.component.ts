import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';

import { CatPlaceModel } from 'src/app/shared/models/catalogue/catPlace.model';
import { PopupBase } from 'src/app/popup.base';
import { CatalogueRepo } from 'src/app/shared/repositories';

import { catchError, finalize } from 'rxjs/operators';
import { CommonEnum } from 'src/app/shared/enums/common.enum';

@Component({
    selector: 'app-add-district',
    templateUrl: './add-district.component.html'
})
export class AddDistrictPopupComponent extends PopupBase implements OnInit {

    @Output() onChange = new EventEmitter<boolean>();

    districtToAdd = new CatPlaceModel();

    countries: any[] = [];
    provinces: any[] = [];
    initProvince: any[];

    formAddDistrict: FormGroup;
    code: AbstractControl;
    nameEn: AbstractControl;
    nameVn: AbstractControl;
    countryID: AbstractControl;
    active: AbstractControl;
    provinceID: AbstractControl;
    id: AbstractControl;

    isUpdate: boolean = false;
    isSubmitted: boolean = false;

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
    }

    initForm() {
        this.formAddDistrict = this._fb.group({
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
            active: [true],
            id: [],
        });
        this.code = this.formAddDistrict.controls['code'];
        this.nameEn = this.formAddDistrict.controls['nameEn'];
        this.nameVn = this.formAddDistrict.controls['nameVn'];
        this.countryID = this.formAddDistrict.controls['countryID'];
        this.id = this.formAddDistrict.controls['id'];
        this.active = this.formAddDistrict.controls['active'];
        this.provinceID = this.formAddDistrict.controls['provinceID'];
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

    saveDistrict() {
        this.isSubmitted = true;
        if (this.formAddDistrict.valid) {

            const formData = this.formAddDistrict.getRawValue();

            const body = {
                placeType: CommonEnum.PlaceTypeEnum.District,
                code: formData.code,
                nameEn: formData.nameEn,
                nameVn: formData.nameVn,
                countryId: formData.countryID,
                provinceId: formData.provinceID,
                active: !!this.isUpdate ? formData.active : true,
                placeTypeId: 'District'
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

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'country':
                this.countryID.setValue(data.id);
                this.provinceID.setValue(null);

                this.provinces = this.getProvinceByCountryId(data.id, this.initProvince);
                break;
            case 'province':
                this.provinceID.setValue(data.id);
                break;
            default:
                break;
        }
    }

    getProvinceByCountryId(id: string, sources: any[]) {
        return sources.filter(x => x.countryID === id);
    }

    cancelAdd() {
        this.hide();
        this.isSubmitted = false;
        this.formAddDistrict.reset();
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
}
