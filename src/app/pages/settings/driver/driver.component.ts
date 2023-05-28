import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { AddOrEditDriverComponent } from './add-or-edit-driver/add-or-edit-driver.component'
import { DriverDetailComponent } from './driver-detail/driver-detail.component'
// @ts-ignore
import * as XLSX from 'xlsx'
import * as moment from 'moment'
@Component({
  selector: 'app-driver',
  templateUrl: './driver.component.html',
})
export class DriverComponent implements OnInit {
  listOfData: any[] = []
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  loading = true
  dataSearch: any = {}
  currentUser: User = new User()
  dataUploadExcel = []

  dataVehicle: any[] = []
  dataRomooc: any[] = []
  dataDriver: any[] = []
  enumRole = enumData.Role.Driver
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
    this.apiService.post(this.apiService.VEHICLE.FIND, {}).then((result) => {
      if (result) {
        this.dataVehicle = result
      }
    })
    this.apiService.post(this.apiService.ROMOOC.FIND, {}).then((result) => {
      if (result) {
        this.dataRomooc = result
      }
    })
    this.apiService.post(this.apiService.DRIVER.FIND, {}).then((result) => {
      if (result) {
        this.dataDriver = result
      }
    })
    this.dataSearch.statusId = enumData.StatusFilter.All.value
  }

  async filterDataSearch() {
    const where: any = {}
    let key = ''
    if (this.dataSearch.statusId > 0) {
      key = 'isDeleted'
      if (this.dataSearch.statusId === enumData.StatusFilter.Active.value) {
        where[key] = false
      }
      if (this.dataSearch.statusId === enumData.StatusFilter.InActive.value) {
        where[key] = true
      }
    }
    if (this.dataSearch.romoocId && this.dataSearch.romoocId !== '') {
      key = 'romoocId'
      where[key] = this.dataSearch.romoocId
    }
    if (this.dataSearch.vehicleId && this.dataSearch.vehicleId !== '') {
      key = 'vehicleId'
      where[key] = this.dataSearch.vehicleId
    }
    if (this.dataSearch.name && this.dataSearch.name !== '') {
      key = 'name'
      where[key] = this.dataSearch.name
    }
    if (this.dataSearch.code && this.dataSearch.code !== '') {
      key = 'code'
      where[key] = this.dataSearch.code
    }
    return where
  }

  async searchData(reset: boolean = false) {
    this.notifyService.showloading()
    if (reset) {
      this.pageIndex = 1
    }
    let where = await this.filterDataSearch()
    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.DRIVER.PAGINATION, dataSearch).then((data) => {
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
      .open(AddOrEditDriverComponent, { disableClose: false })
      .afterClosed()
      .subscribe((flag) => {
        if (flag) this.searchData()
      })
  }

  clickEdit(data: any) {
    this.dialog
      .open(AddOrEditDriverComponent, { disableClose: false, data: data })
      .afterClosed()
      .subscribe((flag) => {
        if (flag) this.searchData()
      })
  }

  viewDetail(data: any) {
    this.dialog
      .open(DriverDetailComponent, { disableClose: false, data: data })
      .afterClosed()
      .subscribe((flag) => {
        if (flag) this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.DRIVER.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  /** EXCEL */
  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_DS_Tai_Xe_' + date + '.xlsx'
    dataExcel.push({
      'Tên Tài Xế* (name)': '',
      'SĐT (numberPhone)': '',
      'CMND (cardNumber)': '',
      'Email (email)': '',
      'Ngày Sinh (dob DD/MM/YYYY)': '',
      'Địa Chỉ (address)': '',
      'Biển số đầu Kéo (vehicleCode)': '',
      'Biển số rơ moóc (romoocCode)': '',
      'Tài khoản*': '',
      'Mật Khẩu*': '',
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
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Template DS Tài Xế')
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
        header: [
          // 'code',
          'name',
          'numberPhone',
          'cardNumber',
          'email',
          'dob',
          'address',
          'vehicleCode',
          'romoocCode',
          'username',
          'password',
        ],
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
      let pushList = []
      for (const row of jsonData) {
        let idx = jsonData.indexOf(row) + 2

        if (row.name == null || (typeof row.name === 'string' && row.name.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên Tài Xế Không Được Để Trống <br>'
        }

        if (row.dob) {
          let checkdob = moment(row.dob, 'DD/MM/YYYY', true)
          if (!checkdob.isValid()) {
            strErr += 'Dòng ' + idx + ' - Ngày sinh không đúng định dạng. Vui lòng kiểm tra lại <br>'
          } else {
            row.dob = checkdob.toDate()
          }
        }

        if (row.username == null || (typeof row.username === 'string' && row.username.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tài Khoản Không Được Để Trống <br>'
        }

        if (row.password == null) {
          strErr += 'Dòng ' + idx + ' - Mật khẩu Không Được Để Trống <br>'
        }
        row.password = row.password.toString()

        pushList.push(row)
      }

      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }

      const data = { lstData: pushList }

      this.apiService.post(this.apiService.DRIVER.IMPORT_EXCEL, jsonData).then((result) => {
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
    this.apiService.post(this.apiService.DRIVER.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Tai_Xe_' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((s: any) => {
            dataExcel.push({
              'Mã Tài Xế': s.code,
              'Tên Tài Xế': s.name,
              SĐT: s.numberPhone,
              CMND: s.cardNumber,
              Email: s.email,
              'Ngày Sinh': moment(s.dob).format('DD/MM/YYYY'),
              'Địa Chỉ': s.address,
              'Biển Số Đầu Kéo': s.vehicleRegNo,
              'Biển Số Rơ Moóc': s.romoocRegNo,
              'Tài khoản': s.userName,
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
            { width: 30 },
            { width: 30 },
            { width: 30 },
          ]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Tài Xế')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
