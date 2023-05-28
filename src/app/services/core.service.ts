import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Column, Workbook } from 'exceljs'
import * as moment from 'moment'
import { enumData } from '../core/enumData'
import { User } from '../models/user.model'
import { AuthenticationService } from './authentication.service'
import { NotifyService } from './notify.service'
declare var Object: any
const fs = require('file-saver')

@Injectable()
export class CoreService {
  enumData: any
  currentUser: User | any
  // enumData: any = enumData
  host = enumData.ApiUrl + '/'

  constructor(
    private authenticationService: AuthenticationService,
    private notifyService: NotifyService,
    private http: HttpClient
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => {
      this.currentUser = x
      this.enumData = x?.enumData
      // console.log(this.currentUser.permission)
    })
  }

  public distance(pFrom: any, pTo: any) {
    // Return Meter and Second between 2 points
    var obj = { Distance: 0, Time: 0 }
    if (pFrom && pTo) {
      if (pFrom.lat > 0 && pFrom.lng > 0 && pTo.lat > 0 && pTo.lng > 0) {
        var R = 6371
        var dLat = (pTo.lat - pFrom.lat) * (Math.PI / 180.0)
        var dLon = (pTo.lng - pFrom.lng) * (Math.PI / 180.0)
        var lat1 = pFrom.lat * (Math.PI / 180.0)
        var lat2 = pTo.lat * (Math.PI / 180.0)
        var a = Math.pow(Math.sin(dLat / 2), 2) + Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2)
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        obj.Distance = R * c * 1000 // Meter
        obj.Time = (obj.Distance / 30) * 60 * 60 // Second
      }
    }
    return obj
  }

  date = {
    to_yyyyMMddHHmmss: (d: Date) => {
      return (
        d.getFullYear() +
        ('0' + (d.getMonth() + 1)).slice(-2) +
        ('0' + d.getDate()).slice(-2) +
        ('0' + d.getHours()).slice(-2) +
        ('0' + d.getMinutes()).slice(-2) +
        ('0' + d.getSeconds()).slice(-2)
      )
    },
    to_ddMMyyyy: (d: Date) => {
      return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear()
    },
    to_ddMMyyyyHHmmss: (d: Date) => {
      return (
        ('0' + d.getDate()).slice(-2) +
        '/' +
        ('0' + (d.getMonth() + 1)).slice(-2) +
        '/' +
        d.getFullYear() +
        ' ' +
        ('0' + d.getHours()).slice(-2) +
        ':' +
        ('0' + d.getMinutes()).slice(-2) +
        ':' +
        ('0' + d.getSeconds()).slice(-2)
      )
    },

    getDate: (pDate: Date) => {
      return pDate && pDate.getTime() ? new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate()) : pDate
    },
    getDateHM: (pDate: Date) => {
      return pDate && pDate.getTime()
        ? new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate(), pDate.getHours(), pDate.getMinutes())
        : pDate
    },
    getDateHMS: (pDate: Date) => {
      return pDate && pDate.getTime()
        ? new Date(
            pDate.getFullYear(),
            pDate.getMonth(),
            pDate.getDate(),
            pDate.getHours(),
            pDate.getMinutes(),
            pDate.getSeconds()
          )
        : pDate
    },
    addDay: (pDate: Date, pVal: number) => {
      return pDate && pDate.getTime ? new Date(pDate.getTime() + pVal * 24 * 60 * 60000) : pDate
    },
    addHour: (pDate: Date, pVal: number) => {
      return pDate && pDate.getTime ? new Date(pDate.getTime() + pVal * 60 * 60000) : pDate
    },
    addMinute: (pDate: Date, pVal: number) => {
      return pDate && pDate.getTime ? new Date(pDate.getTime() + pVal * 60000) : pDate
    },
    addSecond: (pDate: Date, pVal: number) => {
      return pDate && pDate.getTime ? new Date(pDate.getTime() + pVal * 1000) : pDate
    },
    setHour: (pDate: Date, pVal: number) => {
      return pDate && pDate.getTime()
        ? new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate(), pVal, 0)
        : pDate
    },
  }

  public convertObjToArray(obj: any) {
    const arr: any[] = []
    // tslint:disable-next-line:forin
    for (const key in obj) {
      const value = obj[key]
      arr.push(value)
    }
    return arr
  }

  public convertObjToParam(obj: any) {
    let str = ''
    // tslint:disable-next-line:forin
    for (const key in obj) {
      if (str !== '') {
        str += '&'
      }
      str += key + '=' + encodeURIComponent(obj[key])
    }
    return str
  }

  getLanguage() {
    let rs = []
    if (localStorage.getItem('Language')) {
      let lang = localStorage.getItem('LanguageConfig')
      if (lang && lang.length > 0) {
        let value = JSON.parse(lang ? lang : '')
        if (value && value.length > 0) {
          var object = value.reduce((obj: any, item: any) => Object.assign(obj, { [item.key]: item.value }), {})
          rs = object
        }
      }
    }
    return rs
  }

  getLanguageByComponent(component: any) {
    let lang = localStorage.getItem('LanguageConfig')
    if (lang) {
      let value = JSON.parse(lang ? lang : '')
      if (value && value.length > 0) {
        var lstLangInCom = value.filter((s: any) => s.component === component)
        if (lstLangInCom.length > 0) {
          var object = lstLangInCom.reduce((obj: any, item: any) => Object.assign(obj, { [item.key]: item.value }), {})
          return object
        }
      }
    }
    return []
  }

  public getLanguageModule(code: string, sourceEnum: any) {
    let component: any = {}
    let lstEnum = this.convertObjToArray(sourceEnum)
    for (const module of lstEnum) {
      let lstData = this.convertObjToArray(module.data)
      component = lstData.find((p: any) => p.code === code)
      if (component) {
        return { component, module }
      }
    }
    return null
  }

  public checkPermission(role: string) {
    if (!role) {
      console.error('no have role input')
      return false
    }
    if (!this.currentUser || !this.enumData) {
      !this.currentUser && console.error('no have currentUser')
      !this.enumData && console.error('no have enumData')
      return false
    }
    if (this.currentUser.type === this.enumData.UserType.Admin.code) {
      return true
    }
    if (!this.currentUser.permission || this.currentUser.permission.length == 0) {
      console.error('no have currentUser.permission')
      return false
    }
    // console.log(this.currentUser.permission)
    return this.currentUser.permission.some((s: any) => s === role)
  }

  public getEnumElementName(enumData: object, value: string) {
    return this.getEnumElement(enumData, value, 'code', 'name')
  }
  public getEnumElementColor(enumData: object, value: string) {
    return this.getEnumElement(enumData, value, 'code', 'color')
  }

  public getEnumElementNameUnit(enumData: object, value: string) {
    return this.getEnumElement(enumData, value, 'unit', 'nameUnit')
  }

  public getEnumElement(enumData: object, value: string, keyIn: string, keyOut: string) {
    const data = this.convertObjToArray(enumData)
    const item = data.find((p) => p[keyIn] === value)
    return item && item[keyOut] ? item[keyOut] : ''
  }

  public getArrayElementId(array: object, value: string, col: string) {
    return this.getEnumElement(array, value, col, 'name')
  }

  /**
   * Lọc properties không có giá trị
   *
   * @author senhoang
   * @param {Object} where - Đối tượng cần lọc.
   * @returns {void} Hàm không trả về giá trị. Nó sửa đổi đối tượng được truyền làm tham số tại chỗ.
   */
  public filterDataSearch(where: any) {
    return Object.keys(where).forEach(
      (k: any) => !(where[k] || where[k] === false || where[k] === 0) && delete where[k]
    )
  }

  public renderArrayUniqueColors(num: number) {
    let lstUniqueColors: any = []
    let numberRandom: number = Math.floor(Math.random() * 101)
    for (let i = 0; i < num; i++) {
      let color = this.getUniqueColor(i + numberRandom)
      if (color === 'ffffff' || color === 'fff' || color === '000000' || color === '0000') {
        numberRandom += 1
        color = this.getUniqueColor(i + numberRandom)
      }
      lstUniqueColors.push(color)
    }
    return lstUniqueColors
  }

  public getUniqueColor(n: number) {
    // Random color input (index number)
    const rgb = [0, 0, 0]

    for (let i = 0; i < 24; i++) {
      rgb[i % 3] <<= 1
      rgb[i % 3] |= n & 0x01
      n >>= 1
    }
    return '#' + rgb.reduce((a, c) => (c > 0x0f ? c.toString(16) : '0' + c.toString(16)) + a, '')
  }

  /**
   * Hàm Convert array to object (HashMap) [{id,name}] => {id:{id,name}}
   *
   * @author senhoang
   * @param {array} arr  - List Array muốn convert to hash map.
   * @param {string} key - Key để làm key trong hash map(mặc định là id)
   */
  public arrayToObject(arr: any[], key: string = 'id') {
    return arr.reduce((a, v) => (a[v[key]] ? { ...a, [v[key]]: { ...a[v[key]], ...v } } : { ...a, [v[key]]: v }), {})
  }

  // covert ngày nhập excel
  excelDateToJSDate(day: any) {
    var utc_days = Math.floor(day - 25569)
    var utc_value = utc_days * 86400
    var date_info = new Date(utc_value * 1000)

    var fractional_day = day - Math.floor(day) + 0.0000001

    var total_seconds = Math.floor(86400 * fractional_day)

    var seconds = total_seconds % 60

    total_seconds -= seconds

    var hours = Math.floor(total_seconds / (60 * 60))
    var minutes = Math.floor(total_seconds / 60) % 60

    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds)
  }

  /* Map data list to enumData
  objEnumData = enumData.Object
  lstData = lstData (data list from api need solve conflic)
  objKeySolveConflic = objKeySolveConflic {prop:'type solve conflic'}
    type solve conflic (string): 
      u: unique string
      s: sum
      d: date
      dt: date time

   */
  mapDataLstByEnum(objEnumData: any, lstData: any[], objKeySolveConflic: any, matchCodeBy: string = 'type') {
    const result: any = { ...objEnumData }

    for (const data of lstData) {
      const currObjEnum = result[data[matchCodeBy]]
      currObjEnum.data = { ...currObjEnum?.data }
      const currObjEnumData = currObjEnum.data

      for (const key in objKeySolveConflic) {
        const typeSolve = objKeySolveConflic[key]
        const dataOfKey = result[key]

        if (typeSolve === 's') {
          currObjEnumData[key] = (+currObjEnumData[key] || 0) + (+data[key] || 0)
        } else if (typeSolve === 'd') {
          const converTime = moment(data[key]).format('DD-MM-YYYY')
          currObjEnumData[key] = [...(currObjEnumData[key] ? currObjEnumData[key] : []), converTime]
        } else if (typeSolve === 'dt') {
          const converTime = moment(data[key]).format('HH:mm DD-MM-YYYY')
          currObjEnumData[key] = [...(currObjEnumData[key] ? currObjEnumData[key] : []), converTime]
        } else {
          currObjEnumData[key] = [...(currObjEnumData[key] ? currObjEnumData[key] : []), data[key]]
        }

        // objKeySolveConflic[key]
      }

      //   console.log(currObjEnumData)
      //   console.log(currObjEnum)

      currObjEnum.data = currObjEnumData
    }

    // GET UNIQUE STRING

    // return : {...enumObj,data{disTint:'stirng',sumData:12313}}
    for (const keyCode in result) {
      const currData = result[keyCode]

      for (const keyCode2 in currData.data) {
        const typeSolve = objKeySolveConflic[keyCode2]

        if (typeSolve !== 's') {
          // console.log(currData.data[keyCode2])
          currData.data[keyCode2] = [...new Set(currData.data[keyCode2])]
        }
      }
    }
    return result
  }

  /**
   * @typedef {Object} paginationSetting
   * @property {string} url - Đường dẫn API
   * @property {Object} where - Điều kiện
   * @property {string[]} propsDataRow - Danh sách thứ tự các trường được trả về từ API
   */

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
    paginationSetting?: { url: string; where: any; propsDataRow: string[]; link?: string }
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
    if (paginationSetting?.url) {
      const where = {}
      Object.assign(where, paginationSetting?.where)
      await this.filterDataSearch(where)

      const dataSearch = {
        where,
        skip: 0,
        order: { createdAt: 'DESC' },
        take: enumData.Page.pageSizeMax,
      }

      await this.http
        .post(paginationSetting?.link || this.host + paginationSetting?.url, dataSearch)
        .toPromise()
        // tslint:disable-next-line: no-shadowed-variable
        .then((res: any) => {
          const lstData = res[0]

          // Add Data and Conditional Formatting
          for (const [index, data] of lstData.entries()) {
            const rowData: any[] = []
            for (const prop of paginationSetting?.propsDataRow) {
              let propData
              const path = prop.split('.')
              let current = JSON.parse(JSON.stringify(data))
              for (const key of path) {
                if (current) {
                  current = current[key] || ''
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
            fmtRow(row)
          }
        })

      // await this.apiService.post(paginationSetting?.url, dataSearch).then((res: any) => {
      //   if (res) {

      //   }
      // })
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
      fs.saveAs(blob, fileNameEx)
      this.notifyService.hideloading()
    })
    // EXCEL-Compile--end
  }

  // getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  //   new Promise((resolve, reject) => {
  //     const reader = new FileReader()
  //     reader.readAsDataURL(file)
  //     reader.onload = () => resolve(reader.result)
  //     reader.onerror = (error) => reject(error)
  //   })

  // async getBase64ImageFromURL(url: string): Promise<string> {
  //   const res = await this.http.get(url, { responseType: 'blob' }).toPromise()
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader()
  //     reader.readAsDataURL(res)
  //     reader.onloadend = () => {
  //       resolve(reader.result.toString())
  //     }
  //     reader.onerror = (error) => {
  //       reject(error)
  //     }
  //   })
  // }
}
