import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { AddOrEditDriverLicenseComponent } from './add-or-edit-driver-license/add-or-edit-driver-license.component'
import { Workbook } from 'exceljs'
import * as XLSX from 'xlsx'
import * as moment from 'moment'
const fs = require('file-saver')
@Component({
  selector: 'app-driver-license',
  templateUrl: './driver-license.component.html',
})
export class DriverLicenseComponent implements OnInit {
  listOfData: any[] = []
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  dataDriver: any[] = []
  dataLicenseType: any[] = []
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  loading = true
  dataSearch: any = {}
  currentUser: User | any
  enumRole = enumData.Role.Driver_License
  dataUploadExcel: any
  enumData: any

  constructor(
    private dialog: MatDialog,
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
  }

  ngOnInit() {
    this.searchData()
    this.loadDataSearch()
  }

  async filterDataSearch() {
    const where: any = {}
    let key = ''
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
    this.notifyService.showloading()

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

    this.apiService.post(this.apiService.DRIVER_LICENSE.PAGINATION, dataSearch).then((data: any) => {
      this.notifyService.hideloading()
      this.loading = false
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditDriverLicenseComponent, { disableClose: false })
      .afterClosed()
      .subscribe((flag) => {
        if (flag) this.searchData()
      })
  }

  clickEdit(data: any) {
    this.dialog
      .open(AddOrEditDriverLicenseComponent, { disableClose: false, data: data })
      .afterClosed()
      .subscribe((flag: any) => {
        if (flag) this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.DRIVER_LICENSE.DELETE, { id: data.id }).then((res: any) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  loadDataSearch() {
    Promise.all([
      this.apiService.post(this.apiService.DRIVER.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.LICENSE_TYPE.FIND, { isDeleted: false }),
    ]).then(async (res) => {
      this.dataDriver = res[0] || []
      this.dataLicenseType = res[1] || []
    })
  }

  /** EXCEL */

  clickTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    let dataExcel1: any = []
    const fileName = 'Template_Bang_Lai' + date + '.xlsx'
    dataExcel.push({
      'Số bằng lái*': '',
      'Loại bằng lái (licenseTypeCode)*': '',
      'Tài xế (driverCode)*': '',
      'Ngày hiệu lực bằng lái (DD/MM/YYYY)': '',
      'Ngày hết hạn (DD/MM/YYYY)': '',
      'Ghi chú': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [{ width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Template Bằng Lái')
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
        header: ['licenseNo', 'licenseTypeCode', 'driverCode', 'effectDate', 'expireDate', 'cardNumber', 'note'],
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
        if (
          row.licenseNo == null ||
          (typeof row.typeFrlicenseNoomCode === 'string' && row.licenseNo.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Số Bằng Lái Không Được Để Trống <br>'
        }
        if (
          row.licenseTypeCode == null ||
          (typeof row.licenseTypeCode === 'string' && row.licenseTypeCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Loại Bằng Lái Không Được Để Trống <br>'
        }
        if (row.driverCode == null || (typeof row.driverCode === 'string' && row.driverCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tài Xế Không Được Để Trống <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.DRIVER_LICENSE.IMPORT_EXCEL, jsonData).then((result) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess('Thêm Mới File Excel Thành Công')
        this.searchData()
        this.dataUploadExcel = []
      })
    }
  }

  async onDownloadExcel() {
    // this.notifyService.showloading()
    // let where = await this.filterDataSearch()
    // const dataSearch = {
    //   where: where,
    //   order: { updatedAt: 'DESC' },
    //   skip: 0,
    //   take: enumData.Page.pageSizeMax,
    // }
    // this.loading = true
    // this.apiService.post(this.apiService.DISTANCE.PAGINATION, dataSearch).then((res: any) => {
    //   if (res) {
    //     this.loading = false
    //     this.notifyService.hideloading()
    //     if (res) {
    //       let date = new Date().toISOString()
    //       const fileName = 'Danh_Sach_Cu_Ly' + date + '.xlsx'
    //       let dataExcel: any = []
    //       res[0].forEach((i: any) => {
    //         dataExcel.push({
    //           'Loại Địa Điểm Đi': i.typeNameFrom,
    //           'Tên Địa Điểm Đi': i.fromLocationName,
    //           'Loại Địa Điểm Đến': i.typeNameTo,
    //           'Tên Địa Điểm Đến': i.toLocationName,
    //           'Số Cự Ly (KM)': i.distance,
    //         })
    //       })
    //       const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    //       const wb: XLSX.WorkBook = XLSX.utils.book_new()
    //       ws['!cols'] = [{ width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 20 }]
    //       XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Cự Ly')
    //       XLSX.writeFile(wb, fileName)
    //     }
    //   }
    // })
  }
}
