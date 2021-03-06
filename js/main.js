/*globals window, document, DatasetFilter, DatasetChart, _, jQuery, d3, ko*/

var DatavizTurismo;

;(function(global, document, $, d3, ko){

  'use strict';

  DatavizTurismo = global.DatavizTurismo = global.DatavizTurismo || {};

  DatavizTurismo.$slider = $('#slider');

  DatavizTurismo.sliderOptions = {
    min:0,
    max:100,
    step:1,
    orientation:'vertical',
    tooltip:'show',
    handle:'round',
    selection:'after',
    formater:function(v){
      return DatavizTurismo.convertSliderValue(v)+'%';
    }
  };

  DatavizTurismo.headers = [];

  DatavizTurismo.data = [];

  DatavizTurismo.map;

  DatavizTurismo.rankingLimit = 3;

  DatavizTurismo.$twitterButton = $('.twitter');

  DatavizTurismo.$facebookButton = $('.facebook');

  DatavizTurismo.$googleButton = $('.gplus');

  DatavizTurismo.$text = $('.texto-resumen');

  DatavizTurismo.$orderSelectors = $('.filter-order');

  DatavizTurismo.$consultarBtn = $('#consultar');

  DatavizTurismo.$desdeBtn = $('#fecha-desde');

  DatavizTurismo.$hastaBtn = $('#fecha-hasta');

  DatavizTurismo.$filter = $('#filter');

  DatavizTurismo.$fullScreenBtb = $('#full-screen-btn');

  DatavizTurismo.filter = new DatasetFilter();

  DatavizTurismo.bindings = {};

  var FilterOption = function(name, id, icon) {
    this.name = name;
    this.id = id;
    this.icon = icon;
  };

  DatavizTurismo.init = function () {
    //Init map
    DatavizTurismo.map = d3.datavizTurismo('map-container',$('#map-container').width(),DatavizTurismo.retrieveData);

    //Init button
    DatavizTurismo.$filter.on('change',DatavizTurismo.filterData);
    DatavizTurismo.$twitterButton.on('click',DatavizTurismo.shareTwitter);
    DatavizTurismo.$facebookButton.on('click',DatavizTurismo.shareFacebook);
    DatavizTurismo.$googleButton.on('click',DatavizTurismo.shareGoogle);
    DatavizTurismo.$fullScreenBtb.on('click',DatavizTurismo.fullScreen);

    var months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    $('#dateSelector').dateRangeSlider({
      bounds: {
        min: new Date(2012, 0, 1),
        max: new Date(2012, 11, 30)
      },
      defaultValues: {
        min: new Date(2012, 4, 1),
        max: new Date(2012, 7, 31)
      },
      arrows: true,
      step:{
        months: 1
      },
      formatter: function(val) {
        var month = val.getMonth() + 1;
        var year = val.getFullYear();

        return month + '-' + year;
      },
      scales: [{
        next: function(value) {
          var next = new Date(value);
          return new Date(next.setMonth(value.getMonth() + 1));
        },
        label: function(value) {
          return months[value.getMonth()];
        },
        format: function(tickContainer, tickStart, tickEnd) {
          tickContainer.addClass('month');
        }
      }]
    });

    $('#dateSelector').bind('valuesChanged', function(e, data) {
      var start = (data.values.min.getMonth() + 1) + '-' + data.values.min.getFullYear();
      var end   = (data.values.max.getMonth() + 1) + '-' + data.values.max.getFullYear();

      DatavizTurismo.$desdeBtn.val(start);
      DatavizTurismo.$hastaBtn.val(end);
      DatavizTurismo.filterData();
    });

    DatavizTurismo.$filter.selectpicker();

    global.m = 0;
    $('#play').click(function() {

      if($(this).hasClass('playing')) {
        $(this).removeClass('playing').html('&#9658');
        global.clearInterval(global.interval);
      } else {
        $(this).addClass('playing').html('&#9689;');

        global.interval = global.setInterval(function() {

          $('#dateSelector').dateRangeSlider('values', new Date(2012, global.m, 1), new Date(2012, global.m, 27));

          if (global.m < 10) {
            global.m++;
          } else {
            global.m = 0;
          }

        }, 300);
      }

    });

  };

  DatavizTurismo.retrieveData = function(){

    $.getJSON('data/ocupacion_hotelera.json', function(j){
      DatavizTurismo.data = j.rows;
      DatavizTurismo.filter.setDataset(j.rows);
      DatavizTurismo.filterData();
    });

  };

  DatavizTurismo.filterData = function(){
    var filter = DatavizTurismo.filter;
    var j = filter.filter(
      DatavizTurismo.$desdeBtn.val(),
      DatavizTurismo.$hastaBtn.val()
    );

    var filterField = DatavizTurismo.$filter.val(),
        limit = DatavizTurismo.rankingLimit;

    // agregamos el campo valor con el filterField especificado
    _.each(j, function(row) {
      row.valor = row[filterField];
    });

    DatavizTurismo.topRanking = filter.ranking(j, filterField, 'desc', limit);
    DatavizTurismo.botttomRanking = filter.ranking(j, filterField, 'asc', limit);

    DatavizTurismo.updateMap(j);

    DatasetChart.graph(DatavizTurismo.topRanking);
  };

  DatavizTurismo.fullScreen = function() {
    var el = document.documentElement,
        rfs =
          el.requestFullScreen ||
          el.webkitRequestFullScreen ||
          el.mozRequestFullScreen
    ;
    rfs.call(el);
  };

  DatavizTurismo.getLocation = function(href) {
    var l = document.createElement('a');
    l.href = href;
    return l;
  };

  DatavizTurismo.shareTwitter = function(e){
    e.preventDefault();
    var qObj = {
      'text': DatavizTurismo.$text.text(),
      'related': 'palamago,lndata',
      'hashtags': 'argentina,censo,paisFederal'
    };

    var qs = $.param(qObj);

    var width  = 575,
      height = 400,
      left   = ($(window).width()  - width)  / 2,
      top    = ($(window).height() - height) / 2,
      url    = this.href + '?' + qs,
      opts   = 'status=1' +
           ',width='  + width  +
           ',height=' + height +
           ',top='    + top    +
           ',left='   + left;

    window.open(url, 'Twitter', opts);

    return false;
  };

  DatavizTurismo.shareFacebook = function(e){
    e.preventDefault();
    var qs =
      '&p[url]='+window.location+
      '&p[title]='+'Argentina, un país POCO federal...'+
      '&p[images][0]='+window.location+'img/share.png'+
      '&p[summary]='+DatavizTurismo.$text.text();

    var width  = 575,
      height = 400,
      left   = ($(window).width()  - width)  / 2,
      top    = ($(window).height() - height) / 2,
      url    = this.href+qs,
      opts   = 'status=1' +
           ',width='  + width  +
           ',height=' + height +
           ',top='    + top    +
           ',left='   + left;

    window.open(url, 'Facebook', opts);

    return false;
  };

  DatavizTurismo.shareGoogle = function(e){
    e.preventDefault();
    var qs = 'url=' + window.location;

    var width  = 575,
      height = 400,
      left   = ($(window).width()  - width)  / 2,
      top    = ($(window).height() - height) / 2,
      url    = this.href + '?' + qs,
      opts   = 'status=1' +
           ',width='  + width  +
           ',height=' + height +
           ',top='    + top    +
           ',left='   + left;

    window.open(url, 'Google+', opts);

    return false;
  };

  DatavizTurismo.updateMap = function(cities) {
    var $filter = DatavizTurismo.$filter;
    DatavizTurismo.map.update(
      cities, $filter.val(), $filter.find(':selected').text()
    );
  };

  DatavizTurismo.dotSeparateNumber = function(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+'.'+'$2');
    }
    return val;
  };

})(window, document, jQuery, d3, ko);

window.onload = function() {
  DatavizTurismo.init();
};
