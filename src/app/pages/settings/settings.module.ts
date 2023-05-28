import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCascaderModule } from 'ng-zorro-antd/cascader'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzImageModule } from 'ng-zorro-antd/image'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'
import { NzMessageModule } from 'ng-zorro-antd/message'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { NzPaginationModule } from 'ng-zorro-antd/pagination'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzRadioModule } from 'ng-zorro-antd/radio'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzTabsModule } from 'ng-zorro-antd/tabs'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { NzUploadModule } from 'ng-zorro-antd/upload'
import { CURRENCY_MASK_CONFIG, CurrencyMaskConfig, CurrencyMaskModule } from 'ng2-currency-mask'
import { MaterialModule } from '../../material.module'
import { AddOrEditAdvanceReciprocalTypeModelComponent } from './advance-reciprocal-type/add-or-edit-advance-reciprocal-type-model/add-or-edit-advance-reciprocal-type-model.component'
import { AdvanceReciprocalTypeDetailComponent } from './advance-reciprocal-type/advance-reciprocal-type-detail/advance-reciprocal-type-detail.component'
import { AdvanceReciprocalTypeComponent } from './advance-reciprocal-type/advance-reciprocal-type.component'
import { CityComponent } from './city/city.component'
import { AddOrEditContTypeModelComponent } from './cont-type/add-or-edit-cont-type-model/add-or-edit-cont-type-model.component'
import { ContTypeDetailComponent } from './cont-type/cont-type-detail/cont-type-detail.component'
import { ContTypeComponent } from './cont-type/cont-type.component'
import { AddOrEditContractPriceComponent } from './contract-price/add-or-edit-contract-price/add-or-edit-contract-price.component'
import { ContractPriceComponent } from './contract-price/contract-price.component'
import { AddEditContarctTermComponent } from './contract-term/add-edit-contarct-term/add-edit-contarct-term.component'
import { ContractTermComponent } from './contract-term/contract-term.component'
import { AddOrCopyContractComponent } from './contract/add-or-copy-contract/add-or-coppy-contract.component'
import { ContractDetailComponent } from './contract/contract-detail/contract-detail.component'
import { ContractComponent } from './contract/contract.component'
import { EditContractComponent } from './contract/edit-contract/edit-contract.component'
import { AddOrEditCostsIncurredComponent } from './costs-incurred/add-or-edit-costs-incurred/add-or-edit-costs-incurred.component'
import { CostsIncurredDetailComponent } from './costs-incurred/costs-incurred-detail/costs-incurred-detail.component'
import { CostsIncurredComponent } from './costs-incurred/costs-incurred.component'
import { AddOrEditCustomerComponent } from './customer/add-or-edit-customer/add-or-edit-customer.component'
import { CustomerDetailComponent } from './customer/customer-detail/customer-detail.component'
import { AddCustomerLocationComponent } from './customer/customer-location/add-customer-location/add-customer-location.component'
import { CustomerLocationComponent } from './customer/customer-location/customer-location.component'
import { AddCustomerProductComponent } from './customer/customer-product/add-customer-product/add-customer-product.component'
import { CustomerProductComponent } from './customer/customer-product/customer-product.component'
import { CustomerComponent } from './customer/customer.component'
import { AddOrEditDepartmentModelComponent } from './department/add-or-edit-department-model/add-or-edit-department-model.component'
import { DepartmentEmployeesModelComponent } from './department/department-employees-model/department-employees-model.component'
import { DepartmentComponent } from './department/department.component'
import { AddOrEditDistanceComponent } from './distance/add-or-edit-distance/add-or-edit-distance.component'
import { DistanceDetailComponent } from './distance/distance-detail/distance-detail.component'
import { DistanceComponent } from './distance/distance.component'
import { DistrictListComponent } from './district/district-list/district-list.component'
import { DistrictComponent } from './district/district.component'
import { AddOrEditDriverLicenseComponent } from './driver-license/add-or-edit-driver-license/add-or-edit-driver-license.component'
import { DriverLicenseComponent } from './driver-license/driver-license.component'
import { AddOrEditDriverComponent } from './driver/add-or-edit-driver/add-or-edit-driver.component'
import { DriverDetailComponent } from './driver/driver-detail/driver-detail.component'
import { DriverComponent } from './driver/driver.component'
import { AddOrEditEmployeeModelComponent } from './employee/add-or-edit-employee-model/add-or-edit-employee-model.component'
import { ChangePasswordEmployeeModelComponent } from './employee/change-password-employee-model/change-password-employee-model.component'
import { EmployeeDetailComponent } from './employee/employee-detail/employee-detail.component'
import { EmployeeComponent } from './employee/employee.component'
import { AddOrEditGroupProductModelComponent } from './group-product/add-or-edit-group-product-model/add-or-edit-group-product-model.component'
import { GroupProductDetailComponent } from './group-product/group-product-detail/group-product-detail.component'
import { GroupProductComponent } from './group-product/group-product.component'
import { AddOrEditLicenseTypeComponent } from './license-type/add-or-edit-license-type/add-or-edit-license-type.component'
import { LicenseTypeComponent } from './license-type/license-type.component'
import { AddOrEditLocationComponent } from './location/add-or-edit-location/add-or-edit-location.component'
import { ListLocationComponent } from './location/list-location/list-location.component'
import { LocationDetailComponent } from './location/location-detail/location-detail.component'
import { LocationComponent } from './location/location.component'
import { AddContainerProductComponent } from './order/add-or-edit-order-model/add-container-product/add-container-product.component'
import { AddOrEditOrderModelComponent } from './order/add-or-edit-order-model/add-or-edit-order-model.component'
import { ManagerListContComponent } from './order/manager-list-cont/manager-list-cont.component'
import { OrderDetailComponent } from './order/order-detail/order-detail.component'
import { ProductContainerDetailComponent } from './order/order-detail/product-container-detail/product-container-detail.component'
import { OrderComponent } from './order/order.component'
import { AddOrEditPackageTypeModelComponent } from './package-type/add-or-edit-package-type-model/add-or-edit-package-type-model.component'
import { PackageTypeDetailComponent } from './package-type/package-type-detail/package-type-detail.component'
import { PackageTypeComponent } from './package-type/package-type.component'
import { AdminComponent } from './permission/admin/admin.component'
import { PermissionComponent } from './permission/permission.component'
import { TimekeepingComponent } from './permission/timekeeping/timekeeping.component'
import { WarehouseComponent } from './permission/warehouse/warehouse.component'
import { AddPodOpsTripComponent } from './pod/pod-ops-trip/add-pod-ops-trip/add-pod-ops-trip.component'
import { PodOpsTripComponent } from './pod/pod-ops-trip/pod-ops-trip.component'
import { AddPodOrderComponent } from './pod/pod-order/add-pod-order/add-pod-order.component'
import { PodOrderComponent } from './pod/pod-order/pod-order.component'
import { AddOrEditProductModelComponent } from './product/add-or-edit-product-model/add-or-edit-product-model.component'
import { ProductDetailComponent } from './product/group-detail/product-detail.component'
import { ProductComponent } from './product/product.component'
import { AddOrEditRomoocComponent } from './romooc/add-or-edit-romooc/add-or-edit-romooc.component'
import { RomoocComponent } from './romooc/romooc.component'
import { AddOrEditSalaryGasComponent } from './salary-gas/add-or-edit-salary-gas/add-or-edit-salary-gas.component'
import { SalaryGasComponent } from './salary-gas/salary-gas.component'
import { SettingStringComponent } from './setting-string/setting-string.component'
import { AddOrEditOilMonitoringModelComponent } from './setting-vehicle/oil-monitoring/add-or-edit-oil-monitoring-model/add-or-edit-oil-monitoring-model.component'
import { OilMonitoringDetailComponent } from './setting-vehicle/oil-monitoring/oil-monitoring-detail/oil-monitoring-detail.component'
import { OilMonitoringComponent } from './setting-vehicle/oil-monitoring/oil-monitoring.component'
import { SettingVehicleComponent } from './setting-vehicle/setting-vehicle.component'
import { AddOrEditVehicleComponent } from './setting-vehicle/vehicle/add-or-edit-vehicle/add-or-edit-vehicle.component'
import { VehicleComponent } from './setting-vehicle/vehicle/vehicle.component'
import { SettingsRoutingModule } from './settings-routing.module'
import { AddOrEditShipModelComponent } from './ship/add-or-edit-department-model/add-or-edit-ship-model.component'
import { ShipComponent } from './ship/ship.component'
import { AddOrEditVehicleBrandComponent } from './vehicle-brand/add-or-edit-vehicle-brand/add-or-edit-vehicle-brand.component'
import { VehicleBrandComponent } from './vehicle-brand/vehicle-brand.component'
import { AddOrEditVendorComponent } from './vendor/add-or-edit-vendor/add-or-edit-vendor.component'
import { VendorDetailComponent } from './vendor/vendor-detail/vendor-detail.component'
import { VendorComponent } from './vendor/vendor.component'
import { WardListComponent } from './ward/ward-list/ward-list.component'
import { WardComponent } from './ward/ward.component'
import { AddOrEditAssemblyCertificateComponent } from './warehouse/assembly-certificate/add-or-edit-assembly-certificate-model/add-or-edit-assembly-certificate.component'
import { AssemblyCertificateDetailComponent } from './warehouse/assembly-certificate/assembly-certificate-detail/assembly-certificate-detail.component'
import { AssemblyCertificateComponent } from './warehouse/assembly-certificate/assembly-certificate.component'
import { AddOrEditAssembleOfSquarePartsComponent } from './warehouse/assembly-of-square-parts/add-or-edit-assembly-of-square-parts-model/add-or-edit-assembly-of-square-parts.component'
import { AssembleOfSquarePartsDetailComponent } from './warehouse/assembly-of-square-parts/assembly-of-square-parts-detail/assembly-of-square-parts-detail.component'
import { AssembleOfSquarePartsComponent } from './warehouse/assembly-of-square-parts/assembly-of-square-parts.component'
import { AddOrEditInboundModelComponent } from './warehouse/inbound/add-or-edit-inbound-model/add-or-edit-inbound-model.component'
import { InboundDetailComponent } from './warehouse/inbound/inbound-detail/inbound-detail.component'
import { InboundComponent } from './warehouse/inbound/inbound.component'
import { PrintInboundComponent } from './warehouse/inbound/print-inbound/print-inbound.component'
import { AddOrEditInventoryManagementComponent } from './warehouse/inventory-management/add-or-edit-inventory-management/add-or-edit-inventory-management.component'
import { InventoryManagementDetailComponent } from './warehouse/inventory-management/inventory-management-detail/inventory-management-detail.component'
import { InventoryManagementComponent } from './warehouse/inventory-management/inventory-management.component'
import { InventoryComponent } from './warehouse/inventory/inventory.component'
import { AddOrEditItemDetailModelComponent } from './warehouse/item-detail/add-or-edit-item-detail-model/add-or-edit-item-detail-model.component'
import { ItemDetailComponent } from './warehouse/item-detail/item-detail.component'
import { ItemDetailModalComponent } from './warehouse/item-detail/item-detail/item-detail-modal.component'
import { AddOrEditItemGroupModelComponent } from './warehouse/item-group/add-or-edit-item-group-model/add-or-edit-item-group-model.component'
import { ItemGroupDetailComponent } from './warehouse/item-group/item-group-detail/item-group-detail.component'
import { ItemGroupComponent } from './warehouse/item-group/item-group.component'
import { AddItemSupplierModelComponent } from './warehouse/item-supplier/add-item-supplier/add-item-supplier-model/add-item-supplier-model.component'
import { AddItemSupplierComponent } from './warehouse/item-supplier/add-item-supplier/add-item-supplier.component'
import { AddOrEditItemSupplierModelComponent } from './warehouse/item-supplier/add-or-edit-item-supplier-model/add-or-edit-item-supplier-model.component'
import { ItemSupplierDetailComponent } from './warehouse/item-supplier/item-supplier-detail/item-supplier-detail.component'
import { ItemSupplierComponent } from './warehouse/item-supplier/item-supplier.component'
import { AddOrEditItemModelComponent } from './warehouse/item/add-or-edit-item-model/add-or-edit-item-model.component'
import { ItemDetailPrimaryComponent } from './warehouse/item/item-detail/item-detail.component'
import { ItemComponent } from './warehouse/item/item.component'
import { PrintItemComponent } from './warehouse/item/print-item-model/print-item-model.component'
import { AddOrEditOutboundModelComponent } from './warehouse/outbound/add-or-edit-outbound-model/add-or-edit-outbound-model.component'
import { OutboundDetailComponent } from './warehouse/outbound/outbound-detail/outbound-detail.component'
import { OutboundComponent } from './warehouse/outbound/outbound.component'
import { PrintOutboundComponent } from './warehouse/outbound/print-outbound/print-outbound.component'
import { ReportAssemblyCertificateComponent } from './warehouse/report-assembly-certificate/report-assembly-certificate.component'
import { ReportInboundComponent } from './warehouse/report-inbound-detail/report-inbound.component'
import { ReportOutboundComponent } from './warehouse/report-outbound-detail/report-outbound.component'
import { ReportDetailComponent } from './warehouse/report/report-detail/report-detail.component'
import { ReportComponent } from './warehouse/report/report.component'
import { AddOrEditSpecificationModelComponent } from './warehouse/specification/add-or-edit-specification-model/add-or-edit-specification-model.component'
import { SpecificationDetailComponent } from './warehouse/specification/specification-detail/specification-detail.component'
import { SpecificationComponent } from './warehouse/specification/specification.component'
import { AddOrEditUnitModelComponent } from './warehouse/unit/add-or-edit-unit-model/add-or-edit-unit-model.component'
import { UnitDetailComponent } from './warehouse/unit/unit-detail/unit-detail.component'
import { UnitComponent } from './warehouse/unit/unit.component'

export const CustomCurrencyMaskConfig: CurrencyMaskConfig = {
  align: 'right',
  allowNegative: true,
  decimal: '.',
  precision: 0,
  prefix: '',
  suffix: '',
  thousands: ',',
}

@NgModule({
  declarations: [
    LocationComponent,
    AddOrEditLocationComponent,
    VehicleComponent,
    AddOrEditVehicleComponent,
    RomoocComponent,
    AddOrEditRomoocComponent,
    EmployeeComponent,
    EmployeeDetailComponent,
    DepartmentComponent,
    AddOrEditEmployeeModelComponent,
    DepartmentEmployeesModelComponent,
    PermissionComponent,
    AddOrEditDepartmentModelComponent,
    ChangePasswordEmployeeModelComponent,
    LicenseTypeComponent,
    AddOrEditLicenseTypeComponent,
    CityComponent,
    DistrictComponent,
    DriverComponent,
    LicenseTypeComponent,
    DistrictListComponent,
    AddOrEditDriverComponent,
    WardComponent,
    WardListComponent,
    DriverLicenseComponent,
    AddOrEditDriverLicenseComponent,
    DriverDetailComponent,
    CustomerComponent,
    AddOrEditCustomerComponent,
    ContractComponent,
    EditContractComponent,
    AddOrEditContTypeModelComponent,
    ContTypeDetailComponent,
    ContTypeComponent,
    AddOrEditPackageTypeModelComponent,
    PackageTypeDetailComponent,
    PackageTypeComponent,
    AddOrEditGroupProductModelComponent,
    GroupProductDetailComponent,
    GroupProductComponent,
    AddOrEditProductModelComponent,
    ProductDetailComponent,
    ProductComponent,
    VendorComponent,
    AddOrEditVendorComponent,
    CustomerProductComponent,
    CustomerDetailComponent,
    VendorDetailComponent,
    ContractDetailComponent,
    CustomerLocationComponent,
    AddCustomerLocationComponent,
    AddCustomerProductComponent,
    AddOrEditOrderModelComponent,
    OrderDetailComponent,
    OrderComponent,
    ListLocationComponent,
    ContractTermComponent,
    AddEditContarctTermComponent,
    ContractPriceComponent,
    AddOrEditContractPriceComponent,
    AddOrEditItemSupplierModelComponent,
    ItemSupplierDetailComponent,
    ItemSupplierComponent,
    ItemGroupComponent,
    ItemGroupDetailComponent,
    AddOrEditItemGroupModelComponent,
    ItemDetailComponent,
    ItemDetailModalComponent,
    AddOrEditItemDetailModelComponent,
    ItemComponent,
    ItemDetailPrimaryComponent,
    AddOrEditItemModelComponent,
    AddOrEditUnitModelComponent,
    UnitDetailComponent,
    UnitComponent,
    AddOrEditSpecificationModelComponent,
    SpecificationDetailComponent,
    SpecificationComponent,
    InboundComponent,
    InboundDetailComponent,
    AddOrEditInboundModelComponent,
    AddContainerProductComponent,
    ProductContainerDetailComponent,
    CostsIncurredComponent,
    AddOrEditCostsIncurredComponent,
    CostsIncurredDetailComponent,
    DistanceComponent,
    AddOrEditDistanceComponent,
    DistanceDetailComponent,
    SalaryGasComponent,
    AddOrEditSalaryGasComponent,
    AddOrCopyContractComponent,
    OutboundComponent,
    AddOrEditOutboundModelComponent,
    OutboundDetailComponent,
    AdminComponent,
    WarehouseComponent,
    TimekeepingComponent,
    ReportComponent,
    LocationDetailComponent,
    ReportDetailComponent,
    AddItemSupplierComponent,
    AddItemSupplierModelComponent,
    VehicleBrandComponent,
    AddOrEditVehicleBrandComponent,
    SettingVehicleComponent,
    OilMonitoringComponent,
    AddOrEditOilMonitoringModelComponent,
    OilMonitoringDetailComponent,
    AddOrEditAssembleOfSquarePartsComponent,
    AssembleOfSquarePartsDetailComponent,
    AssembleOfSquarePartsComponent,
    AssemblyCertificateComponent,
    AssemblyCertificateDetailComponent,
    AddOrEditAssemblyCertificateComponent,
    InventoryComponent,
    AdvanceReciprocalTypeComponent,
    AddOrEditAdvanceReciprocalTypeModelComponent,
    AdvanceReciprocalTypeDetailComponent,
    InventoryManagementComponent,
    AddOrEditInventoryManagementComponent,
    InventoryManagementDetailComponent,
    PodOrderComponent,
    AddPodOrderComponent,
    PodOpsTripComponent,
    AddPodOpsTripComponent,
    ReportInboundComponent,
    ReportOutboundComponent,
    ReportAssemblyCertificateComponent,
    PrintInboundComponent,
    PrintOutboundComponent,
    AddOrEditShipModelComponent,
    ShipComponent,
    ManagerListContComponent,
    SettingStringComponent,
    PrintItemComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzTableModule,
    NzGridModule,
    NzModalModule,
    NzIconModule,
    NzToolTipModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzCheckboxModule,
    NzTabsModule,
    NzDatePickerModule,
    NzTimePickerModule,
    NzPopconfirmModule,
    NzPaginationModule,
    MaterialModule,
    ReactiveFormsModule,
    CurrencyMaskModule,
    NzCollapseModule,
    NzRadioModule,
    NzCascaderModule,
    NzTagModule,
    NzBadgeModule,
    NzInputNumberModule,
    SettingsRoutingModule,
    NzMessageModule,
    NzUploadModule,
    NzDropDownModule,
    NzImageModule,
  ],
  providers: [{ provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsModule {}
