import { Component, OnInit } from '@angular/core'
import { NotifyService } from '../../../services/notify.service'
import { ApiService } from '../../../services/api.service'
import { enumData } from '../../../core/enumData'
import { MatDialog } from '@angular/material/dialog'
import { CoreService } from '../../../services/core.service'
import { User } from '../../../models/user.model'
import { AuthenticationService } from '../../../services/authentication.service'
import { AddOrEditOrderModelComponent } from './add-or-edit-order-model/add-or-edit-order-model.component'
import { OrderDetailComponent } from './order-detail/order-detail.component'
// @ts-ignore
import * as XLSX from 'xlsx'
import * as moment from 'moment'
import { ManagerListContComponent } from './manager-list-cont/manager-list-cont.component'
const fs = require('file-saver')
import { Column, Workbook } from 'exceljs'
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
})
export class OrderComponent implements OnInit {
  // modalTitle = enumData.Constants.Model_Add
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any
  // dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  dataOrderStatus = this.coreService.convertObjToArray(enumData.OrderStatus)
  loading = true
  currentUser: User | any
  isVisible = false
  dataCONT_TYPEs = []
  enumData: any = enumData
  checkTemplete = false
  dataEmployees: any = []
  dataObject: any
  lstContType: any = []
  packageTypeChoosing: any
  listContTypeModalTitle: string = ''
  isChooseAll = false
  isShowListContType = false
  isLoadContType = false
  dataUploadExcel: any
  enumRole = enumData.Role.Order

  lstOfCustomer: any = []
  lstLocation: any[] = []
  lstEmp: any[] = []
  lstShip: any[] = []

  lstOrderStatus = this.coreService.convertObjToArray(enumData.OrderStatus)
  lstServiceType = this.coreService.convertObjToArray(enumData.ServiceType)
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilterNew)

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
  }

  ngOnInit(): void {
    this.dataSearch = new Object()
    this.dataObject = new Object()

    // Lấy ngày hiện tại
    const now = new Date()

    // Lấy ngày 2 ngày trước
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

    // Lấy ngày 2 ngày sau
    const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)

    // Convert ngày theo kiểu "2023-03-24T02:20:40.002Z"
    const formattedDateTwoDaysAgo = twoDaysAgo.toISOString()
    const formattedDateTwoDaysLater = twoDaysLater.toISOString()

    this.dataSearch.fromETD = [formattedDateTwoDaysAgo, formattedDateTwoDaysLater]
    // this.dataSearch.toETD = formattedDateTwoDaysLater

    this.searchData()
    this.loadAllData()
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
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.ORDER.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  async loadAllData() {
    this.notifyService.showloading()
    Promise.all([
      this.apiService.post(this.apiService.CUSTOMER.FIND, { where: { isDeleted: false } }),
      this.apiService.post(this.apiService.LOCATION.FIND, {}),
      this.apiService.post(this.apiService.SHIP.FIND, {}),
      this.apiService.post(this.apiService.EMPLOYEE.FIND, {}),
    ]).then(async (res) => {
      if (res) {
        this.lstOfCustomer = res[0]
        this.lstLocation = res[1]
        this.lstShip = res[2]
        this.lstEmp = res[3]
      }
      this.notifyService.hideloading()
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditOrderModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data: any) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditOrderModelComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data: any) => {
        this.searchData()
      })
  }

  onClickListCont(dataRow: any) {
    this.dialog
      .open(ManagerListContComponent, { disableClose: false, data: dataRow })
      .afterClosed()
      .subscribe((data: any) => {
        this.searchData()
      })
  }

  clickDetail(data: any) {
    this.dialog
      .open(OrderDetailComponent, { disableClose: false, data: data })
      .afterClosed()
      .subscribe((res: any) => {})
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ORDER.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  sendToOps(id: string) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ORDER.SEND_TO_OPS, { id: id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
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
    this.apiService.post(this.apiService.ORDER.PAGINATION, dataSearch).then((res: any) => {
      if (res) {
        this.loading = false
        this.notifyService.hideloading()
        if (res) {
          let date = new Date().toISOString()
          const fileName = 'Danh_Sach_Oder_' + date + '.xlsx'
          let dataExcel: any = []
          res[0].forEach((i: any) => {
            dataExcel.push({
              'Số Booking': i.bookingNumber,
              'Tên Khách Hàng': i.customerName,

              // Công ty xuất hóa đơn chi hộ
              'Tên Công Ty Hóa Đơn Chi Hộ': i.invoiceCompanyName,
              'Mã Số Thuế Công Ty Hóa Đơn Chi Hộ': i.invoiceCompanyTaxNumber,
              'Địa Chỉ Công Ty Xuất Hóa Đơn Chi Hộ': i.invoiceCompanyAddress,

              //  Công ty xuất hoá đơn cước
              'Tên Công Ty Xuất Hóa Đơn Cước': i.freightCompanyName,
              'Mã Số Thuế Công Ty Xuất Hóa Đơn Cước': i.freightCompanyTaxNumber,
              'Địa Chỉ Công Ty Xuất Hóa Đơn Cước': i.freightCompanyAddress,

              //
              'Số Hợp Đồng Nội Bộ Khách Hàng ': i.internalNumberOfCustomerContracts,
              'Tên Hãng Tàu': i.shipName,
              'Cước Tiền Mặt': i.cashCharges == 0 ? 'Không' : 'Có',
              'Ghi Chú': i.description,

              //
              'Hình Ảnh': i.url,
              'Mã Hợp Đồng': i.customerContractCode,
              'Dịch Vụ Vận Chuyển': i.serviceName,
              'Mã Hình Thức Vận Chuyển': i.transportTypeName,
              //
            })
          })
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
          const wb: XLSX.WorkBook = XLSX.utils.book_new()
          ws['!cols'] = [
            { width: 30 },
            { width: 50 },
            { width: 50 },
            { width: 40 },
            { width: 50 },
            { width: 50 },
            { width: 40 },
            { width: 50 },
            { width: 40 },
            { width: 30 },
            { width: 20 },
            { width: 40 },
            { width: 40 },
            { width: 30 },
            { width: 40 },
            { width: 40 },
            { width: 20 },
          ]
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Order')
          XLSX.writeFile(wb, fileName)
        }
      }
    })
  }

  async clickDownloadTemplateExcel() {
    let date = new Date().toISOString()
    let dataExcel: any = []
    let dataExcel1: any = []
    let dataExcel2: any = []
    let dataExcel3: any = []

    // let dataExcelInfor: any = []
    // res[0].forEach((s: any) => {
    //   dataExcel.push({
    //     'Mã Tài Xế': s.code,
    //     'Tên Tài Xế': s.name,
    //     SĐT: s.numberPhone,
    //     CMND: s.cardNumber,
    //     Email: s.email,
    //     'Ngày Sinh': moment(s.dob).format('DD/MM/YYYY'),
    //     'Địa Chỉ': s.address,
    //     'Biển Số Đầu Kéo': s.vehicleRegNo,
    //     'Biển Số Rơ Moóc': s.romoocRegNo,
    //     'Tài khoản': s.userName,
    //   })
    // })

    const fileName = 'Template_DS_Don_Hang_' + date + '.xlsx'
    dataExcel.push({
      'Mã Đơn Hàng (code)': '',
      'Mã Khách Hàng (customerCode)': '',
      'Mã Dịch Vụ Vận Chuyển (Thông tin nhập đơn hàng)': '',
      'Mã Hình Thức Vận Chuyển (Thông tin nhập đơn hàng)': '',
      'Mã Hợp Đồng (customerContractCode)': '',
      'Số Booking (bookingNumber)': '',
      'Mã Công ty xuất hoá đơn chi hộ (invoiceCompanyCode)': '',
      'Mã Công ty xuất hoá đơn cước (freightCompanyCode)': '',
      'Số hợp đồng nội bộ khách hàng (internalNumberOfCustomerContracts)': '',
      'Mã hàng tàu (shipCode)': '',
      'Ghi chú (description)': '',
    })
    let ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    let wb: XLSX.WorkBook = XLSX.utils.book_new()
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
    XLSX.utils.book_append_sheet(wb, ws, 'Đơn Hàng')
    dataExcel1.push({
      'Mã Đơn Hàng (orderCode)': '',
      'Mã Container (contCode)': '',
      'Mã Loại Container (contTypeCode)': '',
      'Số Lượng Container (quantity)': '',
      'Khối Lượng (weight)': '',
      'Mã Phụ Lục Hợp Đồng (customerContractTermCode)': '',
      'Mã Địa Điểm Lấy Container Rỗng (emptyPickupLocationCode)': '',
      'Thời Gian Lấy Container Rỗng (YYYY-MM-DD HH:ss)': '',
      'Mã Địa Điểm Lấy Hàng (fromLocationCode)': '',
      'Thời Gian Dự Kiến Đến Lấy Hàng (YYYY-MM-DD HH:ss)': '',
      'Mã Địa Điểm Giao Hàng (toLocationCode)': '',
      'Thời Gian Dự Kiến Giao Hàng (YYYY-MM-DD HH:ss)': '',
      'Mã Địa Điểm Trả Container Rỗng (emptyReturnLocationCode)': '',
      'Thời Gian Trả Container Rỗng (YYYY-MM-DD HH:ss)': '',
    })
    let ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel1)

    var colNum = XLSX.utils.decode_col('E') //decode_col converts Excel col name to an integer for col #
    var fmt = '$#,##0.00' // or '"$"#,##0.00_);[Red]\\("$"#,##0.00\\)' or any Excel number format

    /* get worksheet range */

    var range = XLSX.utils.decode_range(ws1['!ref'] as any)
    for (var i = range.s.r + 1; i <= range.e.r; ++i) {
      var ref = XLSX.utils.encode_cell({ r: i, c: colNum })
      ws1[ref].z = fmt
    }
    ws1['!cols'] = [
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
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
    ]
    XLSX.utils.book_append_sheet(wb, ws1, 'Container trong đơn hàng')
    dataExcel2.push({
      'Mã Container (contCode)': '',
      'Mã Sản Phẩm (productCode)': '',
      'Mã Loại Đóng Gói (packageTypeCode)': '',
    })
    let ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel2)
    ws2['!cols'] = [{ width: 30 }, { width: 30 }, { width: 30 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Sản phẩm trong container')

    // dataExcel3.push({
    //   'Mã Đơn Hàng (orderCode)': '',
    //   'Mã Container (contCode)': '',
    //   'Mã Loại Container (contTypeCode)': '',
    //   'Số Lượng Container (quantity)': '',
    //   'Khối Lượng (weight)': '',
    //   'Mã Phụ Lục Hợp Đồng (customerContractTermCode)': '',
    //   'Địa Điểm Lấy Container Rỗng (emptyPickupLocationCode)': '',
    //   'Thời Gian Lấy Container Rỗng (epmtyPickupTime)': '',
    //   'Địa Điểm Lấy Hàng (fromLocationCode)': '',
    //   'Thời Gian Dự Kiến Đến Lấy Hàng (fromETD)': '',
    //   'Địa Điểm Giao Hàng (toLocationCode)': '',
    //   'Thời Gian Dự Kiến Giao Hàng (toETD)': '',
    //   'Địa Điểm Trả Container Rỗng (emptyReturnLocationCode)': '',
    //   'Thời Gian Trả Container Rỗng (emptyReturnTime)': '',
    // })

    /* Table service */
    const lstServiceType = await this.coreService.convertObjToArray(enumData.ServiceType)
    dataExcel3.push(['Loại dịch vụ'])
    dataExcel3.push(['', 'Mã dịch vụ', 'Dịch vụ'])
    for (const serviceType of lstServiceType) {
      dataExcel3.push(['', serviceType.code, serviceType.name])
    }
    dataExcel3.push([, ,])

    /* Loại vận chuyển */
    const lstTransportType = await this.coreService.convertObjToArray(enumData.TransportType)
    dataExcel3.push(['Loại vận chuyển'])
    dataExcel3.push(['', 'Mã Loại vận chuyển', 'Loại vận chuyển'])
    for (const transportType of lstTransportType) {
      dataExcel3.push(['', transportType.code, transportType.name])
    }
    dataExcel3.push([, ,])

    /* Mã loại container */
    await this.apiService.post(this.apiService.CONT_TYPE.FIND, { where: { isDeleted: false } }).then((data) => {
      if (data) {
        const lstContType = data
        dataExcel3.push(['Mã loại container'])
        dataExcel3.push(['', 'Mã loại container', 'Tên Loại Cont'])
        for (const contType of lstContType) {
          dataExcel3.push(['', contType.code, contType.name])
        }
        dataExcel3.push([, ,])
      }
    })

    var ws3 = await XLSX.utils.aoa_to_sheet(dataExcel3)
    // XLSX.utils.book_append_sheet(wb, ws3, 'My sheet')
    // XLSX.writeFile(wb, 'myfilename.xlsx')
    // debugger

    // ws3['!cols'] = [
    //   { width: 15 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    //   { width: 30 },
    // ]

    // ws3['A1'].s = {
    //   border: {
    //     right: {
    //       style: 'thin',
    //       color: '000000',
    //     },
    //     left: {
    //       style: 'thin',
    //       color: '000000',
    //     },
    //     top: {
    //       style: 'thin',
    //       color: '000000',
    //     },
    //     bottom: {
    //       style: 'thin',
    //       color: '000000',
    //     },
    //   },
    // }
    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    XLSX.utils.book_append_sheet(wb, ws3, 'Thông tin nhập đơn hàng')

    XLSX.writeFile(wb, fileName)
  }

  // // EXCEL_TEMPLATE, EXPORT
  // templateHeader = [
  //   'Mã Đơn Hàng*',
  //   'Mã Khách Hàng*',
  //   'Mã Dịch Vụ Vận Chuyển (Thông tin nhập)*',
  //   'Mã Hình Thức Vận Chuyển (Thông tin nhập)*',
  //   'Mã Hợp Đồng*',
  //   'Số Booking*',
  //   'Mã Công ty xuất hoá đơn chi hộ*',
  //   'Mã Công ty xuất hoá đơn cước*',
  //   'Số hợp đồng nội bộ khách hàng*',
  //   'Mã hàng tàu*',
  //   'Ghi chú',
  // ]

  async onDownloadTemplate() {
    // CONFIG
    const colorBgKey = '001E3E'
    let widthValueWs1 = [20, 30, 40, 40, 30, 40, 40, 40, 30, 25, 20, 25, 30, 30, 30, 30, 0]
    let widthValueWs2 = [20, 20, 35, 27, 27, 25, 25, 45, 40, 47, 40, 47, 40, 47]
    let widthValueWs3 = [20, 20, 20, 20]
    let widthValueWs4 = [20, 20, 15]
    let header: string[] = []
    header = [...this.templateHeader]

    const headerSheetCont = [
      'Mã Đơn Hàng*',
      'Mã Container*',
      'Mã Loại Container (Thông tin nhập)*',
      'Số Lượng Container*',
      'Khối Lượng*',
      'Mã Phụ Lục Hợp Đồng*',
      'Mã Địa Điểm Lấy Container',
      'Thời Gian Lấy Container (YYYY-MM-DD HH:ss)',
      'Mã Địa Điểm Lấy Hàng*',
      'Thời Gian Dự Kiến Đến Lấy Hàng* (YYYY-MM-DD HH:ss)*',
      'Mã Địa Điểm Giao Hàng*',
      'Thời Gian Dự Kiến Giao Hàng (YYYY-MM-DD HH:ss)*',
      'Mã Địa Điểm Trả Container Rỗng',
      'Thời Gian Trả Container Rỗng (YYYY-MM-DD HH:ss)',
    ]

    const headerSheetProduct = ['Mã Container*', 'Mã Sản Phẩm*', 'Mã Loại Đóng Gói*']

    this.notifyService.showloading()
    let date = new Date().toISOString()
    let fileName = `DANH_SACH_DON_HANG_EXCEL${date}.xlsx`
    const workbook = new Workbook()
    const wsOrder = workbook.addWorksheet('DS Đơn hàng')
    const wsCont = workbook.addWorksheet('DS Cont')
    const wsProduct = workbook.addWorksheet('DS Hàng Hóa')
    const wsInfor = workbook.addWorksheet('Thông tin nhập đơn hàng')

    // EXCEL-header--start
    const headerRow = wsOrder.addRow(header)
    const headerRowCont = wsCont.addRow(headerSheetCont)
    const headerRowProduct = wsProduct.addRow(headerSheetProduct)

    const allWs = [wsOrder, wsCont, wsProduct]
    const allWsRowHeader = [headerRow, headerRowCont, headerRowProduct]
    const allWsWidth = [widthValueWs1, widthValueWs2, widthValueWs3]

    for (const [i, rowHeader] of allWsRowHeader.entries()) {
      rowHeader.eachCell((cell, colNumber) => {
        if (cell.value !== '') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colorBgKey },
          }
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
          cell.font = { size: 11, bold: true, color: { argb: 'FFFFFF' } }
          cell.border = {
            top: { style: 'thin', color: { argb: '777777' } },
            left: { style: 'thin', color: { argb: '777777' } },
            bottom: { style: 'thin', color: { argb: '777777' } },
            right: { style: 'thin', color: { argb: '777777' } },
          }
        }

        allWs[i].getColumn(colNumber).width = allWsWidth[i][colNumber - 1]

        if (cell.value === 'id') {
          allWs[i].getColumn(colNumber).hidden = true
        }
      })

      rowHeader.height = 24
    }
    // wsOrder.getColumn(1).numFmt = '@'
    // wsOrder.getColumn(5).numFmt = '@'
    // wsOrder.getColumn(6).numFmt = '@'

    wsCont.getColumn(8).numFmt = '@'
    wsCont.getColumn(10).numFmt = '@'
    wsCont.getColumn(12).numFmt = '@'
    wsCont.getColumn(16).numFmt = '@'

    // SHEET INFOR
    const rowsFormatBorder = []
    const rowsFormatTittle = []
    /* Table service */
    const lstServiceType = await this.coreService.convertObjToArray(enumData.ServiceType)
    // dataExcel3.push()
    const rowTittleServiceType = wsInfor.addRow(['Loại dịch vụ'])
    rowsFormatTittle.push(rowTittleServiceType)
    const rowHerderServiceType = wsInfor.addRow(['', 'Mã dịch vụ', 'Dịch vụ'])
    rowsFormatBorder.push(rowHerderServiceType)
    for (const serviceType of lstServiceType) {
      const row = wsInfor.addRow(['', serviceType.code, serviceType.name])
      rowsFormatBorder.push(row)
    }
    wsInfor.addRow([, ,])

    /* Loại vận chuyển */
    const lstTransportType = await this.coreService.convertObjToArray(enumData.TransportType)
    const rowTittleTransportType = wsInfor.addRow(['Loại vận chuyển'])
    rowsFormatTittle.push(rowTittleTransportType)
    const rowHerderTransportType = wsInfor.addRow(['', 'Mã Loại vận chuyển', 'Loại vận chuyển'])
    rowsFormatBorder.push(rowHerderTransportType)
    for (const transportType of lstTransportType) {
      const row = wsInfor.addRow(['', transportType.code, transportType.name])
      rowsFormatBorder.push(row)
    }
    wsInfor.addRow([, ,])

    /* Mã loại container */
    await this.apiService.post(this.apiService.CONT_TYPE.FIND, { where: { isDeleted: false } }).then((data) => {
      if (data) {
        const lstContType = data
        const rowTittleContType = wsInfor.addRow(['Mã loại container'])

        rowTittleContType.getCell(1).value = 'Mã loại container' // Gán giá trị cho cell đầu tiên

        rowTittleContType.eachCell((cell, colNumber) => {
          console.log(cell.value)
          if (cell.value) {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            }
            cell.font = { name: 'Calibri', family: 4, size: 11 }
          }
          if (colNumber === 1) {
            // Merge cell 1 and 2 in the current row
            rowTittleContType.getCell(colNumber + 1).merge(cell)
          }
        })

        rowsFormatTittle.push(rowTittleContType)
        const rowHerderContType = wsInfor.addRow(['', 'Mã loại container', 'Tên Loại Cont'])
        rowsFormatBorder.push(rowHerderContType)
        for (const contType of lstContType) {
          const row = wsInfor.addRow(['', contType.code, contType.name])
          rowsFormatBorder.push(row)
        }
        wsInfor.addRow([, ,])
      }
    })

    for (const row of rowsFormatBorder) {
      row.eachCell((cell, colNumber) => {
        if (cell.value) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
          cell.font = { name: 'Calibri', family: 4, size: 11 }
        }
        wsInfor.getColumn(colNumber).width = widthValueWs4[colNumber - 1]
      })
    }

    for (const row of rowsFormatTittle) {
      row.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colorBgKey },
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
    }

    // wsProduct.getColumn(1).numFmt = '@'
    // wsProduct.getColumn(2).numFmt = '@'

    // EXCEL-header--end

    // Add Data and Conditional Formatting
    // let lstOrderCont: any[] = []
    // let lstVehicle: any[] = []
    // let lstRomooc: any[] = []

    // const dataSearchTemplate = {
    //   whereCont: this.dataSearch,
    //   whereVehicle: this.dataSearch1,
    //   whereRomooc: this.dataSearch2,
    // }
    // await this.apiService.post(this.apiService.OPS_TRIP.EXPORT_DATA_TEMPLATE, dataSearchTemplate).then((data: any) => {
    //   if (data) {
    //     lstOrderCont = data.lstOrderCont
    //     lstVehicle = data.lstVehicle
    //     lstRomooc = data.lstRomooc
    //   }
    // })

    // for (let data of lstOrderCont) {
    //   const rowData = [
    //     '',
    //     '',
    //     '',
    //     '',
    //     '',
    //     '',
    //     data.orderCode || '',
    //     data.orderBookingNumber || '',
    //     data.orderServiceTypeName || '',
    //     data.orderTransportType || '',
    //     data.contTypeName || '',
    //     data.lstProductName || '',
    //     data.emptyPickupLocationName || '',
    //     data.fromLocationName || '',
    //     data.toLocationName || '',
    //     data.emptyReturnLocationName || '',
    //     data.id || '',

    //     // data.quantityLoad ? Number(data.quantityLoad).toLocaleString('en-GB') : '',
    //   ]
    //   const row = wsOrder.addRow(rowData)

    //   row.eachCell((cell, colNumber) => {
    //     cell.border = {
    //       top: { style: 'thin' },
    //       left: { style: 'thin' },
    //       bottom: { style: 'thin' },
    //       right: { style: 'thin' },
    //     }
    //     cell.font = { name: 'Calibri', family: 4, size: 11 }
    //   })
    // }
    // //#endregion

    // // SHEET 2
    // for (let data of lstVehicle) {
    //   const rowData = [
    //     // 'Mã Đầu Kéo',
    //     data.code || '',
    //     // 'Mã Tài Xế mặc định',
    //     data.defaultDriverCode || '',
    //     // 'Biển số Đầu Kéo',
    //     data.regNo || '',
    //     // 'Trạng thái Đầu Kéo',
    //     enumData.statusOperationTrip[`${data.isHaveTrip ? true : false}`].name || '',
    //     // 'Địa chỉ Đầu Kéo',
    //     data.address || '',
    //     // 'Tên Tài xế mặc định',
    //     data.defaultDriverName || '',
    //     // 'Tên Tài xế hiện tại',
    //     data.driverName || '',
    //     // 'Biển số rơ moóc mặc định',
    //     data.romoocRegNo || '',
    //   ]
    //   const row = wsCont.addRow(rowData)

    //   let color = '87D068'
    //   if (data.isHaveTrip) {
    //     color = 'FF5500'
    //   }

    //   row.eachCell((cell, colNumber) => {
    //     cell.border = {
    //       top: { style: 'thin' },
    //       left: { style: 'thin' },
    //       bottom: { style: 'thin' },
    //       right: { style: 'thin' },
    //     }
    //     cell.font = { size: 11 }

    //     if (colNumber === 4) {
    //       cell.fill = {
    //         type: 'pattern',
    //         pattern: 'solid',
    //         fgColor: { argb: color },
    //       }

    //       cell.font = { ...cell.font, color: { argb: 'FFFFFF' } }
    //     }
    //   })
    // }
    // // SHEET 3
    // for (let data of lstRomooc) {
    //   const rowData = [
    //     // 'Mã Romooc',
    //     data.code || '',
    //     // 'Biển số Romooc',
    //     data.regNo || '',
    //     // 'Trạng thái xe',
    //     enumData.statusOperationTrip[`${data.isHaveTrip ? true : false}`].name || '',
    //     // 'Địa chỉ Romooc',
    //     data.address || '',
    //   ]
    //   const row = wsProduct.addRow(rowData)

    //   let color = '87D068'
    //   if (data.isHaveTrip) {
    //     color = 'FF5500'
    //   }

    //   row.eachCell((cell, colNumber) => {
    //     cell.border = {
    //       top: { style: 'thin' },
    //       left: { style: 'thin' },
    //       bottom: { style: 'thin' },
    //       right: { style: 'thin' },
    //     }
    //     cell.font = { size: 11 }

    //     if (colNumber === 3) {
    //       cell.fill = {
    //         type: 'pattern',
    //         pattern: 'solid',
    //         fgColor: { argb: color },
    //       }

    //       cell.font = { ...cell.font, color: { argb: 'FFFFFF' } }
    //     }
    //   })
    // }

    // EXCEL-Compile--start
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      fs.saveAs(blob, fileName)
      this.notifyService.hideloading()
    })
    // EXCEL-Compile--end
  }

  onImportExcel(ev: any) {
    this.notifyService.showloading()
    let workBook = null
    let jsonData: any = null
    let jsonData1: any = null
    let jsonData2: any = null
    const reader = new FileReader()
    const file = ev.target.files[0]
    reader.readAsBinaryString(file)
    reader.onload = () => {
      workBook = XLSX.read(reader.result, { type: 'binary' })
      jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]], {
        raw: true,
        defval: null,
        header: [
          'code',
          'customerCode',
          'serviceType',
          'transportType',
          'customerContractCode',
          'bookingNumber',
          'invoiceCompanyCode',
          'freightCompanyCode',
          'internalNumberOfCustomerContracts',
          'shipCode',
          'description',
        ],
      })
      jsonData1 = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[1]], {
        raw: true,
        defval: null,
        header: [
          'orderCode',
          'contCode',
          'contTypeCode',
          'quantity',
          'weight',
          'customerContractTermCode',
          'emptyPickupLocationCode',
          'epmtyPickupTime',
          'fromLocationCode',
          'fromETD',
          'toLocationCode',
          'toETD',
          'emptyReturnLocationCode',
          'emptyReturnTime',
        ],
      })
      jsonData2 = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[2]], {
        raw: true,
        defval: null,
        header: ['contCode', 'productCode', 'packageTypeCode'],
      })

      // fix lỗi k import 2 lần đc
      ;(<HTMLInputElement>document.getElementById('file')).value = ''

      // bỏ dòng merge
      jsonData.shift()
      jsonData1.shift()
      jsonData2.shift()
      // bỏ dòng header
      let isErr = false
      let strErr = ''
      for (const row of jsonData) {
        let idx = jsonData.indexOf(row) + 2

        if (row.code == null || (typeof row.code === 'string' && row.code.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã đơn hàng không được để trống!<br>'
        }
        if (row.customerCode == null || (typeof row.customerCode === 'string' && row.customerCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã khách hàng không được để trống!<br>'
        }
        if (
          row.invoiceCompanyCode == null ||
          (typeof row.invoiceCompanyCode === 'string' && row.invoiceCompanyCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Mã công ty xuất hoá đơn chi hộ không được để trống!<br>'
        }
        if (
          row.freightCompanyCode == null ||
          (typeof row.freightCompanyCode === 'string' && row.freightCompanyCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Mã công ty xuất hoá đơn cước không được để trống!<br>'
        }
        if (row.serviceType == null || (typeof row.serviceType === 'string' && row.serviceType.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Dịch vụ không được để trống!<br>'
        }
        if (row.shipCode == null || (typeof row.shipCode === 'string' && row.shipCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã hãng tàu không được để trống!<br>'
        }
        if (
          row.transportType == null ||
          (typeof row.transportType === 'string' && row.transportType.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Mã hình thức vận chuyển không được để trống!<br>'
        }
        if (
          row.customerContractCode == null ||
          (typeof row.customerContractCode === 'string' && row.customerContractCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Mã hợp đồng không được để trống!<br>'
        }
        if (
          row.bookingNumber == null ||
          (typeof row.bookingNumber === 'string' && row.bookingNumber.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Số booking không được để trống!<br>'
        }
      }
      for (const row1 of jsonData1) {
        let idx = jsonData.indexOf(row1) + 2

        if (row1.orderCode == null || (typeof row1.orderCode === 'string' && row1.orderCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã đơn hàng không được để trống!<br>'
        }
        if (row1.contCode == null || (typeof row1.contCode === 'string' && row1.contCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã container không được để trống!<br>'
        }
        if (
          row1.contTypeCode == null ||
          (typeof row1.contTypeCode === 'string' && row1.contTypeCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Mã loại container không được để trống!<br>'
        }
        if (
          row1.customerContractTermCode == null ||
          (typeof row1.customerContractTermCode === 'string' && row1.customerContractTermCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Mã phụ lục hợp đồng không được để trống!<br>'
        }
        if (row1.epmtyPickupTime) {
          let epmtyPickupTime = new Date(row1.epmtyPickupTime)
          if (!epmtyPickupTime) {
            strErr += 'Dòng ' + idx + ' - Thời gian lấy container rỗng không đúng định dạng. Vui lòng kiểm tra lại!<br>'
          }
        }
        if (
          row1.fromLocationCode == null ||
          (typeof row1.fromLocationCode === 'string' && row1.fromLocationCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Mã điểm lấy hàng không được để trống!<br>'
        }
        if (row1.fromETD) {
          let fromETD = new Date(row1.fromETD)
          if (!fromETD) {
            strErr +=
              'Dòng ' + idx + ' - Thời gian dự kiến đến lấy hàng không đúng định dạng. Vui lòng kiểm tra lại!<br>'
          }
        }
        if (
          row1.toLocationCode == null ||
          (typeof row1.toLocationCode === 'string' && row1.toLocationCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Mã địa điểm giao hàng không được để trống!<br>'
        }
        if (row1.toETD) {
          let toETD = new Date(row1.toETD)
          if (!toETD) {
            strErr +=
              'Dòng ' + idx + ' - Thời gian dự kiến đến giao hàng xong không đúng định dạng. Vui lòng kiểm tra lại!<br>'
          }
        }
        if (row1.emptyReturnTime) {
          let emptyReturnTime = new Date(row1.emptyReturnTime)
          if (!emptyReturnTime) {
            strErr += 'Dòng ' + idx + ' - Thời gian trả container rỗng không đúng định dạng. Vui lòng kiểm tra lại!<br>'
          }
        }
      }
      for (const row2 of jsonData2) {
        let idx = jsonData.indexOf(row2) + 2

        if (row2.contCode == null || (typeof row2.contCode === 'string' && row2.contCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã container không được để trống!<br>'
        }
        if (row2.productCode == null || (typeof row2.productCode === 'string' && row2.productCode.trim().length == 0)) {
          strErr += 'Dòng ' + idx + ' - Mã sản phẩm không được để trống!<br>'
        }
        if (
          row2.packageTypeCode == null ||
          (typeof row2.packageTypeCode === 'string' && row2.packageTypeCode.trim().length == 0)
        ) {
          strErr += 'Dòng ' + idx + ' - Mã loại đóng gói không được để trống!<br>'
        }
      }
      if (strErr.length > 0) {
        this.notifyService.hideloading()
        this.notifyService.showError(strErr)
        return
      }

      const dataExcel = {
        lstOrder: jsonData,
        lstOrderCont: jsonData1,
        lstContProduct: jsonData2,
      }

      this.apiService.post(this.apiService.ORDER.CREATE_BY_EXCEL, dataExcel).then((result) => {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(this.enumData.Constants.Message_Create_Success)
        this.searchData()
      })
    }
  }

  // EXCEL_TEMPLATE, EXPORT
  templateHeader = [
    'NGÀY',
    'SL',
    'LC',
    'HÃNG TÀU',
    'BL/BK',
    'HÀNG HÓA',
    'XE ĐI',
    'CẢNG NÂNG',
    'KHO ĐÓNG HÀNG',
    'SỐ CONT',
    'SỐ CONT',
    'CẢNG HẠ',
    'CẮT MÁNG',
    'NGÀY VỀ',
    'XE VỀ',
    'SỐ MOOC',
    'TRỌNG LƯỢNG DK',
    'THÔNG TIN NÂNG HẠ/ GIẤY THUỐC',
    'SỐ LÔ',
    'GHI CHÚ',
    'SỐ HĐKH',
    'KHÁCH HÀNG TRẢ NÂNG/HẠ',
    'KHÁCH HÀNG TRẢ CƯỚC',
    'MÃ ĐƠN HÀNG',
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
    this.notifyService.showloading()

    let date = new Date().toISOString()
    let fileNamehead = `BANG_DON_HANG`

    let fileNameAdditional = `-${date}`
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
      'dateOrder',
      'quantity',
      'contTypeCode',
      'shipName',
      'bookingNumber',
      'productName',
      'none',
      'portRaise',
      'stockGetProduct',
      'none',
      'none',
      'putProductDown',
      'cutOfTime',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'description',
      'internalNumberOfCustomerContracts',
      'companyReimbursementCode',
      'freightCompanyName',
      'orderCode',
    ]

    // Khai báo kiểu dữ liệu
    const columnFmt: any = {
      // 1: textFmt,
      // 2: numberFmt,
      // 3: textFmt,
      // 4: textFmt,
      // 5: textFmt,
      // 6: textFmt,
      // 7: numberFmt,
      // 8: numberFmt,
      // 9: numberFmt,
      // 10: numberFmt,
      // 11: numberFmt,
      // 12: numberFmt,
    }

    // Khai báo các loại dữ liệu của cột số {thứ tụ cột:fmtTxt or fmtNum}
    // Khai báo các loại dữ liệu của cột {thứ tụ cột:fmtTxt or fmtNum}
    // FORMAT FILE EXCEL--end

    let header: string[] = []
    if (template) {
      fileName = `Template${fileName}`
      header = this.templateHeader
    } else {
      header = this.templateHeader
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
      if (cell.value === 'MÃ ĐƠN HÀNG') {
        sheet1.getColumn(colNumber).hidden = true
      }
    })
    headerRow.height = 24
    // sheet1.getColumn(4).numFmt = '@'
    // sheet1.getColumn(5).numFmt = '@'

    // CUSTOME WHERE CONDITION
    const where = { ...this.dataSearch }
    await this.coreService.filterDataSearch(where)

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
      await this.apiService.post(this.apiService.ORDER.GROUP_ORDER_CONT, dataSearch).then((res: any) => {
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
      await this.apiService.post(this.apiService.ORDER.GROUP_ORDER_CONT, dataSearch).then((res: any) => {
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
}
