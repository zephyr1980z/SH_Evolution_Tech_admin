import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'
import { AddOrEditOilMonitoringModelComponent } from './add-or-edit-oil-monitoring-model/add-or-edit-oil-monitoring-model.component'
import { OilMonitoringDetailComponent } from './oil-monitoring-detail/oil-monitoring-detail.component'
import * as XLSX from 'xlsx'
import * as moment from 'moment'
import { Workbook } from 'exceljs'
const fs = require('file-saver')

@Component({
  selector: 'app-oil-monitoring',
  templateUrl: './oil-monitoring.component.html',
  styleUrls: ['./oil-monitoring.component.scss'],
})
export class OilMonitoringComponent implements OnInit {
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  loading = true
  currentUser: User | any
  enumData = enumData
  dataObject: any
  enumRole = enumData.Role.Setting_Container_Type
  dataUploadExcel: any[] = []

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
    this.searchData()
  }

  async filterDataSearch() {
    const where: any = {}
    if (this.dataSearch.code && this.dataSearch.code !== '') {
      const key = 'code'
      where[key] = this.dataSearch.code
    }
    if (this.dataSearch.name && this.dataSearch.name !== '') {
      const key = 'name'
      where[key] = this.dataSearch.name
    }
    return where
  }

  async searchData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1
    }
    this.loading = true

    let where = await this.filterDataSearch()
    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.OIL_MONITORING.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data
      }
    })
  }

  viewDetail(object: any) {
    this.dialog
      .open(OilMonitoringDetailComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe(() => {
        this.searchData()
      })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditOilMonitoringModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditOilMonitoringModelComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe(() => {
        this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.OIL_MONITORING.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  onDownloadTemplate() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_Import_Theo_Doi_Dau_' + date + '.xlsx'
    dataExcel.push({
      'Mã Đầu Kéo': '',
      'Ngày Đổ Dầu': '',
      'Số Lượng Dầu': '',
      'Số Tiền': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()

    ws['!cols'] = [{ width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }]

    XLSX.utils.book_append_sheet(wb, ws, 'Template Nhập Theo Dõi Dầu')
    XLSX.writeFile(wb, fileName)
  }

  async clickImportExcel(event: any) {
    this.notifyService.showloading()
    let workBook = null
    let jsonData: any = null
    this.dataUploadExcel = []
    const reader = new FileReader()
    const file = event.target.files[0]
    reader.readAsBinaryString(file)
    reader.onload = () => {
      workBook = XLSX.read(reader.result, { type: 'binary' })
      jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]], {
        raw: true,
        defval: null,
        header: ['vehicleCode', 'oilingDate', 'quantity', 'money'],
      })
      // fix lỗi k import 2 lần đc
      ;(<HTMLInputElement>document.getElementById('file')).value = ''

      // bỏ dòng merge
      jsonData.shift()
      // bỏ dòng header
      let isErr = false
      let strErr = ''

      const inputData: any = {}
      inputData.lstData = []
      const res: any[] = jsonData
      //** */
      for (const row of jsonData) {
        let idx = jsonData.indexOf(row) + 2
        if (row.vehicleCode == null || (typeof row.vehicleCode === 'string' && row.vehicleCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã Đầu Kéo Không Được Để Trống <br>'
        }
        if (row.oilingDate) {
          let oilingDate = moment(row.oilingDate, 'DD/MM/YYYY', true)
          if (!oilingDate.isValid()) {
            strErr += 'Dòng ' + idx + ' - Ngày Đổ Dầu không đúng định dạng. Vui lòng kiểm tra lại <br>'
          } else {
            row.oilingDate = oilingDate.toDate()
          }
        }
        if (row.quantity == null || (typeof row.quantity === 'string' && row.quantity.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Số Lượng Dầu Không Được Để Trống <br>'
        }
        if (row.money == null || (typeof row.money === 'string' && row.money.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Số Tiền Đổ Dầu Không Được Để Trống <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.OIL_MONITORING.IMPORT_EXCEL, jsonData).then((result) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess('Thêm Mới File Excel Thành Công')
        this.searchData()
        this.dataUploadExcel = []
      })
    }
  }

  async onDownloadExcel() {
    this.loading = true
    this.notifyService.showloading()
    let lstVehicle = []
    let lstDriver = []

    let where = await this.filterDataSearch()
    const dataSearch = {
      where,
      skip: 0,
      take: 100000,
    }
    this.loading = true
    Promise.all([
      this.apiService.post(this.apiService.VEHICLE.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.DRIVER.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.OIL_MONITORING.EXPORT_EXCEL, dataSearch),
    ]).then((res: any) => {
      if (res) {
        lstVehicle = res[0]
        lstDriver = res[1]
        this.loading = false
        this.notifyService.hideloading()
        const workbook = new Workbook()
        const worksheet = workbook.addWorksheet('Theo dõi dầu của đầu kéo')

        //#region Body Table
        const header = [
          'Mã phương tiện',
          'Biển số phương tiện',
          'Tài xế',
          'Ngày đổ dầu gần nhất',
          'Số lượng đổ dầu gần nhất (lít)',
          'Số tiền đổ dầu gần nhất (VND)',
        ]
        const headerRow = worksheet.addRow(header)

        // Cell Style : Fill and Border
        headerRow.eachCell((cell, colNumber) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '203751' },
            bgColor: { argb: '203751' },
          }
          cell.alignment = { horizontal: 'center' }
          cell.font = { bold: true }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }

          switch (colNumber) {
            case 1:
              worksheet.getColumn(colNumber).width = 20
              break
            case 2:
              worksheet.getColumn(colNumber).width = 22
              break
            case 3:
              worksheet.getColumn(colNumber).width = 22
              break
            case 4:
              worksheet.getColumn(colNumber).width = 22
              break
            case 5:
              worksheet.getColumn(colNumber).width = 25
              worksheet.getColumn(colNumber).numFmt = '#,##0;[Red]-#,##0'
              break
            case 6:
              worksheet.getColumn(colNumber).width = 22
              worksheet.getColumn(colNumber).numFmt = '#,##0;[Red]-#,##0'
              break
            default:
              worksheet.getColumn(colNumber).width = 15
              worksheet.getColumn(colNumber).numFmt = '#,##0;[Red]-#,##0'
              break
          }
        })
        // Add Data and Conditional Formatting
        for (let data of res[2]) {
          let vehicle = lstVehicle.find((s: any) => s.id == data.vehicleId)
          let driver = lstDriver.find((s: any) => s.id == vehicle.driverId)
          const rowData = [
            vehicle.code || '',
            vehicle.regNo || '',
            driver.name || '',
            moment(data.oilingDate).format('DD/MM/YYYY') || '',
            data.quantity || 0,
            data.money || 0,
          ]
          const row = worksheet.addRow(rowData)
          row.eachCell((cell, colNumber) => {
            cell.font = { bold: true }
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            }
          })
          worksheet.getCell(`A${row.number}`).alignment = { horizontal: 'left' }
        }

        //#endregion

        //#region Save File
        workbook.xlsx.writeBuffer().then((data: any) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          let date = new Date().toISOString()
          const fileName = `THEO_DOI_DAU_CUA_DAU_KEO_${date}.xlsx`
          fs.saveAs(blob, fileName)
          this.notifyService.hideloading()
        })
        //#endregion
      }
    })
  }
}
