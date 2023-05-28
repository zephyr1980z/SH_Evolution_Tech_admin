import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-list-location',
  templateUrl: './list-location.component.html',
})
export class ListLocationComponent implements OnInit {
  listOfData: any[] = []
  loading = false
  enumData = enumData

  typeLocation: string = ''

  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  dataSearch: any = {}

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService
  ) {}

  ngOnInit() {
    this.searchData()
  }

  async searchData(reset: boolean = false) {
    this.notifyService.showloading()
    if (reset) {
      this.pageIndex = 1
    }

    const where: any = {}
    this.loading = false

    if (this.data.cityId) {
      this.typeLocation = 'TỈNH - THÀNH PHỐ'
      where.cityId = this.data.cityId
    }

    if (this.data.districtId) {
      this.typeLocation = 'QUẬN HUYỆN'
      where.districtId = this.data.districtId
    }

    if (this.data.wardId) {
      this.typeLocation = 'PHƯỜNG XÃ'
      where.wardId = this.data.wardId
    }

    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }

    this.apiService.post(this.apiService.LOCATION.PAGINATION, dataSearch).then((data) => {
      this.notifyService.hideloading()
      this.loading = false
      if (data) {
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }
}
