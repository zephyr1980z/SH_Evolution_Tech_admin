import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthenticationService } from '../../services/authentication.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup
  returnUrl!: string
  submitted = false
  logo: string = '../../../assets/img/1024QT.png'
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/'])
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    })

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/'
  }

  get f() {
    const res: any = this.loginForm.controls
    return res
  }

  onSubmit() {
    // this.router.navigate([this.returnUrl])
    this.submitted = true
    // this.authenticationService
    //   .login(this.f.username.value, this.f.password.value)
    //   .pipe(first())
    //   .subscribe(
    //     (data) => {
    //       // debugger
    //       this.router.navigate([this.returnUrl])
    //     },
    //     (error) => {}
    //   )
    // this.router.navigate([this.returnUrl])
    this.authenticationService.loginFake(this.f.username.value, this.f.password.value)
    this.router.navigate(['welcome'])
    // console.log('login')
  }
}
