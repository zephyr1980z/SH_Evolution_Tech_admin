import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { SwaggerToExcelComponent } from './swagger-to-excel/swagger-to-excel.component'

const routes: Routes = [{ path: 'swagger-to-excel', component: SwaggerToExcelComponent }]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToolsRoutingModule {}
