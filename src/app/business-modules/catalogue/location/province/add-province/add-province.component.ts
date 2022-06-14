import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgProgress } from '@ngx-progressbar/core';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

import { PopupBase } from 'src/app/popup.base';
import { CatPlaceModel } from 'src/app/shared/models/catalogue/catPlace.model';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { CommonEnum } from 'src/app/shared/enums/common.enum';

import { catchError, finalize } from 'rxjs/operators';


@Component({
    selector: 'app-add-province',
    templateUrl: './add-province.component.html'
})
export class AddProvincePopupComponent extends PopupBase implements OnInit {

    @Output() onChange = new EventEmitter<boolean>();

    formProvince: FormGroup;
    code: AbstractControl;
    nameEn: AbstractControl;
    nameVn: AbstractControl;
    country: AbstractControl;
    id: AbstractControl;
    active: AbstractControl;

    countries: any = [];

    isSubmitted = false;
    isUpdate: boolean = false;

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
    }

    initForm() {
        this.formProvince = this._fb.group({
            code: ['', Validators.compose([
                Validators.required
            ])],
            nameEn: ['', Validators.compose([
                Validators.required
            ])],
            nameVn: ['', Validators.compose([
                Validators.required
            ])],
            country: ['', Validators.compose([
                Validators.required
            ])],
            active: [true],
            id: [],

        });

        this.code = this.formProvince.controls['code'];
        this.nameEn = this.formProvince.controls['nameEn'];
        this.nameVn = this.formProvince.controls['nameVn'];
        this.country = this.formProvince.controls['country'];
        this.active = this.formProvince.controls['active'];
        this.id = this.formProvince.controls['id'];
    }

    getCountry() {
        this._catalogueRepo.getListAllCountry()
            .subscribe(
                (res: any) => {
                    this.countries = res;
                    this.country.setValue(this.countries[0].id);
                }
            );
    }

    saveProvince() {
        this.isSubmitted = true;
        if (this.formProvince.valid) {
            this._progressRef.start();

            const formData = this.formProvince.getRawValue();

            const body = {
                id: formData.id,
                placeType: CommonEnum.PlaceTypeEnum.Province,
                code: formData.code,
                nameEn: formData.nameEn,
                nameVn: formData.nameVn,
                countryId: formData.country || 1, // * 1 = VN 
                active: !!this.isUpdate ? formData.active : true,
                placeTypeId: 'Province'
            };
            if (this.isUpdate) {
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
                body.id = '00000000-0000-0000-0000-000000000000';
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
        this.formProvince.reset();
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
