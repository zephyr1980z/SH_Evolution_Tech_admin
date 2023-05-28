import { Component, NgZone, OnInit, ViewChild } from '@angular/core'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import am4themes_kelly from '@amcharts/amcharts4/themes/kelly'
import am4themes_animated from '@amcharts/amcharts4/themes/animated'
import * as moment from 'moment'

am4core.useTheme(am4themes_kelly)
am4core.useTheme(am4themes_animated)
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
  dataObject: any = {}
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  loading = true
  dataSearch: any = {}
  currentUser: User = new User()
  lstCustomer: any = []
  monthFormat = 'yyyy/MM'
  @ViewChild('chartOrder', { static: true }) chartOrder: any
  @ViewChild('chartCont', { static: true }) chartCont: any
  @ViewChild('chartTrip', { static: true }) chartTrip: any
  @ViewChild('chartOrderStatus', { static: true }) chartOrderStatus: any

  private chart: any
  dataObjectContType: any = {}
  dataObjectOpsTrip: any = {}
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

  ngOnInit() {
    let date = new Date()
    let days = new Date(date.getFullYear(), date.getMonth(), 1)
    this.dataSearch.dateFrom = days
    this.dataSearch.dateTo = date
    this.searchData()
    this.loadCustomer()
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
    Promise.all([
      this.apiService.post(this.apiService.DASHBOARD.LOAD_ORDER, dataSearch),
      this.apiService.post(this.apiService.DASHBOARD.LOAD_ORDER_CONT, dataSearch),
      this.apiService.post(this.apiService.DASHBOARD.LOAD_OPS_TRIP, dataSearch),
    ]).then(async (res) => {
      this.notifyService.hideloading()
      this.dataObject = res[0]
      this.loadChartPie(res[0].lstOrderType, 'Order')
      this.loadChartPie(res[0].lstOrderStatus, 'OrderStatus')
      this.dataObjectContType = res[1]
      this.loadChartPie(res[1].lstContType, 'Cont')
      this.dataObjectOpsTrip = res[2]
      this.loadChartPie(res[2].lstTripContType, 'Trip')
    })
  }

  loadChartPie(object: any, type: any) {
    this.ngZone.runOutsideAngular(() => {
      let chart: any
      if (type === 'Order') {
        chart = am4core.create(this.chartOrder.nativeElement, am4charts.PieChart)
      } else if (type === 'Cont') {
        chart = am4core.create(this.chartCont.nativeElement, am4charts.PieChart)
      } else if (type === 'Trip') {
        chart = am4core.create(this.chartTrip.nativeElement, am4charts.PieChart)
      } else if (type === 'OrderStatus') {
        chart = am4core.create(this.chartOrderStatus.nativeElement, am4charts.PieChart)
      }
      let data: any = []
      if (type === 'Order') {
        object.forEach((item: any) => {
          data.push({ category: item.name, value: item.count, color: item.color })
        })
      } else if (type === 'Cont') {
        object.forEach((item: any) => {
          data.push({ category: item.name, value: item.count })
        })
      } else if (type === 'Trip') {
        object.forEach((item: any) => {
          data.push({ category: item.name, value: item.count, color: item.color })
        })
      } else if (type === 'OrderStatus') {
        object.forEach((item: any) => {
          data.push({ category: item.name, value: item.count, color: item.color })
        })
      }

      chart.data = data
      chart.legend = new am4charts.Legend()
      chart.legend.position = 'bottom'

      let pieSeries = chart.series.push(new am4charts.PieSeries())
      pieSeries.dataFields.value = 'value'
      pieSeries.dataFields.category = 'category'
      pieSeries.slices.template.stroke = am4core.color('#fff')
      pieSeries.slices.template.strokeOpacity = 1
      pieSeries.hiddenState.properties.opacity = 1
      pieSeries.hiddenState.properties.endAngle = -90
      pieSeries.hiddenState.properties.startAngle = -90
      pieSeries.slices.template.propertyFields.fill = 'color'
      pieSeries.labels.template.text = "{category}: [bold]{value.percent.formatNumber('#.#')}% ~ {value.value}"
      chart.hiddenState.properties.radius = am4core.percent(0)
    })
  }
}
