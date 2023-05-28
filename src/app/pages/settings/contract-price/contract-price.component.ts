import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
import { AddOrEditContractPriceComponent } from './add-or-edit-contract-price/add-or-edit-contract-price.component'
import { Column, Workbook } from 'exceljs'
import * as XLSX from 'xlsx'
import * as moment from 'moment'
const fs = require('file-saver')

@Component({
  selector: 'app-contract-price',
  templateUrl: './contract-price.component.html',
})
export class ContractPriceComponent implements OnInit {
  enumRole: any = enumData.Role.Contract
  currentUser: User | any
  enumData = enumData

  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  listOfData: any = []
  dataSearch: any = {}
  loading = true
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total

  constructor(
    private notifyService: NotifyService,
    public coreService: CoreService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService,
    private dialogRef: MatDialogRef<ContractPriceComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dataParent: any
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit(): void {
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

    where['customerContractTermId'] = this.dataParent.id

    if (this.dataSearch.statusId > 0) {
      const key = 'isDeleted'
      if (this.dataSearch.statusId === this.enumData.StatusFilter.Active.value) {
        where[key] = false
      }
      if (this.dataSearch.statusId === this.enumData.StatusFilter.InActive.value) {
        where[key] = true
      }
    }
    const dataSearch = {
      where,
      order: { createdAt: 'DESC' },
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.CUSTOMER_CONTRACT_PRICE.PAGINATION, dataSearch).then((data: any) => {
      if (data) {
        this.listOfData = data[0]
        this.total = data[1]
        this.loading = false
      }
    })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CUSTOMER_CONTRACT_PRICE.DELETE, { id: data.id }).then((res: any) => {
      this.notifyService.hideloading()
      if (res) {
        this.notifyService.showSuccess('Cập nhật trạng thái thành công!')
        this.searchData()
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditContractPriceComponent, { disableClose: false, data: { contractTerm: this.dataParent } })
      .afterClosed()
      .subscribe(() => {
        this.searchData()
        // this.dataParent.add = false
      })
  }

  clickEdit(data: any) {
    data.serviceType = this.dataParent.serviceType
    data.customerContractId = this.dataParent.customerContractId
    this.dialog
      .open(AddOrEditContractPriceComponent, { disableClose: false, data: data })
      .afterClosed()
      .subscribe(() => {
        this.searchData()
      })
  }

  // EXCEL_TEMPLATE, EXPORT
  templateHeader = [
    'Mã loại Cont',
    'Số lượng Cont',
    'Mã khu vực đi',
    'Mã điểm đi',
    'Mã khu vực đến',
    'Mã điểm đến',
    'Giá cước khác',
    'Giá cước hợp đồng',
    'Giá cước hóa đơn',
    'Mức chiết khấu 1',
    'Mức chiết khấu 2',
    'Bốc xếp',
  ]

  /**
   * Hàm EXPORT EXCEL
   *
   * @author senhoang
   * TODO:
   * 1.Sửa templateHeader
   * 2.Sửa fileNamehead
   * 3.Sửa fileNamehead (fileNameAdditional)
   * 4.Sửa propsDataRow
   * 5.Sửa columnFmt
   * 6.Sửa this.apiService.PAGINATION
   */
  async onDownload(template: boolean = false) {
    this.notifyService.hideloading()

    let date = new Date().toISOString()
    let fileNamehead = `BANG_GIA_PHU_LUC`

    let fileNameAdditional = `${this.dataParent.name}-${date}`
    let fileName = `${fileNamehead}-${fileNameAdditional}.xlsx`

    const workbook = new Workbook()
    const sheet1 = workbook.addWorksheet(fileNamehead)
    // EXCEL-header--start

    // FORMAT FILE EXCEL--start
    const fmtTxt = '@'
    const fmtNum = '#,##0;[Red]-#,##0'

    const textFmt = 'text'
    const dateFmt = 'date'
    const dateTimeFmt = 'dateTime'
    const monthFmt = 'month'
    const numberFmt = 'number'

    // Khai báo trường dữ liệu
    const propsDataRow = [
      '__contType__.code',
      'quantity',
      '__fromArea__.code',
      'fromLocationCode',
      '__toArea__.code',
      'toLocationCode',
      'price',
      'contractFee',
      'invoicePrice',
      'discount1',
      'discount2',
      'cargoHandling',
    ]

    // Khai báo kiểu dữ liệu
    const columnFmt: any = {
      1: textFmt,
      2: numberFmt,
      3: textFmt,
      4: textFmt,
      5: textFmt,
      6: textFmt,
      7: numberFmt,
      8: numberFmt,
      9: numberFmt,
      10: numberFmt,
      11: numberFmt,
      12: numberFmt,
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

    // CUSTOME WHERE CONDITION
    const where = { ...this.dataSearch }
    await this.coreService.filterDataSearch(where)

    where.customerContractTermId = this.dataParent.id

    const dataSearch = {
      where,
      skip: 0,
      order: { createdAt: 'DESC' },
      take: enumData.Page.pageSizeMax,
    }

    // EXCEL-header--end

    // EXCEL-data--start
    if (template) {
      // MAKE DATE INPUT
      await this.apiService.post(this.apiService.CUSTOMER_CONTRACT_PRICE.PAGINATION, dataSearch).then((res: any) => {
        if (res) {
          const lstData = res[0]
          // Add Data and Conditional Formatting
          for (const [index, data] of lstData.entries()) {
            const rowData: any[] = []
            for (const prop of propsDataRow) {
              let propData
              const path = prop.split('.')
              let current = JSON.parse(JSON.stringify(data))
              for (const key of path) {
                if (current) {
                  current = current[key]
                } else {
                  propData = undefined
                  break
                }
              }
              // debugger
              propData = current
              rowData.push(propData)
            }

            const row = sheet1.addRow(rowData)

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
    } else {
      await this.apiService.post(this.apiService.CUSTOMER_CONTRACT_PRICE.PAGINATION, dataSearch).then((res: any) => {
        if (res) {
          const lstData = res[0]

          // Add Data and Conditional Formatting
          for (const [index, data] of lstData.entries()) {
            const rowData: any[] = []
            for (const prop of propsDataRow) {
              let propData
              const path = prop.split('.')
              let current = JSON.parse(JSON.stringify(data))
              for (const key of path) {
                if (current) {
                  current = current[key]
                } else {
                  propData = undefined
                  break
                }
              }
              // debugger
              propData = current
              rowData.push(propData)
            }

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
  async clickImportExcel(ev: any) {
    this.notifyService.showloading()
    const sheetHeader = [
      'contTypeCode',
      'quantity',
      'fromAreaCode',
      'fromLocationCode',
      'toAreaCode',
      'toLocationCode',
      'price',
      'contractFee',
      'invoicePrice',
      'discount1',
      'discount2',
      'cargoHandling',
    ]

    const required: string[] = ['contTypeCode', 'quantity', 'price', 'contractFee', 'invoicePrice']

    let workBook = null
    let jsonData: any = null
    const reader = new FileReader()
    const file = ev.target.files[0]

    reader.readAsBinaryString(file)
    reader.onload = () => {
      workBook = XLSX.read(reader.result, {
        type: 'binary',
        cellDates: true,
      })
      jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]], {
        raw: true,
        defval: null,
        header: sheetHeader,
      })
      // fix lỗi k import 2 lần đc
      ;(<HTMLInputElement>document.getElementById('fileContractPrice')).value = ''

      //get header and delete header out of array
      const header = jsonData.shift()
      if (header) {
        const arrayHeader = Object.values(header)
        if (JSON.stringify(this.templateHeader) !== JSON.stringify(arrayHeader)) {
          this.notifyService.hideloading()
          this.notifyService.showError('Template không đúng định dạng. Vui lòng kiểm tra lại!')
          return
        }
      } else {
        this.notifyService.hideloading()
        this.notifyService.showError('Template không đúng định dạng. Vui lòng kiểm tra lại!')
        return
      }

      let pushInList = []
      let strErr = ''

      for (const row of jsonData) {
        let idx = jsonData.indexOf(row) + 1
        let myItem: any = sheetHeader.reduce((ac, a) => ({ ...ac, [a]: row[a] }), {})

        for (let e of required) {
          if (!myItem[e]) {
            strErr += `Dòng ${idx} - ${header[`${e}`]} không được để trống<br>`
          }

          // if (myItem.date) {
          //   let checkdate = moment(myItem.date, 'MM/YYYY', true)
          //   if (!checkdate.isValid()) {
          //     strErr += 'Dòng ' + idx + ' - cột nhập Tháng không đúng định dạng. Vui lòng kiểm tra lại (MM/YYYY)<br>'
          //   } else {
          //     myItem.date = checkdate.toDate()
          //   }
          // }
        }

        pushInList.push(myItem)
      }

      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }

      if (pushInList.length === 0) {
        this.notifyService.hideloading()
        this.notifyService.showError('Vui lòng thêm ít nhất 1 dòng dữ liệu !')
        return
      }

      const data = { customerContractTermId: this.dataParent.id, lstData: pushInList }

      console.log(data)
      // return
      this.apiService.post(this.apiService.CUSTOMER_CONTRACT_PRICE.IMPORT_EXCEL, data).then((result) => {
        if (result) {
          this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
          this.searchData(true)
        }
      })
    }
  }

  onCopy(dataRow: any) {
    dataRow.serviceType = this.dataParent.serviceType
    dataRow.customerContractId = this.dataParent.customerContractId
    const dataDependency: any = {}
    Object.assign(dataDependency, dataRow)
    dataDependency.id = null
    dataDependency.contractTerm = this.dataParent
    this.dialog
      .open(AddOrEditContractPriceComponent, { disableClose: false, data: dataDependency })
      .afterClosed()
      .subscribe(() => {
        this.searchData()
      })
  }
}
