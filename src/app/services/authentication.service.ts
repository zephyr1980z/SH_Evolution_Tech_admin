import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { enumData } from '../core/enumData'
import { User } from '../models/user.model'

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>
  public currentUser: Observable<User>
  host = enumData.ApiUrl
  constructor(private http: HttpClient) {
    const temp: any = null
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser') || temp))
    this.currentUser = this.currentUserSubject.asObservable()
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value
  }

  login(username: string, password: string) {
    return this.http.post(`${this.host}/auth/login`, { username, password }).pipe(
      map((user) => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentUser', JSON.stringify({ ...user, username }))
        this.currentUserSubject.next({ ...user, username } as User)
        return user
      })
    )
  }

  loginFake(username: string, password: string) {
    if (username === 'admin' && password === '123456') {
      const user: any = { id: 'asdasd', username: 'admin', password: '123456' }

      // store user details and jwt token in local storage to keep user logged in between page refreshes
      localStorage.setItem('currentUser', JSON.stringify({ ...user, username }))
      this.currentUserSubject.next({ ...user, username } as User)

      // this.currentUserSubject.next(user)
    }
    return
  }

  updatePassword(currentPassword: string, newPassword: string, confirmNewPassword: string) {
    return this.http
      .post(`${this.host}/auth/update-password`, { currentPassword, newPassword, confirmNewPassword })
      .pipe(
        map((data) => {
          return data
        })
      )
  }

  logout() {
    // if (!window.location.href.includes(enumData.FrontendTK)) {
    //   localStorage.removeItem('Language')
    //   localStorage.removeItem('LanguageConfig')
    //   localStorage.removeItem('currentUser')
    // }
    localStorage.removeItem('Language')
    localStorage.removeItem('LanguageConfig')
    localStorage.removeItem('currentUser')
    const temp: any = null
    this.currentUserSubject.next(temp)
  }
}
