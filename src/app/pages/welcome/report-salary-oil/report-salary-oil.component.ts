import { Component, OnInit } from '@angular/core'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'

@Component({
  selector: 'app-report-salary-oil',
  templateUrl: './report-salary-oil.component.html',
  styleUrls: ['./report-salary-oil.component.scss'],
})
export class ReportSalaryOilComponent implements OnInit {
  dataObject: any = {}
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  loading = true
  dataSearch: any = {}
  currentUser: User = new User()
  dataObjectCost: any = {}

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
  }

  ngOnInit() {
    this.dataSearch.date = Date()
    this.searchData()
  }

  async searchData(reset: boolean = false) {
    this.notifyService.showloading()
    if (reset) {
      this.pageIndex = 1
    }
    if (!this.dataSearch.date) return this.notifyService.showError('Vui lòng chọn tháng')

    const where = { ...this.dataSearch }
    await this.coreService.filterDataSearch(where)
    const dataSearch = {
      where,
      skip: 0,
      take: enumData.Page.pageSizeMax,
    }
    Promise.all([
      this.apiService.post(this.apiService.DASHBOARD.LOAD_SALARY_OIL, dataSearch),
      this.apiService.post(this.apiService.DASHBOARD.LOAD_COST, dataSearch),
    ]).then(async (res) => {
      this.notifyService.hideloading()
      this.dataObject = res[0]
      this.dataObjectCost = res[1]
    })
  }
}
