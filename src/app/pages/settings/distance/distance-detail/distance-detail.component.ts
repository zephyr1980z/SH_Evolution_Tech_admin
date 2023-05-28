import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../../models/user.model';
import { ApiService } from '../../../../services/api.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { CoreService } from '../../../../services/core.service';
import { NotifyService } from '../../../../services/notify.service';

@Component({
  selector: 'app-distance-detail',
  templateUrl: './distance-detail.component.html',
})
export class DistanceDetailComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData: any
  dataFilterStatus: any
  dataSearch: any = {}
  dataObject: any = {}

  constructor(
    public coreService: CoreService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<DistanceDetailComponent>,
    private authenticationService: AuthenticationService,

    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private notifyService: NotifyService,
    private apiService: ApiService
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
