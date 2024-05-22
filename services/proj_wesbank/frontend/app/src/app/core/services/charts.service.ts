import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartsService {

  constructor() { }


  //chart toolbox settings
  getChartToolbox(){
    return {
      show: true,
      feature: {
          saveAsImage: {
              show: true,
              title: 'Download Image',
              type: 'png',
              // You can customize more properties here
          },
      },
      right: 20, // Adjust position as needed
  }
  }

}
