import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../core/enumData'
import { ApiService } from '../../../../services/api.service'
import { CoreService } from '../../../../services/core.service'
import { NotifyService } from '../../../../services/notify.service'
import { AddCustomerLocationComponent } from './add-customer-location/add-customer-location.component'
@Component({
  selector: 'app-customer-location',
  templateUrl: './customer-location.component.html',
})
export class CustomerLocationComponent implements OnInit {
  // SERCH DATA
  dataSearch: any = {}
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total

  // TABLE DATA
  listOfData: any[] = []
  checked = false
  indeterminate = false
  listOfCurrentPageData: any[] = []
  setOfCheckedId = new Set<number>()
  isChooseAddAll: boolean = false
  checkedLst: any[] = []
  loading = true

  // ORIGIN DATA
  enumData = enumData
  dataLocationType = this.coreService.convertObjToArray(enumData.LocationType)
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  thatData = this.data

  visibleAddCustomerLocation: boolean = false

  constructor(
    private apiService: ApiService,
    private notifyService: NotifyService,
    public coreService: CoreService,
    private dialog: MatDialog,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.searchData()
  }

  async searchData(reset: boolean = false) {
    if (reset) {
      this.setOfCheckedId = new Set<number>()
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

    this.apiService.post(this.apiService.CUSTOMER.LOCATION_PAGINATION, dataSearch).then((data: any) => {
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
    // check all
    this.checked = this.listOfCurrentPageData.every((item) => this.setOfCheckedId.has(item.id))
    // check not all
    this.indeterminate = this.listOfCurrentPageData.some((item) => this.setOfCheckedId.has(item.id)) && !this.checked
    this.checkedLst = [...this.listOfCurrentPageData, ...this.checkedLst].filter((e: any) =>
      this.setOfCheckedId.has(e.id)
    )
  }

  clickRemove() {
    const locationDataDelte: any = {}
    locationDataDelte.customerId = this.data.id
    locationDataDelte.lstLocation = this.checkedLst
    this.notifyService.showloading()
    this.apiService.post(this.apiService.CUSTOMER.LOCATION_DELETE_DATA, locationDataDelte).then((result) => {
      if (result) {
        this.searchData(true)
        this.notifyService.hideloading()
        this.notifyService.showSuccess(enumData.Constants.Message_Delete_Success)
      }
    })
  }

  clickAddLocation(data: any) {
    this.dialog
      .open(AddCustomerLocationComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((data) => {
        this.searchData(true)
      })
  }
}
