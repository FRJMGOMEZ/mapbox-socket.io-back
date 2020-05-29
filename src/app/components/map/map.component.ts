import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Place } from 'src/app/models/place.model';
import { MarkerService } from '../../providers/marker.service';
import { Subscription } from 'rxjs';
import { WebsocketService } from '../../providers/web-sockets.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {


  map: mapboxgl.Map

  markers: Place[] = [];

  newMarkerSubs:Subscription;
  markersRemSubs:Subscription;
  markersChangesSubs: Subscription;
  markersUpdatesSubs:Subscription;


  markersMapbox:{[key:string]:mapboxgl.Marker} = {};


  constructor(private markerService:MarkerService, private wsService:WebsocketService) { }

  ngOnInit(): void {
    this.createMap();
    this.markerService.getMarkers().subscribe((markers:Place[])=>{
        this.markers = markers;
        this.markers.forEach((marker:Place)=>{
          this.addMarker(marker)
        })
    })
    this.listenningNewMarkers();
    this.listenningMarkersRemoval();
    this.listenningMarkersUpdates();
  }
  createMap() {
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoiZnJqbWdvbWV6IiwiYSI6ImNrYXBpbm9mYTBhZGkydW1zZ2t3N2xqY2wifQ.yr0ONX9d0KQybk4DLpiV0Q';
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-75.75512993582937, 45.349977429009954],
      zoom: 15.8
    });
  }

  addMarker(marker: Place) {

    const h2 = document.createElement('h2');
    h2.innerText = marker.name;

    const btnDelete = document.createElement('button');
    btnDelete.innerText = 'Delete';

    const div = document.createElement('div');

    div.append(h2,btnDelete);

    const customPopup = new mapboxgl.Popup({
      offset: 20,
      closeOnClick: false
    })
    .setMaxWidth("150px")
    .setDOMContent(div)
  
    const newMarker = new mapboxgl.Marker({
      draggable: true,
      color: marker.color
    })
      .setLngLat([marker.lng, marker.lat])
      .setPopup(customPopup)
      .addTo(this.map)

     newMarker.on('drag',()=>{
           const lngLat = newMarker.getLngLat();
           let payload ={
             id:marker.id,
             lng:lngLat.lng,
             lat:lngLat.lat
           }
           this.wsService.emit('update-marker',payload)
      })

    btnDelete.addEventListener('click',()=>{
      this.markerService.removeMarker(marker.id).subscribe()
    })

    this.markersMapbox[marker.id] = newMarker;
  }

  createNewMarker() {
    let newMarker: Place = {
      id: new Date().toISOString(),
      name: 'Pancho',
      lng: -75.75512993582937,
      lat: 45.349977429009954,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16) 
    }
    this.markerService.postMarker(newMarker).subscribe();
  }

  listenningNewMarkers(){
   this.newMarkerSubs = this.markerService.listenningNewMarkers().subscribe((marker:Place)=>{
     console.log({neewMarker:marker})
      this.markers.push(marker)
      this.addMarker(marker);
    })
  }

  listenningMarkersRemoval(){
    this.markersRemSubs = this.markerService.listenningRemoveMarker().subscribe((id:string)=>{
      console.log({id})
      this.markers = this.markers.filter((marker:Place)=>{ marker.id != id });
      this.markersMapbox[id].remove();
    })
  }

  listenningMarkersUpdates(){
     this.markersUpdatesSubs = this.markerService.listenningMarkerUpdates().subscribe((payload:{id:string,lng:number,lat:number})=>{
      this.markersMapbox[payload.id].setLngLat([payload.lng,payload.lat])
    })
  }

  ngOnDestroy(){
    this.newMarkerSubs.unsubscribe();
    this.markersRemSubs.unsubscribe();
    this.markersUpdatesSubs.unsubscribe();
  }


}


