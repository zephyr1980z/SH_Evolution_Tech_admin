import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { ApiService } from '../../../services/api.service'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'
import { NotifyService } from '../../../services/notify.service'

@Component({
  selector: 'app-setting-string',
  templateUrl: './setting-string.component.html',
  styleUrls: ['./setting-string.component.scss'],
})
export class SettingStringComponent implements OnInit {
  enumData: any = {}
  role: any
  currentUser: User | any
  parseInt = parseInt
  listOfData: any = []
  dataSearch: any
  dataFilter: any = []
  loading = true
  enumRole: any
  isVisibleDetail = false
  dataObject: any

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  ngOnInit(): void {
    this.role = enumData.SettingString
    this.dataFilter = this.coreService
      .convertObjToArray(this.enumData.SettingString)
      .filter((x) => x.projectType === this.enumData.ProjectSetting.Tms.code)
    this.dataObject = new Object()
    this.dataSearch = new Object()
    this.searchData()
  }

  async searchData(reset: boolean = false) {
    this.loading = true

    this.listOfData = []
    this.apiService
      .post(this.apiService.SETTINGSTRING.FIND, {
        where: { isDeleted: false, projectType: this.enumData.ProjectSetting.Tms.code },
      })
      .then((res: any) => {
        if (res) {
          this.loading = false
          for (const _enum of this.dataFilter) {
            let _value = _enum.default
            if (res.length > 0) {
              const enumTemp = res.find((s: any) => s.code === _enum.code)
              if (enumTemp) {
                if (enumTemp.valueString) {
                  _value = enumTemp.valueString
                } else {
                  _value = enumTemp.valueNumber
                }
              }
            }
            this.listOfData.push({
              code: _enum.code,
              name: _enum.name,
              unit: _enum.unit,
              description: _enum.description,
              projectType: this.enumData.ProjectSetting.Tms.code,
              valueString: !this.parseInt(_value) ? _value : null,
              valueNumber: this.parseInt(_value) && this.parseInt(_value) > 0 ? this.parseInt(_value) : null,
            })
          }
        }
      })
  }

  setActiveItem(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.SETTINGSTRING.DELETE, data).then((result) => {
      if (result) {
        this.searchData()
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
      }
    })
  }

  onSaveData() {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.SETTINGSTRING.CREATELIST, this.listOfData).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
      }
    })
  }

  showDetail(data: any) {
    this.dataObject = data
    this.isVisibleDetail = true
  }

  hideDetail() {
    this.dataObject = new Object()
    this.isVisibleDetail = false
  }
}
