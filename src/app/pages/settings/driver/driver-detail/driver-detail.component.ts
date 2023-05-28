import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'

@Component({
  selector: 'app-driver-detail',
  templateUrl: './driver-detail.component.html',
})
export class DriverDetailComponent implements OnInit {
  dataRomooc: any[] = []
  dataVehicle: any[] = []
  constructor(
    public coreService: CoreService,
    private dialog: MatDialog,
    private apiService: ApiService,
    private authenticationService: AuthenticationService,
    private dialogRef: MatDialogRef<DriverDetailComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}
  closeDialog(flag: any) {
    this.dialogRef.close(flag)
  }

  loadDataFind() {
    Promise.all([
      this.apiService.post(this.apiService.ROMOOC.FIND, { where: { isDeleted: false } }),
      this.apiService.post(this.apiService.VEHICLE.FIND, { where: { isDeleted: false } }),
    ]).then(async (res) => {
      this.dataRomooc = res[0] || []
      this.dataVehicle = res[1] || []
    })
  }
}
