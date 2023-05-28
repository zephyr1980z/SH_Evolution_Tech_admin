import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { enumData } from '../../../../../core/enumData'
import { User } from '../../../../../models/user.model'
import { ApiService } from '../../../../../services/api.service'
import { AuthenticationService } from '../../../../../services/authentication.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'

@Component({
  selector: 'app-oil-monitoring-detail',
  templateUrl: './oil-monitoring-detail.component.html',
  styleUrls: ['./oil-monitoring-detail.component.scss'],
})
export class OilMonitoringDetailComponent implements OnInit {
  currentUser: User | any
  enumData = enumData
  modalTitle: any
  dataFilterStatus: any
  loading = true
  listOfData: any = []
  dataSearch: any = {}
  dataStatusItem: any
  lstVehicle: any = []
  vehicle: any
  totalOilMonitoring: any

  constructor(
    private notifyService: NotifyService,
    public coreService: CoreService,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<OilMonitoringDetailComponent>,
    private authenticationService: AuthenticationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
  }

  async ngOnInit() {
    this.loadData()
    this.searchData()
  }

  closeDialog() {
    this.dialogRef.close(1)
  }

  async searchData(reset: boolean = false) {
    this.loading = true
    this.apiService
      .post(this.apiService.OIL_MONITORING.FIND, {
        vehicleId: this.data.vehicleId,
        oilingDate: this.dataSearch.oilingDate,
      })
      .then((data) => {
        if (data) {
          this.loading = false
          this.listOfData = data
          this.listOfData.sort((a: any, b: any) => (a.oilingDate > b.oilingDate ? -1 : 1))
          this.totalOilMonitoring = this.listOfData.map((s: any) => s.quantity).reduce((a: any, b: any) => a + b, 0)
        }
      })
  }

  loadData() {
    this.notifyService.showloading()
    this.apiService.post(this.apiService.VEHICLE.FIND, { isDeleted: false }).then(async (res) => {
      this.notifyService.hideloading()
      this.lstVehicle = res
      this.vehicle = this.lstVehicle.find((s: any) => s.id == this.data.vehicleId)
      this.modalTitle = `Thông tin theo dõi đổ dầu của ${this.vehicle.regNo}`
    })
    this.notifyService.hideloading()
  }
}
