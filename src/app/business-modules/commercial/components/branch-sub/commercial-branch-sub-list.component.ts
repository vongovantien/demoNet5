import { Component, OnInit, ViewChild, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { AppList } from 'src/app/app.list';
import { catchError, finalize } from 'rxjs/operators';
import { Permission403PopupComponent, ConfirmPopupComponent } from '@common';
import { ToastrService } from 'ngx-toastr';
import { NgProgress } from '@ngx-progressbar/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Partner } from '@models';
import { CatalogueRepo } from '@repositories';
import { RoutingConstants } from '@constants';
import { FormContractCommercialPopupComponent } from 'src/app/business-modules/share-modules/components';

@Component({
  selector: 'app-commercial-branch-sub-list',
  templateUrl: './commercial-branch-sub-list.component.html'
})

export class CommercialBranchSubListComponent extends AppList {
  @ViewChild(Permission403PopupComponent) info403Popup: Permission403PopupComponent;
  @ViewChild(ConfirmPopupComponent) confirmDeletePopup: ConfirmPopupComponent;
  @ViewChild(FormContractCommercialPopupComponent) formContractPopup: FormContractCommercialPopupComponent;

  @Input() parentId: string;
  @Input() partnerType: string;
  @Input() openOnPartner: boolean = false;
  isAddSubPartner: boolean;

  constructor(private _router: Router,
    private _catalogueRepo: CatalogueRepo,
    private _toastService: ToastrService,
    private _ngProgressService: NgProgress,
    protected _activeRoute: ActivatedRoute

  ) {
    super();
    this._progressRef = this._ngProgressService.ref();
  }

  partners: Partner[] = [];
  selectedPartner: Partner;

  ngOnInit() {
    this.headers = [
      { title: 'Partner Code', field: 'accountNo', sortable: true },
      { title: 'Abbr Name', field: 'shortName', sortable: true },
      { title: 'EN Name', field: 'partnerNameEn', sortable: true },
      { title: 'Local Name', field: 'partnerNameVn', sortable: true },
      { title: 'Taxcode', field: 'taxCode', sortable: true },
      { title: 'Country', field: 'countryShippingName', sortable: true }
    ];
  }

  getSubListPartner(partnerId: string) {
    this.isLoading = true;
    this._catalogueRepo.getSubListPartner(partnerId)
      .pipe(catchError(this.catchError), finalize(() => {
        this.isLoading = false;
      })).subscribe(
        (res: Partner[]) => {
          this.partners = res || [];
        }
      );
  }

  gotoCreatePartner() {
    if (this.openOnPartner) {
      this._router.navigate([`${RoutingConstants.CATALOGUE.PARTNER_DATA}/add-sub/${this.parentId}`]);
    } else if (this.partnerType === 'Customer') {
      this._router.navigate([`${RoutingConstants.COMMERCIAL.CUSTOMER}/new-sub/${this.parentId}`]);
    } else {
      this._router.navigate([`${RoutingConstants.COMMERCIAL.AGENT}/new-sub/${this.parentId}`]);
    }
  }

  showDetail(partner: any) {
    this._catalogueRepo.checkViewDetailPartnerPermission(partner.id)
      .pipe(
        catchError(this.catchError),
        finalize(() => this._progressRef.complete())
      ).subscribe(
        (res: CommonInterface.IResult) => {
          if (res.status) {
            if (this.openOnPartner) {
              this._router.navigate([`${RoutingConstants.CATALOGUE.PARTNER_DATA}/detail/${partner.id}`]);
            } else {
              if (partner.partnerType === 'Customer') {
                this._router.navigate([`${RoutingConstants.COMMERCIAL.CUSTOMER}/${partner.id}`]);
              } else {
                this._router.navigate([`${RoutingConstants.COMMERCIAL.AGENT}/${partner.id}`]);
              }
            }
          } else {
            if (res.data === 403) {
              this.info403Popup.show();
            } else {
              const partnerType = this.openOnPartner ? "Partner " : partner.partnerType + " ";
              this._toastService.warning("This " + partnerType + res.message);
            }
          }
        },
      );
  }

  showConfirmDelete(partner: Partner) {
    this.selectedPartner = partner;
    const partnerType = this.openOnPartner ? "Partner " : this.selectedPartner.partnerType + " ";
    this._catalogueRepo.checkDeletePartnerPermission(this.selectedPartner.id)
      .pipe(
        catchError(this.catchError),
        finalize(() => this._progressRef.complete())
      ).subscribe(
        (res: CommonInterface.IResult) => {
          if (res.status) {
            this.confirmDeletePopup.show();
          } else {
            if (res.data === 403) {
              this.info403Popup.show();
            } else {
              this._toastService.warning("This " + partnerType + res.message);
            }
          }
        }
      );
  }

  onDelete() {
    this._catalogueRepo.checkDeletePartnerPermission(this.selectedPartner.id)
      .pipe(
        catchError(this.catchError),
        finalize(() => this._progressRef.complete())
      ).subscribe(
        (res: CommonInterface.IResult) => {
          if (!res) {
            if (res.data === 403) {
              this.info403Popup.show();
            } else {
              const partnerType = this.openOnPartner ? "Partner " : this.selectedPartner.partnerType + " ";
              this._toastService.warning("This " + partnerType + res.message);
            }
            this.confirmDeletePopup.hide();
          } else {
            this.confirmDeletePopup.hide();
            this._progressRef.start();
            this._catalogueRepo.deletePartner(this.selectedPartner.id)
              .pipe(catchError(this.catchError), finalize(() => this._progressRef.complete()))
              .subscribe(
                (res: CommonInterface.IResult) => {
                  if (res.status) {
                    this.getSubListPartner(this.parentId);
                    this._toastService.success(res.message);
                  } else {
                    this._toastService.error(res.message);
                  }
                }
              );
          }
        },
      );
  }
}
