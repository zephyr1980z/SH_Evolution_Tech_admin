import { Component, OnInit } from '@angular/core'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
})
export class PermissionComponent implements OnInit {
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }
  enumData: any
  modalTitle = 'enumData.Constants.Model_Add'
  pageIndex = enumData.Page.pageIndex
  pageSize = 1000
  total = enumData.Page.total

  dataDepartment: any = []
  dataEmployeeSource: any = []
  dataEmployee: any = []
  dataObject: any
  userId: any = ''
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  loading = true
  currentUser: User | any
  dataSave: any[] = []

  PermissionRole = enumData.Role.Setting_Permission
  PermissionTimeKeepingRole = enumData.Role.Setting_Permission_Timekeeping
  PermissionWarehouseRole = enumData.Role.Setting_Permission_Warehouse

  lstPermissionRole: any[] = []
  objPermissionRole: any = {}

  ngOnInit(): void {
    this.loadDepartment()
    this.loadEmployee()
    this.dataObject = new Object()
    this.onChangeEmployee()
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    data.isDeleted = !data.isDeleted
  }

  onChangeEmployee() {
    this.userId = this.dataObject.userId
    // Load all permission
    if (this.dataObject.userId) {
      const where: any = {}
      where.userId = this.dataObject.userId
      const dataSearch = {
        where,
        relations: ['user'],
        order: { roleCode: 'ASC' },
        skip: (this.pageIndex - 1) * this.pageSize,
        take: this.pageSize,
      }
      this.apiService.post(this.apiService.PERMISSION.PAGINATION, dataSearch).then((res: any) => {
        if (res) {
          this.loading = false
          this.lstPermissionRole = res[0]
          this.objPermissionRole = this.coreService.arrayToObject(res[0], 'roleCode')
          // this.total = this.listOfData.length
          // const listCheckBox = document.getElementsByClassName('checkbox-role')
          // for (const item of listCheckBox as any) {
          //   if (
          //     data[0].some((e: any) => {
          //       return e.roleCode === item.id
          //     })
          //   ) {
          //     item.checked = true
          //   } else {
          //     item.checked = false
          //   }
          // }
        }
      })
    }
  }

  async saveData() {
    // this.dataSave = []
    if (!this.dataObject?.userId) {
      this.notifyService.showError('Vui lòng chọn nhân viên!')
    } else {
      this.notifyService.showloading()
      // const listCheckBox = document.getElementsByClassName('checkbox-role')
      // for (const item of listCheckBox as any) {
      //   if (item.checked) {
      //     this.dataSave.push({ userId: this.userId, roleCode: item.id })
      //   }
      // }
      const param: any = {}

      const lstRole: any[] = []

      for (const key in this.objPermissionRole) {
        const roleCode = this.objPermissionRole[key]
        if (roleCode) {
          lstRole.push(key)
        }
      }

      // const lstRoleActiveCode = lstRoleActive.map((e) => e.roleCode)

      param.userId = this.dataObject?.userId
      param.lstRoleCode = lstRole

      await this.apiService.post(this.apiService.PERMISSION.CREATE, param).then((result) => {
        this.notifyService.hideloading()
        if (result) {
          if (result && !result.error) {
            this.dataSave = []
          }
          this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        }
      })
    }
  }

  loadDepartment() {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.DEPARTMENT.FIND, { where: { isDeleted: false } }).then((result) => {
      this.notifyService.hideloading()
      this.dataDepartment = result
    })
  }

  loadEmployee() {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.EMPLOYEE.FIND, { where: { isDeleted: false } }).then((result) => {
      this.notifyService.hideloading()
      this.dataEmployeeSource = result.filter((e: any) => e.__user__ && e.__user__?.type !== 'Admin')
      this.dataEmployee = result.filter((e: any) => e.__user__ && e.__user__?.type !== 'Admin')
    })
  }
}
