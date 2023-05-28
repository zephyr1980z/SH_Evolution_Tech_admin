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
import { MaterialModule } from 'src/app/material.module'
import { SwaggerToExcelComponent } from './swagger-to-excel/swagger-to-excel.component'
import { ToolsRoutingModule } from './tools-routing.module'

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
  declarations: [SwaggerToExcelComponent],
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
    ToolsRoutingModule,
    NzMessageModule,
    NzUploadModule,
    NzDropDownModule,
    NzImageModule,
  ],
  providers: [{ provide: CURRENCY_MASK_CONFIG, useValue: CustomCurrencyMaskConfig }],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ToolsModule {}
