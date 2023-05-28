import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { User } from '../../../../../models/user.model'
import { ApiService } from '../../../../../services/api.service'
import { AuthenticationService } from '../../../../../services/authentication.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'

@Component({
  selector: 'app-print-outbound',
  templateUrl: './print-outbound.component.html',
  styleUrls: ['./print-outbound.component.scss'],
})
export class PrintOutboundComponent implements OnInit {
  dateString = ''
  dataObject: any
  lstItem: any = []
  dataSearch: any = {}
  currentUser: User | any
  enumData: any

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<PrintOutboundComponent>,
    private dialog: MatDialog,
    private router: Router,
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

  async searchData(data: any) {
    this.notifyService.showloading()
    const param = data
    this.apiService.post(this.apiService.OUTBOUND.PRINT, param).then((data) => {
      if (data) {
        this.notifyService.hideloading()
        this.dataObject = data
      }
    })
  }
}
