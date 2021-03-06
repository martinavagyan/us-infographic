import {Directive, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

declare var google: any;
declare var googleLoaded: any;

@Directive({
  selector: '[GoogleChart]'
})
export class GoogleChartDirective implements OnInit, OnChanges {

  public _element: any;
  @Input('chartType') public chartType: string;
  @Input('chartOptions') public chartOptions: Object;
  @Input('chartData') public chartData: Object;
  @Input('updateGeoMap') public updateGeoMap: boolean;

  @Input('stateNameStateCode') public stateNameStateCode: any;

  @Output('selectedRegionEvent') selectedRegionEvent = new EventEmitter<string>();

  constructor(public element: ElementRef) {
    this._element = this.element.nativeElement;
  }

  ngOnInit() {
    this.render();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.render();
  }

  private render() {
    google.charts.load('current', {'packages': ['corechart']});
    this.drawGraph(this.chartOptions, this.chartType, this.chartData, this._element);
  }

  drawGraph(chartOptions, chartType, chartData, ele) {
    google.charts.setOnLoadCallback(drawChart);
    const _this = this;

    function drawChart() {
      let wrapper;
      wrapper = new google.visualization.ChartWrapper({
        chartType: chartType,
        dataTable: chartData,
        options: chartOptions || {},
        containerId: ele.id
      });

      if (_this.chartType === 'GeoChart') {
        google.visualization.events.addListener(wrapper, 'select', function () {
          const selection = wrapper.getChart().getSelection()[0];
          const state = chartData[selection.row + 1];
          if(typeof _this.stateNameStateCode[state[0]] === 'undefined'){
            _this.selectedRegionEvent.emit(null);
          }else{
            _this.selectedRegionEvent.emit(_this.stateNameStateCode[state[0]]);
          }
        });
      }

      wrapper.draw();
    }

  }
}
