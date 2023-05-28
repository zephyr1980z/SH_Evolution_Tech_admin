import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { enumData } from '../../../../../core/enumData';
import { ApiService } from '../../../../../services/api.service';
import { CoreService } from '../../../../../services/core.service';
import { NotifyService } from '../../../../../services/notify.service';

@Component({
  selector: 'app-add-or-edit-assembly-of-square-parts',
  templateUrl: './add-or-edit-assembly-of-square-parts.component.html',
})
export class AddOrEditAssembleOfSquarePartsComponent implements OnInit {
  dataObject: any
  isEditItem = false
  modelTitle = 'Chỉnh sửa máy'

  lstItemSrc: any = []
  lisItem: any = []
  dataChoose: any

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<AddOrEditAssembleOfSquarePartsComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

   ngOnInit() {
    this.loadDataSearch()
    if (this.data && this.data !== null) {
      this.isEditItem = true
      this.dataObject = this.data
    } else {
      this.modelTitle = 'Thêm mới máy'
      this.dataObject = new Object()
      this.dataChoose = new Object()
      this.dataObject.lstItem = []
    }
  }

  async loadDataSearch() {
    Promise.all([
      this.apiService.post(this.apiService.ITEM.FIND, { isDeleted: false }),
    ]).then((res) => {
      this.notifyService.hideloading()
      if (res) {
        this.lstItemSrc = res[0]
      }
    })
  }

  clear() {
    this.dataObject = new Object()
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
    this.apiService.post(this.apiService.ASSEMBLY_OF_SQUARE_PARTS.CREATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
        this.closeDialog()
      }
    })
  }

  updateObject(data: any) {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.ASSEMBLY_OF_SQUARE_PARTS.UPDATE, data).then((result) => {
      if (result) {
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Update_Success)
        this.closeDialog()
      }
    })
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
  onDelete(index: any) {
    this.dataObject.lstItem.splice(index, 1)
  }

  onAddItem() {
    let item = this.dataObject.lstItem.find((s:any) => s.id == this.dataChoose.id)
    if(item){
      item.quantity = item.quantity + +this.dataChoose.quantity
    }
    else{
      this.dataObject.lstItem.push({
      id: this.dataChoose.id,
      quantity: this.dataChoose.quantity,
    })
  }
    this.dataChoose = new Object()
  }

  // onChangeItem(event: any) {
}
