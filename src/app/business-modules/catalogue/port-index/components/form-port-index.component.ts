import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { CatalogueRepo } from 'src/app/shared/repositories';
import { ToastrService } from 'ngx-toastr';
import { PlaceTypeEnum } from 'src/app/shared/enums/placeType-enum';
import { FormValidators } from 'src/app/shared/validators/form.validator';
import { CommonEnum } from '@enums';
import { PortIndex } from '@models';
import { SystemConstants } from 'src/constants/system.const';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-form-port-index',
    templateUrl: './form-port-index.component.html'
})
export class FormPortIndexComponent extends PopupBase implements OnInit {
    @Output() onChange: EventEmitter<boolean> = new EventEmitter<boolean>();
    portindexForm: FormGroup;
    title: string = '';
    countries: any[] = [];
    areas: any[] = [];
    modes: any[] = [];

    portIndex: PortIndex = new PortIndex();
    warehouses: CommonInterface.INg2Select[] = [];

    code: AbstractControl;
    portIndexeNameEN: AbstractControl;
    portIndexeNameLocal: AbstractControl;
    country: AbstractControl;
    zone: AbstractControl;
    mode: AbstractControl;
    active: AbstractControl;
    warehouseId: AbstractControl;

    isSubmitted: boolean = false;
    isUpdate: boolean = false;
    isShowUpdate: boolean = true;
    codePattern = "[a-zA-Z0-9]*";
    constructor(private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService) {
        super();
    }

    ngOnInit() {
        this.getWarehouse();
        this.initForm();
    }

    initForm() {
        this.portindexForm = this._fb.group({
            code: [null, Validators.compose([Validators.required, Validators.pattern(this.codePattern), Validators.minLength(3), Validators.maxLength(10)])],
            portIndexeNameEN: [null, FormValidators.required],
            portIndexeNameLocal: [null, FormValidators.required],
            country: [null, Validators.required],
            zone: [null],
            mode: [null, Validators.required],
            warehouseId: [],
            active: [true]
        });

        this.code = this.portindexForm.controls['code'];
        this.portIndexeNameEN = this.portindexForm.controls['portIndexeNameEN'];
        this.portIndexeNameLocal = this.portindexForm.controls['portIndexeNameLocal'];
        this.country = this.portindexForm.controls['country'];
        this.zone = this.portindexForm.controls['zone'];
        this.mode = this.portindexForm.controls['mode'];
        this.warehouseId = this.portindexForm.controls['warehouseId'];
        this.active = this.portindexForm.controls['active'];
    }
    // get codepattern() {
    //     return this.portindexForm.get('code');
    // }

    onSubmit() {
        this.isSubmitted = true;
        this.setError(this.zone);
        this.setError(this.warehouseId);
        const formData = this.portindexForm.getRawValue();
        this.trimInputForm(formData);
        if (this.portindexForm.valid) {

            this.setPortIndexModel();
            if (this.isUpdate) {
                this._catalogueRepo.updatePlace(this.portIndex.id, this.portIndex)
                    .pipe(finalize(() => this.hide()))
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            } else {
                this.portIndex.id = SystemConstants.EMPTY_GUID;
                this._catalogueRepo.addPlace(this.portIndex)
                    .pipe(finalize(() => this.hide()))
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            this.onHandleResult(res);
                        }
                    );
            }
        } else {
            return;
        }
    }

    trimInputForm(formData: { code: string; portIndexeNameEN: string; portIndexeNameLocal: string; }) {
        this.trimInputValue(this.code, formData.code);
        this.trimInputValue(this.portIndexeNameEN, formData.portIndexeNameEN);
        this.trimInputValue(this.portIndexeNameLocal, formData.portIndexeNameLocal);
    }

    setPortIndexModel() {
        this.portIndex.placeType = PlaceTypeEnum.Port;
        this.portIndex.active = !!this.isUpdate ? this.active.value : true;
        this.portIndex.code = this.code.value;
        this.portIndex.nameEn = this.portIndexeNameEN.value;
        this.portIndex.nameVn = this.portIndexeNameLocal.value;
        this.portIndex.countryID = this.country.value.id;
        this.portIndex.modeOfTransport = this.mode.value.id;
        this.portIndex.areaID = !!this.zone.value ? this.zone.value.id : null;
        this.portIndex.warehouseId = !!this.warehouseId.value ? this.warehouseId.value.id : null;
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

    onCancel() {
        this.hide();
    }

    setFormValue(res: any) {
        const objCountry = this.countries.find(x => x.id === res.countryId);
        const objZone = this.areas.find(x => x.id === res.areaId);
        const objMode = this.modes.find(x => x.id === res.modeOfTransport);
        const objWarehouse = this.warehouses.find(x => x.id === res.warehouseId);

        this.portindexForm.setValue({
            code: res.code,
            portIndexeNameEN: res.nameEn,
            portIndexeNameLocal: res.nameVn,
            country: { id: res.countryId, text: !!objCountry ? objCountry.text : null },
            zone: { id: res.areaId, text: !!objZone ? objZone.text : null },
            mode: { id: res.modeOfTransport, text: !!objMode ? objMode.text : null },
            warehouseId: { id: res.warehouseId, text: !!objWarehouse ? objWarehouse.text : null },
            active: res.active
        });
    }

    getWarehouse() {
        this._catalogueRepo.getPlace({ active: true, placeType: CommonEnum.PlaceTypeEnum.Warehouse })
            .subscribe((res) => {
                this.warehouses = this.utility.prepareNg2SelectData(res, "id", "nameEn");
                console.log(this.warehouses);
            });
    }
}
