import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { User } from '../../../../../models/user.model'
import { ApiService } from '../../../../../services/api.service'
import { AuthenticationService } from '../../../../../services/authentication.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'

@Component({
  selector: 'app-print-inbound',
  templateUrl: './print-inbound.component.html',
  styleUrls: ['./print-inbound.component.scss'],
})
export class PrintInboundComponent implements OnInit {
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
    private dialogRef: MatDialogRef<PrintInboundComponent>,
    private dialog: MatDialog,
    private router: Router,
    private authenticationService: AuthenticationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  async ngOnInit() {
    this.dataSearch = new Object()
    await Promise.all([this.apiService.post(this.apiService.ITEM.FIND, { isDeleted: false })]).then(async (res) => {
      if (res) this.lstItem = res[0]
    })
    this.dataObject = this.data
    await this.dataObject.lstItem.forEach((e: any) => {
      const item = this.lstItem.find((c: any) => c.id == e.itemId)
      if (item) e.baseUnitName = item.baseUnitName
    })
  }

  async searchData(data: any) {
    this.notifyService.showloading()
    const param = data
    this.apiService.post(this.apiService.INBOUND.PRINT, param).then((data) => {
      if (data) {
        this.notifyService.hideloading()
        this.dataObject = data
      }
    })
  }
}
