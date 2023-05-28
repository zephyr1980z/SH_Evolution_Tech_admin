import { Component, OnInit } from '@angular/core'
import { NotifyService } from '../../../../services/notify.service'
import { ApiService } from '../../../../services/api.service'
import { enumData } from '../../../../core/enumData'
import { MatDialog } from '@angular/material/dialog'
import { CoreService } from '../../../../services/core.service'
import { User } from '../../../../models/user.model'
import { AuthenticationService } from '../../../../services/authentication.service'
import { AddOrEditInboundModelComponent } from './add-or-edit-inbound-model/add-or-edit-inbound-model.component'
import { InboundDetailComponent } from './inbound-detail/inbound-detail.component'
// @ts-ignore
import * as XLSX from 'xlsx'
import { PrintInboundComponent } from './print-inbound/print-inbound.component'
@Component({
  selector: 'app-inbound',
  templateUrl: './inbound.component.html',
})
export class InboundComponent implements OnInit {
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
  enumData = enumData
  checkTemplete = false

  dataObject: any
  lstItem: any
  islstItem = false
  enumRole = enumData.Role.Setting_Inbound

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
    // this.loadlstItem()
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
    this.apiService.post(this.apiService.INBOUND.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditInboundModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditInboundModelComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickDetail(data: any) {
    this.dialog
      .open(InboundDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.INBOUND.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  approveInbound(data: any) {
    this.notifyService.showloading()

    let strError = ''
    data.lstItem.forEach((e: any) => {
      if (+e.quantity > +e.estimatedQuantity) {
        strError += `Lô ${e.code} có số lượng nhập thực (${e.quantity}) > số lượng nhập dự kiến (${e.estimatedQuantity}) \n`
      }
    })
    if (strError.length > 0) {
      this.notifyService.hideloading()
      this.notifyService.showError(strError)
      return
    }
    this.apiService.post(this.apiService.INBOUND.APPROVE_INBOUND, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(res.message)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  onCancelInbound(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.INBOUND.CANCEL_INBOUND, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(res.message)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  clickPrint(data: any) {
    this.dialog
      .open(PrintInboundComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }
  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    let dataExcel1: any = []
    const fileName = 'Template_Don_Nhap_Kho' + date + '.xlsx'
    dataExcel.push({
      'Tên đơn nhập kho (name)': '',
      'Mã NCC (supplierCode)': '',
      'Mô tả (description)': '',
    })
    let ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    let wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [{ width: 30 }, { width: 30 }, { width: 30 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Thông tin đơn nhập kho')
    dataExcel1.push({
      'Mã phụ tùng (itemCode)': '',
      'Ngày sản xuất (manufactureDate)': '',
      'Hạn sử dụng (expiryDate)': '',
      'Số lượng nhập dự kiến (estimatedQuantity)': '',
      'Số lượng nhập thực (quantity)': '',
      'Giá nhập (importprice)': '',
    })
    let ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel1)
    ws1['!cols'] = [
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, ws1, 'Danh sách sản phẩm')
    XLSX.writeFile(wb, fileName)
  }

  async clickImportExcel(ev: any) {
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
        header: ['name', 'supplierCode', 'description'],
      })
      jsonData1 = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[1]], {
        raw: true,
        defval: null,
        header: ['itemCode', 'manufactureDate', 'expiryDate', 'estimatedQuantity', 'quantity', 'importprice'],
      })

      // fix lỗi k import 2 lần đc
      ;(<HTMLInputElement>document.getElementById('file')).value = ''

      // bỏ dòng merge
      jsonData.shift()
      jsonData1.shift()
      // bỏ dòng header
      let strErr = ''
      for (const row of jsonData) {
        let idx = jsonData.indexOf(row) + 2

        if (row.name == null || (typeof row.name === 'string' && row.name.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên đơn nhập kho không được để trống!<br>'
        }
      }
      for (const row1 of jsonData1) {
        let idx = jsonData.indexOf(row1) + 2

        if (row1.itemCode == null || (typeof row1.itemCode === 'string' && row1.itemCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã phụ tùng không được để trống!<br>'
        }
        if (row1.manufactureDate) {
          let manufactureDate = new Date(row1.manufactureDate)
          if (!manufactureDate) {
            strErr += 'Dòng ' + idx + ' - Ngày sản xuất không đúng định dạng. Vui lòng kiểm tra lại!<br>'
          }
        }
        if (row1.expiryDate) {
          let expiryDate = new Date(row1.expiryDate)
          if (!expiryDate) {
            strErr += 'Dòng ' + idx + ' - Ngày hết hạn không đúng định dạng. Vui lòng kiểm tra lại!<br>'
          }
        }
        if (row1.manufactureDate && row1.expiryDate) {
          if (row1.manufactureDate > row1.expiryDate) {
            strErr += 'Dòng ' + idx + ' - Ngày sản xuất phải bé hơn hạn sử dụng. Vui lòng kiểm tra lại!<br>'
          }
        }
        if (
          row1.estimatedQuantity == null ||
          (typeof row1.estimatedQuantity === 'string' && row1.estimatedQuantity.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Số lượng nhập dự kiến không được để trống!<br>'
        }
        if (row1.estimatedQuantity && row1.quantity) {
          if (row1.quantity > row1.estimatedQuantity) {
            strErr +=
              'Dòng ' +
              idx +
              ' - Số lượng nhập thực phải bé hơn hoặc bằng số lượng nhập dự kiến. Vui lòng kiểm tra lại!<br>'
          }
        }
        if (row1.importprice == null || (typeof row1.importprice === 'string' && row1.importprice.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Giá nhập không được để trống!<br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      const dataExcel: any = {
        name: jsonData[0].name,
        supplierCode: jsonData[0].supplierCode,
        description: jsonData[0]?.description,
        lstItem: jsonData1,
      }

      this.apiService.post(this.apiService.INBOUND.CREATE_BY_EXCEL, dataExcel).then((result) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(this.enumData.Constants.Message_Create_Success)
        this.searchData()
      })
    }
  }

  async onDownloadExcel() {
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
    this.notifyService.showloading()
    this.apiService.post(this.apiService.INBOUND.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.notifyService.hideloading()
        if (data && data[0].length > 0) {
          let date = new Date().toISOString()
          const fileName = 'Danh_sach_don_nhap_kho' + date + '.xlsx'
          let dataExcel: any = []
          data[0].forEach((s: any) => {
            let row: any = {}
            row['Mã đơn nhập'] = s.code ? s.code : ''
            row['Tên đơn nhập'] = s.name ? s.name : ''
            row['Trạng thái đơn nhập'] = this.coreService.getEnumElementName(this.enumData.Inbound, s.status)
            row['Trạng thái hoạt động'] = s.isDeleted == 0 ? 'Đang hoạt động' : 'Ngưng hoạt động'
            dataExcel.push(row)
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          ws['!cols'] = [{ width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }]
          const wb: XLSX.WorkBook = XLSX.utils.book_new()
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Đơn Nhập Kho')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
