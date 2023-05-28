import { NgModule } from '@angular/core'
import { MatDialogModule } from '@angular/material/dialog'
import { MatSnackBarModule } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'

@NgModule({
  imports: [MatDialogModule, MatTabsModule, MatSnackBarModule],
  exports: [MatDialogModule, MatTabsModule, MatSnackBarModule],
})
export class MaterialModule {}
