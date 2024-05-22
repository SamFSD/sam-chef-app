import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { DrivingEventsService } from '../driving-events.service';
import { Position } from './position';

// as per the library ()
declare const google: any;

@Component({
  selector: 'app-drivers-events-maps',
  templateUrl: './drivers-events-maps.component.html',
  styleUrls: ['./drivers-events-maps.component.scss'],
})
export class DriversEventsMapsComponent implements OnInit {
  map: any;
  @Input() filteredEventDetails: Position[] = [];
  isLoading: boolean = true;

  selectedEvent: string = 'All Events';
  infoWindow: any;
  private readonly onDestroy = new Subject<void>();
  eventDetails: any[] = [];
  eventDescriptions: string[] = [];
  clickedTableMarkers!: { lat: any; lng: any; eventDescription: any }[];

  //Define a class variable to store markers from the Markers Library

  markers: google.maps.MarkerLibrary[] = [];

  constructor(private eventService: DrivingEventsService) {}

  /// set different icon colors for each event descriptions
  getIconColor(eventDescription: string) {
    switch (eventDescription) {
      case 'Harsh Cornering':
        return 'blue';
      case 'Impact Detect':
        return 'yellow';
      case 'Road Speed Overspeeding':
        return 'green';
      case 'Impact Detect Moderate':
        return 'orange';
      case 'Harsh braking':
        return 'purple';
      case 'Harsh acceleration':
        return 'pink';
      case 'Impact Detect Severe':
        return 'grey';
      default:
        return 'red';
    }
  }

  ngOnInit(): void {
    //ubscribe to the on click from the table to get the table data that will set the mat data

    this.eventService.passDataFromPerEventTableToMap.subscribe(
      (data: Position[]) => {
        if (Array.isArray(data)) {
          this.filteredEventDetails = data;
          console.log(this.filteredEventDetails, 'map data');

          // Check if the map is already initialized, if it is, set the markers, otherwise, initialize the map

          if (this.map) {
            console.log('Map exists, setting position');
            this.setMapMarkers(this.filteredEventDetails);
          } else {
            this.initMap(this.filteredEventDetails);
          }
        }
      }
    );
  }

  ///init the map method
  async initMap(data: Position[]): Promise<void> {
    const { Map } = await google.maps.importLibrary('maps');
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        zoom: 6,
        center: this.getCenterPoints(data),
        mapTypeId: 'roadmap',
        mapId: 'DEMO_MAP_ID',
      }
    );
    this.setMapMarkers(data);
    this.infoWindow = new google.maps.InfoWindow();
  }

  ///set the map markers based on the data from the table
  setMapMarkers(data: Position[]) {
    console.log(data, 'data');

    /// Remove existing markers
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });
    this.markers = [];
    this.map.setCenter(this.getCenterPoints(data));

    ///Adding markers for each position in the array
    data.forEach((position: Position) => {
      const iconColor = this.getIconColor(position.event_description);
      const marker = new google.maps.Marker({
        map: this.map,
        position: new google.maps.LatLng(
          position.start_lat,
          position.start_lon
        ),

        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: iconColor,
          fillOpacity: 1,
          scale: 6,
          strokeColor: 'white',
          strokeWeight: 2,
        },
      });
      this.markers.push(marker);

      marker.addListener('mouseover', () => {
        const infoContent = `
        <div>
          <strong>Event Description:</strong> ${position.event_description}<br>
          <strong>Asset Name:</strong> ${position.asset_name}<br>
          <strong>Fleet Number:</strong> ${position.fleet_no}<br>
          <strong>Vehicle Type:</strong> ${position.veh_type_map}<br>
          <strong>Vehicle Registration:</strong> ${position.vehiclereg}<br>
          <strong>Vehicle Model:</strong> ${position.veh_model_map}
        </div>
      `;
        this.infoWindow.setContent(infoContent);
        this.infoWindow.open(this.map, marker);
      });

      marker.addListener('mouseout', () => {
        this.infoWindow.close();
      });
    });

    ///Recalculate and set the new center
    const newCenter = this.getCenterPoints(data);
    this.map.setCenter(newCenter);
  }
  ///calculate the center point of the map

  getCenterPoints(positions: Position[]) {
    this.isLoading = true;

    if (!positions.length) {
      return { lat: NaN, lng: NaN };
    }

    // Filter out invalid positions
    const validPositions = positions.filter(
      (pos) =>
        !isNaN(parseFloat(pos.start_lat)) && !isNaN(parseFloat(pos.start_lon))
    );

    if (!validPositions.length) {
      return { lat: NaN, lng: NaN };
    }

    const averageLat =
      validPositions.reduce((sum, pos) => sum + parseFloat(pos.start_lat), 0) /
      validPositions.length;

    const averageLon =
      validPositions.reduce((sum, pos) => sum + parseFloat(pos.start_lon), 0) /
      validPositions.length;

    const centerPosition = { lat: averageLat, lng: averageLon };
    this.isLoading = false;

    return centerPosition;
  }

  ngOnDestroy() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }
}
