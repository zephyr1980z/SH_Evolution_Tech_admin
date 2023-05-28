import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { WelcomeComponent } from './welcome.component'
import { ReportSalaryOilComponent } from './report-salary-oil/report-salary-oil.component'
import { OrderComponent } from './order/order.component'
import { DebtComponent } from './debt/debt.component'
const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'salary-oil', component: ReportSalaryOilComponent },
  { path: 'order', component: OrderComponent },
  { path: 'debt', component: DebtComponent },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WelcomeRoutingModule {}
