import { Component, OnInit, Output, EventEmitter, } from '@angular/core';
import { AppForm } from 'src/app/app.form';
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { ChargeConstants } from '@constants';

@Component({
    selector: 'form-search-incoterm',
    templateUrl: './form-search-incoterm.component.html'
})

export class CommercialFormSearchIncotermComponent extends AppForm implements OnInit {

    @Output() onSearch: EventEmitter<Partial<ISearchIncoterm>> = new EventEmitter<Partial<ISearchIncoterm>>();
    @Output() onReset: EventEmitter<Partial<ISearchIncoterm>> = new EventEmitter<Partial<ISearchIncoterm>>();

    formSearch: FormGroup;
    //
    incoterm: AbstractControl;
    service: AbstractControl;
    status: AbstractControl;

    services: CommonInterface.INg2Select[] = [
        { text: 'All', id: 'All' },
        { text: ChargeConstants.IT_DES, id: ChargeConstants.IT_CODE },
        { text: ChargeConstants.AI_DES, id: ChargeConstants.AI_CODE },
        { text: ChargeConstants.AE_DES, id: ChargeConstants.AE_CODE },
        { text: ChargeConstants.SFE_DES, id: ChargeConstants.SFE_CODE },
        { text: ChargeConstants.SFI_DES, id: ChargeConstants.SFI_CODE },
        { text: ChargeConstants.SLE_DES, id: ChargeConstants.SLE_CODE },
        { text: ChargeConstants.SLI_DES, id: ChargeConstants.SLI_CODE },
        { text: ChargeConstants.SCE_DES, id: ChargeConstants.SCE_CODE },
        { text: ChargeConstants.SCI_DES, id: ChargeConstants.SCI_CODE },
        { text: ChargeConstants.CL_DES, id: ChargeConstants.CL_CODE }
    ];

    statusSelects: CommonInterface.INg2Select[] = [
        { text: 'All', id: 'All' },
        { text: 'Inactive', id: false },
        { text: 'Active', id: true },
    ];

    constructor(

        private _fb: FormBuilder,
    ) {
        super();
        this.requestSearch = this.onSearchIncoterm;
        this.requestReset = this.onResetIncoterm;
    }

    ngOnInit() {
        this.initForm();
    }

    initForm() {
        this.formSearch = this._fb.group({
            incoterm: [],
            service: [[this.services[0].id]],
            status: [this.statusSelects[0].id],
        });
        this.incoterm = this.formSearch.controls["incoterm"];
        this.service = this.formSearch.controls["service"];
        this.status = this.formSearch.controls["status"];
    }

    onSearchIncoterm() {
        const dataForm: { [key: string]: any } = this.formSearch.getRawValue();
        const body = this.formatSearchParams(dataForm);
        this.onSearch.emit(body);
    }

    onResetIncoterm() {
        const body = {};
        this.onReset.emit(body);
    }

    formatSearchParams(body: any): ISearchIncoterm {
        const checkAllItem = [...body.service].filter(e => e === 'All');
        if (checkAllItem.length > 0) {
            return {
                code: body.incoterm,
                service: null,
                active: body.status === 'All' ? null : body.status,
            };
        } else {
            return {
                code: body.incoterm,
                service: body.service,
                active: body.status === 'All' ? null : body.status,
            };
        }
    }

    selelectedService(event: CommonInterface.INg2Select) {
        const currService = this.service.value;
        if (currService.filter(ele => ele === 'All').length > 0 && event.id !== "All") {
            currService.splice(0);
            currService.push(event.id);
            this.service.setValue(currService);
        }
        if (event.id === 'All') {
            const onlyAllObj = currService.filter(ele => ele === 'All');
            this.service.setValue(onlyAllObj);
        }
    }
}

interface ISearchIncoterm {
    code: string;
    service: string[];
    active: boolean;
}
