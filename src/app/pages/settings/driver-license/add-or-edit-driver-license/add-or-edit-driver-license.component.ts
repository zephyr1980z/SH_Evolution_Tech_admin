import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { NzUploadFile } from 'ng-zorro-antd/upload'
import { environment } from '../../../../../environments/environment'
import { enumData } from '../../../../core/enumData'
import { User } from '../../../../models/user.model'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
@Component({
  selector: 'app-add-or-edit-driver-license',
  templateUrl: './add-or-edit-driver-license.component.html',
  styleUrls: ['./add-or-edit-driver-license.component.scss'],
})
export class AddOrEditDriverLicenseComponent implements OnInit {
  currentUser: User | any
  dataObject: any = {}
  dataDriver: any[] = []
  dataLicenseType: any[] = []
  isEditItem = false
  modelTitle = 'Thêm mới Bằng lái'

  // IMAGE
  urlAction = ''
  previewVisible = false
  previewImage: string = ''
  fileList: NzUploadFile[] = []
  constructor(
    private dialogRef: MatDialogRef<AddOrEditDriverLicenseComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private notifyService: NotifyService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
  }

  ngOnInit(): void {
    if (this.data && this.data !== null) {
      this.modelTitle = 'Cập nhật Bằng lái'
      this.dataObject = this.data
      this.isEditItem = true
      if (this.data.__files__ && this.data.__files__.length > 0) {
        this.dataObject.fileList = this.data.__files__.map((e: any) => ({
          name: e.fileName,
          url: e.fileUrl,
          uid: e.id,
        }))
      }
    }
    this.loadDataCreate()
    this.urlAction = environment.apiUrl + '/' + 'uploadFiles/upload_single'
  }

  loadDataCreate() {
    Promise.all([
      this.apiService.post(this.apiService.DRIVER.FIND, { isDeleted: false }),
      this.apiService.post(this.apiService.LICENSE_TYPE.FIND, { isDeleted: false }),
    ]).then(async (res) => {
      this.dataDriver = res[0] || []
      this.dataLicenseType = res[1] || []
    })
  }

  onSave() {
    const data = this.dataObject
    if (data.id && data.id !== '') {
      this.updateObject(data)
      return
    }
    this.addObject(data)
  }

  addObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.DRIVER_LICENSE.CREATE, data).then((result) => {
      this.notifyService.hideloading()
      if (result) {
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog(1)
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.DRIVER_LICENSE.UPDATE, data).then((result) => {
      this.notifyService.hideloading()
      if (result) {
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog(1)
      }
    })
  }

  closeDialog(flag: any) {
    this.dialogRef.close(flag)
  }

  // IMAGE
  // xóa url image
  handleClearImage(item: any) {
    this.dataObject.url = null
  }

  // show image
  handlePreview = async (file: NzUploadFile): Promise<void> => {
    if (!file.url && !file['preview']) {
      file['preview'] = await getBase64(file.originFileObj!)
    }
    this.previewImage = file.url || file['preview']
    this.previewVisible = true
  }

  handleChange(info: { file: NzUploadFile; fileList: NzUploadFile[] }): void {
    let arr = []
    switch (info.file.status) {
      case 'uploading':
        break
      case 'done':
        {
          if (info.fileList) {
            for (let item of info.fileList) {
              arr.push({
                name: item.name ? item.name : item?.originFileObj?.name,
                url: item.url ? item.url : item.response ? item.response[0] : '',
                uid: item.uid,
              })
            }
            this.dataObject.fileList = arr
          }
        }
        break
      case 'error':
        break
      case 'removed':
        {
          this.dataObject.fileList.forEach((item: { uid: string }, index: any) => {
            if (item.uid === info.file.uid) this.dataObject.fileList.splice(index, 1)
          })
        }
        break
    }
  }
}
