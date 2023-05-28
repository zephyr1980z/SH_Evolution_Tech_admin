import { Injectable } from '@angular/core'
import { enumData } from '../core/enumData'
import { CoreService } from './core.service'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject } from 'rxjs'
import { NotifyService } from './notify.service'
@Injectable()
export class ApiService {
  host = enumData.ApiUrl + '/'
  eventSearchData = new BehaviorSubject<boolean>(false)
  eventLoadListTour = new BehaviorSubject<boolean>(false)
  constructor(public coreService: CoreService, private http: HttpClient, public notifyService: NotifyService) {}

  //#region API Construct

  CITY = {
    LOAD_DATA: 'cities/load_data',
    FIND: 'cities/find',
    PAGINATION: 'cities/pagination',
    CREATE: 'cities/create_data',
    UPDATE: 'cities/update_data',
    DELETE: 'cities/update_active',
  }

  DISTRICT = {
    LOAD_DATA: 'districts/load_data',
    FIND: 'districts/find',
    PAGINATION: 'districts/pagination',
    CREATE: 'districts/create_data',
    UPDATE: 'districts/update_data',
    DELETE: 'districts/update_active',
  }

  WARD = {
    FIND: 'wards/find',
    PAGINATION: 'wards/pagination',
    CREATE: 'wards/create_data',
    UPDATE: 'wards/update_data',
    DELETE: 'wards/update_active',
  }

  EMPLOYEE = {
    FIND: 'employee/find',
    PAGINATION: 'employee/pagination',
    CREATE: 'employee/create_data',
    UPDATE: 'employee/update_data',
    DELETE: 'employee/update_active',
    UPDATE_PASSWORD: 'employee/update_password',
    IMPORT_EXCEL: 'employee/create_data_by_excel',
  }

  DEPARTMENT = {
    FIND: 'department/find',
    PAGINATION: 'department/pagination',
    CREATE: 'department/create_data',
    UPDATE: 'department/update_data',
    DELETE: 'department/update_active',
    IMPORT_EXCEL: 'department/create_data_by_excel',
    LOAD_DETAIL: 'department/load_detail',
  }

  PERMISSION = {
    FIND: 'permission/find',
    PAGINATION: 'permission/pagination',
    CREATE: 'permission/create_data',
    UPDATE: 'permission/update_data',
    DELETE: 'permission/update_active',
  }

  DRIVER = {
    FIND: 'drivers/find',
    PAGINATION: 'drivers/pagination',
    CREATE: 'drivers/create_data',
    UPDATE: 'drivers/update_data',
    DELETE: 'drivers/update_active',
    IMPORT_EXCEL: 'drivers/create_data_by_excel',
  }

  NOTIFY = {
    PAGINATION: 'notify/pagination',
    READ: 'notify/read',
    READ_ALL: 'notify/read_all',
    READ_LIST_NOTIFY: 'notify/read_list_notify',
  }

  LICENSE_TYPE = {
    FIND: 'license_type/find',
    PAGINATION: 'license_type/pagination',
    CREATE: 'license_type/create_data',
    UPDATE: 'license_type/update_data',
    DELETE: 'license_type/update_active',
  }

  ROMOOC = {
    FIND: 'romooc/find',
    PAGINATION: 'romooc/pagination',
    OPS_PAGINATION: 'romooc/ops_pagination',
    CREATE: 'romooc/create_data',
    UPDATE: 'romooc/update_data',
    DELETE: 'romooc/update_active',
    IMPORT_EXCEL: 'romooc/create_data_by_excel',
  }

  VEHICLE = {
    FIND: 'vehicle/find',
    PAGINATION: 'vehicle/pagination',
    OPS_PAGINATION: 'vehicle/ops_pagination',
    CREATE: 'vehicle/create_data',
    UPDATE: 'vehicle/update_data',
    DELETE: 'vehicle/update_active',
    IMPORT_EXCEL: 'vehicle/create_data_by_excel',
  }

  LOCATION = {
    FIND: 'location/find',
    FIND_AREA: 'location/find_area',
    FIND_DATA_AREA: 'location/find_data_area',
    CUSTOM_FIND: 'location/custom_find',
    PAGINATION: 'location/pagination',
    CREATE: 'location/create_data',
    UPDATE: 'location/update_data',
    DELETE: 'location/update_active',
    IMPORT_EXCEL: 'location/create_data_by_excel',
  }

  DRIVER_LICENSE = {
    FIND: 'driver_license/find',
    PAGINATION: 'driver_license/pagination',
    CREATE: 'driver_license/create_data',
    UPDATE: 'driver_license/update_data',
    DELETE: 'driver_license/update_active',
    IMPORT_EXCEL: 'driver_license/create_excel',
  }

  CUSTOMER = {
    FIND: 'customer/find',
    PAGINATION: 'customer/pagination',
    CREATE: 'customer/create_data',
    UPDATE: 'customer/update_data',
    DELETE: 'customer/update_active',
    // ACTIVE: 'customer/update_active',
    IMPORT_EXCEL: 'customer/create_data_by_excel',

    PRODUCT_PAGINATION: 'customer/product_pagination',
    PRODUCT_PAGINATION_NOT_IN: 'customer/product_pagination_not_in',
    PRODUCT_CREATE_DATA: 'customer/product_create_data',
    PRODUCT_DELETE_DATA: 'customer/product_delete_data',

    LOCATION_PAGINATION: 'customer/location_pagination',
    LOCATION_PAGINATION_NOT_IN: 'customer/location_pagination_not_in',
    LOCATION_CREATE_DATA: 'customer/location_create_data',
    LOCATION_DELETE_DATA: 'customer/location_delete_data',
  }

  CONTRACT = {
    FIND: 'contract/find',
    FIND_WITH_CONDITIONS: 'contract/find_with_conditions',
    PAGINATION: 'contract/pagination',
    CREATE: 'contract/create_data',
    UPDATE: 'contract/update_data',
    DELETE: 'contract/update_active',
    IMPORT_EXCEL: 'contract/create_data_by_excel',
    FIND_FOR_UPDATE: 'contract/find_for_update',
  }

  VENDOR = {
    FIND: 'vendor/find',
    PAGINATION: 'vendor/pagination',
    CREATE: 'vendor/create_data',
    UPDATE: 'vendor/update_data',
    DELETE: 'vendor/update_active',
  }

  UPLOAD_FILE = {
    UPLOAD_SINGLE: 'uploadFiles/upload_single',
  }

  CONT_TYPE = {
    FIND: 'cont_type/find',
    PAGINATION: 'cont_type/pagination',
    CREATE: 'cont_type/create_data',
    UPDATE: 'cont_type/update_data',
    DELETE: 'cont_type/update_active',
  }

  GROUP_PRODUCT = {
    FIND: 'group_product/find',
    PAGINATION: 'group_product/pagination',
    CREATE: 'group_product/create_data',
    UPDATE: 'group_product/update_data',
    DELETE: 'group_product/update_active',
  }

  PACKAGE_TYPE = {
    FIND: 'package_type/find',
    PAGINATION: 'package_type/pagination',
    CREATE: 'package_type/create_data',
    UPDATE: 'package_type/update_data',
    UPDATE_CONT_TYPE: 'package_type/update_cont_type',
    DELETE: 'package_type/update_active',
  }

  PRODUCT = {
    FIND: 'product/find',
    PAGINATION: 'product/pagination',
    CREATE: 'product/create_data',
    UPDATE: 'product/update_data',
    DELETE: 'product/update_active',
  }

  CUSTOMER_CONTRACT_TERM = {
    FIND: 'customer_contract_term/find',
    FIND_WITH_CONDITIONS: 'customer_contract_term/find_with_conditions',
    PAGINATION: 'customer_contract_term/pagination',
    CREATE: 'customer_contract_term/create_data',
    UPDATE: 'customer_contract_term/update_data',
    DELETE: 'customer_contract_term/update_active',
  }

  CUSTOMER_CONTRACT_PRICE = {
    FIND: 'customer_contract_price/find',
    PAGINATION: 'customer_contract_price/pagination',
    CREATE: 'customer_contract_price/create_data',
    UPDATE: 'customer_contract_price/update_data',
    DELETE: 'customer_contract_price/update_active',
    FIND_CUSTOMER_LOCATION: 'customer/find_customer_location',
    IMPORT_EXCEL: 'customer_contract_price/import_excel',
  }

  ORDER = {
    FIND: 'order/find',
    FIND_ORDER_CONT_BY_ORDER: 'order/find_order_cont_by_order',
    FIND_ORDER_PRODUCT_BY_ORDER: 'order/find_order_product_by_order',
    FIND_CUSTOMER_LOCATION: 'order/find_customer_location',
    FIND_LOCATION: 'order/find_location',
    FIND_CUSTOMER_PRODUCT: 'order/find_customer_product',

    PAGINATION: 'order/pagination',
    GROUP_ORDER_CONT: 'order/group_order_cont',
    CREATE: 'order/create_data',
    CREATE_BY_EXCEL: 'order/create_data_by_excel',
    UPDATE: 'order/update_data',
    DELETE: 'order/update_active',

    SEND_TO_OPS: 'order/send_to_ops',

    DETAIL: 'order/find_for_detail',
  }

  ORDER_CONT = {
    FIND: 'order_cont/find',
    PAGINATION: 'order_cont/pagination',
    OPS_PAGINATION: 'order_cont/ops_pagination',
    CREATE: 'order_cont/create_data',
    UPDATE: 'order_cont/update_data',
    UPDATE_LIST_DATA: 'order_cont/update_list_data',
    DELETE: 'order_cont/update_active',
  }

  OPS_TRIP = {
    DETAIL: 'ops_trip/find_detail',
    FIND: 'ops_trip/find',
    PAGINATION: 'ops_trip/pagination',
    CREATE: 'ops_trip/create_data',
    UPDATE: 'ops_trip/update_data',
    DELETE: 'ops_trip/update_active',
    EXPORT_DATA_TEMPLATE: 'ops_trip/export_data_template',
    IMPORT_DATA: 'ops_trip/import_data',
    EXPORT_DATA: 'ops_trip/export_data',
  }

  OPS_TRIP_FIN = {
    SALARY_RECALCULATION: 'ops_trip_fin/salary_recalculation',
    OPS_COST_MANAGER: 'ops_trip_fin/ops_cost_manager',
    FIND_COST_INCURRED: 'ops_trip_fin/find_cost_incurred',
    APPROVE_COST_INCURRED: 'ops_trip_fin/approve_cost_incurred',
    REFUSE_COST_INCURRED: 'ops_trip_fin/refuse_cost_incurred',
    DETAIL: 'ops_trip_fin/find_detail',
    FIND: 'ops_trip_fin/find',
    PAGINATION: 'ops_trip_fin/pagination',
    CREATE: 'ops_trip_fin/create_data',
    UPDATE: 'ops_trip_fin/update_data',
    UPDATE_LIST_DATA: 'ops_trip_fin/update_list_data',
    UPDATE_LIST_DATA_STATUS: 'ops_trip_fin/update_list_data_status',
    DELETE: 'ops_trip_fin/update_active',
    EXPORT_DATA_TEMPLATE: 'ops_trip_fin/export_data_template',
    IMPORT_DATA: 'ops_trip_fin/import_data',
    EXPORT_DATA: 'ops_trip_fin/export_data',
  }

  OPS_ACCOUNTING = {
    PAGINATION: 'ops_accounting/pagination',
    FIND: 'ops_accounting/find',
    FIND_ACCOUNTING_DRIVER: 'ops_accounting/find_accounting_driver',
    CREATE: 'ops_accounting/create_data',
    APPROVE_DATA_SALARY: 'ops_accounting/approve_data_salary',
    APPROVE_DATA_COST: 'ops_accounting/approve_data_cost',
    UPDATE: 'ops_accounting/update_data',
    DELETE: 'ops_accounting/update_active',
    RE_UPDATE_SALARY: 'ops_accounting/re_update_salary',
    GET_COST: 'ops_accounting/get_cost',
    IMPORT_EXCEL: 'ops_accounting/create_data_by_excel',
  }

  OPS_TOUR = {
    PAGINATION: 'ops_tour/pagination',
    FIND: 'ops_tour/find',
    CREATE: 'ops_tour/create_data',
    UPDATE: 'ops_tour/update_data',
    DELETE: 'ops_tour/update_active',
    IMPORT_EXCEL: 'ops_tour/create_data_by_excel',
  }

  OPS_COST = {
    PAGINATION: 'ops_cost/pagination',
    FIND: 'ops_cost/find',
    CREATE: 'ops_cost/create_data',
    // CREATE_COST_OF_TRIP: 'ops_cost/create_cost_of_trip',
    // UPDATE_COST_OF_TRIP: 'ops_cost/create_cost_of_trip',
    UPDATE: 'ops_cost/update_data',
    DELETE: 'ops_cost/update_active',
  }

  OPS_ROUTE = {
    PAGINATION: 'ops_route/pagination',
    FIND: 'ops_route/find',
    // CREATE: 'ops_route/create_data',
    UPDATE: 'ops_route/update_data',
    // DELETE: 'ops_route/update_active',
  }

  OPS_TRIP_FIN_DETAIL = {
    FIND: 'ops_trip_fin_detail/find',
    DETAIL: 'ops_trip_fin_detail/find_detail',
    PAGINATION: 'ops_trip_fin_detail/pagination',
    CREATE: 'ops_trip_fin_detail/create_data',
    UPDATE: 'ops_trip_fin_detail/update_data',
    DELETE: 'ops_trip_fin_detail/update_active',
    EXPORT_DATA_TEMPLATE: 'ops_trip_fin_detail/export_data_template',
    IMPORT_DATA: 'ops_trip_fin_detail/import_data',
    EXPORT_DATA: 'ops_trip_fin_detail/export_data',
  }

  TRACKING = {
    // TRACKING_CAR: 'tracking/binh_anh_get_vehicle_history',
    TRACKING_CAR: 'vehicle/binh_anh_get_vehicle_history',
    GET_CAR_STATUS: 'tracking/get_car_status',
    GET_LIST_ORDER: 'tracking/get_list_order',
    GET_LIST_CAR: 'tracking/get_list_car',
    // BINH ANH CAR
    BA_GET_LIST_CAR: 'vehicle/binh_anh_get_vehicle',
    // BA_GET_LIST_CAR: 'vehicle/binh_anh_get_vehicle',
  }

  ITEM = {
    FIND: 'item/find',
    FIND_WITH_SPECIFICATION: 'item/find_item_with_specification',
    PAGINATION: 'item/pagination',
    CREATE: 'item/create_data',
    UPDATE: 'item/update_data',
    DELETE: 'item/update_active',
    IMPORT_EXCEL: 'item/create_data_by_excel',
  }

  FEE_OPS_TRIP = {
    FIND: 'fee_ops_trip/find',
    PAGINATION: 'fee_ops_trip/pagination',
    PREVIOUS: 'fee_ops_trip/previous_data',
    APPROVE: 'fee_ops_trip/approve_data',
    CREATE: 'fee_ops_trip/create_data',
    UPDATE: 'fee_ops_trip/update_data',
    UPDATE_DATA_FROM_TRIP: 'fee_ops_trip/update_data_from_trip',
    UPDATE_PRICE: 'fee_ops_trip/update_data_price',
    DELETE: 'fee_ops_trip/update_active',
    EXPORT_DATA: 'fee_ops_trip/export_data',
  }

  FEE_OPS_COST = {
    FIND: 'fee_ops_cost/find',
    PAGINATION: 'fee_ops_cost/pagination',
    CREATE: 'fee_ops_cost/create_data',
    UPDATE: 'fee_ops_cost/update_data',
    DELETE: 'fee_ops_cost/update_active',
  }

  FEE_COST_STATEMENT = {
    FIND: 'fee_cost_statement/find',
    FIND_APPROVE_TRIP: 'fee_cost_statement/find_approve_trip',
    FIND_FEE_ORDER_CONT: 'fee_cost_statement/find_fee_order_cont',
    PAGINATION: 'fee_cost_statement/pagination',
    APPROVE: 'fee_cost_statement/approve_data',
    CREATE: 'fee_cost_statement/create_data',
    UPDATE: 'fee_cost_statement/update_data',
    DELETE: 'fee_cost_statement/update_active',
    EXPORT_DATA: 'fee_cost_statement/export_data',
  }

  DRIVER_DAY_OFF = {
    PAGINATION: 'driver_day_off/pagination',
    FIND: 'driver_day_off/find',
    CREATE: 'driver_day_off/create_data',
    UPDATE: 'driver_day_off/update_data',
    DELETE: 'driver_day_off/update_active',
  }

  FEE_PAYMENT_ON_BEHALF = {
    FIND: 'fee_payment_on_behalf/find',
    APPROVE: 'fee_payment_on_behalf/approve_data',
    PAGINATION: 'fee_payment_on_behalf/pagination',
    CREATE: 'fee_payment_on_behalf/create_data',
    UPDATE: 'fee_payment_on_behalf/update_data',
    DELETE: 'fee_payment_on_behalf/update_active',
  }

  FEE_SURCHARGE = {
    FIND: 'fee_surcharge/find',
    APPROVE: 'fee_surcharge/approve_data',
    PAGINATION: 'fee_surcharge/pagination',
    CREATE: 'fee_surcharge/create_data',
    UPDATE: 'fee_surcharge/update_data',
    UPDATE_ACTIVE: 'fee_surcharge/update_active',
    DELETE: 'fee_surcharge/delete',
  }

  FEE_OPS_INVOICE = {
    FIND: 'fee_ops_invoice/find',
    PAGINATION: 'fee_ops_invoice/pagination',
    APPROVE: 'fee_ops_invoice/approve_data',
    CREATE: 'fee_ops_invoice/create_data',
    UPDATE: 'fee_ops_invoice/update_data',
    DELETE: 'fee_ops_invoice/update_active',
  }

  FEE_OPS_INVOICE_COLLECT = {
    FIND: 'fee_ops_invoice_collect/find',
    PAGINATION: 'fee_ops_invoice_collect/pagination',
    CREATE: 'fee_ops_invoice_collect/create_data',
    UPDATE: 'fee_ops_invoice_collect/update_data',
    DELETE: 'fee_ops_invoice_collect/update_active',
  }

  ITEM_DETAIL = {
    FIND: 'item_detail/find',
    PAGINATION: 'item_detail/pagination',
    CREATE: 'item_detail/create_data',
    UPDATE: 'item_detail/update_data',
    DELETE: 'item_detail/update_active',
  }

  ITEM_SUPPLIER = {
    FIND: 'item_supplier/find',
    PAGINATION: 'item_supplier/pagination',
    CREATE: 'item_supplier/create_data',
    UPDATE: 'item_supplier/update_data',
    UPDATE_ITEM_SUPPLIER: 'item_supplier/update_item_supplier',
    DELETE: 'item_supplier/update_active',
    IMPORT_EXCEL: 'item_supplier/create_data_by_excel',

    ITEM_PAGINATION: 'item_supplier/item_pagination',
    ITEM_PAGINATION_NOT_IN: 'item_supplier/item_pagination_not_in',
    ITEM_CREATE_DATA: 'item_supplier/item_create_data',
    ITEM_DELETE_DATA: 'item_supplier/item_delete_data',
  }

  ITEM_GROUP = {
    FIND: 'item_group/find',
    PAGINATION: 'item_group/pagination',
    CREATE: 'item_group/create_data',
    UPDATE: 'item_group/update_data',
    DELETE: 'item_group/update_active',
    IMPORT_EXCEL: 'item_group/create_data_by_excel',
  }

  UNIT = {
    FIND: 'unit/find',
    PAGINATION: 'unit/pagination',
    CREATE: 'unit/create_data',
    UPDATE: 'unit/update_data',
    DELETE: 'unit/update_active',
    IMPORT_EXCEL: 'unit/create_data_by_excel',
  }

  SPECIFICATION = {
    FIND: 'specification/find',
    PAGINATION: 'specification/pagination',
    CREATE: 'specification/create_data',
    UPDATE: 'specification/update_data',
    DELETE: 'specification/update_active',
    IMPORT_EXCEL: 'specification/create_data_by_excel',
  }

  SALARY_DRIVER = {
    FIND: 'salary_driver/find',
    PAGINATION: 'salary_driver/pagination',
    CREATE: 'salary_driver/create_data',
    UPDATE: 'salary_driver/update_data',
    DELETE: 'salary_driver/update_active',
    IMPORT_EXCEL: 'salary_driver/create_data_by_excel',
  }

  INBOUND = {
    FIND: 'inbound/find',
    PAGINATION: 'inbound/pagination',
    CREATE: 'inbound/create_data',
    UPDATE: 'inbound/update_data',
    DELETE: 'inbound/update_active',
    APPROVE_INBOUND: 'inbound/approve_inbound',
    APPROVE_INBOUND_DETAIL: 'inbound/approve_inbound_detail',
    CANCEL_INBOUND: 'inbound/cancel_inbound',
    FIND_INBOUND_DETAIL: 'inbound/find_inbound_detail',
    FIND_INBOUND_DETAIL_FOR_REPORT: 'inbound/find_inbound_detail_for_report',
    FIND_ITEM_IN_INBOUND_DETAIL: 'inbound/find_item__in_inbound_detail',
    IBDETAIL_PAGINATION: 'inbound/ibDetail_pagination',
    CREATE_BY_EXCEL: 'inbound/create_data_by_excel',
    PRINT: 'inbound/print',
  }

  COSTS_INCURRED = {
    FIND: 'costs_incurred/find',
    PAGINATION: 'costs_incurred/pagination',
    CREATE: 'costs_incurred/create_data',
    UPDATE: 'costs_incurred/update_data',
    DELETE: 'costs_incurred/update_active',
    IMPORT_EXCEL: 'costs_incurred/create_data_by_excel',
  }

  PHONE_CHARGES = {
    FIND: 'phone_charges/find',
    PAGINATION: 'phone_charges/pagination',
    CREATE: 'phone_charges/create_data',
    UPDATE: 'phone_charges/update_data',
    DELETE: 'phone_charges/update_active',
    TEMPLATE_EXCEL: 'phone_charges/template_excel',
    EXPORT_EXCEL: 'phone_charges/export_excel',
    IMPORT_EXCEL: 'phone_charges/import_excel',
    IMPORT_EXCEL_AR: 'phone_charges/create_excel_ar',
  }

  DISTANCE = {
    FIND: 'distance/find',
    PAGINATION: 'distance/pagination',
    CREATE: 'distance/create_data',
    UPDATE: 'distance/update_data',
    DELETE: 'distance/update_active',
    IMPORT_EXCEL: 'distance/create_data_by_excel',
    EXPORT_EXCEL: 'distance/export_data',
  }

  SALARY_GAS = {
    FIND: 'salary_gas/find',
    PAGINATION: 'salary_gas/pagination',
    CREATE: 'salary_gas/create_data',
    UPDATE: 'salary_gas/update_data',
    DELETE: 'salary_gas/update_active',
    IMPORT_EXCEL: 'salary_gas/create_data_by_excel',
  }

  OUTBOUND = {
    FIND: 'outbound/find',
    FIND_OUTBOUND_FOR_REPORT: 'outbound/find_ob_detail_for_report',
    PAGINATION: 'outbound/pagination',
    CREATE: 'outbound/create_data',
    UPDATE: 'outbound/update_data',
    DELETE: 'outbound/update_active',
    APPROVED_OUTBOUND: 'outbound/approve_outbound',
    FIND_ITEM_SPECIFICATION: 'outbound/find_item_specification',
    IMPORT_EXCEL: 'outbound/create_data_by_excel',
    CANCEL_OUTBOUND: 'outbound/cancel_outbound',
    PRINT: 'outbound/print',
  }

  PAYSLIP = {
    PAGINATION: 'payslip/pagination',
    CREATE: 'payslip/create_data',
    UPDATE: 'payslip/update_data',
    DELETE: 'payslip/update_active',
    APPROVED: 'payslip/update_approved',
    CANCEL: 'payslip/update_cancel',
    PRINT: 'payslip/print',
    CREATE_JOB: 'payslip/create_data_job',
    APPROVED_LIST: 'payslip/update_approved_list',
    FIND: 'payslip/find',
    DETAIL: 'payslip/find_detail',
    IMPORT_EXCEL: 'payslip/import_data',
  }

  POSITION = {
    PAGINATION: 'position/pagination',
    CREATE: 'position/create_data',
    UPDATE: 'position/update_data',
    DELETE: 'position/update_active',
    FIND: 'position/find',
  }

  SHIFT = {
    PAGINATION: 'shift/pagination',
    CREATE: 'shift/create_data',
    UPDATE: 'shift/update_data',
    DELETE: 'shift/update_active',
    FIND: 'shift/find',
    LOAD_DATA_BY_DEPARTMENT: 'shift/load_shift_in_department',
  }

  ADVANCEMONEY = {
    PAGINATION: 'advanceMoney/pagination',
    CREATE: 'advanceMoney/create_data',
    UPDATE: 'advanceMoney/update_data',
    DELETE: 'advanceMoney/update_delete',
    APPROVED: 'advanceMoney/update_approved',
    APPROVE_MONTH_SALARY: 'advanceMoney/approve_month_salary',
    CANCEL: 'advanceMoney/update_cancel',
    PRINT: 'advanceMoney/print',
    CREATE_JOB: 'advanceMoney/create_data_job',
    APPROVED_LIST: 'advanceMoney/update_approved_list',
    UPDATE_TOUR_OF_ADVANCE: 'advanceMoney/update_tour_of_advance',
    FIND: 'advanceMoney/find',
    DETAIL: 'advanceMoney/find_detail',
    CREATE_RECIPROCAL: 'advanceMoney/create_advance_reciprocal',
    CREATE_ADVANCE: 'advanceMoney/create_advance_amount_refunded',
    CREATE_PAYSLIP: 'advanceMoney/create_payslip_from_advance',
    IMPORT_EXCEL: 'advanceMoney/import_data',
    CREATE_TWO: 'advanceMoney/update_data_advance',
    CREATE_EXCEL: 'advanceMoney/create_excel_data',
  }

  TOKEN = {
    RESET_TOKEN: 'auth/refresh',
    CHECK_ACCESS_TOKEN: 'auth/check_access_token',
  }

  CUSTOMER_DEBT = {
    PAGINATION: 'customerDebt/pagination',
    CREATE: 'customerDebt/create_data',
    COLLECT_CUSTOMER: 'customerDebt/collect_customer',
    UPDATE: 'customerDebt/update_status',
    RE_CALCULATOR: 'customerDebt/re_calculator',
    DELETE: 'customerDebt/update_delete',
    FIND: 'customerDebt/find',
    HISTORY: 'customerDebt/load_history',
    DETAIL: 'customerDebt/find_detail',
  }

  REPAIR_TYPE = {
    PAGINATION: 'repairType/pagination',
    CREATE: 'repairType/create_data',
    UPDATE: 'repairType/update_data',
    DELETE: 'repairType/update_active',
    FIND: 'repairType/find',
  }

  REPAIR = {
    PAGINATION: 'repair/pagination',
    CREATE: 'repair/create_data',
    UPDATE: 'repair/update_data',
    DELETE: 'repair/update_active',
    FIND: 'repair/find',
    CANCEL: 'repair/update_cancel',
    PROCESS: 'repair/update_process',
    COMPLETE: 'repair/update_complete',
    LOAD_REPAIR_GROUP: 'repair/load_repair_group',
    REPORT_REPAIR: 'repair/report_repair',
  }

  MAINTENANCE_CONFIG = {
    PAGINATION: 'maintenanceConfig/pagination',
    CREATE: 'maintenanceConfig/create_data',
    UPDATE: 'maintenanceConfig/update_data',
    DELETE: 'maintenanceConfig/update_active',
    FIND: 'maintenanceConfig/find',
  }

  VEHICLE_BRAND = {
    PAGINATION: 'vehicle_brand/pagination',
    CREATE: 'vehicle_brand/create_data',
    UPDATE: 'vehicle_brand/update_data',
    DELETE: 'vehicle_brand/update_active',
    FIND: 'vehicle_brand/find',
  }

  MAINTENANCE = {
    PAGINATION: 'maintenance/pagination',
    CREATE: 'maintenance/create_data',
    UPDATE: 'maintenance/update_data',
    DELETE: 'maintenance/update_active',
    FIND: 'maintenance/find',
    CANCEL: 'maintenance/update_cancel',
    PROCESS: 'maintenance/update_process',
    COMPLETE: 'maintenance/update_complete',
    REPORT: 'maintenance/report_maintenance',
  }

  OIL_MONITORING = {
    PAGINATION: 'oilMonitoring/pagination',
    CREATE: 'oilMonitoring/create_data',
    UPDATE: 'oilMonitoring/update_data',
    DELETE: 'oilMonitoring/update_active',
    FIND: 'oilMonitoring/find',
    IMPORT_EXCEL: 'oilMonitoring/create_data_by_excel',
    EXPORT_EXCEL: 'oilMonitoring/export_excel',
  }

  ASSEMBLY_OF_SQUARE_PARTS = {
    PAGINATION: 'assembly_of_square_parts/pagination',
    CREATE: 'assembly_of_square_parts/create_data',
    UPDATE: 'assembly_of_square_parts/update_data',
    DELETE: 'assembly_of_square_parts/update_active',
    FIND: 'assembly_of_square_parts/find',
    CREATE_BY_EXCEL: 'assembly_of_square_parts/create_data_by_excel',
    FIND_FOR_UPDATE: 'assembly_of_square_parts/find_for_detail',
  }

  ASSEMBLY_CERTIFICATE = {
    PAGINATION: 'assembly_certificate/pagination',
    CREATE: 'assembly_certificate/create_data',
    FIND_AS_FOR_REPORT: 'assembly_certificate/find_as_for_report',
    UPDATE: 'assembly_certificate/update_data',
    DELETE: 'assembly_certificate/update_active',
    FIND: 'assembly_certificate/find',
    APPROVE_ASSEMBLYCERTIFICATE: 'assembly_certificate/approve_assemblyCertificate',
    CANCEL_ASSEMBLYCERTIFICATE: 'assembly_certificate/cancel_assemblyCertificate',
    FIND_FOR_DETAIL: 'assembly_certificate/find_for_detail',
    CREATE_BY_EXCEL: 'assembly_certificate/create_data_by_excel',
  }

  ADVANCE_RECIPROCAL_TYPE = {
    FIND: 'advance_reciprocal_type/find',
    PAGINATION: 'advance_reciprocal_type/pagination',
    CREATE: 'advance_reciprocal_type/create_data',
    UPDATE: 'advance_reciprocal_type/update_data',
    DELETE: 'advance_reciprocal_type/update_active',
  }

  INVENTORY_MANAGEMENT = {
    FIND: 'inventory_management/find',
    PAGINATION: 'inventory_management/pagination',
    CREATE: 'inventory_management/create_data',
    UPDATE: 'inventory_management/update_data',
    DELETE: 'inventory_management/update_active',
    APPROVE_INVENTORYMANAGEMENT: 'inventory_management/approve_inventory',
    CANCEL_INVENTORYMANAGEMENT: 'inventory_management/cancel_inventory',
    ITEM_INVETORY: 'inventory_management/import_data',
    EXPORT_ITEM: 'inventory_management/export_item',
  }

  REPORT = {
    FIND: 'item/find',
    PAGINATION: 'item/report_pagination',
  }

  TIME_KEEPING = {
    FIND: 'timekeeping/find',
    CREATE_DATA: 'timekeeping/create_data',
    SHIFT_IN_OUT_MANAGEMENT: 'timekeeping/shift_in_out_management_in_month',
    IMAGE_IN_OUT_MANAGEMENT: 'timekeeping/image_in_out_management_in_month',
    START_WORKING: 'timekeeping/start_working',
    FINISH_WORKING: 'timekeeping/finish_working',
    CHECK_MID_SHIFT: 'timekeeping/check_mid_shift',
    CHECK_TIMEKEEPERS: 'timekeeping/check_timekeepers',
    UPDATE: 'timekeeping/update_data',
    UPDATE_FORGOT: 'timekeeping/update_data_forgot',
    LOAD_DETAIL: 'timekeeping/load_detail',
    TIME_SHEET_IN_MONTH: 'timekeeping/time_sheet_in_month',
    DOWNLOAD_EXCEL: 'timekeeping/download_excel',
    CHECK_SHIFT: 'timekeeping/check_shift',
  }

  ALLOWANCE = {
    PAGINATION: 'allowance/pagination',
    CREATE: 'allowance/create_data',
    UPDATE: 'allowance/update_data',
    DELETE: 'allowance/update_active',
    FIND: 'allowance/find',
  }

  BONUS = {
    PAGINATION: 'bonus/pagination',
    CREATE: 'bonus/create_data',
    UPDATE: 'bonus/update_data',
    DELETE: 'bonus/update_active',
    FIND: 'bonus/find',
  }

  INSURANCE = {
    PAGINATION: 'insurance/pagination',
    CREATE: 'insurance/create_data',
    UPDATE: 'insurance/update_data',
    DELETE: 'insurance/update_active',
    FIND: 'insurance/find',
  }

  PERSONAL_INCOME_TAX = {
    PAGINATION: 'personalIncomeTax/pagination',
    CREATE: 'personalIncomeTax/create_data',
    UPDATE: 'personalIncomeTax/update_data',
    DELETE: 'personalIncomeTax/update_active',
    FIND: 'personalIncomeTax/find',
  }

  OIL_ORDER = {
    PAGINATION: 'oilOrder/pagination',
    CREATE: 'oilOrder/create_data',
    UPDATE: 'oilOrder/update_data',
    DELETE: 'oilOrder/delete_data',
    LOAD_LIST_TRIP_VEHICLE: 'oilOrder/load_list_trip_vehicle',
    CREATE_BY_OPSTRIP_VEHICLE: 'oilOrder/create_by_opstrip_vehicle',
    FIND_DETAIL: 'oilOrder/find_for_detail',
    OIL_REPORT: 'oilOrder/oil_report',
    LOAD_TRIP_VEHICLE_FOR_EACH: 'oilOrder/load_trip_vehicle_for_each_vehicle',
    CREATE_DATA_LIST: 'oilOrder/create_data_list',
  }

  POD = {
    POD_PAGINATION_ORDER: 'pod/pod_pagination_order',
    POD_PAGINATION_OPS_TRIPS: 'pod/pod_pagination_ops_trips',
    CREATE_MEDIA_ORDER: 'pod/create_media_order',
    CREATE_MEDIA_OPS_TRIPS: 'pod/create_media_ops_trips',
    FIND_MEDIA_ORDER: 'pod/find_media_order',
    FIND_MEDIA_OPS_TRIPS: 'pod/find_media_ops_trips',
  }

  SETTINGSTRING = {
    FIND: 'setting_string/find',
    FIND_KEY: 'setting_string/find_by_key',
    PAGINATION: 'setting_string/pagination',
    CREATE: 'setting_string/create_data',
    CREATELIST: 'setting_string/create_data_list',
    UPDATE: 'setting_string/update_data',
    DELETE: 'setting_string/update_delete',
  }

  EMPLOYEE_SHIFT_CONFIG = {
    LOAD_DATA: 'employeeShiftConfig/load_data',
    FIND: 'employeeShiftConfig/find',
    CREATE: 'employeeShiftConfig/create_data',
    UPDATE: 'employeeShiftConfig/update_data',
    LOAD_DATA_SHIFT: 'employeeShiftConfig/load_data_shift',
    PAGINATION_HISTORY: 'employeeShiftConfig/pagination_history',
  }

  TIMESHEET = {
    PAGINATION: 'timesheet/pagination',
    CREATE: 'timesheet/create_data',
    COMPUTE_TIMESHEET: 'timesheet/compute_timsheet_all',
    COMPUTE_TIMESHEET_FOR_EMPLOYEE: 'timesheet/compute_timsheet_for_employee',
    LOAD_DATA: 'timesheet/load_timesheet_in_month',
    UPDATE_DATA: 'timesheet/update_data',
    CLOSING: 'timesheet/closing_timesheet',
    CLOSING_LIST: 'timesheet/closing_timesheet_list',
  }

  SALARY_FOR_EMPLOYEE = {
    COMPUTE_SALARY: 'salary_for_employee/compute_salary_all',
    COMPUTE_SALARY_FOR_EMPLOYEE: 'salary_for_employee/compute_salary_for_employee',
    LOAD_DATA_MONTH: 'salary_for_employee/load_salary_in_month',
    LOAD_DATA_SHIFT: 'salary_for_employee/load_shift_salary_in_month',
    LOAD_MONTHLY_DETAIL: 'salary_for_employee/load_monthly_salary_detail',
    LOAD_SHIFT_DETAIL: 'salary_for_employee/load_shift_salary_detail',
    UPDATE_DATA: 'salary_for_employee/update_data',
    PRINT_MONTH: 'salary_for_employee/print_monthly_salary',
    PRINT_SHIFT: 'salary_for_employee/print_shift_salary',
    APPROVED: 'salary_for_employee/update_approved',
    APPROVED_LIST: 'salary_for_employee/update_approved_list',
  }

  ALLOWANCE_GO_ON_BUSINESS = {
    CREATE_DATA: 'allowance_go_on_business/create_data',
    UPDATE_DATA: 'allowance_go_on_business/update_data',
    LOAD_DATA: 'allowance_go_on_business/load_go_on_business_shift',
  }

  SHIP = {
    FIND: 'ship/find',
    PAGINATION: 'ship/pagination',
    CREATE: 'ship/create_data',
    UPDATE: 'ship/update_data',
    DELETE: 'ship/update_active',
  }

  WARNING = {
    PAGINATION: 'warning/pagination_maintenance',
    PAGINATION_ORDER: 'warning/pagination_order',
    SAVE: 'warning/update_status',
    LOAD: 'warning/load',
    DETAIL: 'warning/find_detail',
    SAVE_ALL: 'warning/update_all',
  }

  DASHBOARD = {
    LOAD_SALARY_OIL: 'dashboard/load_total_salary',
    LOAD_COST: 'dashboard/load_salary_cost',
    LOAD_ORDER: 'dashboard/load_order',
    LOAD_ORDER_CONT: 'dashboard/load_order_cont',
    LOAD_OPS_TRIP: 'dashboard/load_ops_trip',
    LOAD_DEBT: 'dashboard/load_debt',
    LOAD_DEBT_YEAR: 'dashboard/load_debt_year',
  }

  //#endregion

  //#region Handle

  objToQueryString = (obj: any) =>
    Object.keys(obj)
      .map((k) => {
        if (Array.isArray(obj[k])) {
          return `${k}=${JSON.stringify(obj[k])}`
        }
        return `${k}=${obj[k]}`
      })
      .join('&')

  post(url: string, data: any) {
    return (
      this.http
        .post(this.host + url, data)
        .toPromise()
        // tslint:disable-next-line: no-shadowed-variable
        .then((data) => {
          return data as any
        })
      // .catch((data) => {
      //   const newD = data
      //   this.notifyService.showErrorBE('Đường truyền không ổn định, vui lòng thử lại!')
      //   this.notifyService.hideloading()
      // })
    )
  }

  put(url: string, data: any) {
    return (
      this.http
        .put(this.host + url, data)
        .toPromise()
        // tslint:disable-next-line: no-shadowed-variable
        .then((data) => {
          return data as any
        })
    )
  }

  get(url: string, data: any) {
    const query = this.objToQueryString(data)
    const newUrl = `${this.host + url}?${query}`

    return (
      this.http
        .get(newUrl)
        .toPromise()
        // tslint:disable-next-line: no-shadowed-variable
        .then((data) => {
          return data as any
        })
    )
  }
  //#endregion
}
