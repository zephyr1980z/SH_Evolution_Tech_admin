import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MapControlComponent } from './map-control/map-control.component'

@NgModule({
  imports: [CommonModule],
  declarations: [MapControlComponent],
  exports: [MapControlComponent],
})
export class SharedModule {}
