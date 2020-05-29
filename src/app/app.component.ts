import { Component } from '@angular/core';
import { WebsocketService } from './providers/web-sockets.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'mapBox';

  constructor(private wsService:WebsocketService){
    this.wsService.checkStatus(); 
  }
}
