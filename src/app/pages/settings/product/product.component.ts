import { Component, OnInit } from '@angular/core'
import { NotifyService } from '../../../services/notify.service'
import { ApiService } from '../../../services/api.service'
import { enumData } from '../../../core/enumData'
import { MatDialog } from '@angular/material/dialog'
import { CoreService } from '../../../services/core.service'
import { User } from '../../../models/user.model'
import { AuthenticationService } from '../../../services/authentication.service'
import { AddOrEditProductModelComponent } from './add-or-edit-product-model/add-or-edit-product-model.component'
import { ProductDetailComponent } from './group-detail/product-detail.component'

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
})
export class ProductComponent implements OnInit {
  // modalTitle = enumData.Constants.Model_Add
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  loading = true
  currentUser: User | any
  isVisible = false
  enumData = enumData
  dataObject: any
  lstOfGroupProduct: any = []
  lstOfPackageType: any = []
  enumRole = enumData.Role.Setting_Product

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
  }

  ngOnInit(): void {
    this.dataSearch = new Object()
    this.dataObject = new Object()
    this.dataSearch.statusId = enumData.StatusFilter.All.value
    this.loadAllData()
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
    if (this.dataSearch.groupProductId && this.dataSearch.groupProductId !== '') {
      const key = 'groupProductId'
      where[key] = this.dataSearch.groupProductId
    }
    if (this.dataSearch.packageTypeId && this.dataSearch.packageTypeId !== '') {
      const key = 'packageTypeId'
      where[key] = this.dataSearch.packageTypeId
    }
    if (this.dataSearch.statusId > 0) {
      const key = 'isDeleted'
      if (this.dataSearch.statusId === enumData.StatusFilter.Active.value) {
        where[key] = false
      }
      if (this.dataSearch.statusId === enumData.StatusFilter.InActive.value) {
        where[key] = true
      }
    }
    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.PRODUCT.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditProductModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditProductModelComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickDetail(data: any) {
    this.dialog
      .open(ProductDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  async loadAllData() {
    Promise.all([
      this.apiService.post(this.apiService.GROUP_PRODUCT.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.PACKAGE_TYPE.FIND, { isDeleted: false }),
    ]).then(async (res) => {
      if (res) {
        this.lstOfGroupProduct = res[0] || []
        this.lstOfPackageType = res[1] || []
      }
    })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.PRODUCT.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess('Cập nhật trạng thái hàng hóa thành công!')
      this.notifyService.hideloading()
      this.searchData()
    })
  }
}
