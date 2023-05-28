import { Component, Inject, OnInit, Optional } from '@angular/core'
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Router } from '@angular/router'
import { enumData } from '../../../../../core/enumData'
import { User } from '../../../../../models/user.model'
import { ApiService } from '../../../../../services/api.service'
import { AuthenticationService } from '../../../../../services/authentication.service'
import { CoreService } from '../../../../../services/core.service'
import { NotifyService } from '../../../../../services/notify.service'

@Component({
  selector: 'app-assembly-certificate-detail',
  templateUrl: './assembly-certificate-detail.component.html',
  styleUrls: ['./assembly-certificate-detail.component.scss'],
})
export class AssemblyCertificateDetailComponent implements OnInit {
  role: any
  currentUser: User | any
  enumData = enumData
  modalTitle: any
  pageIndex: any
  pageSize: any
  total: any
  dataFilterStatus: any
  dataSearch: any = {}
  loading = true
  dataObject: any = {}
  modelTitle = 'Thông tin chi tiết máy'
  listItem: any = []

  constructor(
    private notifyService: NotifyService,
    private apiService: ApiService,
    public coreService: CoreService,
    private dialogRef: MatDialogRef<AssemblyCertificateDetailComponent>,
    private dialog: MatDialog,
    private router: Router,
    private authenticationService: AuthenticationService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.authenticationService.currentUser.subscribe((x: any) => (this.currentUser = x))
  }

  async ngOnInit() {
    this.dataSearch = new Object()
    this.data
    await this.apiService
      .post(this.apiService.ASSEMBLY_CERTIFICATE.FIND_FOR_DETAIL, { id: this.data.id })
      .then((res) => {
        if (res) {
          this.dataObject = res
        }
      })
  }

  closeDialog() {
    this.dialogRef.close(1)
  }
}
