import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { ApiService } from '../../../../services/api.service'
import { AuthenticationService } from '../../../../services/authentication.service'
import { CoreService } from '../../../../services/core.service'
@Component({
  selector: 'app-ward-list',
  templateUrl: './ward-list.component.html',
})
export class WardListComponent implements OnInit {
  listOfData: any[] = []
  loading = false

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    public coreService: CoreService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    this.loadData()
  }

  loadData() {
    this.loading = false

    const where: any = { districtId: this.data.id }
    this.apiService.post(this.apiService.WARD.FIND, where).then((res: any) => {
      this.loading = false
      this.listOfData = res || []
    })
  }
}
