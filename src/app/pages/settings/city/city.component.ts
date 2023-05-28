import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { ApiService } from '../../../services/api.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { DistrictListComponent } from '../district/district-list/district-list.component'
import { ListLocationComponent } from '../location/list-location/list-location.component'
@Component({
  selector: 'app-city',
  templateUrl: './city.component.html',
})
export class CityComponent implements OnInit {
  listOfData: any[] = []
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
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

    if (this.dataSearch.region && this.dataSearch.region !== '') {
      where.region = this.dataSearch.region
    }

    if (this.dataSearch.area && this.dataSearch.area !== '') {
      where.area = this.dataSearch.area
    }

    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }

    this.apiService.post(this.apiService.CITY.PAGINATION, dataSearch).then((data) => {
      this.notifyService.hideloading()
      this.loading = false
      if (data) {
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  viewDistrict(data: any) {
    this.dialog.open(DistrictListComponent, { disableClose: false, data: data })
  }

  viewLocationList(data: any) {
    this.dialog.open(ListLocationComponent, { disableClose: false, data: { ...data, cityId: data.id } })
  }
}
