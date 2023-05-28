import { HttpClient } from '@angular/common/http'
import { Component, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Column, Workbook } from 'exceljs'
import * as moment from 'moment'
import { enumData } from '../../../core/enumData'
import { ApiService } from '../../../services/api.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'
const fs = require('file-saver')

@Component({
  selector: 'app-swagger-to-excel',
  templateUrl: './swagger-to-excel.component.html',
})
export class SwaggerToExcelComponent implements OnInit {
  listOfData: any[] = []
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  dataCity: any[] = []
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  loading = true
  dataSearch: any = {}
  dataFormInput: any = {}

  DEFAULT_LINK: string = 'https://dms-pro-auth-api.apetechs.co/api-json'

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private dialog: MatDialog,
    public coreService: CoreService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // this.loadDataSearch()
    // this.searchData()

    this.dataFormInput.link = this.DEFAULT_LINK
  }

  async searchData(reset: boolean = false) {
    this.notifyService.showloading()
    if (reset) {
      this.pageIndex = 1
    }

    const where: any = {}

    if (this.dataSearch.name && this.dataSearch.name !== '') {
      where.name = this.dataSearch.name
    }

    if (this.dataSearch.code && this.dataSearch.code !== '') {
      where.code = this.dataSearch.code
    }

    if (this.dataSearch.cityId && this.dataSearch.cityId !== '') {
      where.cityId = this.dataSearch.cityId
    }

    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }

    this.apiService.post(this.apiService.DISTRICT.PAGINATION, dataSearch).then((data) => {
      this.notifyService.hideloading()
      this.loading = false
      if (data) {
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }
  loadDataSearch() {
    Promise.all([this.apiService.post(this.apiService.CITY.FIND, {})]).then(async (res) => {
      this.dataCity = res[0] || []
    })
  }

  async onDownLoadExcel() {
    const fileName = 'API'
    const templateHeader = ['STT', 'Field', 'Field Mapping API', 'Data Type', 'Required', 'Default', 'Significant']

    // Khai báo trường dữ liệu
    const propsDataRow = [
      '__opsTour__.code',
      'dateOpsTour',
      '__driver__.name',
      'opsTripCode',
      '__romooc__.regNo',
      '__vehicle__.regNo',
      'standardSalary',
      'mooring',
      'bonus',
      'salaryDriver',
      'oilDistance',
      'oilActual',
      'statusSalary',
      'lifting',
      'another',
      'externalPayment',
      'cargoHandling',
      'bridges',
      'tirePatch',
      'statusCost',
    ]

    // Khai báo kiểu dữ liệu
    const columnFmt: any = {
      // 2: 'date',
      // 7: 'number',
      // 8: 'number',
      // 9: 'number',
      // 10: 'number',
      // 11: 'number',
      // 12: 'number',
      // 14: 'number',
      // 15: 'number',
      // 16: 'number',
      // 17: 'number',
      // 18: 'number',
      // 19: 'number',
    }
    // const siteDomain = window.location.hostname.substring(0, window.location.hostname.indexOf('.co') + 3)
    const site = this.dataFormInput.link?.substring(0, this.dataFormInput.link?.indexOf('.co') + 3)
    const siteApiDocs = `${site}/api-json`

    const paginationSetting = {
      url: this.apiService.OPS_ACCOUNTING.PAGINATION,
      link: siteApiDocs,
      where: { isDeleted: false },
      propsDataRow: propsDataRow,
    }

    this.onDownload(fileName, templateHeader, columnFmt, paginationSetting)
  }

  /**
   * DOWNLOAD FILE EXCEL.
   *
   * @param {number} fileName - Tên file
   * @param {string[]} templateHeader - Khai báo tên header
   * @param {string[]} columnFmt - Khai báo kiểu dữ liệu cho columns
   * @param {?paginationSetting} paginationSetting - Khai báo các thông tin lấy dữ liệu fill vào
   * @returns {underfined} Kết quả
   */
  async onDownload(
    fileName: string,
    templateHeader: string[],
    columnFmt: string[],
    paginationSetting?: { url: string; link: string; where: any; propsDataRow: string[] }
  ) {
    this.notifyService.showloading()

    let date = new Date().toISOString()
    let fileNamehead = fileName

    let fileNameAdditional = `${date}`
    let fileNameEx = `${fileNamehead}-${fileNameAdditional}.xlsx`

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

    // // Khai báo trường dữ liệu
    // const propsDataRow = [
    //   '__opsTour__.code',
    //   'dateOpsTour',
    //   '__driver__.name',
    //   'opsTripCode',
    //   '__romooc__.regNo',
    //   '__vehicle__.regNo',
    //   'standardSalary',
    //   'mooring',
    //   'bonus',
    //   'salaryDriver',
    //   'oilDistance',
    //   'oilActual',
    //   'statusSalary',
    //   'lifting',
    //   'another',
    //   'externalPayment',
    //   'cargoHandling',
    //   'bridges',
    //   'tirePatch',
    //   'statusCost',
    // ]

    // // Khai báo kiểu dữ liệu
    // const columnFmt: any = {
    //   2: dateFmt,
    //   7: numberFmt,
    //   8: numberFmt,
    //   9: numberFmt,
    //   10: numberFmt,
    //   11: numberFmt,
    //   12: numberFmt,
    //   14: numberFmt,
    //   15: numberFmt,
    //   16: numberFmt,
    //   17: numberFmt,
    //   18: numberFmt,
    //   19: numberFmt,
    // }

    // Khai báo các loại dữ liệu của cột số {thứ tụ cột:fmtTxt or fmtNum}
    // Khai báo các loại dữ liệu của cột {thứ tụ cột:fmtTxt or fmtNum}

    // CẤU HÌNH FMT
    // FMT ROW
    const fmtRow = (rowData: any, objStyle: any = {}) => {
      rowData.eachCell((cell: any, colNumber: any) => {
        cell.border = {
          top: { style: 'thin', color: { argb: '777777' } },
          left: { style: 'thin', color: { argb: '777777' } },
          bottom: { style: 'thin', color: { argb: '777777' } },
          right: { style: 'thin', color: { argb: '777777' } },
        }
        cell.font = { name: 'Calibri', family: 4, size: 11 }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        for (const prop in objStyle) {
          cell[prop] = objStyle[prop]
        }
      })
    }

    // const fmtRow = (rowData: any, objStyle: any = {}) => {
    //   rowData.eachCell((cell: any, colNumber: any) => {
    //     cell.border = {
    //       top: { style: 'thin' },
    //       left: { style: 'thin' },
    //       bottom: { style: 'thin' },
    //       right: { style: 'thin' },
    //     }
    //     cell.font = { name: 'Calibri', family: 4, size: 11 }
    //     for (const prop in objStyle) {
    //       cell[prop] = objStyle[prop]
    //     }
    //   })
    // }

    const fmtRowHeader = (rowData: any, objStyle: any = {}) => {
      rowData.eachCell((cell: any, colNumber: any) => {
        // cell.fill = {
        //   type: 'pattern',
        //   pattern: 'solid',
        //   // fgColor: { argb: '001E3E' },
        // }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        // cell.font = { size: 11, bold: true, color: { argb: '0000ff' } }
        cell.font = { name: 'Calibri', family: 4, size: 12, bold: true, color: { argb: '0000ff' } }
        cell.border = {
          top: { style: 'thin', color: { argb: '777777' } },
          left: { style: 'thin', color: { argb: '777777' } },
          bottom: { style: 'thin', color: { argb: '777777' } },
          right: { style: 'thin', color: { argb: '777777' } },
        }
        for (const prop in objStyle) {
          cell[prop] = objStyle[prop]
        }
      })
      rowData.getCell(6).merge(rowData.getCell(1))
    }

    // FORMAT FILE EXCEL--end

    let header: string[] = templateHeader
    // if (template) {
    //   header = this.templateHeader
    // } else {
    //   header = [...this.templateHeader, 'Trạng thái']
    // }
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
    // if (paginationSetting?.url) {
    //   const where = {}
    //   Object.assign(where, paginationSetting?.where)
    //   await this.filterDataSearch(where)

    //   const dataSearch = {
    //     where,
    //     skip: 0,
    //     order: { createdAt: 'DESC' },
    //     take: enumData.Page.pageSizeMax,
    //   }

    if (paginationSetting) {
      await this.http
        .get(paginationSetting.link)
        .toPromise()
        // tslint:disable-next-line: no-shadowed-variable
        .then((res: any) => {
          // const responseJs:any = JSON.parse(res)
          console.log(res)
          const lstData: any[] = []
          const dicSchemas = res.components.schemas
          const objData = res.paths
          const objKeys = Object.keys(objData)
          for (let i = 0; i < objKeys?.length; i++) {
            const key = objKeys[i]
            const dataOfKey = objData[key]

            const rowAdd = sheet1.addRow([
              `POST: ${key}`,
              ...Array(5),
              dataOfKey?.post?.summary || dataOfKey?.get?.summary,
            ])
            // console.log(i + ': ' + key + ': ' + objData[key])
            // Merge cell 1 and 2 in the current row
            // fmtRow(rowAdd)
            // rowAdd.getCell(13).merge(rowAdd.getCell(1))
            // rowAdd.getCell(9).merge(rowAdd.getCell(7))
            fmtRowHeader(rowAdd, { border: {}, alignment: { horizontal: 'left' } })

            // CONTENT
            // const objDataOfPath = res.paths
            // const objKeys = Object.keys(objData)
            // for (let i = 0; i < objKeys?.length; i++) {
            //   const key = objKeys[i]
            //   const dataOfKey = objData[key]

            //   const rowAdd = sheet1.addRow([key, ...Array(6)])
            //   // console.log(i + ': ' + key + ': ' + objData[key])
            //   // Merge cell 1 and 2 in the current row
            //   // fmtRow(rowAdd)
            //   // rowAdd.getCell(13).merge(rowAdd.getCell(1))
            //   // rowAdd.getCell(9).merge(rowAdd.getCell(7))
            //   fmtRowHeader(rowAdd, { border: {}, alignment: { horizontal: 'left' } })
            // }
            if (dataOfKey['post']) {
              const postProp = dataOfKey['post']

              const requiredCodeBody = postProp?.requestBody?.content['application/json']?.schema.$ref
              if (!requiredCodeBody) {
                continue
              }
              // const inputString = '#/components/schemas/LoginAdminDto'
              const outputArray = requiredCodeBody
                .replace('#', '')
                ?.split('/')
                ?.filter((e: any) => e)

              // console.log(outputArray) // ["components", "schemas", "LoginAdminDto"]

              let objDto: any = res

              for (const propsMid of outputArray) {
                objDto = objDto[propsMid]
              }

              const dicRequired = new Set(objDto.required)
              const objDtoData = objDto.properties
              const objDtoKeys = Object.keys(objDtoData)
              for (let idx2 = 0; idx2 < objDtoKeys?.length; idx2++) {
                const keyDto = objDtoKeys[idx2]
                const dataOfKeyDto = objDtoData[keyDto]
                const isRequired = dicRequired.has(keyDto)

                // const rowAdd = sheet1.addRow([key, ...Array(6)])
                const rowAdd = sheet1.addRow([
                  idx2 + 1,
                  keyDto,
                  '',
                  dataOfKeyDto.type,
                  isRequired ? 'Y' : 'N',
                  '',
                  dataOfKeyDto.description,
                ])
                // console.log(i + ': ' + key + ': ' + objData[key])
                // Merge cell 1 and 2 in the current row
                // fmtRow(rowAdd)
                // rowAdd.getCell(13).merge(rowAdd.getCell(1))
                // rowAdd.getCell(9).merge(rowAdd.getCell(7))
                fmtRow(rowAdd)
              }

              let dto = outputArray
            } else if (dataOfKey['get']) {
              // const rowAdd = sheet1.addRow([`GET: ${key}`, ...Array(6)])
              // fmtRowHeader(rowAdd, { border: {}, alignment: { horizontal: 'left' } })
            }
          }

          // Add Data and Conditional Formatting
          // for (const [index, data] of [].entries()) {
          //   const rowData: any[] = []
          //   for (const prop of paginationSetting?.propsDataRow) {
          //     let propData
          //     const path = prop.split('.')
          //     let current = JSON.parse(JSON.stringify(data))
          //     for (const key of path) {
          //       if (current) {
          //         current = current[key] || ''
          //       } else {
          //         propData = undefined
          //         break
          //       }
          //     }
          //     // debugger
          //     propData = current
          //     rowData.push(propData)
          //   }

          //   const row = sheet1.addRow(rowData)
          //   fmtRow(row)
          // }
        })
    }

    // await this.apiService.post(paginationSetting?.url, dataSearch).then((res: any) => {
    //   if (res) {

    //   }
    // })
    // }
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
      fs.saveAs(blob, fileNameEx)
      this.notifyService.hideloading()
    })
    // EXCEL-Compile--end
  }
}
