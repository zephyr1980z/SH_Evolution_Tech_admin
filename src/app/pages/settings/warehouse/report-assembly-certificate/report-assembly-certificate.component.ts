import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'
// @ts-ignore
import * as XLSX from 'xlsx'
import * as moment from 'moment'

@Component({
  selector: 'app-report-assembly-certificate',
  templateUrl: './report-assembly-certificate.component.html',
})
export class ReportAssemblyCertificateComponent implements OnInit {
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
  lstStatus = this.coreService.convertObjToArray(enumData.AssemblyCertificate)
  listFilter: any = []
  dataQuarterly: any = []
  dataObject: any
  enumRole = enumData.Role.Setting_Assembly_Certificate_Report

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
    if (this.dataSearch.status && this.dataSearch.status !== '') {
      key = 'status'
      where[key] = this.dataSearch.status
    }
    if (this.dataSearch.itemCode && this.dataSearch.itemCode !== '') {
      key = 'itemCode'
      where[key] = this.dataSearch.itemCode
    }
    if (this.dataSearch.importDate && this.dataSearch.importDate !== '') {
      key = 'importDate'
      where[key] = this.dataSearch.importDate
    }

    if (this.dataSearch.quarterly && this.dataSearch.quarterly !== '') {
      key = 'quarterly'
      where[key] = this.dataSearch.quarterly
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

    if (this.dataSearch.type === this.enumQuarterly) {
      if (this.dataSearch.quarterlyId == undefined || this.dataSearch.quarterlyId == '') {
        this.notifyService.showError('Vui lòng chọn quý ')
        return
      }
      if (this.dataSearch.quarterly == undefined || this.dataSearch.quarterly == '') {
        this.notifyService.showError('Vui lòng chọn năm ')
        return
      }
    }

    const dataSearch = {
      where,
      order: { createdAt: 'DESC' },
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.ASSEMBLY_CERTIFICATE.FIND_AS_FOR_REPORT, dataSearch).then((data: any) => {
      if (data) {
        this.listOfData = data[0]
        this.total = data[1]
        this.loading = false
      }
    })
  }
  /** EXCEL */
  async onDownloadExcel() {
    let date = new Date().toISOString()
    const fileName = 'Bao_Cao_Lap_Rap_May' + date + '.xlsx'
    let dataExcel: any = []
    this.listOfData.forEach((i: any) => {
      dataExcel.push({
        'Mã đơn xuất': i.obCode,
        'Mã phụ tùng': i.itemCode,
        'Tên phụ tùng': i.itemName,
        'Mã lô nhập': i.ibDetailCode,
        'Sl xuất trong kỳ': i.quantity,
        'Ngày xuất': i?.exportDate ? moment(i.exportDate).format('YYYY-MM-DD') : '',
        'Trạng thái đơn xuất': this.coreService.getEnumElementName(enumData.OutBoundStatus, i.obStatus),
      })
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Báo cáo lắp ráp máy')
    XLSX.writeFile(wb, fileName)
  }

  onChangeFilter(event: any) {
    this.dataSearch.type = event
  }
  onChangeQuarterly(result: any) {
    this.dataSearch.quarterly = result
  }
}
