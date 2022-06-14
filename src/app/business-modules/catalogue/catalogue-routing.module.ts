import { NgModule } from "@angular/core";
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'ware-house' },
  { path: 'ware-house', loadChildren: () => import('./warehouse/warehouse.module').then(m => m.WareHouseModule), data: { name: 'Warehouse' } },
  { path: 'port-index', loadChildren: () => import('./port-index/port-index.module').then(m => m.PortIndexModule), data: { name: 'Port' } },
  { path: 'partner-data', loadChildren: () => import('./partner-data/partner-data.module').then(m => m.PartnerDataModule), data: { name: 'Supplier/Carrier' } },
  { path: 'commodity', loadChildren: () => import('./commodity/commodity.module').then(m => m.CommondityModule), data: { name: 'Commodity' } },
  { path: 'stage-management', loadChildren: () => import('./stage-management/stage-management.module').then(m => m.StateManagementModule), data: { name: 'Stage' } },
  { path: 'unit', loadChildren: () => import('./unit/unit.module').then(m => m.UnitModule), data: { name: 'Unit' } },
  { path: 'location', loadChildren: () => import('./location/location.module').then(m => m.LocationModule), data: { name: 'Location' } },
  { path: 'charge', loadChildren: () => import('./charge/charge.module').then(m => m.ChargeModule), data: { name: 'Charge' } },
  { path: 'currency', loadChildren: () => import('./currency/currency.module').then(m => m.CurrencyModule), data: { name: 'Currency' } },
  { path: 'bank', loadChildren: () => import('./bank/bank.module').then(m => m.BankModule), data: { name: 'Bank' } },
  { path: 'chart-of-accounts', loadChildren: () => import('./chart-of-accounts/chart-of-accounts.module').then(m => m.ChartOfAccountsModule), data: { name: 'Chart Of Accounts' } },

  // TODO other module...
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogueRoutingModule { }
