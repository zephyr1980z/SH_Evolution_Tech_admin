import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { ApiService } from '../../../services/api.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { ListLocationComponent } from '../location/list-location/list-location.component'
import { WardListComponent } from '../ward/ward-list/ward-list.component'

@Component({
  selector: 'app-district',
  templateUrl: './district.component.html',
})
export class DistrictComponent implements OnInit {
  listOfData: any[] = []
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  dataCity: any[] = []
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  loading = true
  dataSearch: any = {}
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialog: MatDialog,
    public coreService: CoreService
  ) {}

  ngOnInit() {
    this.loadDataSearch()
    this.searchData()
  }

  async searchData(reset: boolean = false) {
    this.notifyService.showloading()
    if (reset) {
      this.pageIndex = 1
    }

    const where: any = {}

    if (this.dataSearch.name && this.dataSearch.name !== '') {
      where.name = this.dataSearch.name
    }

    if (this.dataSearch.code && this.dataSearch.code !== '') {
      where.code = this.dataSearch.code
    }

    if (this.dataSearch.cityId && this.dataSearch.cityId !== '') {
      where.cityId = this.dataSearch.cityId
    }

    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }

    this.apiService.post(this.apiService.DISTRICT.PAGINATION, dataSearch).then((data) => {
      this.notifyService.hideloading()
      this.loading = false
      if (data) {
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }
  loadDataSearch() {
    Promise.all([this.apiService.post(this.apiService.CITY.FIND, {})]).then(async (res) => {
      this.dataCity = res[0] || []
    })
  }

  viewWard(data: any) {
    this.dialog.open(WardListComponent, { disableClose: false, data: data })
  }

  viewLocationList(data: any) {
    this.dialog.open(ListLocationComponent, { disableClose: false, data: { ...data, districtId: data.id } })
  }
}
