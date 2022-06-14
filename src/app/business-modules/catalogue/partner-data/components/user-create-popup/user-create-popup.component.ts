import { Component, OnInit } from '@angular/core';
import { PopupBase } from 'src/app/popup.base';
import { finalize, catchError, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { SortService } from '@services';
import { CatalogueRepo, SystemRepo } from '@repositories';
import { UserLevel } from '@models';
import { AbstractControl } from '@angular/forms';
import { RoutingConstants } from '@constants';

@Component({
  selector: 'app-user-create-popup',
  templateUrl: './user-create-popup.component.html',
})
export class UserCreatePopupComponent extends PopupBase implements OnInit {

  userList: UserLevel[] = [];
  partnerId: string = '';
  selectedUser: any = new UserLevel();
  valueSearch: AbstractControl;
  constructor(private _systemRepo: SystemRepo,
    private _catalogueRepo: CatalogueRepo,
    private _toastService: ToastrService,
    private router: Router,
    private _sortService: SortService) {
    super();
    this.requestSort = this.sortUsers;
  }


  ngOnInit() {
    this.headers = [
      { title: 'User Name', field: 'userName', sortable: true },
      { title: 'Group Name', field: 'groupName', sortable: true },
      { title: 'Office Name', field: 'officeName', sortable: true },
    ];
    this.getListUser();
  }

  getListUser() {
    const claim = localStorage.getItem('id_token_claims_obj');
    const currenctUser = JSON.parse(claim)["companyId"];
    const body: any = {
      companyId: currenctUser,
      active: true
    };
    this._systemRepo.getListUsersByCurrentCompany(body)
      .pipe(catchError(this.catchError),
        map((data: any) => {
          return {
            data: data.map((item: any) => new UserLevel(item))
          };
        }),
        finalize(() => { this.isLoading = false; this._progressRef.complete(); }))
      .subscribe(
        (res: any) => {
          if (!!res) {
            this.userList = res.data;
          }
        },
      );
  }

  onChangeUser() {
    const user = this.userList.filter(x => x.isSelected)[0];
    if (!user) {
      this._toastService.warning("Please select user to update.");
    }
    else {
      this._catalogueRepo.updateInfoForPartner({ id: this.partnerId, userCreated: user.userId, companyId: user.companyId, officeId: user.officeId, groupId: user.groupId })
        .pipe(catchError(this.catchError))
        .subscribe(
          (res: CommonInterface.IResult) => {
            if (res.status) {
              this._toastService.success(res.message);
              this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                this.router.navigate([`${RoutingConstants.CATALOGUE.PARTNER_DATA}/detail/${this.partnerId}`]);
              });
            } else {
              this._toastService.error(res.message);
            }
            this.onClosePopup();
          }
        );
    }
  }

  onSelectUser(data: UserLevel) {
    if (!!this.selectedUser.userId) {
      this.userList.filter(x => x === this.selectedUser)[0].isSelected = false;
    }
    this.selectedUser = data;
  }

  onSearchAutoComplete(keyword: string) {
    if (this.valueSearch.value === '') {
      this.valueSearch.setValue(null);
    }
    if (!!this.valueSearch.value) {
      this.userList = this.userList.filter((item: UserLevel) => item.userName.includes(keyword) || item.groupName.includes(keyword) || item.officeName.includes(keyword));
    }
  }

  sortUsers(sortField: string) {
    this.userList = this._sortService.sort(this.userList, sortField, this.order);
  }

  onClosePopup() {
    this.isSubmitted = false;
    this.hide();
  }
}
