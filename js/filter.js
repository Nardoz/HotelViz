/*globals _*/

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

    var monthFrom = parseInt(dateFrom.split('-')[0]);
    var yearFrom  = parseInt(dateFrom.split('-')[1]);

    var monthTo = parseInt(dateTo.split('-')[0]);
    var yearTo  = parseInt(dateTo.split('-')[1]);

    var filtered = _.filter(dataset, function(item) {
      return (
        (parseInt(item.anio) >= yearFrom  && parseInt(item.mes) >= monthFrom) &&
        (parseInt(item.anio) <= yearTo    && parseInt(item.mes) <= monthTo)
      );
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
        memo2.estadia           = memo2.estadia + item.estadia;
        memo2.lat               = item.lat;
        memo2.lon               = item.lon;
        memo2.anio              = item.anio;
        memo2.mes               = item.mes;
        memo2.provincia         = item.provincia;
        memo2.ciudad            = item.ciudad;

        return memo2;
      },{
        establecimientos: 0,
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

      /*
        totals is an object with the totals of several values
        calculateAverage transforms these totals in averages
        counting the non-empty items
       */
      var calculateAverage = function(data, totals, fields) {

        totals = _.clone(totals);

        if (_.isString(fields)) fields = fields.split(',');
        if (! _.isArray(fields)) fields = [fields];

        _.each(fields, function(field) {
          var count = _.filter(data, function(row) {
            return row[field] !== undefined;
          }).length;

          totals[field] = parseFloat((totals[field] / count).toFixed(2));
        });

        return totals;
      };

      reduced = calculateAverage(city, reduced, 'establecimientos,estadia');

      data.push(reduced);
    });

    return data;

  };

  this.ranking = function(data, field, sortOrder, limit) {

    sortOrder = (sortOrder || 'desc').toLowerCase();
    limit = limit || 5;

    var sorted = _.sortBy(data, function(row) {
      return row[field];
    });

    if (sortOrder === 'desc') sorted = sorted.reverse();

    sorted = sorted.slice(0, limit);

    return sorted;
  };

};
