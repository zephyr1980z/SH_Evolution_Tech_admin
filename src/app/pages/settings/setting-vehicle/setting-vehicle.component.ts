import { Component, OnInit } from '@angular/core'
import { enumData } from '../../../core/enumData'
import { User } from '../../../models/user.model'
import { AuthenticationService } from '../../../services/authentication.service'
import { CoreService } from '../../../services/core.service'

@Component({
  selector: 'app-setting-vehicle',
  templateUrl: './setting-vehicle.component.html',
  styleUrls: ['./setting-vehicle.component.scss'],
})
export class SettingVehicleComponent implements OnInit {
  currentUser: User | undefined
  isCollapsed = true
  enumData: any
  SettingVehicle: any
  constructor(private authenticationService: AuthenticationService, public coreService: CoreService) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
  }

  ngOnInit(): void {
    this.SettingVehicle = enumData.Role.Setting_Vehicle
  }
}
