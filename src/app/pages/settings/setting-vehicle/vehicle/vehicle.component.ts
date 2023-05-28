import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { AddOrEditVehicleComponent } from './add-or-edit-vehicle/add-or-edit-vehicle.component'
// @ts-ignore
import * as XLSX from 'xlsx'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { NotifyService } from '../../../../services/notify.service'
import { ApiService } from '../../../../services/api.service'
import { CoreService } from '../../../../services/core.service'
import { AuthenticationService } from '../../../../services/authentication.service'
@Component({
  selector: 'app-vehicle',
  templateUrl: './vehicle.component.html',
})
export class VehicleComponent implements OnInit {
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  listOfData: any[] = []
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  loading = true
  dataSearch: any = {}
  currentUser: User | any

  enumData = enumData
  dataDriver: any[] = []
  dataRomooc: any[] = []
  dataVehicle: any[] = []

  dataUploadExcel: any
  enumRole = enumData.Role.Setting_Vehicle

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

  ngOnInit() {
    this.searchData()
    this.dataSearch.statusId = this.enumData.StatusFilter.All.value
    this.apiService.post(this.apiService.DRIVER.FIND, {}).then((result) => {
      if (result) {
        this.dataDriver = result
      }
    })
    this.apiService.post(this.apiService.ROMOOC.FIND, {}).then((result) => {
      if (result) {
        this.dataRomooc = result
      }
    })
    this.apiService.post(this.apiService.VEHICLE.FIND, {}).then((result) => {
      if (result) {
        this.dataVehicle = result
      }
    })
  }

  // async filterDataSearch() {
  //   const where: any = {}
  //   if (this.dataSearch.code && this.dataSearch.code !== '') {
  //     const key = 'code'
  //     where[key] = this.dataSearch.code
  //   }
  //   // if (this.dataSearch.name && this.dataSearch.name !== '') {
  //   //   const key = 'name'
  //   //   where[key] = this.dataSearch.name
  //   // }
  //   if (this.dataSearch.statusId > 0) {
  //     const key = 'isDeleted'
  //     if (this.dataSearch.statusId === this.enumData.StatusFilter.Active.value) {
  //       where[key] = false
  //     }
  //     if (this.dataSearch.statusId === this.enumData.StatusFilter.InActive.value) {
  //       where[key] = true
  //     }
  //   }
  //   return where
  // }

  async searchData(reset: boolean = false) {
    this.loading = false
    if (reset) {
      this.pageIndex = 1
    }

    // let where = await this.filterDataSearch()
    const where = { ...this.dataSearch }
    await this.coreService.filterDataSearch(where)

    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.VEHICLE.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditVehicleComponent, { disableClose: false })
      .afterClosed()
      .subscribe((flag) => {
        if (flag) this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditVehicleComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((flag) => {
        if (flag) this.searchData()
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.VEHICLE.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  /** EXCEL */

  clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    const fileName = 'Template_DS_DAU_KEO_' + date + '.xlsx'
    dataExcel.push({
      'Mã Đầu Kéo(code)*': '',
      'Biển Số Đầu Kéo(regNo)*': '',
      'Địa Chỉ Đầu Kéo(address)*': '',
      'Mã Tài Xế Hiện Tại(driverCode)': '',
      'Mã Tài Xế Mặc Định(defaultDriverCode)': '',
      'Mã Rơ Moóc Hiện Tại(romoocCode)': '',
      'Dòng Xe(vehicleBrandCode)': '',
      'Địa Điểm(locationCode)*': '',
    })
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    ws['!cols'] = [
      { width: 20 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, 'Template DS Đầu Kéo')
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
          'regNo',
          'address',
          'driverCode',
          'defaultDriverCode',
          'romoocCode',
          'vehicleBrandCode',
          'locationCode',
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
          strErr += 'Dòng ' + idx + ' - Mã Đầu Kéo Không Được Để Trống <br>'
        }

        if (row.regNo == null || (typeof row.regNo === 'string' && row.regNo.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Biển Số Đầu Kéo Không Được Để Trống <br>'
        }

        if (row.address == null || (typeof row.address === 'string' && row.address.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Địa Chỉ Đầu Kéo Không Được Để Trống <br>'
        }
        if (row.locationCode == null || (typeof row.locationCode === 'string' && row.locationCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Địa Điểm Không Được Để Trống <br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.VEHICLE.IMPORT_EXCEL, jsonData).then((result) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess('Thêm Mới File Excel Thành Công')
        this.searchData()
        this.dataUploadExcel = []
      })
    }
  }

  async onDownloadExcel() {
    this.notifyService.showloading()

    // let where = await this.filterDataSearch()
    const where = { ...this.dataSearch }
    await this.coreService.filterDataSearch(where)

    const dataSearch = {
      where: where,
      order: { updatedAt: 'DESC' },
      skip: 0,
      take: enumData.Page.pageSizeMax,
    }
    this.loading = true
    this.apiService.post(this.apiService.VEHICLE.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Dau_Keo_' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((i: any) => {
            dataExcel.push({
              'Mã Đầu Kéo': i.code,
              'Biển Số Đầu Kéo': i.regNo,
              'Địa Chỉ Đầu Kéo': i.address,
              'Tài Xế Hiện Tại': i.driverName,
              'Tài Xế Mặc Định': i.defaultDriverName,
              'B.s Rơ Moóc Hiện Tại': i.romoocRegNo,
              'Dòng Xe': i.vehicleBrandName,
            })
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          const wb: XLSX.WorkBook = XLSX.utils.book_new()
          ws['!cols'] = [{ width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }, { width: 20 }]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Đầu Kéo')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
