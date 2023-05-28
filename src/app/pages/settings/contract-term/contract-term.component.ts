import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { ContractPriceComponent } from '../contract-price/contract-price.component'
import { AddEditContarctTermComponent } from './add-edit-contarct-term/add-edit-contarct-term.component'
import { Column, Workbook } from 'exceljs'
import * as XLSX from 'xlsx'
import * as moment from 'moment'
const fs = require('file-saver')

@Component({
  selector: 'app-contract-term',
  templateUrl: './contract-term.component.html',
})
export class ContractTermComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData = enumData
  enumRole: any = enumData.Role.Customer

  dataStatusFilterNew = this.coreService.convertObjToArray(enumData.StatusFilterNew)
  listOfData: any = []
  dataSearch: any = {}
  loading = true
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total

  dataObject: any = {}

  constructor(
    private notifyService: NotifyService,
    public coreService: CoreService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private dialogRef: MatDialogRef<ContractTermComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dataParent: any
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit(): void {
    this.dataObject = new Object()
    // this.dataSearch = this.data
    this.dataSearch.statusId = enumData.StatusFilter.All.value
    this.searchData()
  }

  async searchData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1
    }
    this.loading = true

    const where = { ...this.dataSearch }
    await this.coreService.filterDataSearch(where)

    // Add condition
    where.customerContractId = this.dataParent.id

    const dataSearch = {
      where,
      order: { createdAt: 'DESC' },
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.CUSTOMER_CONTRACT_TERM.PAGINATION, dataSearch).then((data: any) => {
      if (data) {
        this.listOfData = data[0]
        this.total = data[1]
        this.loading = false
      }
    })
  }

  // async searchData(reset: boolean = false) {
  //   if (reset) {
  //     // this.isSave = false
  //     this.pageIndex = 1
  //     this.setOfCheckedId.clear()
  //   }
  //   this.hashing = {}
  //   this.checked = false
  //   this.indeterminate = false
  //   this.isSave = false
  //   this.loading = true

  //   const where = { ...this.dataSearch }
  //   await this.coreService.filterDataSearch(where)

  //   const dataSearch = {
  //     where: where,
  //     skip: (this.pageIndex - 1) * this.pageSize,
  //     take: this.pageSize,
  //   }

  //   await this.apiService.post(this.apiService.OPS_ACCOUNTING.PAGINATION, dataSearch).then((data: any) => {
  //     if (data) {
  //       this.loading = false
  //       this.total = data[1]
  //       this.listOfData = data[0]
  //     }
  //   })
  // }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CUSTOMER_CONTRACT_TERM.DELETE, { id: data.id }).then((res: any) => {
      this.notifyService.hideloading()
      if (res) {
        this.notifyService.showSuccess('Cập nhật trạng thái thành công!')
        this.searchData()
      }
    })
  }

  clickAdd(dataRow: any = {}) {
    dataRow.customerContract = this.dataParent

    this.dialog
      .open(AddEditContarctTermComponent, { disableClose: false, data: dataRow })
      .afterClosed()
      .subscribe(() => {
        this.searchData()
        this.dataParent.add = false
      })
  }

  clickEdit(dataRow: any) {
    dataRow.customerContract = this.dataParent
    this.dialog
      .open(AddEditContarctTermComponent, { disableClose: false, data: dataRow })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  clickPricelist(data: any) {
    data.customerContractTermId = data.id
    this.dialog
      .open(ContractPriceComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }

  // EXCEL_TEMPLATE, EXPORT
  templateHeader = [
    'STT',
    'Mã Phụ Lục',
    'Tên Phụ Lục',
    'Mức chiết khấu',
    'Người nhận chiết khấu',
    'Dịch Vụ Vận Chuyển',
    'Hình Thức Vận Chuyển',
    'Ngày Hiệu Lực',
    'Ngày Hết Hiệu Lực',
  ]

  async onDownload(template: boolean = false) {
    this.notifyService.hideloading()

    let date = new Date().toISOString()
    let fileNamehead = `DANH_SACH_PHU_LUC_HOP_DONG`

    let fileNameAdditional = `${this.dataParent.name}-${date}.xlsx`
    let fileName = `${fileNamehead}-${fileNameAdditional}`

    const workbook = new Workbook()
    const sheet1 = workbook.addWorksheet(fileNamehead)
    // EXCEL-header--start

    // FORMAT FILE EXCEL--start
    const fmtTxt = '@'
    const fmtNum = '#,##0;[Red]-#,##0'

    // default: 'text', 'date', 'dateTime', 'number'
    // const typeColumn:any = {
    //   text: { code:'text'},
    //   date: { code:'date'},
    //   dateTime: { code:'dateTime'},
    //   number: { code:'number'},
    // }
    const textFmt = 'text'
    const dateFmt = 'date'
    const dateTimeFmt = 'dateTime'
    const monthFmt = 'month'
    const numberFmt = 'number'

    // Khai báo kiểu liệu
    const columnFmt: any = {
      4: numberFmt,
      8: dateFmt,
      9: dateFmt,
    }

    // Khai báo các loại dữ liệu của cột số {thứ tụ cột:fmtTxt or fmtNum}
    // Khai báo các loại dữ liệu của cột {thứ tụ cột:fmtTxt or fmtNum}
    // FORMAT FILE EXCEL--end

    let header: string[] = []
    if (template) {
      fileName = `Template${fileName}`
      header = this.templateHeader
    } else {
      header = [...this.templateHeader, 'Trạng thái']
    }
    const headerRow = sheet1.addRow(header)

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
    })
    headerRow.height = 24
    // sheet1.getColumn(4).numFmt = '@'
    // sheet1.getColumn(5).numFmt = '@'

    // EXCEL-header--end

    // EXCEL-data--start
    if (template) {
      // MAKE DATE INPUT
      // await this.apiService.post(this.apiService.PHONE_CHARGES.TEMPLATE_EXCEL, {}).then((res: any) => {
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
      //       const row = sheet1.addRow(rowData)
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

      await this.apiService.post(this.apiService.CUSTOMER_CONTRACT_TERM.PAGINATION, dataSearch).then((res: any) => {
        if (res) {
          const lstData = res[0]

          // Add Data and Conditional Formatting
          // data.date ? moment(new Date(data.date)).format('MM/YYYY') : '',
          for (const [index, data] of lstData.entries()) {
            const rowData = [
              index,
              data.code,
              data.name,
              data.discountInfo,
              data.discountRecipient,
              data.serviceType,
              data.transportType,
              data.effectDate,
              data.expireDate,
            ]

            const row = sheet1.addRow([...rowData, data.isDeleted ? 'Ngưng hoạt động' : 'Đang hoạt động'])

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
    // EXCEL-format-last--start
    sheet1.columns.forEach((value: Partial<Column>, index: number, array: Partial<Column>[]) => {
      const indexColumn = +index + 1

      let column = value as Column
      let maxLength = 0

      // Format column .numFmt
      const fmtType = columnFmt[indexColumn]
      column.numFmt = fmtType === numberFmt ? fmtNum : fmtTxt

      column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        // Covert data to format data
        const value: any = cell.value

        // Covert data to format data
        if (rowNumber > 1) {
          if (fmtType === dateFmt) {
            const convertStringDate: string = moment(value).format('DD/MM/YYYY')
            cell.value = cell.value ? convertStringDate : ''
          } else if (fmtType === dateTimeFmt) {
            // dateTimeFmt
            const convertStringDate: string = moment(new Date(value)).format('DD/MM/YYYY HH:ss')
            cell.value = value ? convertStringDate : ''
          } else if (fmtType === monthFmt) {
            // monthFmt
            const convertStringDate: string = moment(new Date(value)).format('MM/YYYY')
            cell.value = value ? convertStringDate : ''
          } else if (fmtType === numberFmt) {
            // numberFmt
            cell.value = value ? +value : 0
          }
        }

        // assing max length
        maxLength = value?.toString().length > maxLength ? value?.toString().length : maxLength
      })

      column.width = maxLength + 5
    })
    // EXCEL-format-last--end

    // EXCEL-Compile--start
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      fs.saveAs(blob, fileName)
      this.notifyService.hideloading()
    })
    // EXCEL-Compile--end
  }
  // EXCEL --end

  //IMPORT EXCEL
  // async clickImportExcel(ev: any) {
  //   this.notifyService.showloading()
  //   const sheetHeader = [
  //     // 'Mã tài xế',
  //     'driverCode',
  //     // 'Biển số xe mặc định',
  //     'vehicleRegNo',
  //     // 'Họ và tên tài xế',
  //     'driverName',
  //     // 'SĐT',
  //     'driverNumberPhone',
  //     // 'Tháng',
  //     'date',
  //     // 'Phí điện thoại đã sử dụng',
  //     'money',
  //     // 'Số tiền được cấp',
  //     'providedMoney',
  //     // 'Tổng dư còn lại',
  //     'excessMoney',
  //     // 'Tổng trừ lương',
  //     'payCutMoney',
  //     // 'Tiền cơm',
  //     'moneyRice',
  //     'moneyAdditional',
  //     'moneyAnother',
  //     'moneyRest',
  //     'moneyBonusYear',
  //     // 'Ghi chú',
  //     'description',
  //   ]

  //   const required: string[] = ['driverCode', 'date', 'money', 'providedMoney']

  //   let workBook = null
  //   let jsonData: any = null
  //   const reader = new FileReader()
  //   const file = ev.target.files[0]

  //   reader.readAsBinaryString(file)
  //   reader.onload = () => {
  //     workBook = XLSX.read(reader.result, {
  //       type: 'binary',
  //       cellDates: true,
  //     })
  //     jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]], {
  //       raw: true,
  //       defval: null,
  //       header: sheetHeader,
  //     })
  //     // fix lỗi k import 2 lần đc
  //     ;(<HTMLInputElement>document.getElementById('file')).value = ''

  //     //get header and delete header out of array
  //     const header = jsonData.shift()
  //     if (header) {
  //       const arrayHeader = Object.values(header)
  //       if (JSON.stringify(this.templateHeader) !== JSON.stringify(arrayHeader)) {
  //         this.notifyService.hideloading()
  //         this.notifyService.showError('Template không đúng định dạng. Vui lòng kiểm tra lại!')
  //         return
  //       }
  //     } else {
  //       this.notifyService.hideloading()
  //       this.notifyService.showError('Template không đúng định dạng. Vui lòng kiểm tra lại!')
  //       return
  //     }

  //     let pushInList = []
  //     let strErr = ''

  //     for (const row of jsonData) {
  //       let idx = jsonData.indexOf(row) + 1
  //       let myItem: any = sheetHeader.reduce((ac, a) => ({ ...ac, [a]: row[a] }), {})

  //       for (let e of required) {
  //         if (!myItem[e]) {
  //           strErr += `Dòng ${idx} - ${header[`${e}`]} không được để trống<br>`
  //         }

  //         if (myItem.date) {
  //           let checkdate = moment(myItem.date, 'MM/YYYY', true)
  //           if (!checkdate.isValid()) {
  //             strErr += 'Dòng ' + idx + ' - cột nhập Tháng không đúng định dạng. Vui lòng kiểm tra lại (MM/YYYY)<br>'
  //           } else {
  //             myItem.date = checkdate.toDate()
  //           }
  //         }
  //       }

  //       pushInList.push(myItem)
  //     }

  //     if (strErr.length > 0) {
  //       this.notifyService.hideloading()
  //       this.notifyService.showError(strErr)
  //       return
  //     }

  //     if (pushInList.length === 0) {
  //       this.notifyService.hideloading()
  //       this.notifyService.showError('Vui lòng thêm ít nhất 1 dòng dữ liệu !')
  //       return
  //     }

  //     const data = { lstData: pushInList }

  //     this.apiService.post(this.apiService.PHONE_CHARGES.IMPORT_EXCEL, data).then((result) => {
  //       if (result) {
  //         this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
  //         this.searchData(true)
  //       }
  //     })
  //   }
  // }

  onCopy(dataRow: any) {
    dataRow.customerContract = this.dataParent
    // this.dataParent?.customerContract?
    const dataDependency: any = {}
    Object.assign(dataDependency, dataRow)
    dataDependency.id = null

    this.dialog
      .open(AddEditContarctTermComponent, { disableClose: false, data: dataDependency })
      .afterClosed()
      .subscribe((res) => {
        this.searchData()
      })
  }
}
