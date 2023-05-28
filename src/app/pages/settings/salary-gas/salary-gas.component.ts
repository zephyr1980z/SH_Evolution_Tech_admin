import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { AddOrEditSalaryGasComponent } from './add-or-edit-salary-gas/add-or-edit-salary-gas.component'
import * as XLSX from 'xlsx'
@Component({
  selector: 'app-salary-gas',
  templateUrl: './salary-gas.component.html',
})
export class SalaryGasComponent implements OnInit {
  radioValue = 'Salary'
  radioValueGas = 'Gas'

  Salary: any
  Gas: any

  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  listOfData: any[] = []
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  loading = true
  currentUser: User | undefined
  dataSearch: any = {}
  enumData = enumData
  type: string = 'Salary'
  dataUploadExcel: any

  enumRole = enumData.Role.Setting_Salary_Gas

  lstProduct: any = []
  lstLocation: any = []
  lstContType: any = []
  dataServiceType: any = []

  constructor(
    private dialog: MatDialog,
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit(): void {
    this.searchData()
    this.loadAllData()
    this.dataSearch.statusId = this.enumData.StatusFilter.All.value
    this.dataServiceType = this.coreService.convertObjToArray(enumData.ServiceType)
  }

  async filterDataSearch() {
    const where: any = {}
    if (this.dataSearch.productId && this.dataSearch.productId !== '') {
      const key = 'productId'
      where[key] = this.dataSearch.productId
    }
    if (this.dataSearch.locationId && this.dataSearch.locationId !== '') {
      const key = 'locationId'
      where[key] = this.dataSearch.locationId
    }
    if (this.dataSearch.contTypeId && this.dataSearch.contTypeId !== '') {
      const key = 'contTypeId'
      where[key] = this.dataSearch.contTypeId
    }
    if (this.dataSearch.serviceType && this.dataSearch.serviceType !== '') {
      where['serviceType'] = this.dataSearch.serviceType
    }
    where['type'] = this.type
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

  async loadAllData() {
    Promise.all([
      this.apiService.post(this.apiService.PRODUCT.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.LOCATION.CUSTOM_FIND, { isDeleted: false, locationType: 'Port' }),
      this.apiService.post(this.apiService.CONT_TYPE.FIND, { isDeleted: false }),
    ]).then(async (res) => {
      if (res) {
        this.lstProduct = res[0]
        this.lstLocation = res[1]
        this.lstContType = res[2]
      }
    })
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
    this.apiService.post(this.apiService.SALARY_GAS.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
    this.notifyService.hideloading()
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditSalaryGasComponent, { disableClose: false, data: { type: this.type, add: true } })
      .afterClosed()
      .subscribe((flag) => {
        if (flag) this.searchData()
      })
  }

  clickEdit(object: any) {
    object.type = this.type
    this.dialog
      .open(AddOrEditSalaryGasComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((flag) => {
        if (flag) this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.SALARY_GAS.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  onchangeRadioValue(event: any) {
    if (event == 'Salary') {
      this.type = 'Salary'
    } else if (event == 'Gas') {
      this.type = 'Gas'
    }
    this.searchData()
  }

  /** EXCEL */

  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_Luong_Dau' + date + '.xlsx'
    dataExcel.push({
      'Lương/Dầu(Salary/Gas)*': '',
      'Loại Dịch Vụ (XuatKhau or NhapKhau or ChuyenKho)*': '',
      'Hàng Hóa (productCode)*': '',
      'Cảng (locationCode)*': '',
      'Loại Cont (contTypeCode)*': '',
      'Số Lượng Cont (quantity)*': '',
      'Kiểu Lấy Hàng (XuatKhau(TuHa or HaOBai or TuHaVeBai )/NhapKhau(TuLay or LayOBai or TuLayLayBai ))': '',
      'Đơn Giá (unitPrice)*': '',
      'Số Cộng Thêm (plusNumber)*': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 40 },
      { width: 30 },
      { width: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Template Lương Dầu')
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
          // Lương/Dầu
          'typeCode',
          // Loại dịch vụ
          'serviceTypeCode',
          // Hàng hóa
          'productCode',
          // Cảng
          'locationCode',
          // Loại cont
          'contTypeCode',
          // Sl cont
          'quantity',
          // Kiểu lấy hàng
          'pickupTypeCode',
          // Đơn giá
          'unitPrice',
          // Số cộng thêm
          'plusNumber',
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
        if (row.typeCode == null || (typeof row.typeCode === 'string' && row.typeCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Loại Lương Dầu Không Được Để Trống <br>'
        }

        if (
          row.serviceTypeCode == null ||
          (typeof row.serviceTypeCode === 'string' && row.serviceTypeCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Loại Dịch Vụ Không Được Để Trống <br>'
        }

        if (row.productCode == null || (typeof row.productCode === 'string' && row.productCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Hàng Hóa Không Được Để Trống <br>'
        }

        if (row.locationCode == null || (typeof row.locationCode === 'string' && row.locationCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Cảng Không Được Để Trống <br>'
        }

        if (row.contTypeCode == null || (typeof row.contTypeCode === 'string' && row.contTypeCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Loại Cont Đến Không Được Để Trống <br>'
        }
        if (row.quantity == null || (typeof row.quantity === 'string' && row.quantity.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Số lượng Cont Đến Không Được Để Trống <br>'
        }

        if (row.unitPrice == null || (typeof row.unitPrice === 'string' && row.unitPrice.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Đơn Giá Đến Không Được Để Trống <br>'
        }
        if (row.plusNumber == null || (typeof row.plusNumber === 'string' && row.plusNumber.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Số Cộng Thêm Đến Không Được Để Trống <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.SALARY_GAS.IMPORT_EXCEL, jsonData).then((result) => {
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
    this.apiService.post(this.apiService.SALARY_GAS.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Luong_Dau_' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((i: any) => {
            dataExcel.push({
              'Loại Dịch Vụ': i.serviceName,
              'Hàng Hóa': i.productName,
              Cảng: i.locationName,
              'Loại Cont': i.contTypeName,
              'Số lượng cont': i.quantity,
              'Kiểu Lấy Hàng': i.distance,
              'Đơn Giá': i.unitPrice,
              'Số Cộng Thêm': i.plusNumber,
            })
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          const wb: XLSX.WorkBook = XLSX.utils.book_new()
          ws['!cols'] = [{ width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 20 }]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Lương Dầu')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
