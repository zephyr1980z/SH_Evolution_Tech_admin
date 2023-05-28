import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { AddOrEditEmployeeModelComponent } from './add-or-edit-employee-model/add-or-edit-employee-model.component'
import { ChangePasswordEmployeeModelComponent } from './change-password-employee-model/change-password-employee-model.component'
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component'
// @ts-ignore
import * as XLSX from 'xlsx'
import * as moment from 'moment'

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
})
export class EmployeeComponent implements OnInit {
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any = {}
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  loading = true
  currentUser: User | any
  enumData: any
  dataUploadExcel = []
  dataDepartment: any[] = []
  enumRole = enumData.Role.Setting_Employee

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialog: MatDialog,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit(): void {
    this.dataSearch.statusId = enumData.StatusFilter.All.value
    this.searchData()
    this.loadDepartment()
  }

  async filterDataSearch() {
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
    if (this.dataSearch.departmentId && this.dataSearch.departmentId !== '') {
      key = 'departmentId'
      where[key] = this.dataSearch.departmentId
    }
    if (this.dataSearch.statusId > 0) {
      key = 'isDeleted'
      if (this.dataSearch.statusId === enumData.StatusFilter.Active.value) {
        where[key] = false
      }
      if (this.dataSearch.statusId === enumData.StatusFilter.InActive.value) {
        where[key] = true
      }
    }
    where.employeeType = enumData.EmployeeType.TMS.code
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
    this.apiService.post(this.apiService.EMPLOYEE.PAGINATION, dataSearch).then((data: any) => {
      this.notifyService.hideloading()
      this.loading = false
      if (data) {
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditEmployeeModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(data: any) {
    this.dialog
      .open(AddOrEditEmployeeModelComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.EMPLOYEE.DELETE, { id: data.id }).then((res: any) => {
      this.notifyService.hideloading()
      if (res) {
        this.notifyService.showSuccess('Cập nhật trạng thái nhân viên thành công!')
        this.searchData()
      }
    })
  }

  changePassword(data: any) {
    this.dialog
      .open(ChangePasswordEmployeeModelComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {
        // this.searchData()
      })
  }

  clickDetail(data: any) {
    this.dialog
      .open(EmployeeDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  loadDepartment() {
    this.notifyService.showloading()
    this.apiService
      .post(this.apiService.DEPARTMENT.FIND, { isDeleted: false, departmentType: enumData.DepartmentType.TMS.code })
      .then((result: any) => {
        this.notifyService.hideloading()
        this.dataDepartment = result
      })
  }

  /** EXCEL */
  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_DS_Nhan_Vien_' + date + '.xlsx'
    dataExcel.push({
      'Họ & Tên (name)*': '',
      'Mã Phòng Ban (departmentCode)*': '',
      'SĐT (numberPhone)*': '',
      'CMND/CCCD (cardNumber)*': '',
      'Email (email)*': '',
      'Ngày Vào Làm (DD/MM/YYYY)*': '',
      'Ngày Sinh (DD/MM/YYYY)': '',
      'Địa Chỉ (address)*': '',
      'Tài Khoản (username)*': '',
      'Mật Khẩu (password)*': '',
      'Loại Nhân Viên (TMS/TIMEKEEPING)*': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()

    ws['!cols'] = [
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 40 },
      { width: 30 },
      { width: 30 },
      { width: 40 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
    ]

    XLSX.utils.book_append_sheet(wb, ws, 'Template DS Nhân Viên')
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
          // Họ & Tên
          'name',
          // Mã Phòng Ban
          'departmentCode',
          // SĐT
          'numberPhone',
          // CMND
          'cardNumber',
          // Email
          'email',
          // Ngày Vào Làm
          'startWorkingDay',
          // Ngày Sinh
          'dob',
          // Địa Chỉ
          'address',
          // Tài Khoản
          'username',
          // Mật Khẩu
          'password',
          //Loại nhân viên
          'employeeTypeCode',
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

      // const res: any[] = jsonData
      let pushList = []

      for (const row of jsonData) {
        let idx = jsonData.indexOf(row) + 2

        if (row.name == null || (typeof row.name === 'string' && row.name.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên Nhân Viên Không Được Để Trống <br>'
        }

        if (
          row.departmentCode == null ||
          (typeof row.departmentCode === 'string' && row.departmentCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Phòng Ban Không Được Để Trống <br>'
        }

        if (row.password == null || (typeof row.password === 'string' && row.password.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Password Không Được Để Trống <br>'
        }
        row.password = row.password.toString()

        if (row.username == null || (typeof row.username === 'string' && row.username.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tài khoản Không Được Để Trống <br>'
        }

        if (
          row.startWorkingDay == null ||
          (typeof row.startWorkingDay === 'string' && row.startWorkingDay.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Ngày vào làm Không Được Để Trống <br>'
        }

        if (row.cardNumber == null || (typeof row.cardNumber === 'string' && row.cardNumber.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - CMND/CCCD Không Được Để Trống <br>'
        }

        if (row.email == null || (typeof row.email === 'string' && row.email.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Email Không Được Để Trống <br>'
        }

        if (!row.email.match('^[A-Za-z0-9_.]{3,32}@([a-zA-Z0-9]{2,12})(.[a-zA-Z]{2,12})+$')) {
          strErr += 'Dòng ' + idx + ' - Email Không Được Nhập Sai Định Dạng <br>'
        }

        if (row.address == null || (typeof row.address === 'string' && row.address.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Địa Chỉ Không Được Để Trống <br>'
        }

        if (
          row.startWorkingDay == null ||
          (typeof row.startWorkingDay === 'string' && row.startWorkingDay.trim().length == 0)
        ) {
          let startWorkingDay = moment(row.startWorkingDay, 'DD/MM/YYYY', true)
          if (!startWorkingDay.isValid()) {
            strErr += 'Dòng ' + idx + ' - Ngày Vào Làm không đúng định dạng. Vui lòng kiểm tra lại <br>'
          }
        }

        if (typeof row.startWorkingDay === 'number') {
          let startWorkingDayFm = this.coreService.excelDateToJSDate(row.startWorkingDay)
          row.startWorkingDay = moment(startWorkingDayFm).format('YYYY-MM-DD')
        } else {
          if (row.startWorkingDay) {
            var dateParts = row.startWorkingDay.split('/')
            // month is 0-based, that's why we need dataParts[1] - 1
            var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
            row.startWorkingDay = moment(dateObject).format('YYYY-MM-DD')
          }
        }

        // if (row.dob == null || (typeof row.dob === 'string' && row.dob.trim().length == 0)) {
        //   let dob = moment(row.dob, 'DD/MM/YYYY', true)
        //   if (!dob.isValid()) {
        //     strErr += 'Dòng ' + idx + ' - Ngày sinh không đúng định dạng. Vui lòng kiểm tra lại <br>'
        //   }
        // }

        // if (typeof row.dob === 'number') {
        //   let dobFm = this.coreService.excelDateToJSDate(row.dob)
        //   row.dob = moment(dobFm).format('YYYY-MM-DD')
        // } else {
        //   if (row.dob) {
        //     var dateParts = row.dob.split('/')
        //     // month is 0-based, that's why we need dataParts[1] - 1
        //     var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
        //     row.dob = moment(dateObject).format('YYYY-MM-DD')
        //   }
        // }

        if (
          row.employeeTypeCode == null ||
          (typeof row.employeeTypeCode === 'string' && row.employeeTypeCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Loại Nhân Viên Không Được Để Trống <br>'
        }

        pushList.push(row)
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }

      const data = { lstData: pushList }
      this.apiService.post(this.apiService.EMPLOYEE.IMPORT_EXCEL, jsonData).then((result) => {
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
    this.apiService.post(this.apiService.EMPLOYEE.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Nhan_Vien_' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((s: any) => {
            dataExcel.push({
              'Mã Nhân Viên': s.code,
              'Họ & Tên': s.name,
              'Phòng Ban': s.departmentName,
              SĐT: s.numberPhone,
              CMND: s.cardNumber,
              Email: s.email,
              'Ngày Sinh': moment(s.dob).format('DD/MM/YYYY'),
              'Địa Chỉ': s.address,
              'Tài Khoản': s.username,
              'Trạng Thái': s.isDeleted ? enumData.StatusFilter.InActive.name : enumData.StatusFilter.Active.name,
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
            { width: 40 },
            { width: 30 },
            { width: 40 },
            { width: 40 },
          ]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Nhân Viên')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
