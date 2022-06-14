import { Component, Input, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { AppForm } from "src/app/app.form";
import { takeUntil } from "rxjs/operators";
import { HouseBill } from "@models";
import { IShareBussinessState, getDetailHBlState } from "../../store";
import { DataService } from "@services";
@Component({
	selector: 'attach-list-house-bill',
	templateUrl: './attach-list-house-bill.component.html'
})
export class ShareBusinessAttachListHouseBillComponent extends AppForm implements OnInit {
	@Input() action: string = 'INSERT';
	attachList: string = '';
	// class="non-editable" contenteditable="false" >>> prevent editing froala
	titleAttachListDefault: string =
		`<div class="non-editable" contenteditable="false">
		<p style="text-align: center;">
		<strong>
			<span style="font-size: 18px; font-family: Tahoma;">ATTACH LIST</span>
		</strong>
	</p>
	<table style="width: 100%; margin-left: calc(0%);">
		<tbody>
			<tr>
				<td style="width: 85%; text-align: right; border: none;">
					<span style="font-family: Tahoma;">						
						<strong>H-B/L No. &nbsp; &nbsp; :</strong>&nbsp;								
					</span>
				</td>
				<td style="width: 15%; text-align: left; border: none;">
					<span style="font-family: Tahoma;">[[HBLNo]]</span>
				</td>
			</tr>
			<tr>
				<td style="width: 85%; text-align: right; border: none;">
					<span style="font-family: Tahoma;">					
						<strong>Date &nbsp; &nbsp; :</strong>&nbsp;
					</span>
				</td>
				<td style="width: 15%; text-align: left; border: none;">
					<span style="font-family: Tahoma;">[[Date]]</span>
				</td>
			</tr>
		</tbody>
	</table>
	<p style="border-bottom-style: solid; border-width:2px;">
	<br>
	</p>
	</div>
	<p>&nbsp;</p>`;

	constructor(
		private _store: Store<IShareBussinessState>,
		private _dataService: DataService
	) {
		super();
	}

	ngOnInit(): void {
		if (this.action === "UPDATE") {
			this._store.select(getDetailHBlState)
				.pipe(takeUntil(this.ngUnsubscribe)).subscribe(
					(hbl: HouseBill) => {
						if (!!hbl && !!hbl.id) {
							this._dataService.currentMessage.subscribe(
								(data: any) => {
									const hblNo = !!data && !!data.formHBLData && !!data.formHBLData.hblNo ? data.formHBLData.hblNo : '';
									const date = !!data && !!data.formHBLData && !!data.formHBLData.etd ? data.formHBLData.etd : '';
									console.log(date)
									this.attachList = (hbl.attachList !== null && hbl.attachList !== '' ? hbl.attachList : this.titleAttachListDefault).replace('[[HBLNo]]', hblNo).replace('[[Date]]', date);
								}
							)
						}
					}
				);
		} else {
			this._dataService.currentMessage.subscribe(
				(data: any) => {
					const hblNo = !!data && !!data.formHBLData && !!data.formHBLData.hblNo ? data.formHBLData.hblNo : '';
					const date = !!data && !!data.formHBLData && !!data.formHBLData.etd ? data.formHBLData.etd : '';
					this.attachList = this.titleAttachListDefault.replace('[[HBLNo]]', hblNo).replace('[[Date]]', date);
				}
			)
		}
	}
}