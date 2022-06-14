import { Component, OnInit } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { CatalogueRepo } from '@repositories';
import { CommonEnum } from '@enums';
import { Customer, PortIndex } from '@models';

import { Observable } from 'rxjs';
import { FormGroup, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { SystemConstants } from 'src/constants/system.const';
import { JobConstants } from '@constants';
import { FormValidators } from '@validators';

@Component({
    selector: 'form-booking-note-lcl-export',
    templateUrl: './form-booking-note-lcl-export.component.html'
})

export class SeaLCLExportFormBookingNoteComponent extends AppForm implements OnInit {

    formGroup: FormGroup;
    shipperId: AbstractControl;
    consigneeId: AbstractControl;
    shipperDescription: AbstractControl;
    consigneeDescription: AbstractControl;
    etd: AbstractControl;
    eta: AbstractControl;
    pol: AbstractControl;
    pod: AbstractControl;
    paymentTerm: AbstractControl;
    dateOfStuffing: AbstractControl;
    closingTime: AbstractControl;
    from: AbstractControl;
    to: AbstractControl;
    placeOfStuffing: AbstractControl;
    contact: AbstractControl;
    bookingNo: AbstractControl;
    bookingDate: AbstractControl;
    //
    packageQty: AbstractControl;

    shipppers: Observable<Customer[]>;
    consignees: Observable<Customer[]>;
    ports: Observable<PortIndex[]>;

    displayFieldsCustomer: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PARTNER;
    displayFieldPort: CommonInterface.IComboGridDisplayField[] = JobConstants.CONFIG.COMBOGRID_PORT;
    termTypes: string[] = JobConstants.COMMON_DATA.FREIGHTTERMS;

    constructor(
        private _catalogueRepo: CatalogueRepo,
        private _fb: FormBuilder
    ) {
        super();
    }

    ngOnInit() {
        this.shipppers = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.SHIPPER, CommonEnum.PartnerGroupEnum.CUSTOMER]);
        this.consignees = this._catalogueRepo.getPartnerByGroups([CommonEnum.PartnerGroupEnum.CONSIGNEE]);
        this.ports = this._catalogueRepo.getPlace({ placeType: CommonEnum.PlaceTypeEnum.Port, modeOfTransport: CommonEnum.TRANSPORT_MODE.SEA, active: true });

        this.initForm();
    }

    initForm() {
        const userLogged: SystemInterface.IClaimUser = JSON.parse(localStorage.getItem(SystemConstants.USER_CLAIMS));

        this.formGroup = this._fb.group({
            from: [userLogged.nameEn, Validators.required], // * Default english name
            telFrom: [],
            to: [null, Validators.required],
            telTo: [],
            revision: [],
            bookingNo: [null, Validators.required],
            placeOfStuffing: [null, Validators.required],
            contact: [null, Validators.required],
            vessel: [],
            voy: [],
            shipperDescription: [],
            consigneeDescription: [],
            freightRate: [],
            placeOfDelivery: [],
            noOfContainer: [],
            commodity: [],
            specialRequest: [],
            gw: [],
            cbm: [],
            serviceRequired: [],
            otherTerm: [],
            hblNo: [],
            noOfBl: [],
            pickupAt: [],
            dropoffAt: [],
            note: [`<p>Xin vui l&ograve;ng li&ecirc;n lạc 2H trước khi ra h&agrave;ng
                    <br>Ph&iacute; CFS Tại văn ph&ograve;ng
                    <br>Ph&iacute; THC shipper sẽ thanh to&aacute;n khi lấy chứng từ:
                    <br>Ghi ch&uacute; kh&aacute;c:
                    <br>- H&agrave;ng đi India Shipper phải cung cấp IEC khi gửi chi tiết HBL
                    <br>- Kh&ocirc;ng nhận h&agrave;ng thực phẩm đi Rotterdam, Mỹ, Canada.
                    <br>- Kh&ocirc;ng nhận h&agrave;ng h&agrave;nh l&yacute; c&aacute; nh&acirc;n đi Mỹ v&agrave; Canada.
                    <br>- Vui l&ograve;ng gửi đầy đủ th&ocirc;ng tin AMS c&ugrave;ng l&uacute;c với chi tiết l&agrave;m Bill cho h&agrave;ng xuất đi Mỹ
                    <br>- Kh&ocirc;ng nhận h&agrave;ng nguy hiểm.
                    <br>- Thu ph&iacute; khai quan tại cảng đến đối với h&agrave;ng Mỹ, Canada với mức ph&iacute; 40usd/ lần điều chỉnh chi tiết h&agrave;ng h&oacute;a sau khi t&agrave;u chạy.
                    <br>- H&agrave;ng h&oacute;a chất liệu gỗ hoặc được đ&oacute;ng trong kiện gỗ c&aacute;c loại phải c&oacute; giấy chứng nhận hun tr&ugrave;ng.
                    <br>- Vui l&ograve;ng b&aacute;o trước đối với h&agrave;ng si&ecirc;u trường, si&ecirc;u trọng hoặc c&oacute; sự thay đổi về khối lượng</p>`],
            otherTerms: [],

            shipperId: [],
            consigneeId: [],
            pol: [null, Validators.required],
            pod: [],

            dateOfStuffing: [null, Validators.required],
            closingTime: [],
            etd: [null, Validators.required],
            eta: [],
            bookingDate: [{ startDate: new Date(), endDate: new Date() }],
            //
            packageQty: [],


            paymentTerm: [],
        }, { validator: [FormValidators.comparePort, FormValidators.compareETA_ETD] });

        this.shipperId = this.formGroup.controls['shipperId'];
        this.consigneeId = this.formGroup.controls['consigneeId'];
        this.shipperDescription = this.formGroup.controls['shipperDescription'];
        this.consigneeDescription = this.formGroup.controls['consigneeDescription'];
        this.eta = this.formGroup.controls['eta'];
        this.etd = this.formGroup.controls['etd'];
        this.closingTime = this.formGroup.controls['closingTime'];
        this.dateOfStuffing = this.formGroup.controls['dateOfStuffing'];
        this.pol = this.formGroup.controls['pol'];
        this.pod = this.formGroup.controls['pod'];
        this.paymentTerm = this.formGroup.controls['paymentTerm'];
        this.from = this.formGroup.controls['from'];
        this.to = this.formGroup.controls['to'];
        this.contact = this.formGroup.controls['contact'];
        this.placeOfStuffing = this.formGroup.controls['placeOfStuffing'];
        this.bookingNo = this.formGroup.controls['bookingNo'];
        this.bookingDate = this.formGroup.controls['bookingDate'];
        //
        this.packageQty = this.formGroup.controls['packageQty'];
    }

    onSelectDataFormInfo(data: any, type: string) {
        switch (type) {
            case 'shipper':
                this.shipperId.setValue(data.id);
                this.shipperDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'consignee':
                this.consigneeId.setValue(data.id);
                this.consigneeDescription.setValue(this.getDescription(data.partnerNameEn, data.addressEn, data.tel, data.fax));
                break;
            case 'pol':
                this.pol.setValue(data.id);
                break;
            case 'pod':
                this.pod.setValue(data.id);
                break;
            default:
                break;
        }

    }

    getDescription(fullName: string, address: string, tel: string, fax: string) {
        let strDescription: string = '';
        if (!!fullName) {
            strDescription += fullName;
        }
        if (!!address) {
            strDescription = strDescription + "\n" + address;
        }
        if (!!tel) {
            strDescription = strDescription + "\nTel No:" + tel;
        }
        if (!!fax) {
            strDescription = strDescription + "\nFax No:" + fax;
        }
        // return `${fullName} \n${address} \nTel No: ${!!tel ? tel : ''} \nFax No: ${!!fax ? fax : ''} \n`;
        return strDescription;
    }
}