import { Injectable } from '@angular/core'
import { Subject, Observable } from 'rxjs'

@Injectable()
export class StorageService {
  public data = {}
  public loading = new Subject<boolean>()
  private storageSub = new Subject<boolean>()
  constructor() {}

  watchStorage(): Observable<any> {
    return this.storageSub.asObservable()
  }

  setItem(key: string, data: any) {
    localStorage.setItem(key, data)
    this.storageSub.next(true)
  }

  removeItem(key: any) {
    localStorage.removeItem(key)
    this.storageSub.next(key)
  }
}
