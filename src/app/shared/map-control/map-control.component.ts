import { Component, OnInit, Input } from '@angular/core'
import { enumData } from '../../core/enumData'
import { ApiService } from '../../services/api.service'
import { CoreService } from '../../services/core.service'
import { NotifyService } from '../../services/notify.service'
declare const google: any

@Component({
  selector: 'app-map-control',
  templateUrl: './map-control.component.html',
  styleUrls: ['./map-control.component.scss'],
})
export class MapControlComponent implements OnInit {
  @Input()
  public options: any
  map: any
  markers: any[] = []
  routes: any[] = []
  enumData: any = enumData
  directionsService: any = new google.maps.DirectionsService()
  directionsRenderer: any = new google.maps.DirectionsRenderer()

  constructor(private coreService: CoreService, private apiService: ApiService, private notifyService: NotifyService) {}

  ngOnInit() {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, this.options)
    this.directionsRenderer.setMap(this.map)
    this.options.control = {
      setCenter: (lat: number, lng: number, zoomLevel: number) => {
        this.map.setCenter({ lat: lat, lng: lng })
        this.map.setZoom(zoomLevel)
      },
      fitBounds: (lstPoint: any[]) => {
        const lstLat = lstPoint.map((c) => c.lat)
        const lstLng = lstPoint.map((c) => c.lng)
        const lat_min = Math.min(...lstLat)
        const lat_max = Math.max(...lstLat)
        var lng_min = Math.min(...lstLng)
        var lng_max = Math.max(...lstLng)

        this.map.setCenter(new google.maps.LatLng((lat_max + lat_min) / 2.0, (lng_max + lng_min) / 2.0))
        this.map.fitBounds(
          new google.maps.LatLngBounds(
            //bottom left
            new google.maps.LatLng(lat_min, lng_min),
            //top right
            new google.maps.LatLng(lat_max, lng_max)
          )
        )
      },
      addMarkerCar: (markerData: any) => {
        // debugger
        let marker = new google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          icon: {
            url: `assets/img/car/car_yellow${markerData.Direction !== undefined ? markerData.Direction : 0}.svg`,
          },
          map: this.map,
          type: 'car',
          zIndex: 9999,
          carId: markerData.Id,
          id: markerData.Id,
          Direction: markerData.Direction,
          tittle: `Biển số xe: ${markerData.VehiclePlate}`,
        })

        // $('img[src="' + 'assets/img/car/car_yellow.svg' + '?id=' + marker.id + '"]').css({
        //   transform: 'rotate(' + (90) + 'deg)',
        // })
        // $('img[src="' + 'assets/img/car/car_yellow.svg' + '"]').css({
        //   transform: 'rotate(' + (heading - initial) + 'deg)',
        // })

        this.markers.push(marker)
        markerData.no = markerData.VehiclePlate
        markerData.driverName = 'senhoang'
        markerData.driverPhone = '0828746593'
        markerData.GpsTimeString = markerData.LocalTime
        var html = `
        <div style="height: 110px; width: 250px; font-size: 15px;">
          <div><b>Số xe:</b> ${markerData.no} (${markerData.Speed} Km/h)</div>
          <div><b>Trạng thái xe:</b> ${this.enumData.CarGPSStatus[markerData.State]?.name}</div>
          <div><b>Tài xế:</b> ${markerData.driverName || ''} - ${markerData.driverPhone || ''}</div>
          <div><b>Thời gian:</b> ${markerData.GpsTimeString}</div>
          <div><b>Vị trí:</b> ${markerData.Address}</div>
          <div><b>KM ngày:</b> ${markerData.Distance}</div>
        </div>
        `
        var infoWindow = new google.maps.InfoWindow({
          content: html,
        })
        google.maps.event.addListener(marker, 'mouseover', () => {
          infoWindow.open(this.map, marker)
        })
        google.maps.event.addListener(marker, 'mouseout', () => {
          infoWindow.close()
        })
      },
      changePositionMarkerCar: (markerData: any) => {
        // debugger
        const carMarker = this.markers.find((c) => c.id == markerData.id)
        if (carMarker) {
          if (carMarker.lat !== markerData.lat || carMarker.lng !== markerData.lng) {
            const latlng = new google.maps.LatLng(markerData.lat, markerData.lng)
            carMarker.setPosition(latlng)
          }
          if (carMarker.Direction !== markerData.Direction) {
            carMarker.setIcon({
              url: `assets/img/car/car_yellow${markerData.Direction !== undefined ? markerData.Direction : 0}.svg`,
            })
          }
        }
      },
      changeColorMarkerCar: (markerData: any) => {
        if (markerData.status === 'PARKING') {
          // đổi màu các xe cũ đang focus về xanh
          const lstMarkerCarFocus = this.markers.filter((c) => c.type === 'car' && c.isFocus)
          for (const markerCarFocus of lstMarkerCarFocus) {
            markerCarFocus.isFocus = false
            markerCarFocus.setIcon('assets/img/car/car_blue.svg')
          }
        } else if (markerData.status === 'BUSY') {
          // đổi màu các xe focus qua vàng
          const markerCar = this.markers.find((c) => c.type === 'car' && c.carId === markerData.Id)
          if (markerCar) {
            markerCar.isFocus = true
            markerCar.setIcon('assets/img/car/car_yellow.svg')
          }
        } else if (markerData.status === 'READY') {
          // đổi màu các xe focus màu xanh
          const markerCar = this.markers.find((c) => c.type === 'car' && c.carId === markerData.Id)
          if (markerCar) {
            markerCar.isFocus = true
            markerCar.setIcon('assets/img/car/car_green.svg')
          }
        } else if (markerData.status === 'BUSY_TOUR') {
          // đổi màu các xe focus màu xanh
          const markerCar = this.markers.find((c) => c.type === 'car' && c.carId === markerData.Id)
          if (markerCar) {
            markerCar.isFocus = true
            markerCar.setIcon('assets/img/car/car_red.svg')
          }
        } else if (markerData.status === 'BUSY_PRIVATE') {
          // đổi màu các xe focus màu xanh
          const markerCar = this.markers.find((c) => c.type === 'car' && c.carId === markerData.Id)
          if (markerCar) {
            markerCar.isFocus = true
            markerCar.setIcon('assets/img/car/car_grey.svg')
          }
        }
      },
      clearMarkerByType: (type: string) => {
        let lstMarkerCar = this.markers.filter((c) => c.type === type)
        for (const marker of lstMarkerCar) {
          marker.setMap(null)
        }
        this.markers = this.markers.filter((c) => c.type != type)
      },
      addMarker: (markerData: any) => {
        let marker = new google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map: this.map,
          type: 'location',
          zIndex: 2,
        })

        this.markers.push(marker)

        //add marker info
        var html = `
        <div style="height: 100px; width: 200px;font-size: 14px;">
          <div><b>Vị trí</b> ${markerData.address} (${markerData.lat}-${markerData.lng})</div>
        </div>
        `
        var infoWindow = new google.maps.InfoWindow({
          content: html,
        })
        google.maps.event.addListener(marker, 'click', () => {
          infoWindow.open(this.map, marker)
        })
      },
      addMarkerLocation: (markerData: any, type: string) => {
        let marker = new google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          icon: `assets/img/location/${type}.svg`,
          map: this.map,
          type: 'location',
          zIndex: 4,
        })

        this.markers.push(marker)

        //add marker info
        var html = `
        <div style="height: 100px; width: 200px;font-size: 14px;">
          <div><b>Vị trí</b> ${markerData.Address} (${markerData.Latitude}-${markerData.Longitude})</div>
        </div>
        `
        var infoWindow = new google.maps.InfoWindow({
          content: html,
        })
        google.maps.event.addListener(marker, 'click', () => {
          infoWindow.open(this.map, marker)
        })
      },
      drawRouteGPS: (objGPS: any, callback: any) => {
        if (objGPS.vehicleCode && objGPS.fromDate && objGPS.toDate) {
          this.apiService.post(this.apiService.TRACKING.TRACKING_CAR, objGPS).then((res) => {
            res = res.filter((c: any) => c.Latitude > 0 && c.Longitude > 0)
            var first = null,
              last = null

            // Chỉ vẽ route khi có ít nhất 2 tọa độ và khoảng cách mỗi điểm >= 5m
            if (res.length > 1) {
              // Lấy tọa độ đầu tiên và cuối cùng để tạo marker
              first = { lat: res[0].Latitude, lng: res[0].Longitude }
              last = { lat: res[res.length - 1].Latitude, lng: res[res.length - 1].Longitude }

              // Setup routes
              var lstRoute: any[] = []
              for (var i = 0; i < res.length - 1; i++) {
                if (
                  res[i + 1].Latitude ||
                  res[i].Latitude != res[i + 1].Latitude ||
                  res[i].Longitude != res[i + 1].Longitude
                ) {
                  var distance = this.coreService.distance(
                    { lat: res[i].Latitude, lng: res[i].Longitude },
                    { lat: res[i + 1].Latitude, lng: res[i + 1].Longitude }
                  )
                  if (distance.Distance >= 5) {
                    let route = new google.maps.Polyline({
                      shape: 'polyline',
                      path: [
                        { lat: res[i].Latitude, lng: res[i].Longitude },
                        { lat: res[i + 1].Latitude, lng: res[i + 1].Longitude },
                      ],
                      strokeColor: '#FF6253',
                      strokeOpacity: 0.8,
                      strokeWeight: 3,
                      icons: [],
                    })

                    lstRoute.push(route)
                  }
                }
              }

              // add icon arraw for route
              if (lstRoute.length > 0) {
                const iconArrowGPS = {
                  icon: {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    strokeColor: '#e5584a',
                    strokeOpacity: 1,
                    strokeWeight: 3,
                  },
                  offset: '50%',
                }
                var range = 10
                var numArrow = lstRoute.length / range
                for (var i = 0; i < numArrow; i++) {
                  lstRoute[i * range].icons.push(iconArrowGPS)
                }

                this.routes.push(...lstRoute)
              }

              // show route in map
              for (var route of lstRoute) {
                route.setMap(this.map)
              }
              this.map.setCenter(first)
              this.map.setZoom(15)
            }
            if (callback) callback(first, last)
          })
        }
      },
      clearRouteGPS: () => {
        this.options.control.clearMarkerByType('location')
        for (const route of this.routes) {
          route.setMap(null)
        }
        this.routes = []
        this.directionsRenderer.setDirections({ routes: [] })

        // debugger
        // this.map
      },

      /**Vẽ các điểm([truyền thứ tự obj {lat,lng}]) */
      calculateAndDisplayRoute: (lstLocation: any[]) => {
        const lst = [...lstLocation]
        const lastLocation = lst.pop()
        const [firstLocation, ...restLocation] = lst

        let waypts: any[] = []

        for (const location of restLocation) {
          waypts.push({
            location: new google.maps.LatLng(location.lat, location.lng),
            stopover: true,
          })
        }

        this.directionsService
          .route({
            origin: firstLocation,
            destination: lastLocation,
            waypoints: waypts,
            optimizeWaypoints: true,
            travelMode: google.maps.TravelMode.DRIVING,
          })
          .then((response: any) => {
            this.directionsRenderer.setDirections(response)

            const route = response.routes[0]
            const summaryPanel = document.getElementById('directions-panel') as HTMLElement

            if (summaryPanel) {
              summaryPanel.innerHTML = ''

              // For each route, display summary information.
              for (let i = 0; i < route.legs.length; i++) {
                const routeSegment = i + 1

                summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment + '</b><br>'
                summaryPanel.innerHTML += route.legs[i].start_address + ' to '
                summaryPanel.innerHTML += route.legs[i].end_address + '<br>'
                summaryPanel.innerHTML += route.legs[i].distance!.text + '<br><br>'
              }
            }
          })
          .catch((e: any) => window.alert('Directions request failed due to ' + status))
      },
    }
  }
}
