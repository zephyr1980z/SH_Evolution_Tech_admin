import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { User } from '../../../../../models/user.model'
import { ApiService } from '../../../../../services/api.service'
import { AuthenticationService } from '../../../../../services/authentication.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'
@Component({
  selector: 'app-item-supplier-detail',
  templateUrl: './item-supplier-detail.component.html',
})
export class ItemSupplierDetailComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData: any
  modalTitle: any
  pageIndex: any
  pageSize: any
  total: any
  dataFilterStatus: any
  listOfData: any = []
  dataSearch: any = {}
  loading = true
  dataObject: any = {}
  dataDepartment: any = []
  dataDepartmentSource: any = []
  department: any
  modelTitle = 'THÔNG TIN NHÀ CUNG CẤP'

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<ItemSupplierDetailComponent>,
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
    this.dataObject = this.data
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
