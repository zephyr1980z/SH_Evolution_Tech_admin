import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { User } from '../../../../../models/user.model'
import { ApiService } from '../../../../../services/api.service'
import { AuthenticationService } from '../../../../../services/authentication.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'

@Component({
  selector: 'app-product-container-detail',
  templateUrl: './product-container-detail.component.html',
})
export class ProductContainerDetailComponent implements OnInit {
  screenWidth: any
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
  lstOfContType: any = []
  lstOfCusLocation: any = []
  lstOfCusProduct: any = []

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<ProductContainerDetailComponent>,
    private dialog: MatDialog,
    private router: Router,
    private authenticationService: AuthenticationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  async ngOnInit() {
    this.screenWidth = window.screen.width
    this.dataSearch = new Object()
    this.dataObject = this.data
    console.log(this.dataObject)
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
