import { Component, OnInit } from '@angular/core'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'
import * as XLSX from 'xlsx'
import * as moment from 'moment'

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
})
export class InventoryComponent implements OnInit {
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any
  dataObject: any
  loading = true
  currentUser: User | any
  enumData = enumData

  lstSupplier: any = []
  lstItem: any = []
  dataUploadExcel: any

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
  }

  ngOnInit(): void {
    this.dataSearch = new Object()
    this.searchData()
    this.loadDataSearch()
  }

  async filterDataSearch() {
    const where: any = {}
    if (this.dataSearch.code && this.dataSearch.code !== '') {
      const key = 'code'
      where[key] = this.dataSearch.code
    }
    if (this.dataSearch.itemCode && this.dataSearch.itemCode !== '') {
      const key = 'itemCode'
      where[key] = this.dataSearch.itemCode
    }
    if (this.dataSearch.itemName && this.dataSearch.itemName !== '') {
      const key = 'itemName'
      where[key] = this.dataSearch.itemName
    }
    if (this.dataSearch.supplierId && this.dataSearch.supplierId !== '') {
      const key = 'supplierId'
      where[key] = this.dataSearch.supplierId
    }
    where['status'] = enumData.Inbound_Detail.DaNhap.code
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
    this.apiService.post(this.apiService.INBOUND.IBDETAIL_PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  async loadDataSearch() {
    Promise.all([
      this.apiService.post(this.apiService.ITEM.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.ITEM_SUPPLIER.FIND, { isDeleted: false }),
    ]).then((res) => {
      this.notifyService.hideloading()
      if (res) {
        this.lstItem = res[0]
        this.lstSupplier = res[1]
      }
    })
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
    this.apiService.post(this.apiService.INBOUND.IBDETAIL_PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Kiem_ton_chi_tiet_lo_' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((s: any) => {
            dataExcel.push({
              'Mã lô phụ tùng': s.code,
              'Mã phụ tùng': s.itemCode,
              'Tên phụ tùng': s.itemName,
              'Ngày sản xuất': moment(s.manufactureDate).format('DD/MM/YYYY'),
              'Hạn sử dụng': moment(s.expiryDateb).format('DD/MM/YYYY'),
              'Số lượng nhập dự kiến': s.estimatedQuantity ? Number(s.estimatedQuantity).toLocaleString('vi') : '',
              'Số lượng nhập thực': s.itemDetailQuantity ? Number(s.itemDetailQuantity).toLocaleString('vi') : '',
              'Số lượng còn lại': s.quantity ? Number(s.quantity).toLocaleString('vi') : '',
              'Giá tồn kho': s.importprice ? Number(s.importprice).toLocaleString('vi') : '',
            })
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          const wb: XLSX.WorkBook = XLSX.utils.book_new()

          ws['!cols'] = [
            { width: 20 },
            { width: 20 },
            { width: 40 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
          ]
          XLSX.utils.book_append_sheet(wb, ws, 'Kiểm Tồn Chi Tiết Lô')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
