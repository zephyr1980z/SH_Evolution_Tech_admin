import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'
@Component({
  selector: 'app-product',
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData: any
  modalTitle: any
  pageIndex: any
  pageSize: any
  total: any
  listOfData: any = []
  dataSearch: any = {}
  loading = true
  dataObject: any = {}

  constructor(
    public coreService: CoreService,
    private dialogRef: MatDialogRef<ProductDetailComponent>,
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
