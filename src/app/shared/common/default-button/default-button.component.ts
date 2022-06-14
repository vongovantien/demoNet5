import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ButtonModalSetting, ButtonAttributeSetting } from '../../models/layout/button-modal-setting.model';
import { ButtonType } from '../../enums/type-button.enum';
import { AddDefaultButton, EditDefaultButton, DeleteDefaultButton, ImportDefaultButton, ExportDefaultButton, SaveDefaultButton, CancelDefaultButton, ResetDefaultButton, DetailDefaultButton, SearchDefaultButton, PreviewDefaultButton, LockDefaultButton } from '../../enums/default-button-enum';

@Component({
    selector: 'app-default-button',
    templateUrl: './default-button.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultButtonComponent implements OnInit {

    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();
    @Input() buttonSetting: ButtonModalSetting;
    @Input() dataTarget: string;
    @Input() disabled: boolean = false;

    isAdd: boolean = false;
    isEdit: boolean = false;
    isDelete: boolean = false;
    isImport: boolean = false;
    isExport: boolean = false;
    isSave: boolean = false;
    isCancel: boolean = false;
    isDetail: boolean = false;
    isSearch: boolean = false;
    isPreview: boolean = false;
    isLock: boolean = false;
    buttonAttribute: ButtonAttributeSetting;


    ngOnInit() {
        this.buttonAttribute = this.buttonSetting.buttonAttribute;
        this.setMode(this.buttonSetting.typeButton);
    }

    setMode(typeButton: ButtonType): any {
        if (typeButton === ButtonType.add) {
            this.isAdd = true;
            this.setSyleButton(AddDefaultButton);
        }
        if (typeButton === ButtonType.edit) {
            this.isEdit = true;
            this.setSyleButton(EditDefaultButton);
        }
        if (typeButton === ButtonType.delete) {
            this.isDelete = true;
            this.setSyleButton(DeleteDefaultButton);
        }
        if (typeButton === ButtonType.import) {
            this.isImport = true;
            this.setSyleButton(ImportDefaultButton);
        }
        if (typeButton === ButtonType.export) {
            this.isExport = true;
            this.setSyleButton(ExportDefaultButton);
        }
        if (typeButton === ButtonType.save) {
            this.isSave = true;
            this.setSyleButton(SaveDefaultButton);
        }
        if (typeButton === ButtonType.cancel) {
            this.isCancel = true;
            this.setSyleButton(CancelDefaultButton);
        }
        if (typeButton === ButtonType.reset) {
            this.isCancel = true;
            this.setSyleButton(ResetDefaultButton);
        }
        if (typeButton === ButtonType.detail) {
            this.isDetail = true;
            this.setSyleButton(DetailDefaultButton);
        }
        if (typeButton === ButtonType.search) {
            this.isSearch = true;
            this.setSyleButton(SearchDefaultButton);
        }
        if (typeButton === ButtonType.preview) {
            this.isPreview = true;
            this.setSyleButton(PreviewDefaultButton);
        }
        if (typeButton === ButtonType.lock) {
            this.isPreview = true;
            this.setSyleButton(LockDefaultButton);
        }
    }
    setSyleButton(DefaultButton: ButtonAttributeSetting): any {
        if (this.buttonAttribute == null) {
            this.buttonAttribute = DefaultButton;
        }
    }

    onClickButton() {
        this.onClick.emit();
    }
}
