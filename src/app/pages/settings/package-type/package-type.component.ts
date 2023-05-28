import { Component, OnInit } from '@angular/core'
import { NotifyService } from '../../../services/notify.service'
import { ApiService } from '../../../services/api.service'
import { enumData } from '../../../core/enumData'
import { MatDialog } from '@angular/material/dialog'
import { CoreService } from '../../../services/core.service'
import { User } from '../../../models/user.model'
import { AuthenticationService } from '../../../services/authentication.service'
import { AddOrEditPackageTypeModelComponent } from './add-or-edit-package-type-model/add-or-edit-package-type-model.component'
import { PackageTypeDetailComponent } from './package-type-detail/package-type-detail.component'

@Component({
  selector: 'app-package-type',
  templateUrl: './package-type.component.html',
})
export class PackageTypeComponent implements OnInit {
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
  dataCONT_TYPEs = []
  enumData = enumData
  checkTemplete = false
  dataEmployees: any = []
  dataObject: any
  lstContType: any = []
  packageTypeChoosing: any
  listContTypeModalTitle: string = ''
  isChooseAll = false
  isShowListContType = false
  isLoadContType = false
  enumRole = enumData.Role.Setting_Package_Type

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
    this.loadContType()
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
    this.apiService.post(this.apiService.PACKAGE_TYPE.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
        for (const item of this.listOfData) {
          item.numContType = item.listContTypeId.split(',').filter((c: any) => !!c).length
        }
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditPackageTypeModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditPackageTypeModelComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickDetail(data: any) {
    this.dialog
      .open(PackageTypeDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.PACKAGE_TYPE.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  async viewContTypes(data: any) {
    this.packageTypeChoosing = data
    this.listContTypeModalTitle = `Danh sách loại Container của ${data.name}`
    // nếu chưa load Plant thì load lần đầu
    if (!this.isLoadContType) {
      await this.loadContType()
    }
    // chọn các công ty đc phân cho nhân viên
    for (const contType of this.lstContType) {
      contType.isChoose = data.listContTypeId.includes(contType.id)
    }
    this.isChooseAll = data.numContType === this.lstContType.length

    // mở modal
    this.isShowListContType = true
  }

  async isChangeChooseAllContType() {
    for (const contType of this.lstContType) {
      contType.isChoose = this.isChooseAll
    }
  }

  async loadContType() {
    this.apiService.post(this.apiService.CONT_TYPE.FIND, { isDeleted: false }).then((res) => {
      if (res) this.lstContType = res
      this.isLoadContType = true
    })
  }

  savePackageContType() {
    this.notifyService.showloading()
    const lstContTypeId = this.lstContType.filter((c: any) => c.isChoose).map((c: any) => c.id)
    const listContTypeId = lstContTypeId.join()
    // gọi api lưu lại
    this.apiService
      .post(this.apiService.PACKAGE_TYPE.UPDATE_CONT_TYPE, { id: this.packageTypeChoosing.id, listContTypeId })
      .then((res) => {
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.notifyService.hideloading()
        this.packageTypeChoosing.listContTypeId = listContTypeId
        this.packageTypeChoosing.numContType = lstContTypeId.length

        // đóng modal
        this.isShowListContType = false
      })
  }

  // async loadEmployeeByCONT_TYPE(CONT_TYPEId: any) {
  //   this.notifyService.showloading()
  //   await this.apiService
  //     .post(this.apiService.EMPLOYEE.FIND, { where: { isDeleted: false, CONT_TYPEId: CONT_TYPEId } })
  //     .then((result) => {
  //       this.notifyService.hideloading()
  //       this.dataEmployees = result
  //     })
  // }

  // async viewEmployees(data: any) {
  //   this.dialog
  //     .open(CONT_TYPEEmployeesModelComponent, { disableClose: false, data: data })
  //     .afterClosed()
  //     .subscribe((data) => {
  //       this.searchData()
  //     })
  // }
}
