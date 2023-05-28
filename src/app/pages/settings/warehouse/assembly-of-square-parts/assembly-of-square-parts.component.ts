import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'
import { AddOrEditAssembleOfSquarePartsComponent } from './add-or-edit-assembly-of-square-parts-model/add-or-edit-assembly-of-square-parts.component'
import * as XLSX from 'xlsx'
import { AssembleOfSquarePartsDetailComponent } from './assembly-of-square-parts-detail/assembly-of-square-parts-detail.component'

@Component({
  selector: 'app-assembly-of-square-parts',
  templateUrl: './assembly-of-square-parts.component.html',
})
export class AssembleOfSquarePartsComponent implements OnInit {
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  loading = true
  currentUser: User | any
  isVisible = false
  enumData = enumData
  enumRole = enumData.Role.Assembly_Of_Square_Parts
  dataObject: any
  dataUploadExcel: any

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

  async searchData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1
    }
    this.loading = true

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
    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.ASSEMBLY_OF_SQUARE_PARTS.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditAssembleOfSquarePartsComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditAssembleOfSquarePartsComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }
  clickDetail(data: any) {
    this.dialog
      .open(AssembleOfSquarePartsDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ASSEMBLY_OF_SQUARE_PARTS.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  /** EXCEL */
  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    let dataExcel2: any = []
    const fileName = 'Template_Phieu_Lap_Rap_May' + date + '.xlsx'
    dataExcel.push({
      'Mã máy (code)': '',
      'Tên máy (name)': '',
      'Mô Tả(description)': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [{ width: 20 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 20 }, { width: 20 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Thông tin máy')
    dataExcel2.push({
      'Mã máy (code)': '',
      'Mã phụ tùng (itemCode)': '',
      'Số lượng (quantity)': '',
    })
    const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel2)
    ws2['!cols'] = [{ width: 20 }, { width: 30 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'DS phụ tùng')
    XLSX.writeFile(wb, fileName)
  }

  onImportExcel(ev: any) {
    this.notifyService.showloading()
    let workBook = null
    let jsonData: any = null
    let jsonData1: any = null
    const reader = new FileReader()
    const file = ev.target.files[0]
    reader.readAsBinaryString(file)
    reader.onload = () => {
      workBook = XLSX.read(reader.result, { type: 'binary' })
      jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]], {
        raw: true,
        defval: null,
        header: ['code', 'name', 'description'],
      })
      jsonData1 = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[1]], {
        raw: true,
        defval: null,
        header: ['code', 'itemCode', 'quantity'],
      })
      // fix lỗi k import 2 lần đc
      ;(<HTMLInputElement>document.getElementById('file')).value = ''

      // bỏ dòng merge
      jsonData.shift()
      jsonData1.shift()
      // bỏ dòng header
      let isErr = false
      let strErr = ''
      for (const row of jsonData) {
        let idx = jsonData.indexOf(row) + 2

        if (row.code == null || (typeof row.code === 'string' && row.code.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã máy không được để trống!\n'
        }
        if (row.name == null || (typeof row.name === 'string' && row.name.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên máy không được để trống!\n'
        }
      }
      for (const row of jsonData1) {
        let idx = jsonData.indexOf(row) + 2
        if (row.code == null || (typeof row.code === 'string' && row.code.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã máy của sheet DS phụ tùng không được để trống!\n'
        }
        if (row.itemCode == null || (typeof row.itemCode === 'string' && row.itemCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã phụ tùng của sheet DS phụ tùng không được để trống!\n'
        }
        if (row.quantity == null || (typeof row.quantity === 'string' && row.quantity.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Số lượng phụ tùng của sheet DS phụ tùng không được để trống!\n'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }

      const dataExcel = {
        lstMachine: jsonData,
        lstItem: jsonData1,
      }

      this.apiService.post(this.apiService.ASSEMBLY_OF_SQUARE_PARTS.CREATE_BY_EXCEL, dataExcel).then((result) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(this.enumData.Constants.Message_Create_Success)
        this.searchData()
      })
    }
  }
}
