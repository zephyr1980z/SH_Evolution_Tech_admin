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
  selector: 'app-item-group-detail',
  templateUrl: './item-group-detail.component.html',
})
export class ItemGroupDetailComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData: any
  modalTitle: any
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  dataFilterStatus: any
  listOfData: any = []
  dataSearch: any = {}
  loading = true
  dataObject: any = {}
  dataDepartment: any = []
  dataDepartmentSource: any = []
  department: any
  modelTitle = 'THÔNG TIN NHÓM PHỤ TÙNG'

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<ItemGroupDetailComponent>,
    private dialog: MatDialog,
    private router: Router,
    private authenticationService: AuthenticationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
  }

  async ngOnInit() {
    this.dataObject = this.data
    await this.loadAllData()
  }
  async loadAllData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1
    }
    this.loading = true
    const where: any = {}
    where['itemGroupId'] = this.dataObject.id

    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    await this.apiService.post(this.apiService.ITEM.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }
  closeDialog() {
    this.dialogRef.close(1)
  }
}
