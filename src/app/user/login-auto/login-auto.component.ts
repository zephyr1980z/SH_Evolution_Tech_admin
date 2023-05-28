import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthenticationService } from '../../services/authentication.service'
import { first } from 'rxjs/operators'

@Component({
  selector: 'app-login-auto',
  templateUrl: './login-auto.component.html',
})
export class LoginAutoComponent implements OnInit {
  returnUrl: any
  username: any
  password: any

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/'
    this.username = this.route.snapshot.paramMap.get('username')
    this.password = this.route.snapshot.paramMap.get('password')
    this.onLogin()
  }

  onLogin() {
    this.authenticationService
      .login(this.username, this.password)
      .pipe(first())
      .subscribe(
        (data: any) => {
          if (data) {
            this.router.navigate([this.returnUrl])
          }
        },
        (error) => {}
      )
  }
}
