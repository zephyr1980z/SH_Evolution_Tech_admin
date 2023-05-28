import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { AddOrEditDistanceComponent } from './add-or-edit-distance/add-or-edit-distance.component'
import { DistanceDetailComponent } from './distance-detail/distance-detail.component'
import { Workbook } from 'exceljs'
import * as XLSX from 'xlsx'
import * as moment from 'moment'
const fs = require('file-saver')

@Component({
  selector: 'app-distance',
  templateUrl: './distance.component.html',
})
export class DistanceComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData: any
  modalTitle: any
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  dataLocationType = this.coreService.convertObjToArray(enumData.LocationType)
  listOfData: any = []
  dataCustomer: any[] = []
  dataSearch: any = {}
  loading = true
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total

  dataLocation: any[] = []
  enumRole = enumData.Role.Setting_Distance
  dataUploadExcel: any

  constructor(
    private notifyService: NotifyService,
    public coreService: CoreService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit(): void {
    this.dataSearch.statusId = enumData.StatusFilter.All.value
    this.loadDataSearch()
    this.dataSearch = new Object()
    this.searchData()
  }

  async filterDataSearch() {
    const where: any = {}
    // if (this.dataSearch.portId && this.dataSearch.portId !== '') {
    //   const key = 'portId'
    //   where[key] = this.dataSearch.portId
    // }
    if (this.dataSearch.typeFrom && this.dataSearch.typeFrom !== '') {
      const key = 'typeFrom'
      where[key] = this.dataSearch.typeFrom
    }
    if (this.dataSearch.typeTo && this.dataSearch.typeTo !== '') {
      const key = 'typeTo'
      where[key] = this.dataSearch.typeTo
    }
    if (this.dataSearch.toLocationId && this.dataSearch.toLocationId !== '') {
      const key = 'toLocationId'
      where[key] = this.dataSearch.toLocationId
    }
    if (this.dataSearch.fromLocationId && this.dataSearch.fromLocationId !== '') {
      const key = 'fromLocationId'
      where[key] = this.dataSearch.fromLocationId
    }
    if (this.dataSearch.distance && this.dataSearch.distance !== '') {
      const key = 'distance'
      where[key] = this.dataSearch.distance
    }
    if (this.dataSearch.statusId > 0) {
      const key = 'isDeleted'
      if (this.dataSearch.statusId === this.enumData.StatusFilter.Active.value) {
        where[key] = false
      }
      if (this.dataSearch.statusId === this.enumData.StatusFilter.InActive.value) {
        where[key] = true
      }
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
      order: { createdAt: 'DESC' },
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.DISTANCE.PAGINATION, dataSearch).then((data: any) => {
      if (data) {
        this.listOfData = data[0]
        this.total = data[1]
        this.loading = false
      }
    })
  }

  loadDataSearch() {
    Promise.all([this.apiService.post(this.apiService.LOCATION.FIND, { where: { isDeleted: false } })]).then(
      async (res) => {
        this.dataLocation = res[0] || []
      }
    )
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.DISTANCE.DELETE, { id: data.id }).then((res: any) => {
      this.notifyService.hideloading()
      if (res) {
        this.notifyService.showSuccess('Cập nhật trạng thái thành công!')
        this.searchData()
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditDistanceComponent, { disableClose: false })
      .afterClosed()
      .subscribe(() => {
        this.searchData()
      })
  }

  clickEdit(data: any) {
    this.dialog
      .open(AddOrEditDistanceComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  viewDetail(data: any) {
    this.dialog
      .open(DistanceDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  /** EXCEL */

  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    let dataExcel1: any = []
    const fileName = 'Template_Ds_Cu_Ly' + date + '.xlsx'
    dataExcel.push({
      'Loại Địa Điểm Đi (Depot,Parking,Stock,Port,Hub,Other)*': '',
      'Tên Địa Điểm Đi (fromLocationCode)*': '',
      'Loại Địa Điểm Đến (Depot,Parking,Stock,Port,Hub,Other)*': '',
      'Tên Địa Điểm Đến (toLocationCode)*': '',
      'Số Cự Ly (distance)*': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [{ width: 50 }, { width: 30 }, { width: 50 }, { width: 30 }, { width: 30 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Template DS Cự Ly')
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
        header: ['typeFromCode', 'fromLocationCode', 'typeToCode', 'toLocationCode', 'distance'],
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
        if (row.typeFromCode == null || (typeof row.typeFromCode === 'string' && row.typeFromCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Loại Địa Điểm Đi Không Được Để Trống <br>'
        }

        if (
          row.fromLocationCode == null ||
          (typeof row.fromLocationCode === 'string' && row.fromLocationCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Tên Địa Điểm Đi Không Được Để Trống <br>'
        }

        if (row.typeToCode == null || (typeof row.typeToCode === 'string' && row.typeToCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Loại Địa Điểm Đến Không Được Để Trống <br>'
        }

        if (
          row.toLocationCode == null ||
          (typeof row.toLocationCode === 'string' && row.toLocationCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Tên Địa Điểm Đến Không Được Để Trống <br>'
        }
        if (row.distance == null || (typeof row.distance === 'string' && row.distance.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Cự Ly Đến Không Được Để Trống <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.DISTANCE.IMPORT_EXCEL, jsonData).then((result) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess('Thêm Mới File Excel Thành Công')
        this.searchData()
        this.dataUploadExcel = []
      })
    }
  }

  async onDownloadExcel() {
    this.notifyService.showloading()

    let where = await this.filterDataSearch()
    const dataSearch = {
      where: where,
      order: { updatedAt: 'DESC' },
      skip: 0,
      take: enumData.Page.pageSizeMax,
    }
    this.loading = true
    this.apiService.post(this.apiService.DISTANCE.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Cu_Ly' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((i: any) => {
            dataExcel.push({
              'Loại Địa Điểm Đi': i.typeNameFrom,
              'Tên Địa Điểm Đi': i.fromLocationName,
              'Loại Địa Điểm Đến': i.typeNameTo,
              'Tên Địa Điểm Đến': i.toLocationName,
              'Số Cự Ly (KM)': i.distance,
            })
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          const wb: XLSX.WorkBook = XLSX.utils.book_new()
          ws['!cols'] = [{ width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 20 }]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Cự Ly')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }

  async onDownload() {
    this.loading = true
    this.notifyService.showloading()

    let where = await this.filterDataSearch()
    const dataSearch = {
      where,
      skip: 0,
      take: 100000,
    }
    this.loading = true
    this.apiService.post(this.apiService.DISTANCE.EXPORT_EXCEL, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        const lstData = res[0]

        const workbook = new Workbook()
        const worksheet = workbook.addWorksheet('Template_Cu_Ly')
        const worksheet1 = workbook.addWorksheet('Danh Sách Địa Điểm')

        //#region Body Table
        const header = [
          'Loại địa điểm đi (typeFrom)',
          'Tên dịa điểm đi (fromLocationCode)',
          'Loại địa điểm đến (typeTo)',
          'Tên địa điểm dến (toLocationCode)',
          'Số cự ly (distance)',
        ]
        const headerRow = worksheet.addRow(header)
        // Cell Style : Fill and Border
        headerRow.eachCell((cell, colNumber) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '228cdc' },
            bgColor: { argb: '228cdc' },
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
              worksheet.getColumn(colNumber).width = 25
              break
            case 2:
              worksheet.getColumn(colNumber).width = 25
              break
            case 3:
              worksheet.getColumn(colNumber).width = 25
              break
            case 4:
              worksheet.getColumn(colNumber).width = 25
              break
            case 5:
              worksheet.getColumn(colNumber).width = 25
              worksheet.getColumn(colNumber).numFmt = '#,##0;[Red]-#,##0'
              break
            case 6:
              worksheet.getColumn(colNumber).width = 25
              worksheet.getColumn(colNumber).numFmt = '#,##0;[Red]-#,##0'
              break
            default:
              worksheet.getColumn(colNumber).width = 25
              worksheet.getColumn(colNumber).numFmt = '#,##0;[Red]-#,##0'
              break
          }
        })

        //#region Body Table
        const header1 = ['Mã địa điểm', 'Tên địa điểm', 'Loại địa điểm', 'Tên loại địa điểm', 'Khu vực']
        const headerRow1 = worksheet1.addRow(header1)

        // Cell Style : Fill and Border
        headerRow1.eachCell((cell, colNumber) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '228cdc' },
            bgColor: { argb: '228cdc' },
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
              worksheet1.getColumn(colNumber).width = 20
              break
            case 2:
              worksheet1.getColumn(colNumber).width = 22
              break
            case 3:
              worksheet1.getColumn(colNumber).width = 22
              break
            case 4:
              worksheet1.getColumn(colNumber).width = 22
              break
            case 5:
              worksheet1.getColumn(colNumber).width = 25
              worksheet1.getColumn(colNumber).numFmt = '#,##0;[Red]-#,##0'
              break
            case 6:
              worksheet1.getColumn(colNumber).width = 22
              worksheet1.getColumn(colNumber).numFmt = '#,##0;[Red]-#,##0'
              break
            default:
              worksheet1.getColumn(colNumber).width = 15
              worksheet1.getColumn(colNumber).numFmt = '#,##0;[Red]-#,##0'
              break
          }
        })
        // Add Data and Conditional Formatting
        for (let data of lstData) {
          const rowData1 = [
            data.code || '',
            data.name || '',
            data.type || '',
            data.typeName || '',
            data.__area__?.name || '',
          ]

          const row1 = worksheet1.addRow(rowData1)
          row1.eachCell((cell, colNumber) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            }
          })
        }

        //#endregion

        //#region Save File
        workbook.xlsx.writeBuffer().then((data: any) => {
          let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          let date = new Date().toISOString()
          const fileName = `DANH_SACH_CU_LY_${date}.xlsx`
          fs.saveAs(blob, fileName)
          this.notifyService.hideloading()
        })
        //#endregion
      }
    })
  }
}
