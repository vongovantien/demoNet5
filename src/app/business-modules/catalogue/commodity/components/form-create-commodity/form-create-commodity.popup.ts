import { PopupBase } from "src/app/popup.base";
import { Component, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { Commodity } from "src/app/shared/models/catalogue/commodity.model";
import { CatalogueRepo } from "src/app/shared/repositories";
import { catchError } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

@Component({
    selector: 'form-create-commodity-popup',
    templateUrl: './form-create-commodity.popup.html'
})

export class CommodityAddPopupComponent extends PopupBase {
    @Output() onRequestCommodity: EventEmitter<any> = new EventEmitter<any>();

    formCommodity: FormGroup;
    commodity: Commodity = new Commodity();
    commodityCode: AbstractControl;
    commodityNameEn: AbstractControl;
    commodityNameVn: AbstractControl;
    commodityGroup: AbstractControl;
    commodityActive: AbstractControl;

    isSubmited: boolean = false;
    action: string = 'create';

    groups: any[];
    groupActive: any[] = [];

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService,) {
        super();
    }

    ngOnInit() {
        this.initForm();
        this.getGroups();
    }

    initForm() {
        this.formCommodity = this._fb.group({
            commodityCode: ['',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(25),
                    Validators.minLength(2)
                ])
            ],
            commodityNameEn: ['',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(250),
                    Validators.minLength(2)
                ])
            ],
            commodityNameVn: ['',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(250),
                    Validators.minLength(2)
                ])
            ],
            commodityGroup: [null,
                Validators.compose([
                    Validators.required
                ])
            ],
            commodityActive: ['']
        });

        this.commodityCode = this.formCommodity.controls['commodityCode'];
        this.commodityNameEn = this.formCommodity.controls['commodityNameEn'];
        this.commodityNameVn = this.formCommodity.controls['commodityNameVn'];
        this.commodityGroup = this.formCommodity.controls['commodityGroup'];
        this.commodityActive = this.formCommodity.controls['commodityActive'];
    }

    getGroups() {
        this._catalogueRepo.getAllCommodityGroup()
            .pipe(catchError(this.catchError))
            .subscribe(
                (data: any) => {
                    this.groups = data.map(x => ({ "text": x.groupName, "id": x.id }));
                },
            );
    }

    saveCommodity() {
        this.isSubmited = true;
        if (this.formCommodity.valid) {
            const _commodity: Commodity = {
                id: this.commodity.id,
                commodityNameVn: this.commodityNameVn.value,
                commodityNameEn: this.commodityNameEn.value,
                commodityGroupId: this.commodityGroup.value.id,
                commodityGroupNameVn: this.commodity.commodityGroupNameVn,
                commodityGroupNameEn: this.commodity.commodityGroupNameEn,
                note: this.commodity.note,
                userCreated: this.commodity.userCreated,
                datetimeCreated: this.commodity.datetimeCreated,
                userModified: this.commodity.userCreated,
                datetimeModified: this.commodity.datetimeModified,
                active: this.commodityActive.value,
                inactiveOn: this.commodity.inactiveOn,
                code: this.commodityCode.value
            };
            console.log(_commodity);
            if (this.action == "create") {
                this._catalogueRepo.addNewCommodity(_commodity)
                    .pipe(catchError(this.catchError))
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                this._toastService.success(res.message);
                                this.onRequestCommodity.emit();
                                this.closePopup();
                            } else {
                                this._toastService.error(res.message);
                            }
                        }
                    );
            } else {
                this._catalogueRepo.updateCommodity(this.commodity.id, _commodity)
                    .pipe(catchError(this.catchError))
                    .subscribe(
                        (res: CommonInterface.IResult) => {
                            if (res.status) {
                                this._toastService.success(res.message);
                                this.onRequestCommodity.emit();
                                this.closePopup();
                            } else {
                                this._toastService.error(res.message);
                            }
                        }
                    );
            }
        }
    }

    getDetail() {
        this.formCommodity.setValue({
            commodityCode: this.commodity.code,
            commodityNameEn: this.commodity.commodityNameEn,
            commodityNameVn: this.commodity.commodityNameVn,
            commodityGroup: { id: this.commodity.commodityGroupId, text: this.groups.find(x => x.id === this.commodity.commodityGroupId).text },
            commodityActive: this.commodity.active
        });
    }

    closePopup() {
        this.hide();
        this.isSubmited = false;
        this.commodity = new Commodity();
        this.formCommodity.reset();
    }
}