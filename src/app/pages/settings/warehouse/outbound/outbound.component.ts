import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'
// @ts-ignore
import * as XLSX from 'xlsx'
import { AddOrEditOutboundModelComponent } from './add-or-edit-outbound-model/add-or-edit-outbound-model.component'
import { OutboundDetailComponent } from './outbound-detail/outbound-detail.component'
import { PrintOutboundComponent } from './print-outbound/print-outbound.component'

@Component({
  selector: 'app-outbound',
  templateUrl: './outbound.component.html',
})
export class OutboundComponent implements OnInit {
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  loading = true
  currentUser: User | any
  isVisible = false
  enumData = enumData

  listOfData: any = []
  dataSearch: any
  dataUploadExcel: any

  dataObject: any
  lstItem: any
  islstItem = false
  enumRole = enumData.Role.Setting_Outbound

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    public dialog: MatDialog,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x?.enumData))
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
    if (this.dataSearch.statusId > 0) {
      const key = 'isDeleted'
      if (this.dataSearch.statusId === enumData.StatusFilter.Active.value) {
        where[key] = false
      }
      if (this.dataSearch.statusId === enumData.StatusFilter.InActive.value) {
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
    this.apiService.post(this.apiService.OUTBOUND.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditOutboundModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  // clickEdit(object: any) {
  //   this.dialog
  //     .open(AddOrEditOutboundModelComponent, { disableClose: false, data: object })
  //     .afterClosed()
  //     .subscribe((data) => {
  //       this.searchData()
  //     })
  // }

  clickDetail(data: any) {
    this.dialog
      .open(OutboundDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.OUTBOUND.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  onApproved(object: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.OUTBOUND.APPROVED_OUTBOUND, { id: object.id }).then((res) => {
      this.notifyService.showSuccess(res.message)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  onCancel(object: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.OUTBOUND.CANCEL_OUTBOUND, { id: object.id }).then((res) => {
      this.notifyService.showSuccess(res.message)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  clickPrint(data: any) {
    this.dialog
      .open(PrintOutboundComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  /** EXCEL */
  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_Phieu_Xuat_' + date + '.xlsx'
    dataExcel.push({
      'Mã Phụ Tùng (itemCode)': '',
      'Mã Lô Sản Phẩm(inboundDetailCode)': '',
      'Số Lượng Xuất (quantity)': '',
      'Đơn Giá (price)': '',
      'Mô Tả(description)': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [{ width: 20 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 20 }, { width: 20 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Template Phiếu Xuất')
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
        header: ['itemCode', 'inboundDetailCode', 'quantity', 'price', 'description'],
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

        if (row.itemCode == null || (typeof row.itemCode === 'string' && row.itemCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã Phụ Tùng Không Được Để Trống <br>'
        }

        if (
          row.inboundDetailCode == null ||
          (typeof row.inboundDetailCode === 'string' && row.inboundDetailCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Mã Lô Sản Phẩm Không Được Để Trống <br>'
        }

        if (row.quantity == null || (typeof row.quantity === 'string' && row.quantity.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Số Lượng Xuất Không Được Để Trống <br>'
        }

        if (row.price == null || (typeof row.price === 'string' && row.price.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Đơn Giá Không Được Để Trống <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.OUTBOUND.IMPORT_EXCEL, jsonData).then((result) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess('Thêm Mới File Excel Thành Công')
        this.searchData()
        this.dataUploadExcel = []
      })
    }
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditOutboundModelComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }
}
