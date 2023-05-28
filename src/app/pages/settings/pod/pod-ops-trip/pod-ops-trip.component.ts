import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { enumData } from '../../../../core/enumData';
import { User } from '../../../../models/user.model';
import { ApiService } from '../../../../services/api.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { CoreService } from '../../../../services/core.service';
import { NotifyService } from '../../../../services/notify.service';
import { AddPodOpsTripComponent } from './add-pod-ops-trip/add-pod-ops-trip.component';


@Component({
  selector: 'app-pod-ops-trip',
  templateUrl: './pod-ops-trip.component.html',
})
export class PodOpsTripComponent implements OnInit {
  currentUser: User | any
  enumData = enumData
  dataFilterStatus = this.coreService.convertObjToArray(enumData.StatusFilter)
  dataServiceType = this.coreService.convertObjToArray(enumData.ServiceType)
  listOfData: any = []
  dataSearch: any = {}
  loading = true
  pageIndex = enumData.Page.pageIndex
  pageSize = enumData.Page.pageSize
  total = enumData.Page.total
  dataObject: any
  lstDriver: any[] = []
  lstVehicle: any[] = []

  constructor(
    private notifyService: NotifyService,
    public coreService: CoreService,
    private apiService: ApiService,
    private dialog: MatDialog,
    private router: Router,
    private authenticationService: AuthenticationService,

    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x))
    this.authenticationService.currentUser.subscribe((x: any) => (this.enumData = x.enumData))
  }

  async ngOnInit() {
    Promise.all([
      await this.apiService.post(this.apiService.DRIVER.FIND, {}),
      await this.apiService.post(this.apiService.VEHICLE.FIND, {}),
    ]).then((res) => {
      this.notifyService.hideloading()
      this.lstDriver = res[0]
      this.lstVehicle = res[1]
    })
    this.dataSearch = new Object()
    this.dataObject = new Object()
    this.searchData()
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
      order: { createdAt: 'DESC' },
      skip: (this.pageIndex - 1) * this.pageSize,
      take: this.pageSize,
    }
    this.apiService.post(this.apiService.POD.POD_PAGINATION_OPS_TRIPS, dataSearch).then((data: any) => {
      if (data) {
        this.loading = false
        this.listOfData = data[0]
        this.total = data[1]
      }
    })
  }

  clickDetail(data: any) {
    this.dialog
      .open(AddPodOpsTripComponent, { disableClose: false, data })
      .afterClosed()
      .subscribe((data) => {
        this.searchData(true)
      })
  }
}
