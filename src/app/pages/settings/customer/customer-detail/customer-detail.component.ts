import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../models/user.model';
import { AuthenticationService } from '../../../../services/authentication.service';
@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
})
export class CustomerDetailComponent implements OnInit {

  role: any
  currentUser: User | any
  enumData: any
  dataFilterStatus: any
  listOfData: any = []
  dataSearch: any = {}
  dataObject: any = {}

  constructor(
    private dialogRef: MatDialogRef<CustomerDetailComponent>,
    private authenticationService: AuthenticationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit(): void {
    this.dataSearch = new Object()
    this.dataObject = this.data
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
