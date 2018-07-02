import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {UsInfographicsService} from "../../services/us-infographics.service";
import {MatTabChangeEvent} from '@angular/material';
import {State} from "../../models/state";


@Component({
  selector: 'app-geomap',
  templateUrl: './geomap.component.html',
  styleUrls: ['./geomap.component.css']
})
export class GeomapComponent implements OnInit {
  @Output('selectedStateEvent') selectedStateEvent = new EventEmitter<string>();

  @Output('stateCodeToNameMappingEvent') stateCodeToNameMappingEvent = new EventEmitter<any>();
  @Output('stateJobsEvent') stateJobsEvent = new EventEmitter<any>();
  @Output('statePopulationByAgeGroupEvent') statePopulationByAgeGroupEvent = new EventEmitter<any>();
  @Output('populationAsAnObjectEvent') populationAsAnObjectEvent = new EventEmitter<any>();
  @Output('unemploymentDataEvent') unemploymentDataEvent = new EventEmitter<any>();

  public selectedStateId: string;
  public statesNameMapping: Object;
  public statesPopulationByAgeGroups: Object;
  public statesJobs: Object;
  public statesTotalPopulationByName: any;
  private populationAsAnObject: Object;
  public updateGeoMap = true;
  public map_ChartData: any;

  public stateArea: any;

  public unemploymentData: Object;
  public unemploymentGeoMapData: any;

  public stateNameStateCode: any;

  public searchComponentStateData: State[] = [];

  public map_ChartOptions: Object;
  private currentTab = 0;

  constructor(private usInfographicsService: UsInfographicsService) {
    this.generateDefaultMapOption();
  }

  ngOnInit() {
    (async () => {
      await this.loadInfographicsData().then(() => {
        this.populationAsAnObject = GeomapComponent.getAllStatesTotalPopulation(this.statesPopulationByAgeGroups);
        this.statesTotalPopulationByName = this.mapStateNameWithPopulation(this.populationAsAnObject, this.statesNameMapping);
        this.searchComponentStateData = this.mapStateNamePopulationStateCode(this.populationAsAnObject, this.statesNameMapping);
        this.stateNameStateCode = GeomapComponent.createStateCodeNameMappingToStateCode(this.statesNameMapping);
        this.stateArea = GeomapComponent.objectToArray(this.stateArea);
        this.unemploymentGeoMapData = GeomapComponent.objectToArray(this.unemploymentData);

        this.stateCodeToNameMappingEvent.emit(this.statesNameMapping);
        this.stateJobsEvent.emit(this.statesJobs);
        this.statePopulationByAgeGroupEvent.emit(this.statesPopulationByAgeGroups);
        this.populationAsAnObjectEvent.emit(this.populationAsAnObject);
        this.unemploymentDataEvent.emit(this.unemploymentData);
        this.setGeoMapToPopulationData();
      });
    })();
  }

  private generateDefaultMapOption(): void {
    this.map_ChartOptions = {
      region: 'US',
      displayMode: 'region',
      resolution: 'provinces',
      legend: 'none',
      enableRegionInteractivity: 'true',
      sizeAxis: {minSize: 1, maxSize: 10},
      width: '100%',
      aggregationTarget: 'category',
      defaultColor: '#f5f5f5',
    };
    this.renderMap();
  }

  public setGeoMapToPopulationData() {
    this.generateDefaultMapOption();
    this.map_ChartData = [['State', 'Population'], ...(this.statesTotalPopulationByName)];
    this.map_ChartOptions['colorAxis'] = {minValue: 1000000, maxValue: 32000000, colors: ['#3f51b5']};
    this.renderMap();
  }

  public setGeoMapToUnemploymentData() {
    this.generateDefaultMapOption();
    this.map_ChartData = [['State', 'Unemployment (%)'], ...(this.unemploymentGeoMapData)];
    this.map_ChartOptions['colorAxis'] = {minValue: 2, maxValue: 7, colors: ['#B71C1C']};
    this.renderMap();
  }

  public setGeoMapToAreaData() {
    this.generateDefaultMapOption();
    this.map_ChartData = [['State', 'Area (km2)'], ...(this.stateArea)];
    this.map_ChartOptions['colorAxis'] = {minValue: 2000, maxValue: 1000000, colors: ['#E65100']};
    this.renderMap();
  }

  async loadInfographicsData(): Promise<any> {
    await new Promise<void>(resolve => {
      this.usInfographicsService.getJobsData().subscribe(data => {
        this.statesJobs = data;
        resolve();
      });
    });
    await new Promise<void>(resolve => {
      this.usInfographicsService.getStatesData().subscribe(data => {
        this.statesNameMapping = data;
        resolve();
      });
    });
    await new Promise<void>(resolve => {
      this.usInfographicsService.getPopulationData().subscribe(data => {
        this.statesPopulationByAgeGroups = data;
        resolve();
      });
    });
    await new Promise<void>(resolve => {
      this.usInfographicsService.getunemploymentData().subscribe(data => {
        this.unemploymentData = data;
        resolve();
      });
    });
    await new Promise<void>(resolve => {
      this.usInfographicsService.getAreaData().subscribe(data => {
        this.stateArea = data;
        resolve();
      });
    });
  }

  private static getAllStatesTotalPopulation(statesPopulations: any): any[] {
    const allStatePopulations: any = {};
    for (const statePopulation of statesPopulations) {
      const currentState: string = statePopulation['State'];
      const stateName = statePopulation['State'];
      statePopulation['State'] = 0;
      allStatePopulations[currentState] = this.sumObjectProperties(statePopulation);
      statePopulation['State'] = stateName;
    }
    return allStatePopulations;
  }

  private mapStateNameWithPopulation(statesPopulations: any, statesNamesMapping: any): any[] {
    const statesNamesAndPopulations = [];
    for (const stateName in statesNamesMapping) {
      if (statesNamesMapping.hasOwnProperty(stateName)) {
        const stateFullName = statesNamesMapping[stateName];
        const stateTotalPopulation = statesPopulations[stateName];
        if (typeof statesPopulations[stateName] === 'undefined') {
          continue;
        }
        statesNamesAndPopulations.push([stateFullName, stateTotalPopulation]);
      }
    }
    return statesNamesAndPopulations;
  }

  private mapStateNamePopulationStateCode(statesPopulations: any, statesNamesMapping: any): any[] {
    const statesNamesAndPopulations = [];
    for (const stateId in statesNamesMapping) {
      if (statesNamesMapping.hasOwnProperty(stateId)) {
        const stateFullName = statesNamesMapping[stateId];
        const stateTotalPopulation = statesPopulations[stateId];
        if (typeof  statesPopulations[stateId] === 'undefined') {
          continue;
        }
        statesNamesAndPopulations.push({
          'name': stateFullName,
          'population': stateTotalPopulation,
          'id': stateId.toLowerCase(),
        });
      }
    }
    return statesNamesAndPopulations;
  }


  public static sumObjectProperties(obj: object): number {
    return Object.keys(obj)
      .reduce(function (sum: any, key: any) {
        return sum + parseFloat(obj[key]);
      }, 0);
  }


  public updateTab(event: number) {
    this.currentTab = event;
    this.setSelectedStateId(null);
    switch (event) {
      case 0: { // Population
        this.setGeoMapToPopulationData();
        break;
      }
      case 1: { // Jobs
        this.setGeoMapToUnemploymentData();
        break;
      }
      case 2: { //  Area
        this.setGeoMapToAreaData();
        break;
      }

    }
  }

  stateSelected(stateId) {
    if(stateId === null){
      this.refresh();
      return;
    }
    stateId = stateId.toUpperCase();
    this.setSelectedStateId(stateId);
    this.hightlightSelectedState(stateId);
    this.zoomInState(stateId);
  }

  private hightlightSelectedState(stateId) {
    this.map_ChartData = [['State', 'Population'], ['US-' + stateId, this.populationAsAnObject[stateId]]];
    this.map_ChartOptions['colorAxis'] = {
      minValue: 1,
      maxValue: this.populationAsAnObject[stateId],
      colors: ['#3f51b5']
    };
    this.renderMap();
  }

  public zoomInState(stateId: string): void {
    this.map_ChartOptions['region'] = 'US-' + stateId;
    this.renderMap();
  }

  public refresh(): void {
    this.updateTab(this.currentTab);
  }

  private setSelectedStateId(stateId: string): void {
    this.selectedStateId = stateId;
    this.selectedStateEvent.emit(this.selectedStateId);
  }

  public static objectToArray(obj: any): any[] {
    return Object.keys(obj).map(function (key) {
      return [key, obj[key]];
    });
  }

  private static createStateCodeNameMappingToStateCode(obj: any): any {
    const result = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[obj[key]] = key;
        result[key] = key;
      }
    }
    return result;
  }

  private renderMap(): void {
    this.updateGeoMap = !this.updateGeoMap;
  }
}
