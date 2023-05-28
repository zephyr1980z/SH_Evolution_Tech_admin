import { Component, OnInit } from '@angular/core'
import { NotifyService } from '../../../services/notify.service'
import { ApiService } from '../../../services/api.service'
import { enumData } from '../../../core/enumData'
import { MatDialog } from '@angular/material/dialog'
import { CoreService } from '../../../services/core.service'
import { User } from '../../../models/user.model'
import { AuthenticationService } from '../../../services/authentication.service'
import { AddOrEditGroupProductModelComponent } from './add-or-edit-group-product-model/add-or-edit-group-product-model.component'
import { GroupProductDetailComponent } from './group-product-detail/group-product-detail.component'

@Component({
  selector: 'app-group-product',
  templateUrl: './group-product.component.html',
})
export class GroupProductComponent implements OnInit {
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
  enumRole = enumData.Role.Setting_Group_Product
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
    this.apiService.post(this.apiService.GROUP_PRODUCT.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditGroupProductModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditGroupProductModelComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickDetail(data: any) {
    this.dialog
      .open(GroupProductDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.GROUP_PRODUCT.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess('Cập nhật trạng thái nhóm hàng thành công!')
      this.notifyService.hideloading()
      this.searchData()
    })
  }
}
