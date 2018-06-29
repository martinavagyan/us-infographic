import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {ConfigurationService} from './configuration.service';

@Injectable({
  providedIn: 'root'
})
export class UsInfographicsService {


  private localDataPath = '../assets/data/';
  private jobsDataPath = 'jobs.json';
  private statesDataPath = 'states.json';
  private populationDataPath = 'population.json';

  private actionUrl: string;

  constructor(private http: HttpClient,
              private configurationService: ConfigurationService) {
    this.actionUrl = `${configurationService.apiHost}${configurationService.apiPrefix}`;
  }

  public getPopulationData(): Observable<any>  {
    return this.getLocalJSON(this.localDataPath + this.populationDataPath);
  }

  public getStatesData(): Observable<any>  {
    return this.getLocalJSON(this.localDataPath + this.statesDataPath);
  }

  public getJobsData(): Observable<any>  {
    return this.getLocalJSON(this.localDataPath + this.jobsDataPath);
  }

  private getLocalJSON(path: string): Observable<any> {
    return this.http.get<any>(path);
  }
}
