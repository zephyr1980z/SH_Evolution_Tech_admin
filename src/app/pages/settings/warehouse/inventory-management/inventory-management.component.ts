import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'
import { AddOrEditInventoryManagementComponent } from './add-or-edit-inventory-management/add-or-edit-inventory-management.component'
import { InventoryManagementDetailComponent } from './inventory-management-detail/inventory-management-detail.component'
import * as XLSX from 'xlsx'
@Component({
  selector: 'app-inventory-management',
  templateUrl: './inventory-management.component.html',
})
export class InventoryManagementComponent implements OnInit {
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any
  loading = true
  currentUser: User | any
  isVisible = false
  enumData = enumData
  dataObject: any
  dataStatus: any = []
  dataUploadExcel: any
  enumRole = enumData.Role.Inventory_Management

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x?.enumData))
  }

  ngOnInit(): void {
    this.dataSearch = new Object()
    this.dataObject = new Object()
    this.dataStatus = this.coreService.convertObjToArray(this.enumData.InventoryStatus)
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
    if (this.dataSearch.status && this.dataSearch.status !== '') {
      where['status'] = this.dataSearch.status
    }
    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.INVENTORY_MANAGEMENT.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd(data: any) {
    this.dialog
      .open(AddOrEditInventoryManagementComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((data) => {
        this.searchData(true)
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditInventoryManagementComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickDetail(data: any) {
    this.dialog
      .open(InventoryManagementDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  approveInventory(object: any) {
    this.notifyService.showloading()
    this.apiService
      .post(this.apiService.INVENTORY_MANAGEMENT.APPROVE_INVENTORYMANAGEMENT, { id: object.id })
      .then((res) => {
        this.notifyService.showSuccess(res.message)
        this.notifyService.hideloading()
        this.searchData()
      })
  }

  onCancelIM(data: any) {
    this.notifyService.showloading()
    this.apiService
      .post(this.apiService.INVENTORY_MANAGEMENT.CANCEL_INVENTORYMANAGEMENT, { id: data.id })
      .then((res) => {
        this.notifyService.showSuccess(res.message)
        this.notifyService.hideloading()
        this.searchData()
      })
  }

  async clickImportExcel(event: any, ev: any, i: any) {
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
        header: ['inboundCode', 'inboundDetailCode', 'itemCode', 'itemName', 'quantity', 'realQuantity'],
      })
      // fix lỗi k import 2 lần đc
      const idFile = 'file' + '-' + i
      ;(<HTMLInputElement>document.getElementById(idFile)).value = ''
      // bỏ dòng merge
      jsonData.shift()
      // bỏ dòng header
      let isErr = false
      let strErr = ''
      //** */
      for (const row of jsonData) {
        let idx = jsonData.indexOf(row) + 2
        if (row.inboundCode == null || (typeof row.inboundCode === 'string' && row.inboundCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã đơn nhập không được để trống \n'
        }
        if (
          row.inboundDetailCode == null ||
          (typeof row.inboundDetailCode === 'string' && row.inboundDetailCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Mã lô không được để trống \n'
        }
        if (row.itemCode == null || (typeof row.itemCode === 'string' && row.itemCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã phụ tùng không được để trống \n'
        }
        if (row.itemName == null || (typeof row.itemName === 'string' && row.itemName.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên phụ tùng không được để trống \n'
        }
        if (row.quantity == null || (typeof row.quantity === 'string' && row.quantity.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tổng tồn kho sản phẩm trong lô không được để trống \n'
        }
        if (row.realQuantity == null || (typeof row.realQuantity === 'string' && row.realQuantity.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Số lượng thực tế không được để trống \n'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      const dataExcel = {
        id: ev.id,
        lstItem: jsonData,
      }
      this.apiService.post(this.apiService.INVENTORY_MANAGEMENT.ITEM_INVETORY, dataExcel).then((res) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess('Cập nhật phiếu kiểm tồn thành công')
        this.searchData()
        this.dataUploadExcel = []
      })
    }
  }

  async onDownload(data: any) {
    this.notifyService.showloading()
    let date = new Date().toISOString()
    const fileName = 'Danh_Sach_Phu_Tung_Trong_Lo' + date + '.xlsx'
    let dataExcel: any = []
    data.forEach((s: any) => {
      dataExcel.push({
        'Mã đơn nhập': s.inboundCode,
        'Mã lô': s.inboundDetailCode,
        'Mã phụ tùng': s.itemCode,
        'Tên phụ tùng': s.itemName,
        'Tổng tồn kho sản phẩm trong lô': s.quantity,
        'Số lượng thực tế': '',
      })
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách phụ tùng')
    XLSX.writeFile(wb, fileName)
    this.notifyService.hideloading()
  }
}
