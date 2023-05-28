import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { AddOrEditVendorComponent } from './add-or-edit-vendor/add-or-edit-vendor.component'
import { VendorDetailComponent } from './vendor-detail/vendor-detail.component'

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
})
export class VendorComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData: any
  modalTitle: any
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  listOfData: any = []
  dataSearch: any
  loading = true
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  enumRole = enumData.Role.Vendor

  constructor(
    private notifyService: NotifyService,
    public coreService: CoreService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit(): void {
    this.dataSearch = new Object()
    this.dataSearch.statusId = enumData.StatusFilter.Active.value
    this.searchData()
  }

  async searchData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1
    }
    this.loading = true

    const where: any = {}
    if (this.dataSearch.code && this.dataSearch.code !== '') {
      const key = 'code'
      where[key] = this.dataSearch.code
    }
    if (this.dataSearch.name && this.dataSearch.name !== '') {
      const key = 'name'
      where[key] = this.dataSearch.name
    }
    if (this.dataSearch.statusId > 0) {
      const key = 'isDeleted'
      if (this.dataSearch.statusId === this.enumData.StatusFilter.Active.value) {
        where[key] = false
      }
      if (this.dataSearch.statusId === this.enumData.StatusFilter.InActive.value) {
        where[key] = true
      }
    }

    const dataSearch = {
      where,
      order: { createdAt: 'DESC' },
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.VENDOR.PAGINATION, dataSearch).then((data: any) => {
      if (data) {
        this.loading = false
        this.listOfData = data[0]
        this.total = data[1]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditVendorComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  viewCarDetail(data: any) {
    this.dialog
      .open(VendorDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  clickEdit(data: any) {
    this.dialog
      .open(AddOrEditVendorComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.VENDOR.DELETE, { id: data.id }).then((res: any) => {
      this.notifyService.hideloading()
      if (res) {
        this.notifyService.showSuccess('Cập nhật trạng thái thành công!')
        this.searchData()
      }
    })
  }
}
