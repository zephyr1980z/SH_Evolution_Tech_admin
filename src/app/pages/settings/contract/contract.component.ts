import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { ContractTermComponent } from '../contract-term/contract-term.component'
import { EditContractComponent } from './edit-contract/edit-contract.component'
import { ContractDetailComponent } from './contract-detail/contract-detail.component'
import { AddOrCopyContractComponent } from './add-or-copy-contract/add-or-coppy-contract.component'
// @ts-ignore
import * as XLSX from 'xlsx'
import { Workbook } from 'exceljs'
import * as moment from 'moment'
const fs = require('file-saver')

@Component({
  selector: 'app-contract',
  templateUrl: './contract.component.html',
  styleUrls: ['./contract.component.scss'],
})
export class ContractComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData = enumData
  modalTitle: any
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  listOfData: any = []
  dataCustomer: any[] = []
  dataSearch: any = {}
  loading = true
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total

  dataUploadExcel: any
  enumRole = enumData.Role.Contract

  constructor(
    private notifyService: NotifyService,
    public coreService: CoreService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit(): void {
    this.dataSearch.statusId = this.enumData.StatusFilter.All.value
    this.dataSearch = new Object()
    this.searchData()
  }

  async filterDataSearch() {
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

    const where = { ...this.dataSearch }
    await this.coreService.filterDataSearch(where)

    const dataSearch = {
      where,
      order: { createdAt: 'DESC' },
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.CONTRACT.PAGINATION, dataSearch).then((data: any) => {
      if (data) {
        this.listOfData = data[0]
        this.total = data[1]
        this.loading = false
      }
    })
  }

  loadCustomer() {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CUSTOMER.FIND, { where: { isDeleted: false } }).then((result) => {
      this.notifyService.hideloading()
      this.dataCustomer = result
    })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CONTRACT.DELETE, { code: data.code }).then((res: any) => {
      this.notifyService.hideloading()
      if (res) {
        this.notifyService.showSuccess('Cập nhật trạng thái thành công!')
        this.searchData()
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrCopyContractComponent, { disableClose: false })
      .afterClosed()
      .subscribe(() => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(EditContractComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  clickDetail(data: any) {
    this.dialog
      .open(ContractDetailComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  clickAppendix(dataRow: any) {
    this.dialog
      .open(ContractTermComponent, { disableClose: false, data: dataRow })
      .afterClosed()
      .subscribe((res) => {})
  }

  copyContract(object: any) {
    this.dialog
      .open(AddOrCopyContractComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe(() => {
        this.searchData()
      })
  }

  // EXCEL_TEMPLATE, EXPORT
  templateHeader = [
    'Mã Hợp Đồng* (code)',
    'Tên Hợp Đồng* (name)',
    'Mã Khách Hàng* (customerCode)',
    'Ngày Ký DD/MM/YYYY (signDate)',
    'Ngày Hiệu Lực DD/MM/YYYY (effectDate)',
    'Ngày Hết Hiệu Lực DD/MM/YYYY (expireDate)',
  ]
  async onDownload(template: boolean = false) {
    this.notifyService.hideloading()
    let date = new Date().toISOString()
    const fileName = 'Template_DS_Hop_Dong_' + date + '.xlsx'
    const workbook = new Workbook()
    const worksheet = workbook.addWorksheet('Danh sách hợp đồng')

    // EXCEL-header--start
    let templateWidthValue = [10, 15, 20, 15, 30, 30, 15, 15, 15, 15, 15, 15, 15, 30]
    let widthValue = [30, 30, 30, 40, 30, 30, 25, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
    let header: string[] = []
    if (template) {
      // fileName = `TemplateThemCacKhoanCongTru`
      header = this.templateHeader
      worksheet.getColumn(4).numFmt = '@'
      worksheet.getColumn(5).numFmt = '@'
      worksheet.getColumn(6).numFmt = '@'
    } else {
      // header = [...this.templateHeader, 'Trạng thái']
      // worksheet.getColumn(5).numFmt = '#,##0;[Red]-#,##0'
      // worksheet.getColumn(6).numFmt = '#,##0;[Red]-#,##0'
      // worksheet.getColumn(7).numFmt = '#,##0;[Red]-#,##0'
      // worksheet.getColumn(8).numFmt = '#,##0;[Red]-#,##0'
      // worksheet.getColumn(9).numFmt = '#,##0;[Red]-#,##0'
      // worksheet.getColumn(10).numFmt = '#,##0;[Red]-#,##0'
      // worksheet.getColumn(11).numFmt = '#,##0;[Red]-#,##0'
      // worksheet.getColumn(12).numFmt = '#,##0;[Red]-#,##0'
    }
    const headerRow = worksheet.addRow(header)

    // Cell Style : Fill and Border
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '001E3E' },
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
      cell.font = { size: 11, bold: true, color: { argb: 'FFFFFF' } }
      cell.border = {
        top: { style: 'thin', color: { argb: '777777' } },
        left: { style: 'thin', color: { argb: '777777' } },
        bottom: { style: 'thin', color: { argb: '777777' } },
        right: { style: 'thin', color: { argb: '777777' } },
      }
      if (template) {
        worksheet.getColumn(colNumber).width = templateWidthValue[colNumber - 1]
      }
      {
        worksheet.getColumn(colNumber).width = widthValue[colNumber - 1]
      }
    })
    // headerRow.height = 24
    // worksheet.getColumn(4).numFmt = '@'
    // worksheet.getColumn(5).numFmt = '@'

    // EXCEL-header--end

    // EXCEL-data--start
    if (template) {
      // await this.apiService.post(this.apiService.CONTRACT.PAGINATION, {}).then((res: any) => {
      //   if (res) {
      //     const lstData = res
      //     // Add Data and Conditional Formatting
      //     for (let driver of lstData) {
      //       const rowData = [
      //         driver.code,
      //         driver.vehicleRegNo,
      //         driver.name,
      //         driver.numberPhone,
      //         moment(new Date()).format('MM/YYYY'),
      //         '',
      //         '200000',
      //         '',
      //         '',
      //         '',
      //         '',
      //         '',
      //         '',
      //         '',
      //         '',
      //       ]
      //       const row = worksheet.addRow(rowData)
      //       row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      //         cell.border = {
      //           top: { style: 'thin' },
      //           left: { style: 'thin' },
      //           bottom: { style: 'thin' },
      //           right: { style: 'thin' },
      //         }
      //       })
      //     }
      //   }
      // })
    } else {
      const where = { ...this.dataSearch }
      await this.coreService.filterDataSearch(where)

      const dataSearch = {
        where,
        skip: 0,
        order: { createdAt: 'DESC' },
        take: enumData.Page.pageSizeMax,
      }

      await this.apiService.post(this.apiService.CONTRACT.PAGINATION, dataSearch).then((res: any) => {
        if (res) {
          const lstData = res[0]

          // Add Data and Conditional Formatting
          for (let data of lstData) {
            const rowData = [
              data.__driver__.code,
              data.vehicleRegNo,
              data.__driver__.name,
              data.__driver__.numberPhone,
              data.date ? moment(new Date(data.date)).format('MM/YYYY') : '',
              data.money ? Number(data.money) : 0,
              data.providedMoney ? Number(data.providedMoney) : 0,
              data.excessMoney ? Number(data.excessMoney) : 0,
              data.payCutMoney ? Number(data.payCutMoney) : 0,
              data.moneyRice ? Number(data.moneyRice) : 0,
              data.moneyAdditional ? Number(data.moneyAdditional) : 0,
              data.moneyAnother ? Number(data.moneyAnother) : 0,
              data.moneyRest ? Number(data.moneyRest) : 0,
              data.moneyBonusYear ? Number(data.moneyBonusYear) : 0,
              data.description,
              data.isDeleted ? 'Ngưng hoạt động' : 'Đang hoạt động',
            ]

            const row = worksheet.addRow(rowData)

            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
              }
            })
          }
        }
      })
    }
    // EXCEL-data--end

    // EXCEL-Compile--start
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      fs.saveAs(blob, fileName)
      this.notifyService.hideloading()
    })
    // EXCEL-Compile--end
  }

  // /** EXCEL */
  // clickDownloadTemplateExcel() {
  //   let date = new Date().toISOString()
  //   let dataExcel: any = []
  //   const fileName = 'Template_DS_Hop_Dong_' + date + '.xlsx'
  //   dataExcel.push({
  //     'Mã Hợp Đồng* (code)': '',
  //     'Tên Hợp Đồng* (name)': '',
  //     'Mã Khách Hàng* (customerCode)': '',
  //     'Ngày Ký DD/MM/YYYY (signDate)': '',
  //     'Ngày Hiệu Lực DD/MM/YYYY (effectDate)': '',
  //     'Ngày Hết Hiệu Lực DD/MM/YYYY (expireDate)': '',
  //   })
  //   const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
  //   /* set the format */
  //   // cell.z = '@';
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new()
  //   ws['!cols'] = [{ width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }, { width: 30 }]
  //   XLSX.utils.book_append_sheet(wb, ws, 'Template DS Hợp Đồng')
  //   XLSX.writeFile(wb, fileName)
  // }

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
        header: ['code', 'name', 'customerCode', 'signDate', 'effectDate', 'expireDate'],
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
        if (row.customerCode == null || (typeof row.customerCode === 'string' && row.customerCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên Khách Hàng Không Được Để Trống <br>'
        }
        if (row.code == null || (typeof row.code === 'string' && row.code.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã Hợp Đồng Không Được Để Trống <br>'
        }

        if (row.name == null || (typeof row.name === 'string' && row.name.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Tên Hợp Đồng Không Được Để Trống <br>'
        }

        if (row.signDate) {
          let checkdob = moment(row.signDate, 'DD/MM/YYYY', true)
          if (!checkdob.isValid()) {
            strErr += 'Dòng ' + idx + ' - Ngày Ký không đúng định dạng. Vui lòng kiểm tra lại <br>'
          } else {
            row.signDate = checkdob.toDate()
          }
        }
        if (row.effectDate) {
          let checkdob = moment(row.effectDate, 'DD/MM/YYYY', true)
          if (!checkdob.isValid()) {
            strErr += 'Dòng ' + idx + ' - Ngày Hiệu Lực không đúng định dạng. Vui lòng kiểm tra lại <br>'
          } else {
            row.effectDate = checkdob.toDate()
          }
        }
        if (row.expireDate) {
          let checkdob = moment(row.expireDate, 'DD/MM/YYYY', true)
          if (!checkdob.isValid()) {
            strErr += 'Dòng ' + idx + ' - Ngày Hết Hiệu Lực không đúng định dạng. Vui lòng kiểm tra lại <br>'
          } else {
            row.expireDate = checkdob.toDate()
          }
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }
      this.apiService.post(this.apiService.CONTRACT.IMPORT_EXCEL, jsonData).then((result) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess('Thêm Mới File Excel Thành Công')
        this.searchData()
        this.dataUploadExcel = []
      })
    }
  }

  async onDownloadExcel() {
    this.notifyService.showloading()

    const where = { ...this.dataSearch }
    await this.coreService.filterDataSearch(where)

    const dataSearch = {
      where: where,
      order: { updatedAt: 'DESC' },
      skip: 0,
      take: enumData.Page.pageSizeMax,
    }
    this.loading = true
    this.apiService.post(this.apiService.CONTRACT.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Hop_Dong' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((i: any) => {
            dataExcel.push({
              'Mã Hợp Đồng': i.code,
              'Tên Hợp Đồng': i.name,
              'Tên Khách Hàng': i.customerId ? i.__customer__.name : '',
              'Ngày Ký': moment(i.signDate).format('YYYY-MM-DD'),
              'Ngày Hiệu Lực': moment(i.effectDate).format('YYYY-MM-DD'),
              'Ngày Hết Hiệu Lực': moment(i.expireDate).format('YYYY-MM-DD'),
            })
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
          ]
          // ws["!cols"][4].z = "@";
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Hợp Đồng')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }
}
