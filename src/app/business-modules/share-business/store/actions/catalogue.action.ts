import { createAction, props } from "@ngrx/store";

export enum ShareBussinessCatalogueActionTypes {
    LOAD_PARTNER_KEYIN_CHARGE = '[Partner] Get Partner For Key In Charge',
    LOAD_PARTNER_KEYIN_CHARGE_SUCCESS = '[Partner] Get Partner For Key In Charge Success',

};

export interface ISearchPartnerForKeyInSurcharge {
    service: string;
    office: string;
    salemanId: string;
}

export const LoadListPartnerForKeyInSurcharge = createAction(ShareBussinessCatalogueActionTypes.LOAD_PARTNER_KEYIN_CHARGE, props<ISearchPartnerForKeyInSurcharge>());
export const LoadListPartnerForKeyInSurchargeSuccess = createAction(ShareBussinessCatalogueActionTypes.LOAD_PARTNER_KEYIN_CHARGE_SUCCESS, props<{ data: any[] }>());
