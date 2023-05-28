import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../../core/enumData'
import { ApiService } from '../../../../../services/api.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'

@Component({
  selector: 'app-add-customer-location',
  templateUrl: './add-customer-location.component.html',
})
export class AddCustomerLocationComponent implements OnInit {
  // ORIGIN DATA
  enumData = enumData
  dataLocationType = this.coreService.convertObjToArray(enumData.LocationType)
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)

  // TABLE DATA
  checked = false
  indeterminate = false
  listOfCurrentPageData: any[] = []
  setOfCheckedId = new Set<number>()
  isChooseAddAll: boolean = false
  listOfData: any[] = []
  checkedLst: any[] = []

  //SEARCH DATA
  dataSearch: any = {}
  loading = true
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total

  constructor(
    private apiService: ApiService,
    private notifyService: NotifyService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<AddCustomerLocationComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.searchData(true)
  }

  hideModal() {}

  onAddLocation() {
    const locationDataCreate: any = {}
    locationDataCreate.customerId = this.data.id
    locationDataCreate.lstLocation = this.checkedLst
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CUSTOMER.LOCATION_CREATE_DATA, locationDataCreate).then((result) => {
      if (result) {
        this.closeDialog()
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Create_Success)
      }
    })
    this.hideModal()
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
    if (this.dataSearch.name && this.dataSearch.name !== '') {
      const key = 'name'
      where[key] = this.dataSearch.name
    }

    if (this.dataSearch.type && this.dataSearch.type !== '') {
      const key = 'type'
      where[key] = this.dataSearch.type
    }

    if (this.dataSearch.statusId > 0) {
      const key = 'isDeleted'
      if (this.dataSearch.statusId === this.enumData.StatusFilter.Active.value) {
        where[key] = false
      }
      if (this.dataSearch.statusId === this.enumData.StatusFilter.InActive.value) {
        where[key] = true
      }
    }

    where['customerId'] = this.data.id

    const dataSearch = {
      where,
      order: { createdAt: 'DESC' },
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }

    this.apiService.post(this.apiService.CUSTOMER.LOCATION_PAGINATION_NOT_IN, dataSearch).then((data: any) => {
      if (data) {
        this.loading = false
        this.listOfData = data[0]
        this.total = data[1]
      }
    })
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id)
    } else {
      this.setOfCheckedId.delete(id)
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked)
    this.refreshCheckedStatus()
  }

  onAllChecked(value: boolean): void {
    this.listOfCurrentPageData.forEach((item) => this.updateCheckedSet(item.id, value))
    this.refreshCheckedStatus()
  }

  onCurrentPageDataChange($event: any): void {
    this.listOfCurrentPageData = $event
    this.refreshCheckedStatus()
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfCurrentPageData.every((item) => this.setOfCheckedId.has(item.id))
    this.indeterminate = this.listOfCurrentPageData.some((item) => this.setOfCheckedId.has(item.id)) && !this.checked

    this.checkedLst = [...this.listOfCurrentPageData, ...this.checkedLst].filter((e: any) =>
      this.setOfCheckedId.has(e.id)
    )
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
