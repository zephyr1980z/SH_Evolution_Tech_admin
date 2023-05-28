import { AfterViewInit, Component, NgZone } from '@angular/core'
import { ApiService } from '../../../services/api.service'
import { CoreService } from '../../../services/core.service'
import { StorageService } from '../../../services/storage.service'
@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
})
export class AnalysisComponent implements AfterViewInit {
  dNow = new Date()
  constructor(
    private apiService: ApiService,
    private ngZone: NgZone,
    public coreService: CoreService,
    private storageService: StorageService
  ) {}

  ngAfterViewInit(): void {
    this.searchData()
  }

  searchData() {}
}
