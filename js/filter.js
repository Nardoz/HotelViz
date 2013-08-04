

var DatasetFilter = function() {

  var dataset = {};

  this.setDataset = function(d) {
    dataset = d;
  }

  this.filter = function(dateFrom, dateTo) {

    var data = [];

    if(dateFrom.split('-').length != 2) {
      console.error('Invalid start date: ' + dateFrom);
      return data;
    }

    if(dateTo.split('-').length != 2) {
      console.error('Invalid end date: ' + dateTo);
      return data;
    }

    var monthFrom = dateFrom.split('-')[0];
    var yearFrom  = dateFrom.split('-')[1];

    var monthTo = dateTo.split('-')[0];
    var yearTo  = dateTo.split('-')[1];

    var filtered = _.filter(dataset, function(item) {
      return (item.anio >= yearFrom && item.mes >= monthFrom) && (item.anio <= yearTo && item.mes <= monthTo);
    });

    var groupedByCity = _.groupBy(filtered, function(item) {
      return item.ciudad;
    });

    _.each(groupedByCity, function(city) {

      var reduced = _.reduce(city, function(memo, item) {

        var memo2 = _.clone(memo);

        memo2.habitaciones_disp = memo2.habitaciones_disp + item.habitaciones_disp;
        memo2.habitaciones_ocup = memo2.habitaciones_ocup + item.habitaciones_ocup;
        memo2.plazas_disp       = memo2.plazas_disp + item.plazas_disp;
        memo2.plazas_ocup       = memo2.plazas_ocup + item.plazas_ocup;
        memo2.establecimientos  = memo2.establecimientos + item.establecimientos;
        memo2.viajeros          = memo2.viajeros + item.viajeros;
        memo2.estadiaAcum       = memo2.estadiaAcum + item.estadia;
        memo2.estadiaCount      = memo2.estadiaCount + 1;
        memo2.lat               = item.lat;
        memo2.lon               = item.lon;
        memo2.anio              = item.anio;
        memo2.mes               = item.mes;
        memo2.provincia         = item.provincia;
        memo2.ciudad            = item.ciudad;

        return memo2;
      },{
        establecimientos: 0,
        estadiaCount: 0,
        estadiaAcum: 0,
        estadia: 0,
        habitaciones_disp: 0,
        habitaciones_ocup: 0,
        plazas_disp: 0,
        plazas_ocup: 0,
        viajeros: 0,
        lat: 0,
        lon: 0,
        anio: 0,
        mes: 0,
        provincia: '',
        ciudad: ''
      });

      reduced.estadia = reduced.estadiaAcum / reduced.estadiaCount;

      data.push(reduced);

    });

    return data;

  }

};
