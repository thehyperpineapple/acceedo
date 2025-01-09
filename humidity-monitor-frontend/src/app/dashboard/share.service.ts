import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  private serverUpdatedSource = new BehaviorSubject<boolean>(false); // BehaviorSubject to notify changes
  serverUpdated$ = this.serverUpdatedSource.asObservable(); // Observable to subscribe to

  // Method to trigger update notifications
  notifyServerUpdate() {
    this.serverUpdatedSource.next(true);
  }
}