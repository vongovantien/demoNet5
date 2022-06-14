import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-trucking-assignment',
  templateUrl: './trucking-assignment.component.html',
  styleUrls: ['./trucking-assignment.component.sass']
})
export class TruckingAssignmentComponent implements OnInit {

  constructor(private toastr: ToastrService) { }

  ngOnInit() {
  }

  unlock_assign(){
    // this.spinnerService.show();
    // setTimeout(() => {
    //   this.spinnerService.hide();
    //   this.toastr.success("Unlock assignment success !");
    // }, 1500);
  }

  assign_supplier(){
    // this.spinnerService.show();
    // setTimeout(() => {
    //   this.spinnerService.hide();
    //   this.toastr.success("Assign success !");
    // }, 1500);
  }

  

}
