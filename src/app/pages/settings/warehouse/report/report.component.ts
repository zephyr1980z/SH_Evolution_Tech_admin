import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'
import { ReportDetailComponent } from './report-detail/report-detail.component'
// @ts-ignore
import * as XLSX from 'xlsx'
import * as moment from 'moment'

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
})
export class ReportComponent implements OnInit {
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any
  loading = true
  currentUser: User | any
  enumData = enumData
  enumYear = enumData.DatetimeFilter.Year.code
  enumMonth = enumData.DatetimeFilter.Month.code
  enumQuarterly = enumData.DatetimeFilter.Quarterly.code
  listFilter: any = []
  dataQuarterly: any = []
  dataObject: any
  enumRole = enumData.Role.Setting_Report

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
    this.dataSearch.type = enumData.DatetimeFilter.Month.code
    this.dataSearch.statusId = enumData.StatusFilter.All.value
    this.listFilter = this.coreService.convertObjToArray(enumData.DatetimeFilter)
    this.dataQuarterly = this.coreService.convertObjToArray(enumData.DatetimeQuarterly)
    this.searchData()
  }

  async searchData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1
    }
    this.loading = true
    const where: any = {}
    let key = ''
    if (this.dataSearch.code && this.dataSearch.code !== '') {
      key = 'code'
      where[key] = this.dataSearch.code
    }
    if (this.dataSearch.name && this.dataSearch.name !== '') {
      key = 'name'
      where[key] = this.dataSearch.name
    }
    if (this.dataSearch.exportDate && this.dataSearch.exportDate !== '') {
      key = 'exportDate'
      where[key] = this.dataSearch.exportDate
    }

    if (this.dataSearch.quarterly && this.dataSearch.quarterly !== '') {
      key = 'quarterly'
      where[key] = this.dataSearch.quarterly
    }

    if (this.dataSearch.type === this.enumQuarterly) {
      if (this.dataSearch.quarterlyId === undefined) {
        this.notifyService.showError('Vui lòng chọn quý ')
        return
      }
    }

    if (this.dataSearch.quarterlyId && this.dataSearch.quarterlyId !== '') {
      key = 'quarterlyId'
      where[key] = this.dataSearch.quarterlyId
    }

    if (this.dataSearch.type && this.dataSearch.type !== '') {
      key = 'type'
      where[key] = this.dataSearch.type
    }

    if (this.dataSearch.dateFrom && this.dataSearch.dateFrom !== '') {
      key = 'month'
      where[key] = this.dataSearch.dateFrom
    }

    const dataSearch = {
      where,
      order: { createdAt: 'DESC' },
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.REPORT.PAGINATION, dataSearch).then((data: any) => {
      if (data) {
        this.listOfData = data[0]
        this.total = data[1]
        this.loading = false
      }
    })
  }

  clickDetail(data: any) {
    // this.dialog
    //   .open(ReportDetailComponent, { disableClose: false, data })
    //   .afterClosed()
    //   .subscribe((res) => {})
  }

  /** EXCEL */
  async onDownloadExcel() {
    // this.notifyService.showloading()
    // let where = await this.filterDataSearch()
    // const dataSearch = {
    //     where: where,
    //     order: { updatedAt: 'DESC' },
    //     skip: 0,
    //     take: enumData.Page.pageSizeMax,
    // }
    // this.loading = true
    // this.apiService.post(this.apiService.CONTRACT.PAGINATION, dataSearch).then((res: any) => {
    //    if (res) {
    //     this.loading = false
    //     this.notifyService.hideloading()
    //     if (res) {
    //       let date = new Date().toISOString()
    //       const fileName = 'Bao_Cao_' + date + '.xlsx'
    //       let dataExcel: any = []
    //       res[0].forEach((i: any) => {
    //         dataExcel.push({
    //           'Mã Phụ Tùng': '',
    //           'Tên Phụ Tùng': '',
    //           'Sl Đầu Kỳ':  '',
    //           'Sl Xuất Trong Kỳ': '',
    //           'Tồn Cuối Kỳ': '',
    //           'Tồn Còn Lại': '',
    //           'Đã Xuất': '',
    //           'Hạn Sử Dụng': '',
    //           'Giá Trị Xuất': '',
    //           'Giá Trị Tồn': '',
    //           })
    //         })
    //       const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    //       const wb: XLSX.WorkBook = XLSX.utils.book_new()
    //       ws['!cols'] = [
    //         { width: 30 },
    //         { width: 30 },
    //         { width: 30 },
    //         { width: 30 },
    //         { width: 30 },
    //         { width: 30 },
    //         { width: 30 },
    //         { width: 30 },
    //         { width: 30 },
    //         { width: 30 },
    //         ]
    //       XLSX.utils.book_append_sheet(wb, ws, 'Báo Cáo')
    //       XLSX.writeFile(wb, fileName)
    //     }
    //   }
    // })
  }

  onChangeFilter(event: any) {
    this.dataSearch.type = event
  }
  onChangeQuarterly(result: any) {
    this.dataSearch.quarterly = result
  }
}
