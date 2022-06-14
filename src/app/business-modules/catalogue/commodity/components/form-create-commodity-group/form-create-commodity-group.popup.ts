import { PopupBase } from "src/app/popup.base";
import { Component, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { CatalogueRepo } from "src/app/shared/repositories";
import { catchError } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";
import { CommodityGroup } from "src/app/shared/models/catalogue/commonity-group.model";

@Component({
    selector: 'form-create-commodity-group-popup',
    templateUrl: './form-create-commodity-group.popup.html'
})

export class CommodityGroupAddPopupComponent extends PopupBase {
    @Output() onRequestCommodity: EventEmitter<any> = new EventEmitter<any>();

    formGroupCommodity: FormGroup;
    commodityGroup: CommodityGroup = new CommodityGroup();
    groupNameEN: AbstractControl;
    groupNameVN: AbstractControl;
    commodityGroupActive: AbstractControl;

    isSubmited: boolean = false;
    action: string = 'create';

    constructor(
        private _fb: FormBuilder,
        private _catalogueRepo: CatalogueRepo,
        private _toastService: ToastrService, ) {
        super();
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.formGroupCommodity = this._fb.group({
            groupNameEN: ['',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(3)
                ])
            ],
            groupNameVN: ['',
                Validators.compose([
                    Validators.required,
                    Validators.minLength(3)
                ])
            ],
            commodityGroupActive: ['']
        });

        this.groupNameEN = this.formGroupCommodity.controls['groupNameEN'];
        this.groupNameVN = this.formGroupCommodity.controls['groupNameVN'];
        this.commodityGroupActive = this.formGroupCommodity.controls['commodityGroupActive'];
    }

    saveCommodityGroup(){
        this.isSubmited = true;
        if (this.formGroupCommodity.valid) {
            const _commodityGroup: CommodityGroup = {
                id: this.commodityGroup.id,
                groupNameVn: this.groupNameVN.value,
                groupNameEn: this.groupNameEN.value,
                note: this.commodityGroup.note,
                userCreated: this.commodityGroup.userCreated,
                datetimeCreated: this.commodityGroup.datetimeCreated,
                userModified: this.commodityGroup.userCreated,
                datetimeModified: this.commodityGroup.datetimeModified,
                active: this.commodityGroupActive.value,
                inactiveOn: this.commodityGroup.inactiveOn
            };
            console.log(_commodityGroup);
            if (this.action == "create") {
                this._catalogueRepo.addNewCommodityGroup(_commodityGroup)
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
                this._catalogueRepo.updateCommodityGroup(this.commodityGroup.id, _commodityGroup)
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
        console.log(this.commodityGroup)        
        this.formGroupCommodity.setValue({
            groupNameVN: this.commodityGroup.groupNameVn,
            groupNameEN: this.commodityGroup.groupNameEn,
            commodityGroupActive: this.commodityGroup.active,
        });
    }

    closePopup() {
        this.hide();
        this.commodityGroup = new CommodityGroup();
        this.isSubmited = false;
        this.formGroupCommodity.reset();
    }
}