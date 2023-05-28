import { Component, OnInit } from '@angular/core'
import { NotifyService } from '../../../../services/notify.service'
import { ApiService } from '../../../../services/api.service'
import { enumData } from '../../../../core/enumData'
import { MatDialog } from '@angular/material/dialog'
import { CoreService } from '../../../../services/core.service'
import { User } from '../../../../models/user.model'
import { AuthenticationService } from '../../../../services/authentication.service'
import { AddOrEditItemModelComponent } from './add-or-edit-item-model/add-or-edit-item-model.component'
import { ItemDetailPrimaryComponent } from './item-detail/item-detail.component'
// @ts-ignore
import * as XLSX from 'xlsx'
import { PrintItemComponent } from './print-item-model/print-item-model.component'
@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
})
export class ItemComponent implements OnInit {
  // modalTitle = enumData.Constants.Model_Add
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  safetyStockLevel = this.coreService.convertObjToArray(enumData.ItemSaftyStockLevel)
  loading = true
  currentUser: User | any
  isVisible = false
  enumData = enumData
  checkTemplete = false
  dataObject: any
  dataUploadExcel: any
  enumRole = enumData.Role.Setting_Item
  lstItemGroup: any = []
  setOfCheckedId = new Set<any>()
  checked = false
  indeterminate = false
  isVisiblePrint = false
  isVisiblePrintItem = false
  printItem: any
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
    this.loadAllData()
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
    if (this.dataSearch.itemGroupId && this.dataSearch.itemGroupId !== '') {
      const key = 'itemGroupId'
      where[key] = this.dataSearch.itemGroupId
    }
    if (this.dataSearch.safetyStockLevel && this.dataSearch.safetyStockLevel !== '') {
      const key = 'safetyStockLevel'
      where[key] = this.dataSearch.safetyStockLevel
    }
    if (this.dataSearch.importPrice && this.dataSearch.importPrice !== '') {
      const key = 'importPrice'
      where[key] = this.dataSearch.importPrice
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
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.ITEM.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  async loadAllData() {
    this.notifyService.showloading()
    Promise.all([this.apiService.post(this.apiService.ITEM_GROUP.FIND, { isDeleted: false })]).then((res) => {
      this.notifyService.hideloading()
      if (res) {
        this.lstItemGroup = res[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditItemModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditItemModelComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickDetail(data: any) {
    this.dialog
      .open(ItemDetailPrimaryComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ITEM.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }
  /** EXCEL */
  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_DS_Phu_Tung_' + date + '.xlsx'
    dataExcel.push({
      'Mã Phụ Tùng (code)': '',
      'Tên Phụ Tùng (name)': '',
      'Mã Nhóm Phụ Tùng (itemGroupCode)': '',
      'Mã Quy cách (specificationCode)': '',
      'Mô Tả (description)': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Template DS Phụ Tùng')
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
        header: ['code', 'name', 'itemGroupCode', 'specificationCode', 'description'],
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
          strErr += 'Dòng ' + idx + ' - Mã Phụ Tùng Không Được Để Trống <br>'
        }

        if (row.name == null || (typeof row.name === 'string' && row.name.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên Phụ Tùng Không Được Để Trống <br>'
        }

        if (
          row.itemGroupCode == null ||
          (typeof row.itemGroupCode === 'string' && row.itemGroupCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' -Mã Nhóm Phụ Tùng Không Được Để Trống <br>'
        }

        if (
          row.specificationCode == null ||
          (typeof row.specificationCode === 'string' && row.specificationCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' -Mã Quy Cách Không Được Để Trống <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.ITEM.IMPORT_EXCEL, jsonData).then((result) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess('Thêm Mới File Excel Thành Công')
        this.dataUploadExcel = []
        this.searchData()
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
      take: this.enumData.Page.pageSizeMax,
    }
    this.loading = true
    this.apiService.post(this.apiService.ITEM.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Nha_Cap_' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((s: any) => {
            dataExcel.push({
              'Mã Phụ Tùng': s.code,
              'Tên Phụ Tùng': s.name,
              'Nhóm Phụ Tùng': s.itemGroupName,
              'Đơn vị': s.unitName,
              'Quy đổi': s.unitToBaseUnitQuantity,
              'Đơn vị cơ sở': s.baseUnitName,
              'Số Lượng Tổng': s.quantity,
              'Giá Nhập Trung Bình': s.importPrice,
            })
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          const wb: XLSX.WorkBook = XLSX.utils.book_new()
          ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Nhà Cung Cấp')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }

  clickPrint(object: any) {
    this.isVisiblePrintItem = true
    this.printItem = object
  }

  onPrintOneItem() {
    const object: any = this.printItem
    object.printQuantity = this.dataObject.printQuantity
    this.dialog
      .open(PrintItemComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((flag) => {
        this.dataObject = new Object()
        this.printItem = new Object()
        this.isVisiblePrintItem = false
      })
  }

  onPrintPayment() {
    const data: any = this.setOfCheckedId
    data.printQuantity = this.dataObject.printQuantity
    if (this.setOfCheckedId.size > 0) {
      this.dialog
        .open(PrintItemComponent, { disableClose: false, data: data })
        .afterClosed()
        .subscribe(() => {
          this.dataObject = new Object()
          this.isVisiblePrint = false
        })
    } else {
      this.notifyService.showError('Vui lòng chọn ít nhất một phụ tùng !')
    }
  }

  printList() {
    this.isVisiblePrint = true
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id)
    } else {
      this.setOfCheckedId.delete(id)
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked)
    this.refreshCheckedStatus()
  }

  onAllChecked(value: boolean): void {
    this.setOfCheckedId = new Set<any>()
    this.listOfData.forEach((item: number) => this.updateCheckedSet(item, value))
    this.refreshCheckedStatus()
  }

  onCurrentPageDataChange($event: any): void {
    this.listOfData = $event
    this.refreshCheckedStatus()
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfData.every((item: any) => this.setOfCheckedId.has(item))
    this.indeterminate = this.listOfData.some((item: any) => this.setOfCheckedId.has(item)) && !this.checked
  }

  handleCancel() {
    this.isVisiblePrint = false
    this.isVisiblePrintItem = false
    this.refreshCheckedStatus()
    this.dataObject = new Object()
    this.printItem = new Object()
  }
}
