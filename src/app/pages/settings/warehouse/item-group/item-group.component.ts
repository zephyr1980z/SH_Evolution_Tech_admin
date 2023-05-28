import { Component, OnInit } from '@angular/core'
import { NotifyService } from '../../../../services/notify.service'
import { ApiService } from '../../../../services/api.service'
import { enumData } from '../../../../core/enumData'
import { MatDialog } from '@angular/material/dialog'
import { CoreService } from '../../../../services/core.service'
import { User } from '../../../../models/user.model'
import { AuthenticationService } from '../../../../services/authentication.service'
import { AddOrEditItemGroupModelComponent } from './add-or-edit-item-group-model/add-or-edit-item-group-model.component'
import { ItemGroupDetailComponent } from './item-group-detail/item-group-detail.component'
// @ts-ignore
import * as XLSX from 'xlsx'
@Component({
  selector: 'app-item-group',
  templateUrl: './item-group.component.html',
})
export class ItemGroupComponent implements OnInit {
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
  dataCONT_TYPEs = []
  enumData = enumData
  checkTemplete = false
  dataEmployees: any = []
  dataObject: any
  lstContType: any = []
  packageTypeChoosing: any
  listContTypeModalTitle = ''
  isChooseAll = false
  isShowListContType = false
  isLoadContType = false

  dataUploadExcel: any
  enumRole = enumData.Role.Setting_Item_Group
  totalItem = enumData.Page.total
  listOfItem: any = []
  isVisibleItem = false
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
    this.loadContType()
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
      relations: ['items'],
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.ITEM_GROUP.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditItemGroupModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditItemGroupModelComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickDetail(data: any) {
    this.dialog
      .open(ItemGroupDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ITEM_GROUP.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  async viewContTypes(data: any) {
    this.packageTypeChoosing = data
    this.listContTypeModalTitle = `Danh sách loại Container của ${data.name}`
    // nếu chưa load Plant thì load lần đầu
    if (!this.isLoadContType) {
      await this.loadContType()
    }
    // chọn các công ty đc phân cho nhân viên
    for (const contType of this.lstContType) {
      contType.isChoose = data.listContTypeId.includes(contType.id)
    }
    this.isChooseAll = data.numContType === this.lstContType.length

    // mở modal
    this.isShowListContType = true
  }

  async isChangeChooseAllContType() {
    for (const contType of this.lstContType) {
      contType.isChoose = this.isChooseAll
    }
  }

  async loadContType() {
    this.apiService.post(this.apiService.CONT_TYPE.FIND, { isDeleted: false }).then((res) => {
      if (res) this.lstContType = res
      this.isLoadContType = true
    })
  }

  /** Template mẫu excel */
  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_Nhom_Phu_Tung' + date + '.xlsx'
    dataExcel.push({
      'Mã Nhóm Phụ Tùng (code)': '',
      'Tên Nhóm Phụ Tùng (name)': '',
      'Mô Tả (description)': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [{ width: 10 }, { width: 10 }, { width: 10 }, { width: 60 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Template Nhóm Phụ Tùng')
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
          strErr += 'Dòng ' + idx + ' - Mã Không Được Để Trống<br>'
        }

        if (row.name == null || (typeof row.name === 'string' && row.name.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên Không Được Để Trống  <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.ITEM_GROUP.IMPORT_EXCEL, jsonData).then((result) => {
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
    this.apiService.post(this.apiService.ITEM_GROUP.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Nhom_Phu_Tung' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((s: any) => {
            dataExcel.push({
              'Mã Nhóm Phụ Tùng': s.code,
              'Tên Nhóm Phụ Tùng': s.name,
              'Mô Tả': s.description,
            })
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          const wb: XLSX.WorkBook = XLSX.utils.book_new()
          ws['!cols'] = [{ width: 10 }, { width: 10 }, { width: 10 }, { width: 60 }]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Nhóm Phụ Tùng')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }

  async onViewGroupItem(data: any, reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1
    }
    const where: any = {}
    where['itemGroupId'] = data.id

    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    await this.apiService.post(this.apiService.ITEM.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.totalItem = data[1]
        this.listOfItem = data[0]
        this.isVisibleItem = true
      }
    })
  }
}
