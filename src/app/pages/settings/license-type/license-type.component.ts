import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { AddOrEditLicenseTypeComponent } from './add-or-edit-license-type/add-or-edit-license-type.component'

@Component({
  selector: 'app-license-type',
  templateUrl: './license-type.component.html',
})
export class LicenseTypeComponent implements OnInit {
  listOfData: any[] = []
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  loading = true
  dataSearch: any = {}
  currentUser: User | any
  enumRole = enumData.Role.Type_Driver_License

  constructor(
    private dialog: MatDialog,
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
  }

  ngOnInit() {
    this.searchData()
  }

  async searchData(reset: boolean = false) {
    this.notifyService.showloading()
    if (reset) {
      this.pageIndex = 1
    }

    const where: any = {}
    let key = ''

    if (this.dataSearch.statusId > 0) {
      let key = 'isDeleted'
      if (this.dataSearch.statusId === enumData.StatusFilter.Active.value) {
        where[key] = false
      }
      if (this.dataSearch.statusId === enumData.StatusFilter.InActive.value) {
        where[key] = true
      }
    }

    if (this.dataSearch.name && this.dataSearch.name !== '') {
      key = 'name'
      where[key] = this.dataSearch.name
    }

    if (this.dataSearch.code && this.dataSearch.code !== '') {
      key = 'code'
      where[key] = this.dataSearch.code
    }

    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }

    this.apiService.post(this.apiService.LICENSE_TYPE.PAGINATION, dataSearch).then((data: any) => {
      this.notifyService.hideloading()
      this.loading = false
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditLicenseTypeComponent, { disableClose: false })
      .afterClosed()
      .subscribe((flag: any) => {
        if (flag) this.searchData()
      })
  }

  clickEdit(data: any) {
    this.dialog
      .open(AddOrEditLicenseTypeComponent, { disableClose: false, data: data })
      .afterClosed()
      .subscribe((flag: any) => {
        if (flag) this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.LICENSE_TYPE.DELETE, { id: data.id }).then((res: any) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }
}
