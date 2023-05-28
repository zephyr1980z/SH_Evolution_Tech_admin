import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { LocationComponent } from './location/location.component'
import { RomoocComponent } from './romooc/romooc.component'
import { EmployeeComponent } from './employee/employee.component'
import { DepartmentComponent } from './department/department.component'
import { PermissionComponent } from './permission/permission.component'
import { WardComponent } from './ward/ward.component'
import { DistrictComponent } from './district/district.component'
import { CityComponent } from './city/city.component'
import { DriverComponent } from './driver/driver.component'
import { LicenseTypeComponent } from './license-type/license-type.component'
import { DriverLicenseComponent } from './driver-license/driver-license.component'
import { CustomerComponent } from './customer/customer.component'
import { ContractComponent } from './contract/contract.component'
import { ContTypeComponent } from './cont-type/cont-type.component'
import { PackageTypeComponent } from './package-type/package-type.component'
import { GroupProductComponent } from './group-product/group-product.component'
import { ProductComponent } from './product/product.component'
import { VendorComponent } from './vendor/vendor.component'
import { OrderComponent } from './order/order.component'
import { ItemComponent } from './warehouse/item/item.component'
import { ItemDetailComponent } from './warehouse/item-detail/item-detail.component'
import { ItemGroupComponent } from './warehouse/item-group/item-group.component'
import { UnitComponent } from './warehouse/unit/unit.component'
import { SpecificationComponent } from './warehouse/specification/specification.component'
import { ItemSupplierComponent } from './warehouse/item-supplier/item-supplier.component'
import { InboundComponent } from './warehouse/inbound/inbound.component'
import { CostsIncurredComponent } from './costs-incurred/costs-incurred.component'
import { DistanceComponent } from './distance/distance.component'
import { SalaryGasComponent } from './salary-gas/salary-gas.component'
import { OutboundComponent } from './warehouse/outbound/outbound.component'
import { ReportComponent } from './warehouse/report/report.component'
import { VehicleBrandComponent } from './vehicle-brand/vehicle-brand.component'
import { SettingVehicleComponent } from './setting-vehicle/setting-vehicle.component'
import { AssembleOfSquarePartsComponent } from './warehouse/assembly-of-square-parts/assembly-of-square-parts.component'
import { AssemblyCertificateComponent } from './warehouse/assembly-certificate/assembly-certificate.component'
import { InventoryComponent } from './warehouse/inventory/inventory.component'
import { AdvanceReciprocalTypeComponent } from './advance-reciprocal-type/advance-reciprocal-type.component'
import { InventoryManagementComponent } from './warehouse/inventory-management/inventory-management.component'
import { PodOrderComponent } from './pod/pod-order/pod-order.component'
import { PodOpsTripComponent } from './pod/pod-ops-trip/pod-ops-trip.component'
import { ReportInboundComponent } from './warehouse/report-inbound-detail/report-inbound.component'
import { ReportOutboundComponent } from './warehouse/report-outbound-detail/report-outbound.component'
import { ReportAssemblyCertificateComponent } from './warehouse/report-assembly-certificate/report-assembly-certificate.component'
import { ShipComponent } from './ship/ship.component'
import { SettingStringComponent } from './setting-string/setting-string.component'

const routes: Routes = [
  { path: 'location', component: LocationComponent },
  { path: 'setting-vehicle', component: SettingVehicleComponent },
  { path: 'romooc', component: RomoocComponent },
  { path: 'employee', component: EmployeeComponent },
  { path: 'department', component: DepartmentComponent },
  { path: 'permission', component: PermissionComponent },
  { path: 'ward', component: WardComponent },
  { path: 'district', component: DistrictComponent },
  { path: 'city', component: CityComponent },
  { path: 'driver', component: DriverComponent },
  { path: 'license-type', component: LicenseTypeComponent },
  { path: 'driver-license', component: DriverLicenseComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'contract', component: ContractComponent },
  { path: 'vendor', component: VendorComponent },
  { path: 'cont-type', component: ContTypeComponent },
  { path: 'package-type', component: PackageTypeComponent },
  { path: 'group-product', component: GroupProductComponent },
  { path: 'product', component: ProductComponent },
  { path: 'order', component: OrderComponent },
  { path: 'item', component: ItemComponent },
  { path: 'item-detail', component: ItemDetailComponent },
  { path: 'item-group', component: ItemGroupComponent },
  { path: 'item-unit', component: UnitComponent },
  { path: 'item-specification', component: SpecificationComponent },
  { path: 'item-supplier', component: ItemSupplierComponent },
  { path: 'inbound', component: InboundComponent },
  { path: 'costs-incurred', component: CostsIncurredComponent },
  { path: 'distance', component: DistanceComponent },
  { path: 'salary-gas', component: SalaryGasComponent },
  { path: 'outbound', component: OutboundComponent },
  { path: 'report', component: ReportComponent },
  { path: 'vehicle-brand', component: VehicleBrandComponent },
  { path: 'assembly-of-square-parts', component: AssembleOfSquarePartsComponent },
  { path: 'assembly-certificate', component: AssemblyCertificateComponent },
  { path: 'advance-reciprocal-type', component: AdvanceReciprocalTypeComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'inventory-management', component: InventoryManagementComponent },
  { path: 'pod-order', component: PodOrderComponent },
  { path: 'pod-ops-trip', component: PodOpsTripComponent },
  { path: 'report-inbound', component: ReportInboundComponent },
  { path: 'report-outbound', component: ReportOutboundComponent },
  { path: 'report-assembly-certificate', component: ReportAssemblyCertificateComponent },
  { path: 'ship', component: ShipComponent },
  { path: 'setting-string', component: SettingStringComponent },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
