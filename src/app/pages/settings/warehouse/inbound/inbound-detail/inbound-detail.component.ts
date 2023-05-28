import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { enumData } from '../../../../../core/enumData'
import { User } from '../../../../../models/user.model'
import { ApiService } from '../../../../../services/api.service'
import { AuthenticationService } from '../../../../../services/authentication.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'
@Component({
  selector: 'app-inbound-detail',
  templateUrl: './inbound-detail.component.html',
})
export class InboundDetailComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData = enumData
  modalTitle: any
  pageIndex: any
  pageSize: any
  total: any
  dataFilterStatus: any
  dataSearch: any = {}
  loading = true
  dataObject: any = {}
  modelTitle = 'THÔNG TIN ĐƠN NHẬP KHO'
  lstItem: any = []
  isQualified = false

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<InboundDetailComponent>,
    private dialog: MatDialog,
    private router: Router,
    private authenticationService: AuthenticationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
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
      if (+e.quantity == 0) {
        this.isQualified = true
      }
    })
    if (this.isQualified)
      this.notifyService.showInfo(
        `Không thể xác nhận nhập từng lô vì có lô có số lượng nhập thực bằng 0. Vui lòng kiểm tra lại!`
      )
  }

  closeDialog() {
    this.dialogRef.close(1)
  }

  onApproveInboundDetail(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.INBOUND.APPROVE_INBOUND_DETAIL, { id: data.id }).then((res) => {
      if (res) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(res.message)
        this.closeDialog()
      }
    })
  }
  onWarningApproveIbDetail(data: any) {
    if (+data.quantity == 0) {
      this.notifyService.showInfo(`Số lượng nhập thực đang bằng ${data.quantity}, bạn có muốn nhập lô này!`)
    }
  }
}
