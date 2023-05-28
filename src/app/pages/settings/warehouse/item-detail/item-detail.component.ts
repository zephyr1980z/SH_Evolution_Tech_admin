import { Component, OnInit } from '@angular/core'
import { NotifyService } from '../../../../services/notify.service'
import { ApiService } from '../../../../services/api.service'
import { enumData } from '../../../../core/enumData'
import { MatDialog } from '@angular/material/dialog'
import { CoreService } from '../../../../services/core.service'
import { User } from '../../../../models/user.model'
import { AuthenticationService } from '../../../../services/authentication.service'
import { AddOrEditItemDetailModelComponent } from './add-or-edit-item-detail-model/add-or-edit-item-detail-model.component'
import { ItemDetailModalComponent } from './item-detail/item-detail-modal.component'
// @ts-ignore
import * as XLSX from 'xlsx'
@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
})
export class ItemDetailComponent implements OnInit {
  // modalTitle = enumData.Constants.Model_Add
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  listOfData: any = []
  dataSearch: any
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  loading = true
  currentUser: User | any
  isVisible = false
  enumData = enumData
  checkTemplete = false
  dataObject: any

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    private coreService: CoreService,
    private dialog: MatDialog,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
  }

  ngOnInit(): void {
    this.dataSearch = new Object()
    this.dataObject = new Object()
    this.dataSearch.statusId = enumData.StatusFilter.All.value
    this.searchData()
  }

  async searchData(reset: boolean = false) {
    if (reset) {
      this.pageIndex = 1
    }
    this.loading = true

    const where: any = {}
    if (this.dataSearch.code && this.dataSearch.code !== '') {
      const key = 'code'
      where[key] = this.dataSearch.code
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
    const dataSearch = {
      where,
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.ITEM_DETAIL.PAGINATION, dataSearch).then((data) => {
      if (data) {
        this.loading = false
        this.total = data[1]
        this.listOfData = data[0]
      }
    })
  }

  clickAdd() {
    this.dialog
      .open(AddOrEditItemDetailModelComponent, { disableClose: false })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickEdit(object: any) {
    this.dialog
      .open(AddOrEditItemDetailModelComponent, { disableClose: false, data: object })
      .afterClosed()
      .subscribe((data) => {
        this.searchData()
      })
  }

  clickDetail(data: any) {
    this.dialog
      .open(ItemDetailModalComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((res) => {})
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ITEM_DETAIL.DELETE, { id: data.id }).then((res) => {
      this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      this.notifyService.hideloading()
      this.searchData()
    })
  }

  clickDownloadTemplateExcel() {
    // let date = new Date().toISOString()
    // const fileName = 'Template_add_employee_to' + date + '.xlsx'
    // let dataExcel: any = []
    // this.listOfData.forEach((e: any) => {
    //   e.lstProjectItem.forEach((d: any) => {
    //     dataExcel.push({
    //       'Mã Zone': e.code,
    //       'Mã Căn': d.code,
    //       'Tên Căn': d.name,
    //       'Danh sách mã nhân viên (Cách nhau bằng dấu phẩy)': d.lstEmployeeCode.toString(),
    //     })
    //   })
    // })
    // const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataExcel)
    // const wb: XLSX.WorkBook = XLSX.utils.book_new()
    // ws['!cols'] = [{ width: 10 }, { width: 10 }, { width: 10 }, { width: 60 }]
    // XLSX.utils.book_append_sheet(wb, ws, 'TemplateDownloadExcel')
    // XLSX.writeFile(wb, fileName)
  }

  async clickImportExcel(event: any) {
    //   this.notifyService.showloading()
    //   let workBook = null
    //   let jsonData: any = null
    //   this.dataUploadExcel = []
    //   const reader = new FileReader()
    //   const file = event.target.files[0]
    //   reader.readAsBinaryString(file)
    //   reader.onload = () => {
    //     workBook = XLSX.read(reader.result, { type: 'binary' })
    //     jsonData = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]], {
    //       raw: true,
    //       defval: null,
    //       header: ['zoneCode', 'appartmentCode', 'appartmentName', 'lstEmployeeCode'],
    //     })
    //     // fix lỗi k import 2 lần đc
    //     ;(<HTMLInputElement>document.getElementById('file')).value = ''
    //     // bỏ dòng merge
    //     jsonData.shift()
    //     // bỏ dòng header
    //     let strErr = ''
    //     const inputData: any = {}
    //     inputData.lstData = []
    //     const res: any[] = jsonData
    //     /** Chuyển tất cả lstProjectItem  ra 1 lstProjectItems lớn */
    //     const lstProjectItems = [...this.listOfData.map((e: any) => ({ lstProjectItem: e.lstProjectItem, code: e.code }))]
    //     for (let row of res as any) {
    //       let idx = res.indexOf(row) + 2
    //       if (row.zoneCode == null || (typeof row.zoneCode === 'string' && row.zoneCode.trim().length == 0))
    //         strErr += 'Dòng ' + idx + ' - Mã Zone không được để trống  <br>'
    //       if (
    //         row.appartmentCode == null ||
    //         (typeof row.appartmentCode === 'string' && row.appartmentCode.trim().length == 0)
    //       )
    //         strErr += 'Dòng ' + idx + ' - Mã căn không được để trống  <br>'
    //       if (
    //         row.appartmentName == null ||
    //         (typeof row.appartmentName === 'string' && row.appartmentName.trim().length == 0)
    //       )
    //         strErr += 'Dòng ' + idx + ' - Tên căn không được để trống  <br>'
    //       if (strErr.length > 0) {
    //         this.notifyService.hideloading()
    //         this.notifyService.showError(strErr)
    //         return
    //       }
    //       /** Chuyển code nhân viên thành id */
    //       row.lstEmployeeId = []
    //       if (row.lstEmployeeCode && row.lstEmployeeCode != undefined) {
    //         const lstEmpCode = row.lstEmployeeCode.split(',')
    //         lstEmpCode.forEach((e: any) => {
    //           const employee = this.lstEmployee.find((d: any) => e.trim() == d.code)
    //           if (employee) {
    //             row.lstEmployeeId.push(employee.id)
    //           }
    //         })
    //       }
    //       /** Tìm đúng id cho appartment */
    //       inputData.projectId = this.dataSearch.projectId
    //       for (let i of lstProjectItems) {
    //         const projectItem = i.lstProjectItem.find((e: any) => e.code == row.appartmentCode && i.code == row.zoneCode)
    //         if (projectItem) {
    //           inputData.lstData.push({
    //             id: projectItem.id,
    //             lstEmployeeId: row.lstEmployeeId,
    //           })
    //         }
    //       }
    //     }
    //     this.notifyService.hideloading()
    //     this.apiService.post(this.apiService.PROJECT_GROUP.SM_JOB_SAVE, inputData).then((result) => {
    //       if (result) {
    //         this.fileList = []
    //         this.notifyService.showSuccess('Thêm file excel thành công!')
    //         this.searchData()
    //       }
    //     })
    //   }
  }
}
