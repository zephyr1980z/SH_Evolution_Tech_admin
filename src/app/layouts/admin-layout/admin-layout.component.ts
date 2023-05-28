import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { enumData } from '../../core/enumData'
import { User } from '../../models/user.model'
import { ApiService } from '../../services/api.service'
import { AuthenticationService } from '../../services/authentication.service'
import { CoreService } from '../../services/core.service'

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit {
  isCollapsed = false
  currentUser!: User

  // PERMISSION

  // NOTIFY
  lstNOD: any[] = []
  isVisibleNotify = false
  lstNotify: any[] = []
  numNotify: number = 10
  totalNotify: number = 0
  dataItemNotify: any
  dataItemWarning: any
  enumNotifyStatus: any = enumData.NotifyStatus
  loading = false
  numNofityNew: any

  constructor(
    private router: Router,
    public coreService: CoreService,
    private authenticationService: AuthenticationService,
    private titleService: Title,
    private apiService: ApiService
  ) {
    this.authenticationService.currentUser.subscribe((x: User) => (this.currentUser = x))
  }

  async ngOnInit() {
    this.titleService.setTitle('Senhoangisdadev')

    await this.loadNotify()
    await this.getSocket()
  }

  getSocket() {
    // if (this.coreService.checkPermission(this.SettingOpsAssignment?.Add?.code)) {
    //   this.socket.getNotifyNewOrderOps().subscribe((res: any) => {
    //     if (res) {
    //       this.loadNotify()
    //       // this.playAudio()
    //     }
    //   })
    // } else {
    //   console.warn('permission notifycation is denied!')
    // }
  }

  viewNotify(item: any) {
    // this.loading = true
    // this.apiService.post(this.apiService.NOTIFY.READ, { id: item.id }).then((res) => {
    //   this.loadNotify()
    //   if (item.objectType === enumData.NotifyObjectType.SendToOps.code) {
    //     this.router.navigate(['/operation/ops-assignment'])
    //   }
    // })
  }

  loadMoreNotify() {
    this.numNotify += 10
    this.loadNotify()
  }

  async loadNotify() {
    // await this.hamCheckTokenHetHan()
    // this.loading = true
    // const dataSearch = {
    //   where: {},
    //   order: { createdAt: 'DESC' },
    //   take: this.numNotify,
    //   skip: 0,
    // }
    // await this.apiService.post(this.apiService.NOTIFY.PAGINATION, dataSearch).then((data: any) => {
    //   if (data) {
    //     this.lstNotify = data[0]
    //     this.totalNotify = data[1]
    //     this.numNofityNew = data[2] || 0
    //     this.loading = false
    //   }
    // })
  }

  async hamCheckTokenHetHan() {
    // await this.apiService
    //   .post(this.apiService.TOKEN.CHECK_ACCESS_TOKEN, {
    //     accessToken: this.currentUser.accessToken,
    //   })
    //   .then(async (res) => {
    //     if (!res) {
    //       await this.apiService
    //         .post(this.apiService.TOKEN.RESET_TOKEN, { accessToken: this.currentUser.accessToken })
    //         .then((res) => {
    //           if (res) {
    //             const currentUser = this.authenticationService.currentUserValue
    //             if (currentUser && currentUser.accessToken) {
    //               currentUser.accessToken = res.accessToken
    //               this.currentUser.accessToken = res.accessToken
    //               localStorage.setItem('accessToken', res.accessToken)
    //             }
    //           }
    //         })
    //     }
    //   })
  }

  async onReadAll() {
    // await this.hamCheckTokenHetHan()
    // this.loading = true
    // this.apiService.post(this.apiService.NOTIFY.READ_ALL, {}).then((res) => {
    //   this.loadNotify()
    // })
  }

  playAudio() {
    let audio = new Audio()
    audio.src = 'assets/sound/sound.wav'
    audio.load()
    audio.play()
    audio.volume = 1
  }

  logout() {
    this.authenticationService.logout()
    this.router.navigate(['/user/login'])
    // this.authenticationService.logout()
    location.reload()
  }

  removeScroll() {
    let element = document.getElementById('remove-scroll')
    element?.classList.remove('scroll')
  }
}
