import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzCascaderModule } from 'ng-zorro-antd/cascader'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { NzPaginationModule } from 'ng-zorro-antd/pagination'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzStatisticModule } from 'ng-zorro-antd/statistic'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzTabsModule } from 'ng-zorro-antd/tabs'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { CurrencyMaskModule } from 'ng2-currency-mask'
import { MaterialModule } from '../../material.module'
import { AnalysisComponent } from './analysis/analysis.component'
import { DebtComponent } from './debt/debt.component'
import { OrderComponent } from './order/order.component'
import { ReportSalaryOilComponent } from './report-salary-oil/report-salary-oil.component'
import { WelcomeRoutingModule } from './welcome-routing.module'
import { WelcomeComponent } from './welcome.component'
@NgModule({
  imports: [
    CommonModule,
    WelcomeRoutingModule,
    NzCardModule,
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
    NzPopconfirmModule,
    NzPaginationModule,
    MaterialModule,
    ReactiveFormsModule,
    CurrencyMaskModule,
    NzCollapseModule,
    CommonModule,
    NzStatisticModule,
    NzGridModule,
    NzTagModule,
    NzCascaderModule,
  ],
  declarations: [WelcomeComponent, AnalysisComponent, ReportSalaryOilComponent, OrderComponent, DebtComponent],
  exports: [WelcomeComponent],
  bootstrap: [WelcomeComponent],
})
export class WelcomeModule {}
