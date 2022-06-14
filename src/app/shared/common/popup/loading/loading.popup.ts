import { Component } from '@angular/core';
import { eFMSPopup } from '../popup';

@Component({
  selector: 'loading-popup',
  templateUrl: './loading.popup.html'
})
export class LoadingPopupComponent extends eFMSPopup {
  isCompleted: boolean = false;
  isSuccessDownload: boolean = false;
  isProccessComplete: boolean = false;

  body: string = '';
  constructor() {
    super();
  }

  ngOnInit() {
    this.body = "Report is in running process! <br><b>Please wait while downloading...</b>";
  }

  close() {
    this.resetPopup();
    this.hide();
  }

  downloadSuccess(){
    this.isCompleted = true;
    this.isSuccessDownload = true;
  }

  downloadFail(){
    this.isCompleted = true;
    this.isSuccessDownload = false;
  }

  resetPopup(){
    this.isCompleted = false;
    this.isSuccessDownload = false;
  }

  proccessCompleted(){
    this.isCompleted = true;
    this.isSuccessDownload = false;
    this.isProccessComplete = true;
  }
  proccessFail(){
    this.isCompleted = true;
    this.isSuccessDownload = false;
    this.isProccessComplete = false;
  }
}
