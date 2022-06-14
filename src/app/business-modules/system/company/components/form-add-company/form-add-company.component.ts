import { Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

declare var $: any;
@Component({
    selector: 'form-add-company',
    templateUrl: './form-add-company.component.html',
    styleUrls: ['./../../company-information.component.scss']
})
export class CompanyInformationFormAddComponent extends AppForm {

    @ViewChild('image') el: ElementRef;
    @Input() companyId='';

    formGroup: FormGroup;
    code: AbstractControl;
    bunameVn: AbstractControl;
    bunameEn: AbstractControl;
    bunameAbbr: AbstractControl;
    website: AbstractControl;
    active: AbstractControl;
    kbExchangeRate: AbstractControl;

    types: CommonInterface.ICommonTitleValue[] = [
        { title: 'Active', value: true },
        { title: 'Inactive', value: false },
    ];
    photoUrl: string = '';
    imgDefault: string = "assets/app/media/img/emptydata.png";

    constructor(
        private _fb: FormBuilder,
        private _toastService: ToastrService,
        private _zone: NgZone,
    ) {
        super();
    }

    ngOnInit(): void {
        this.initForm();
    }

    initForm() {
        this.formGroup = this._fb.group({
            code: ['', Validators.compose([
                Validators.required,
            ])],
            bunameVn: ['', Validators.compose([
                Validators.required,
            ])],
            bunameEn: ['', Validators.compose([
                Validators.required,
            ])],
            bunameAbbr: ['', Validators.compose([
                Validators.required,
            ])],
            website: [],
            active: [this.types[0]],
            kbExchangeRate: [],
        });

        this.code = this.formGroup.controls['code'];
        this.bunameVn = this.formGroup.controls['bunameVn'];
        this.bunameEn = this.formGroup.controls['bunameEn'];
        this.bunameAbbr = this.formGroup.controls['bunameAbbr'];
        this.website = this.formGroup.controls['website'];
        this.active = this.formGroup.controls['active'];
        this.kbExchangeRate = this.formGroup.controls['kbExchangeRate'];
    }

    ngAfterViewInit() {
        this.initImageLibary();
    }

    initImageLibary() {
        let selectImg = null;
        this._zone.run(() => {
            $(this.el.nativeElement).froalaEditor({
                requestWithCORS: true,
                language: 'vi',
                imageEditButtons: ['imageReplace'],
                imageMaxSize: 5 * 1024 * 1024,
                imageAllowedTypes: ['jpeg', 'jpg', 'png'],
                requestHeaders: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    Module: 'Company',
                    // Path: `dayladuongdanhinh`
                },
                //imageUploadURL: `//${environment.HOST.SYSTEM}/api/v1/1/SysImageUpload/image`,
                imageUploadURL: `//${environment.HOST.FILE_SYSTEM}/api/v1/en-US/AWSS3/UploadImages/System/Company/${this.companyId}`,
                imageUploadMethod: 'PUT',
                imageManagerLoadURL: `//${environment.HOST.SYSTEM}/api/v1/1/SysImageUpload/company`,
                imageManagerDeleteURL: `//${environment.HOST.SYSTEM}/api/v1/1/SysImageUpload/Delete`,
                imageManagerDeleteMethod: 'DELETE',
                imageManagerDeleteParams: { id: selectImg?.id }
            }).on('froalaEditor.contentChanged', (e: any) => {
                this.photoUrl = e.target.src;
            }).on('froalaEditor.imageManager.imageDeleted', (e, editor, data) => {
                if (e.error) {
                    this._toastService.error("Xóa thất bại");
                } else
                    this._toastService.success("Xóa thành công");

            }).on('froalaEditor.image.error', (e, editor, error, response) => {
                console.log(error);
                switch (error.code) {
                    case 5:
                        this._toastService.error("Size image invalid");
                        break;
                    case 6:
                        this._toastService.error("Image invalid");
                        break;
                    default:
                        this._toastService.error(error.message);
                        break;
                }
            });
        });
        console.log(this.code.value);
        
    }
}

export interface IFormAddCompany {
    code: string;
    bunameVn: string;
    bunameEn: string;
    bunameAbbr: string;
    website: string;
    active: boolean;
    kbExchangeRate: number;
}
