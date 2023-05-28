import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { AddOrEditCostsIncurredComponent } from './add-or-edit-costs-incurred/add-or-edit-costs-incurred.component'
import { CostsIncurredDetailComponent } from './costs-incurred-detail/costs-incurred-detail.component'
// @ts-ignore
import * as XLSX from 'xlsx'
@Component({
  selector: 'app-costs-incurred',
  templateUrl: './costs-incurred.component.html',
})
export class CostsIncurredComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData: any
  modalTitle: any
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  listOfData: any = []
  dataCustomer: any[] = []
  dataSearch: any = {}
  loading = true
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total

  dataUploadExcel: any
  enumRole = enumData.Role.Setting_Costs_Incurred

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
    this.dataSearch = new Object()
    this.searchData()
  }

  async filterDataSearch() {
    const where: any = {}
    if (this.dataSearch.name && this.dataSearch.name !== '') {
      const key = 'name'
      where[key] = this.dataSearch.name
    }
    if (this.dataSearch.code && this.dataSearch.code !== '') {
      const key = 'code'
      where[key] = this.dataSearch.code
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
    this.apiService.post(this.apiService.COSTS_INCURRED.PAGINATION, dataSearch).then((data: any) => {
      if (data) {
        this.listOfData = data[0]
        this.total = data[1]
        this.loading = false
      }
    })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.COSTS_INCURRED.DELETE, { id: data.id }).then((res: any) => {
      this.notifyService.hideloading()
      if (res) {
        this.notifyService.showSuccess('Cập nhật trạng thái thành công!')
        this.searchData()
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditCostsIncurredComponent, { disableClose: false })
      .afterClosed()
      .subscribe(() => {
        this.searchData()
      })
  }

  clickEdit(data: any) {
    this.dialog
      .open(AddOrEditCostsIncurredComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  viewDetail(data: any) {
    this.dialog
      .open(CostsIncurredDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  /** EXCEL */

  /** Template mẫu excel */
  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    let dataExcel2: any = []
    const fileName = 'Template_Chi_Phi_Phat_Sinh_' + date + '.xlsx'
    dataExcel.push({
      'Mã chi phí': '',
      'Tên chi phí': '',
      'Loại chi phí': '',
      'Mô Tả': '',
    })
    const costsIncurredType = this.coreService.convertObjToArray(this.enumData.CostsIncurredType)
    dataExcel2.push({
      'Loại chi phí': '',
    })
    costsIncurredType.forEach((e: any) => {
      dataExcel2.push({
        'Loại chi phí': e.code,
      })
    })

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()

    const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel2)
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 30 }]
    ws2['!cols'] = [{ width: 20 }, { width: 20 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Template chi phí Phát Sinh')
    XLSX.utils.book_append_sheet(wb, ws2, 'Mã chi phí')
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
        header: ['code', 'name', 'type', 'description'],
      })
      // fix lỗi k import 2 lần đc
      ;(<HTMLInputElement>document.getElementById('file')).value = ''

      // bỏ dòng merge
      jsonData.shift()
      // bỏ dòng header
      let strErr = ''

      const inputData: any = {}
      inputData.lstData = []
      const res: any[] = jsonData
      //** */
      for (const row of jsonData) {
        let idx = jsonData.indexOf(row) + 2
        if (row.code == null || (typeof row.code === 'string' && row.code.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã Không Được Để Trống<br>'
        }

        if (row.name == null || (typeof row.name === 'string' && row.name.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên Không Được Để Trống  <br>'
        }

        if (row.type == null || (typeof row.type === 'string' && row.type.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Loại Chi Phí Không Được Để Trống  <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.COSTS_INCURRED.IMPORT_EXCEL, jsonData).then((result) => {
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
      take: enumData.Page.pageSizeMax,
    }
    this.loading = true
    this.apiService.post(this.apiService.COSTS_INCURRED.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'DS_Chi_Phi_Phat_Sinh' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((s: any) => {
            dataExcel.push({
              'Mã Chi Phí': s.code,
              'Tên Chi Phí': s.name,
              'Loại Chi Phí': s.type,
              'Mô Tả': s.description,
            })
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          const wb: XLSX.WorkBook = XLSX.utils.book_new()
          ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 30 }]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Chi Phí Phát Sinh')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
