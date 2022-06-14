import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DocumentationRepo } from '@repositories';

@Component({
    selector: 'lock-shipment',
    templateUrl: './lock-shipment.component.html'
})

export class LockShipmentComponent implements OnInit {
    options: CommonInterface.INg2Select[] = [
        { id: 1, text: 'Job ID' },
        // { id: 2, text: 'MBL' },
        // { id: 3, text: 'HBL' },
        // { id: 4, text: 'Custom No' },
    ];
    selectedOption: string = this.options[0].id;
    keyword: string;


    constructor(
        private _toastService: ToastrService,
        private _documentRepo: DocumentationRepo,
    ) {
    }

    ngOnInit() { }

    lock() {
        if (!this.keyword) {
            return;
        }

        const jobIds: string[] = this.keyword.replace(/(?:\r\n|\r|\n|\\n|\\r)/g, ',').trim().split(',').map((item: any) => item.trim());

        this._documentRepo.lockShipmentList(jobIds || [])
            .subscribe(
                (res: CommonInterface.IResult) => {
                    if (res.status) {
                        this._toastService.success(res.message);
                    }
                }
            )
    }
}