import { Component, Inject, OnInit, Optional } from '@angular/core'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { AuthenticationService } from '../../../services/authentication.service'
import { User } from '../../../models/user.model'
import { AddOrEditCustomerComponent } from './add-or-edit-customer/add-or-edit-customer.component'
import { ApiService } from '../../../services/api.service'

import { CustomerProductComponent } from './customer-product/customer-product.component'
import { CustomerDetailComponent } from './customer-detail/customer-detail.component'
import { CustomerLocationComponent } from './customer-location/customer-location.component'
// @ts-ignore
import * as XLSX from 'xlsx'
import { enumData } from '../../../core/enumData'
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
})
export class CustomerComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData = enumData
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)

  listOfData: any = []
  dataSearch: any = {}
  loading = true
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  dataObject: any

  dataUploadExcel: any
  enumRole = enumData.Role.Customer

  constructor(
    private notifyService: NotifyService,
    public coreService: CoreService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router,
    private authenticationService: AuthenticationService,

    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit(): void {
    this.dataSearch = new Object()
    this.dataObject = new Object()
    this.dataSearch.statusId = enumData.StatusFilter.All.value
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
    if (this.dataSearch.numberPhone && this.dataSearch.numberPhone !== '') {
      const key = 'numberPhone'
      where[key] = this.dataSearch.numberPhone
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
    this.apiService.post(this.apiService.CUSTOMER.PAGINATION, dataSearch).then((data: any) => {
      if (data) {
        this.loading = false
        this.listOfData = data[0]
        this.total = data[1]
      }
    })
  }

  viewCarDetail(data: any) {
    this.dialog
      .open(CustomerDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditCustomerComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(data: any) {
    this.dialog
      .open(AddOrEditCustomerComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  clickProducts(data: any) {
    this.dialog
      .open(CustomerProductComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  setupCustomerLocation(data: any) {
    this.dialog
      .open(CustomerLocationComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CUSTOMER.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  setupCustomerProduct(data: any) {
    this.dialog
      .open(CustomerProductComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  clickDetailproduct(data: any) {
    this.dialog
      .open(CustomerDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }
  /** EXCEL */
  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_DS_Khach_Hang_' + date + '.xlsx'
    dataExcel.push({
      'Mã Khách Hàng* (code)': '',
      'Tên Khách Hàng* (name)': '',
      'SĐT Khách Hàng (numberPhone)': '',
      'Mã Số Thuế* (taxNumber)': '',
      'Người Đại Diện (represenTative)': '',
      'SĐT Người Đại Diện (represenNumberphone)': '',
      'Địa Chỉ* (address)': '',
      'Email (email)': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [
      { width: 20 },
      { width: 20 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 40 },
      { width: 30 },
      { width: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Template DS Khách Hàng')
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
          'code',
          'name',
          'numberPhone',
          'taxNumber',
          'represenTative',
          'represenTativenumberPhone',
          'address',
          'email',
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
      const res: any[] = jsonData
      //** */
      for (const row of jsonData) {
        let idx = jsonData.indexOf(row) + 2

        if (row.code == null || (typeof row.code === 'string' && row.code.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã Khách Hàng Không Được Để Trống <br>'
        }

        if (row.name == null || (typeof row.name === 'string' && row.name.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên Khách Hàng Không Được Để Trống <br>'
        }

        // if (row.numberPhone == null || (typeof row.numberPhone === 'string' && row.numberPhone.trim().length == 0)) {
        //   strErr += 'Dòng ' + idx + ' - SĐT Không Được Để Trống <br>'
        // }

        if (row.taxNumber == null || (typeof row.taxNumber === 'string' && row.taxNumber.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã Số Thuế Không Được Để Trống <br>'
        }

        // if (
        //   row.represenTative == null ||
        //   (typeof row.represenTative === 'string' && row.represenTative.trim().length == 0)
        // ) {
        //   strErr += 'Dòng ' + idx + ' - Người Đại Diện Không Được Để Trống <br>'
        // }

        // if (
        //   row.represenTativenumberPhone == null ||
        //   (typeof row.represenTativenumberPhone === 'string' && row.represenTativenumberPhone.trim().length == 0)
        // ) {
        //   strErr += 'Dòng ' + idx + ' - SĐT Người Đại Diện Không Được Để Trống <br>'
        // }

        if (row.address == null || (typeof row.address === 'string' && row.address.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Địa Chỉ Không Được Để Trống <br>'
        }

        // if (row.email == null || ( typeof row.email === 'string' && row.email.trim().length == 0)) {
        //   strErr += 'Dòng ' + idx + ' - Email Không Được Để Trống <br>'
        // }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.CUSTOMER.IMPORT_EXCEL, jsonData).then((result) => {
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
    this.apiService.post(this.apiService.CUSTOMER.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Khach_Hang_' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((s: any) => {
            dataExcel.push({
              'Mã Khách Hàng': s.code,
              'Tên Khách Hàng': s.name,
              'SĐT Khách Hàng': s.numberPhone,
              'Mã Số Thuế': s.taxNumber,
              'Người Đại Diện': s.represenTative,
              'SĐT Người Đại Diện': s.represenTativenumberPhone,
              'Địa Chỉ': s.address,
              Email: s.email,
            })
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          const wb: XLSX.WorkBook = XLSX.utils.book_new()
          ws['!cols'] = [
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 50 },
            { width: 20 },
          ]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Khách Hàng')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
