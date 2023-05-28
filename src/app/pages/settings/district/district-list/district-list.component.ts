import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ApiService } from '../../../../services/api.service'
import { CoreService } from '../../../../services/core.service'
import { WardListComponent } from '../../ward/ward-list/ward-list.component'

@Component({
  selector: 'app-district-list',
  templateUrl: './district-list.component.html',
})
export class DistrictListComponent implements OnInit {
  listOfData: any[] = []
  loading = false

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private dialog: MatDialog,
    public coreService: CoreService
  ) {}

  ngOnInit() {
    this.loadData()
  }

  loadData() {
    this.loading = false
    const where: any = { cityId: this.data.id }
    this.apiService.post(this.apiService.DISTRICT.LOAD_DATA, where).then((res: any) => {
      this.loading = false
      this.listOfData = res || []
    })
  }

  viewWard(data: any) {
    this.dialog.open(WardListComponent, { disableClose: false, data: data })
  }
}
