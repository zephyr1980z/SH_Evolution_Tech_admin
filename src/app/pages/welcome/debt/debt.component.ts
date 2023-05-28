import { Component, NgZone, OnInit, ViewChild } from '@angular/core'
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import am4themes_kelly from '@amcharts/amcharts4/themes/kelly'
import am4themes_animated from '@amcharts/amcharts4/themes/animated'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import * as moment from 'moment'

am4core.useTheme(am4themes_kelly)
am4core.useTheme(am4themes_animated)
@Component({
  selector: 'app-debt',
  templateUrl: './debt.component.html',
  styleUrls: ['./debt.component.scss'],
})
export class DebtComponent implements OnInit {
  dataObject: any = {}
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  loading = true
  dataSearch: any = {}
  currentUser: User = new User()
  lstCustomer: any = []
  monthFormat = 'yyyy/MM'
  @ViewChild('chartXYContract', { static: true }) chartXYContract: any
  private chart: any
  dataObjectContType: any = {}
  dataObjectOpsTrip: any = {}
  yearFilter = new Date()
  yearFormat = 'yyyy'
  customerId: any
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService,
    private ngZone: NgZone
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
  }

  ngOnDestroy() {
    let self = this
    this.ngZone.runOutsideAngular(() => {
      if (self.chart) {
        self.chart.dispose()
      }
    })
  }

  ngAfterViewInit(): void {
    this.searchData()
    this.loadCustomer()
    this.loadDataDebt()
  }

  ngOnInit() {
    let date = new Date()
    let days = new Date(date.getFullYear(), date.getMonth(), 1)
    this.dataSearch.dateFrom = days
    this.dataSearch.dateTo = date
  }

  loadCustomer() {
    this.apiService.post(this.apiService.CUSTOMER.FIND, { isDeleted: false }).then((res) => {
      if (res) {
        this.lstCustomer = res
      }
    })
  }

  async searchData(reset: boolean = false) {
    this.notifyService.showloading()
    if (reset) {
      this.pageIndex = 1
    }

    let dateFrom = this.dataSearch.dateFrom
    let dateTo = this.dataSearch.dateTo

    if (!dateFrom || !dateTo) {
      this.notifyService.showError('Vui lòng chọn ngày để thực hiện chức năng')
      return
    }

    if (moment(dateFrom).format('YYYY-MM-DD') > moment(dateTo).format('YYYY-MM-DD')) {
      this.notifyService.showError('Từ ngày phải sớm hơn đến ngày')
      return
    }

    const where = { ...this.dataSearch }
    await this.coreService.filterDataSearch(where)
    const dataSearch = {
      where,
      skip: 0,
      take: enumData.Page.pageSizeMax,
    }
    Promise.all([this.apiService.post(this.apiService.DASHBOARD.LOAD_DEBT, dataSearch)]).then(async (res) => {
      this.notifyService.hideloading()
      this.dataObject = res[0]
    })
  }

  loadDataDebt() {
    Promise.all([
      this.apiService.post(this.apiService.DASHBOARD.LOAD_DEBT_YEAR, {
        year: this.yearFilter.getFullYear(),
        customerId: this.customerId,
      }),
    ]).then(async (res) => {
      this.loadChartXYContract(res[0])
    })
  }

  loadChartXYContract(object: any) {
    this.ngZone.runOutsideAngular(() => {
      let chart = am4core.create(this.chartXYContract.nativeElement, am4charts.XYChart)
      let data: any = []
      object.forEach((item: any) => {
        data.push({
          MONTH: item.month,
          Cuoc: item.feeInvoice,
          ThuHo: item.pobCollect,
        })
      })
      chart.data = data

      // Create axes
      var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis())
      categoryAxis.dataFields.category = 'MONTH'
      categoryAxis.renderer.minGridDistance = 10
      categoryAxis.renderer.cellStartLocation = 0.1
      categoryAxis.renderer.cellEndLocation = 0.9
      categoryAxis.renderer.grid.template.location = 0

      chart.legend = new am4charts.Legend()
      chart.legend.position = 'bottom'

      let yAxis = chart.yAxes.push(new am4charts.ValueAxis())
      yAxis.min = 0
      this.createSeries('Cuoc', 'Cước', chart)
      this.createSeries('ThuHo', 'Thu Hộ', chart)
    })
  }

  createSeries(field: string, name: string, chart: any) {
    let series = chart.series.push(new am4charts.ColumnSeries())
    series.dataFields.valueY = field
    series.dataFields.categoryX = 'MONTH'
    series.name = name
    series.columns.template.tooltipText = '{name}: [bold]{valueY}[/]'
    series.columns.pixelHeight = 100

    let labelBullet = series.bullets.push(new am4charts.LabelBullet())
    labelBullet.label.verticalCenter = 'bottom'
    labelBullet.label.dy = -3
    labelBullet.label.text = '[font-size:10px]{valueY}'

    chart.zoomOutButton.disabled = false
    return series
  }
}
