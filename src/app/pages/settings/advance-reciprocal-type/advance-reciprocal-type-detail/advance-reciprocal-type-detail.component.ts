import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { User } from '../../../../models/user.model'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'

@Component({
  selector: 'app-advance-reciprocal-type-detail',
  templateUrl: './advance-reciprocal-type-detail.component.html',
})
export class AdvanceReciprocalTypeDetailComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData: any
  total: any
  dataFilterStatus: any
  listOfData: any = []
  dataObject: any = {}

  constructor(
    public coreService: CoreService,
    private dialogRef: MatDialogRef<AdvanceReciprocalTypeDetailComponent>,
    private authenticationService: AuthenticationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  async ngOnInit() {
    this.dataObject = this.data
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
