import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { AddOrEditRomoocComponent } from './add-or-edit-romooc/add-or-edit-romooc.component'
// @ts-ignore
import * as XLSX from 'xlsx'
@Component({
  selector: 'app-romooc',
  templateUrl: './romooc.component.html',
})
export class RomoocComponent implements OnInit {
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  lstShaftType = this.coreService.convertObjToArray(enumData.ShaftType)
  listOfData: any[] = []
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  loading = true
  dataSearch: any = {}
  dataDriver: any[] = []
  dataRomooc: any[] = []
  currentUser: User | undefined
  enumData = enumData

  dataUploadExcel: any
  enumRole = enumData.Role.Setting_Romooc

  constructor(
    private dialog: MatDialog,
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit() {
    this.searchData()
    this.dataSearch.statusId = this.enumData.StatusFilter.All.value
    this.apiService.post(this.apiService.DRIVER.FIND, {}).then((result) => {
      if (result) {
        this.dataDriver = result
      }
    })
    this.apiService.post(this.apiService.ROMOOC.FIND, {}).then((result) => {
      if (result) {
        this.dataRomooc = result
      }
    })
  }

  async filterDataSearch() {
    const where: any = {}
    if (this.dataSearch.code && this.dataSearch.code !== '') {
      const key = 'code'
      where[key] = this.dataSearch.code
    }
    if (this.dataSearch.regNo && this.dataSearch.regNo !== '') {
      const key = 'regNo'
      where[key] = this.dataSearch.regNo
    }
    if (this.dataSearch.shaftType && this.dataSearch.shaftType !== '') {
      const key = 'shaftType'
      where[key] = this.dataSearch.shaftType
    }
    if (this.dataSearch.driverId && this.dataSearch.driverId !== '') {
      const key = 'driverId'
      where[key] = this.dataSearch.driverId
    }
    if (this.dataSearch.address && this.dataSearch.address !== '') {
      const key = 'address'
      where[key] = this.dataSearch.address
    }
    if (this.dataSearch.weight && this.dataSearch.weight !== '') {
      const key = 'weight'
      where[key] = this.dataSearch.weight
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
    this.loading = false
    if (reset) {
      this.pageIndex = 1
    }
    let where = await this.filterDataSearch()
    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.ROMOOC.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
    this.notifyService.hideloading()
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditRomoocComponent, { disableClose: false })
      .afterClosed()
      .subscribe((flag) => {
        if (flag) this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditRomoocComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((flag) => {
        if (flag) this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ROMOOC.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  /** EXCEL */

  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_DS_RO_MOOC_' + date + '.xlsx'
    dataExcel.push({
      'Mã Rơ Moóc (code)*': '',
      'Biển Số Rơ Moóc (regNo)*': '',
      'Loại Trục (HaiTruc or BaTruc)*': '',
      'Tải Trọng (weight)*': '',
      'Địa Chỉ Rơ Moóc (address)': '',
      'Mã Tài Xế (driverCode)': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [{ width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Template DS Rơ Moóc')
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
        header: ['code', 'regNo', 'shaftTypeCode', 'weight', 'address', 'driverCode'],
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
        if (row.code == null || (typeof row.code === 'string' && row.code.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã Rơ Moóc Không Được Để Trống <br>'
        }

        if (row.regNo == null || (typeof row.regNo === 'string' && row.regNo.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Biển Số Rơ Moóc Không Được Để Trống <br>'
        }

        if (
          row.shaftTypeCode == null ||
          (typeof row.shaftTypeCode === 'string' && row.shaftTypeCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Loại Trục Không Được Để Trống <br>'
        }

        if (row.weight == null || (typeof row.weight === 'string' && row.weight.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tải Trọng Không Được Để Trống <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.ROMOOC.IMPORT_EXCEL, jsonData).then((result) => {
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
    this.apiService.post(this.apiService.ROMOOC.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Ro_Mooc' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((i: any) => {
            dataExcel.push({
              'Mã Rơ Moóc': i.code,
              'Biển Số Rơ Moóc': i.regNo,
              'Địa Chỉ Rơ Moóc': i.address,
              'Tài Xế Hiện Tại': i.driverName,
              'Loại Trục': i.typeName,
              'Tải Trọng': i.weight ? Number(i.weight).toLocaleString('vi') : '',
            })
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          const wb: XLSX.WorkBook = XLSX.utils.book_new()
          ws['!cols'] = [{ width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 20 }, { width: 20 }]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Rơ Moóc')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
