import { Component, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { SettingRepo } from "@repositories";

@Component({
    selector: "generate-id",
    templateUrl: "./generate-id.component.html",
})
export class GenerateIdComponent implements OnInit {
    types: CommonInterface.INg2Select[] = [
        { id: 1, text: "SOA" },
        { id: 2, text: "Settlement" },
        { id: 3, text: "Advance" },
        { id: 4, text: "Receipt" },
        { id: 5, text: "CD Note" },
    ];
    selectedType: number = this.types[0].id;

    keyword: string;
    constructor(
        private _toastService: ToastrService,
        private _settingRepo: SettingRepo
    ) { }

    ngOnInit() { }

    generatePaymentId() {
        if (!this.keyword) {
            return;
        }
        this._settingRepo
            .generatePaymentId(this.keyword, this.selectedType)
            .subscribe((res: CommonInterface.IResult) => {
                if (res.status) {
                    this._toastService.success(
                        `Update successfully`,
                        "Update Success !"
                    );
                } else {
                    this._toastService.error(res.data.message);
                }
            });
    }
}
