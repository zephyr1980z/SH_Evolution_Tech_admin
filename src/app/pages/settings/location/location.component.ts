import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { ApiService } from '../../../services/api.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { AddOrEditLocationComponent } from './add-or-edit-location/add-or-edit-location.component'
// @ts-ignore
import * as XLSX from 'xlsx'
import { LocationDetailComponent } from './location-detail/location-detail.component'
@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
})
export class LocationComponent implements OnInit {
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  loading = true
  isVisible = false
  dataDepartments = []
  enumData = enumData
  checkTemplete = false
  dataEmployees: any = []
  dataObject: any
  isLoadEmployees = false
  dataLocationType: any[] = []
  dataCity: any[] = []
  dataPortArea: any[] = []

  dataUploadExcel: any
  enumRole = enumData.Role.Setting_Location

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.dataSearch = new Object()
    this.dataObject = new Object()
    this.dataSearch.statusId = enumData.StatusFilter.Active.value
    this.dataLocationType = this.coreService.convertObjToArray(enumData.LocationType)
    this.searchData()
    this.loadDataSearch()
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
    if (this.dataSearch.type && this.dataSearch.type !== '') {
      const key = 'type'
      where[key] = this.dataSearch.type
    }
    if (this.dataSearch.areaId && this.dataSearch.areaId !== '') {
      const key = 'areaId'
      where[key] = this.dataSearch.areaId
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
      order: { name: 'ASC' },
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.LOCATION.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  loadDataSearch() {
    Promise.all([
      this.apiService.post(this.apiService.CITY.FIND, { where: { isDeleted: false } }),
      this.apiService.post(this.apiService.LOCATION.FIND_AREA, {}),
    ]).then(async (res) => {
      this.dataCity = res[0] || []
      this.dataPortArea = res[1] || []
    })
  }

  viewDetail(data: any) {
    this.dialog
      .open(LocationDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditLocationComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditLocationComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.LOCATION.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  loadEmployeeByDepartment(departmentId: any) {
    this.notifyService.showloading()
    this.apiService
      .post(this.apiService.EMPLOYEE.FIND, { where: { isDeleted: false, departmentId: departmentId } })
      .then((result) => {
        this.notifyService.hideloading()
        this.dataEmployees = result
      })
  }

  viewEmployees(data: any) {
    this.isLoadEmployees = true
    this.loadEmployeeByDepartment(data.id)
  }

  /** EXCEL */

  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_DS_DIA_DIEM_' + date + '.xlsx'
    dataExcel.push({
      'Mã Địa Điểm (code) *': '',
      'Tên Địa Điểm (name) *': '',
      'Địa Chỉ (address)': '',
      'Loại Địa Điểm (type) *': '',
      'Vĩ Tuyến (lat)': '',
      'Kinh Tuyến (lng)': '',
      'Loại Cảng (KV4,KHAC,CATLAI)': '',
      'Mã Tỉnh Thành (cityCode)': '',
      'Mã Quận Huyện (districtCode)': '',
      'Mã Phường Xã (wardCode)': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Template DS Địa Điểm')
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
        header: ['code', 'name', 'address', 'type', 'lat', 'lng', 'areaCode', 'cityCode', 'districtCode', 'wardCode'],
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
          strErr += 'Dòng ' + idx + ' - Mã Địa Điểm Không Được Để Trống <br>'
        }

        if (row.name == null || (typeof row.name === 'string' && row.name.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên Địa Điểm Không Được Để Trống <br>'
        }

        // if (row.address == null || (typeof row.address === 'string' && row.address.trim().length == 0)) {
        //   strErr += 'Dòng ' + idx + ' -  Địa Điểm Không Được Để Trống <br>'
        // }

        if (row.type == null || (typeof row.type === 'string' && row.type.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Loại Địa Điểm Không Được Để Trống <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.LOCATION.IMPORT_EXCEL, jsonData).then((result) => {
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
    this.apiService.post(this.apiService.LOCATION.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Dia_Diem' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((i: any) => {
            dataExcel.push({
              'Mã Địa Điểm': i.code,
              'Tên Địa Điểm': i.name,
              'Địa Điểm': i.address,
              'Loại Địa Điểm': i.typeName,
              'Phường/Xã': i.wardName,
              'Quận/Huyện': i.districtName,
              'Tỉnh/Thành': i.cityName,
              'Kinh Tuyến': i.lng,
              'Vĩ Tuyến': i.lat,
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
            { width: 20 },
            { width: 20 },
            { width: 30 },
          ]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Địa Điểm')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
