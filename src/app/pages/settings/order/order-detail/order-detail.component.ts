import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'
import { ProductContainerDetailComponent } from './product-container-detail/product-container-detail.component'
@Component({
  selector: 'app-order',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
})
export class OrderDetailComponent implements OnInit {
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
    private dialogRef: MatDialogRef<OrderDetailComponent>,
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
    for (let x of this.dataObject.fileList) {
      if (!x.name.match(/.(jpg|jpeg|png|gif)$/i)) {
        x.isNotImage = true
      }
    }
  }

  clickDetail(object: any) {
    this.dialog
      .open(ProductContainerDetailComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((res) => {})
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
