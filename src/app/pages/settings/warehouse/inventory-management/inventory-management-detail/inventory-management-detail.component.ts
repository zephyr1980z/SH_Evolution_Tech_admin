import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { User } from '../../../../../models/user.model'
import { ApiService } from '../../../../../services/api.service'
import { AuthenticationService } from '../../../../../services/authentication.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'

@Component({
  selector: 'app-inventory-management-detail',
  templateUrl: './inventory-management-detail.component.html',
})
export class InventoryManagementDetailComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData: any
  modalTitle: any
  pageIndex: any
  pageSize: any
  total: any
  dataFilterStatus: any
  dataSearch: any = {}
  loading = true
  dataObject: any = {}
  modelTitle = 'THÔNG TIN CHI TIẾT PHIẾU KIỂM'

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<InventoryManagementDetailComponent>,
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
    this.apiService
      .post(this.apiService.EMPLOYEE.FIND, { where: { id: this.dataObject.createdBy } })
      .then(async (res) => {
        this.dataObject.createdByName = res[0].name
      })
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
