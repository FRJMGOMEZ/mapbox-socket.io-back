import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import { map} from 'rxjs/operators'
import { Place } from '../models/place.model';
import { WebsocketService } from './web-sockets.service';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  private baseUrl:string

  constructor(private http:HttpClient, private wsService:WebsocketService) { 
    this.baseUrl = environment.backUrl;
  }

  getMarkers(){
    let url = `${this.baseUrl}/markers`
    return this.http.get(url).pipe(map((res:any)=>{ return res.markers}))
  }

  postMarker(marker:Place){
    let url = `${this.baseUrl}/marker`
    return this.http.post(url,{marker})
  }

  removeMarker(id: string){
    let url = `${this.baseUrl}/marker/${id}`
    return this.http.delete(url)
  }
  listenningNewMarkers(){
    return this.wsService.listen('new-marker')
  }

  listenningRemoveMarker(){
    return this.wsService.listen('remove-marker')
  }

  listenningMarkerUpdates(){
    return this.wsService.listen('update-marker')
  }
}
