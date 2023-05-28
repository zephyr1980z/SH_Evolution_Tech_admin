import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { environment } from '../../../../../../environments/environment';
import { enumData } from '../../../../../core/enumData';
import { ApiService } from '../../../../../services/api.service';
import { CoreService } from '../../../../../services/core.service';
import { NotifyService } from '../../../../../services/notify.service';
declare var Object: any
const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
@Component({
  selector: 'app-add-pod-ops-trip',
  templateUrl: './add-pod-ops-trip.component.html',
})
export class AddPodOpsTripComponent implements OnInit {

  enumData: any
  dataObject: any
  isEditItem = false
  modelTitle = 'DANH SÁCH CHỨNG TỪ CỦA CHUYẾN'
  listOfData: any = []
  BodOps: any
  enumRole = enumData.Role.Bod_Ops
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize

   // IMAGE
   urlAction = ''
   previewVisible = false
   previewImage: string = ''
   fileList: NzUploadFile[] = []

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<AddPodOpsTripComponent>,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.BodOps = enumData.Role.Bod_Ops
    this.loadData()
    this.dataObject = new Object()
    if (this.data && this.data != null) {
      this.dataObject = this.data
    }
    this.urlAction = environment.apiUrl + '/' + 'uploadFiles/upload_single'
  }

  clear() {
    this.dataObject = new Object()
  }

  onSave() {
    const data = this.dataObject
    data.opsTripId = this.data.id
    this.notifyService.showloading()
    this.apiService.post(this.apiService.POD.CREATE_MEDIA_OPS_TRIPS, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }
  closeDialog() {
    this.dialogRef.close(1)
  }

  loadData() {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.POD.FIND_MEDIA_OPS_TRIPS, { id: this.data.id }).then((result) => {
      this.notifyService.hideloading()
      this.dataObject = result
    })
  }

  onDelete(index: any) {
    this.dataObject.lstOrderPods.splice(index, 1)
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
