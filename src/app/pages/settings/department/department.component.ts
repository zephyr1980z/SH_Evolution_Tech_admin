import { Component, OnInit } from '@angular/core'
import { NotifyService } from '../../../services/notify.service'
import { ApiService } from '../../../services/api.service'
import { enumData } from '../../../core/enumData'
import { MatDialog } from '@angular/material/dialog'
import { AddOrEditDepartmentModelComponent } from './add-or-edit-department-model/add-or-edit-department-model.component'
import { CoreService } from '../../../services/core.service'
import { User } from '../../../models/user.model'
import { AuthenticationService } from '../../../services/authentication.service'
import { DepartmentEmployeesModelComponent } from './department-employees-model/department-employees-model.component'
// @ts-ignore
import * as XLSX from 'xlsx'
@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
})
export class DepartmentComponent implements OnInit {
  // modalTitle = enumData.Constants.Model_Add
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  loading = true
  currentUser: User | any
  isVisible = false
  dataDepartments = []
  enumData = enumData
  checkTemplete = false
  dataEmployees: any = []
  dataObject: any
  isLoadEmployees = false
  lstDepartment: any[] = []
  dataUploadExcel = []
  enumRole = enumData.Role.Setting_Department

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
    if (this.dataSearch.statusId > 0) {
      const key = 'isDeleted'
      if (this.dataSearch.statusId === enumData.StatusFilter.Active.value) {
        where[key] = false
      }
      if (this.dataSearch.statusId === enumData.StatusFilter.InActive.value) {
        where[key] = true
      }
    }
    where.departmentType = enumData.DepartmentType.TMS.code
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
    this.apiService.post(this.apiService.DEPARTMENT.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditDepartmentModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditDepartmentModelComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.DEPARTMENT.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess('Cập nhật trạng thái phòng ban thành công!')
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  async loadEmployeeByDepartment(departmentId: any) {
    this.notifyService.showloading()
    await this.apiService
      .post(this.apiService.EMPLOYEE.FIND, { where: { isDeleted: false, departmentId: departmentId } })
      .then((result) => {
        this.notifyService.hideloading()
        this.dataEmployees = result
      })
  }

  async viewEmployees(data: any) {
    this.dialog
      .open(DepartmentEmployeesModelComponent, { disableClose: false, data: data })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  /** EXCEL */
  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_Phong_Ban_' + date + '.xlsx'
    dataExcel.push({
      'Mã Phòng Ban (code)': '',
      'Tên Phòng Ban (name)': '',
      'Mô Tả (description)': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Template Phòng Ban')
    XLSX.writeFile(wb, fileName)
  }
  /** Nhập Excel */
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
        header: ['code', 'name', 'description'],
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
          strErr += 'Dòng ' + idx + ' - Mã Phòng Ban Không Được Để Trống<br>'
        }

        if (row.name == null || (typeof row.name === 'string' && row.name.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên Phòng Ban Không Được Để Trống  <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.DEPARTMENT.IMPORT_EXCEL, jsonData).then((result) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess('Thêm Mới File Excel Thành Công')
        this.searchData()
        this.dataUploadExcel = []
      })
    }
  }

  /** Xuất excel */
  async onDownloadExcel() {
    this.notifyService.showloading()

    let where = await this.filterDataSearch()
    const dataSearch = {
      where: where,
      order: { updatedAt: 'DESC' },
      skip: 0,
      take: this.enumData.Page.pageSizeMax,
    }
    this.loading = true
    this.apiService.post(this.apiService.DEPARTMENT.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Phong_Ban' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((s: any) => {
            dataExcel.push({
              'Mã Phòng Ban': s.code,
              'Tên Phòng Ban': s.name,
              'Mô Tả': s.description,
            })
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          const wb: XLSX.WorkBook = XLSX.utils.book_new()
          ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Phòng Ban')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
