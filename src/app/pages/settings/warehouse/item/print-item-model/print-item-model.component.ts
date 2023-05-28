import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import * as $ from 'jquery'
import * as JsBarcode from 'jsbarcode'
@Component({
  selector: 'app-print-item-model',
  templateUrl: './print-item-model.component.html',
})
export class PrintItemComponent implements OnInit {
  dateString = ''
  dataObject: any
  totalMoney: any
  lstData: any = []
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit(): void {
    this.dataObject = this.data
    if (!this.dataObject.code) {
      this.dataObject?.forEach((item: any) => {
        this.lstData.push(item.code)
      })
      for (let e of this.lstData) {
        for (let len = 0; len < this.dataObject.printQuantity; len++)
          $('.body-barcode-container').append(
            $(`
          <div" class="page-break" style="width: 100%">
            <img  draggable="false" class="barcode${e}"/> 
          </div>
          `)
          )
        $('.body-barcode-container').append($(`<div style="display: block; width: 100%;"></div>`))
        JsBarcode(`.barcode${e}`, e)
      }
    } else {
      for (let len = 0; len < this.dataObject.printQuantity; len++)
        $('.body-barcode-container').append(
          $(`
      <div" class="page-break" style="width: 100%">
      <img draggable="false" nz-col nzSpan="8" class="barcode${this.dataObject.code}" />
      `)
        )
      JsBarcode(`.barcode${this.dataObject.code}`, this.dataObject.code)
    }
  }
}
