import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();

  // * Open when release
  // if (window) {
  //   // * Clear console.log
  //   window.console.log = function () { };
  // }
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

