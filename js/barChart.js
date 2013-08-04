/*globals nv, d3, _*/

'use strict';

var DatasetChart = {};

DatasetChart.graph = function(data) {

  data = DatasetChart._parseData(data);

  nv.addGraph(function() {
    var chart = nv.models.multiBarHorizontalChart()
        .x(function(d) { return d.label; })
        .y(function(d) { return d.value; })
        .margin({top: 30, right: 20, bottom: 50, left: 0})
        .showValues(true)
        .tooltips(false)
        .showControls(false);

    chart.yAxis
      .tickFormat(d3.format(',.2f'));

    d3.select('#chart1 svg')
      .datum(data)
      .transition().duration(500)
      .call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });

};

DatasetChart._parseData = function(data) {

  var colors = ['#d2af03', '#46b8da', '#a3c725'],
      index = 0;

  var parsed = _.map(data, function(row) {
    return {
      key: row.ciudad,
      color: colors[index++],
      values: [{
        label: 'label',
        value: row.valor
      }]
    };
  });

  return parsed;
};
