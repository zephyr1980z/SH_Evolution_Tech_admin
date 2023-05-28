import { Component, OnInit, Input, Optional, Inject } from '@angular/core'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
declare const google: any

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  @Input()
  public options: any
  map: any

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: any) {}

  ngOnInit() {
    if (this.data && this.data.mapOptions) {
      this.options = this.data.mapOptions
    }
    if (!this.options) {
      this.options = {
        center: new google.maps.LatLng(15.8774773, 108.3306529),
        zoom: 15,
        scrollwheel: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      }
    }
    this.map = new google.maps.Map(document.getElementById('map'), this.options)
    this.options.control = {
      setCenter: (lat: number, lng: number, zoomLevel: number) => {
        this.map.setCenter({ lat: lat, lng: lng })
        this.map.setZoom(zoomLevel)
      },
    }
    // new AutocompleteDirectionsHandler(this.map);
    // initMap();
  }
}

// function initMap() {
//   const map = new google.maps.Map(document.getElementById("map"), {
//     mapTypeControl: false,
//     componentRestrictions: { country: "VN" },
//     center: { lat: 15.8774773, lng: 108.3306529 },
//     zoom: 15,
//   });
//   new AutocompleteDirectionsHandler(map);
// }

class AutocompleteDirectionsHandler {
  map
  originPlaceId
  destinationPlaceId
  travelMode
  directionsService
  directionsRenderer
  constructor(map: any) {
    this.map = map
    this.originPlaceId = ''
    this.destinationPlaceId = ''
    this.travelMode = google.maps.TravelMode.WALKING
    this.directionsService = new google.maps.DirectionsService()
    this.directionsRenderer = new google.maps.DirectionsRenderer()
    this.directionsRenderer.setMap(map)
    const originInput = document.getElementById('origin-input')
    const destinationInput = document.getElementById('destination-input')
    const modeSelector = document.getElementById('mode-selector')
    const originAutocomplete = new google.maps.places.Autocomplete(originInput)
    originAutocomplete.setFields(['place_id'])
    const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput)
    destinationAutocomplete.setFields(['place_id'])
    this.setupClickListener('changemode-walking', google.maps.TravelMode.WALKING)
    this.setupClickListener('changemode-transit', google.maps.TravelMode.TRANSIT)
    this.setupClickListener('changemode-driving', google.maps.TravelMode.DRIVING)
    this.setupPlaceChangedListener(originAutocomplete, 'ORIG')
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST')
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput)
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput)
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector)
  }

  setupClickListener(id: any, mode: any) {
    const radioButton = document.getElementById(id)
    radioButton?.addEventListener('click', () => {
      this.travelMode = mode
      this.route()
    })
  }

  setupPlaceChangedListener(autocomplete: any, mode: any) {
    autocomplete.bindTo('bounds', this.map)
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.place_id) {
        window.alert('Please select an option from the dropdown list.')
        return
      }
      if (mode === 'ORIG') {
        this.originPlaceId = place.place_id
      } else {
        this.destinationPlaceId = place.place_id
      }
      this.route()
    })
  }

  route() {
    if (!this.originPlaceId || !this.destinationPlaceId) {
      return
    }
    const me = this
    this.directionsService.route(
      {
        origin: { placeId: this.originPlaceId },
        destination: { placeId: this.destinationPlaceId },
        travelMode: this.travelMode,
      },
      (response: any, status: any) => {
        if (status === 'OK') {
          me.directionsRenderer.setDirections(response)
        } else {
          window.alert('Directions request failed due to ' + status)
        }
      }
    )
  }
}
