import { Component, Input, OnInit, SimpleChanges } from '@angular/core'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  @Input() userId: any
  @Input() objPermissionRole: any
  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
  }

  enumData = enumData
  modalTitle: any
  pageIndex: any
  pageSize: any
  total: any
  listOfData: any = []
  dataFilterStatus: any

  dataDepartment: any = []
  dataEmployeeSource: any = []
  dataEmployee: any = []
  dataObject: any
  loading = true
  currentUser: User | undefined
  listKeys: any = []
  dataSave: any = []

  enumRole = enumData.Role.Setting_Permission

  ngOnChanges(changes: SimpleChanges) {
    if (changes !== undefined) {
      if (changes['currentValue'] !== null && this.userId) {
        this.userId = this.userId
        this.searchData()
      }
    }
  }

  searchData(reset: boolean = false) {
    // this.loading = false
    // if (typeof this.userId !== 'undefined' && this.userId !== '') {
    //   this.loading = true
    //   if (reset) {
    //     this.pageIndex = 1
    //   }
    //   const where: any = {}
    //   if (this.userId && this.userId !== '') {
    //     where['userId'] = this.userId
    //   }
    //   const dataSearch = {
    //     where,
    //     relations: ['user'],
    //     order: { roleCode: 'ASC' },
    //     skip: (this.pageIndex - 1) * this.pageSize,
    //     take: this.pageSize,
    //   }
    //   this.apiService.post(this.apiService.PERMISSION.PAGINATION, dataSearch).then((data: any) => {
    //     if (data) {
    //       this.loading = false
    //       this.total = this.listOfData.length
    //       const listCheckBox = document.getElementsByClassName('checkbox-role')
    //       for (const item of listCheckBox as any) {
    //         if (
    //           data[0].some((e: any) => {
    //             return e.roleCode === item.id
    //           })
    //         ) {
    //           item.checked = true
    //         } else {
    //           item.checked = false
    //         }
    //       }
    //     }
    //   })
    // }
  }

  ngOnInit(): void {
    this.listOfData = this.coreService.convertObjToArray(enumData.Role)

    this.dataFilterStatus = this.coreService.convertObjToArray(this.enumData.StatusFilter)
    this.apiService.eventSearchData.subscribe((res) => {
      if (res === true) {
        this.searchData()
      }
    })
    this.searchData()
    this.listOfData = this.listOfData.filter((s: any) => s.type == 'tms')
    this.listOfData.forEach((element: any) => {
      Object.keys(element).forEach((e) => {
        if (
          e != 'code' &&
          e != 'name' &&
          e != 'type' &&
          e != 'url' &&
          !this.listKeys.some((s: any) => {
            return s.key === e
          })
        ) {
          this.listKeys.push({ key: e, name: element[e].name, value: false })
        }
      })
    })
  }

  onItemChecked(data: any, item: any) {
    const codeRole = data[item.key]

    if (this.objPermissionRole[codeRole?.code]) {
      this.objPermissionRole[codeRole?.code] = false
    } else {
      this.objPermissionRole[codeRole?.code] = true
    }
  }

  ngOnDestroy() {
    this.apiService.eventSearchData.next(false)
  }
}
