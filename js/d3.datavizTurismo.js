d3.datavizTurismo = function(containerId,width,cb) {

  //Init vars
  var height=750,
    centered,
    projection,
    path,
    mapa_svg,
    mainGroup,
    departamentos,
    provincias,
    legend,
    gran_buenos_aires,
    gran_buenos_aires_mesh,
    svg,
    mini_svg,
    AMBA_IDS = ["D02003", "D02004", "D02011", "D02017", "D02035", "D02036", "D02132", "D02038", "D02051", "D02052", "D02134", "D02133", "D02129", "D02061", "D02063", "D02062", "D02070", "D02130", "D02075", "D02077", "D02079", "D02080", "D02089", "D02128", "D02092", "D02105", "D02106", "D02053", "D02109", "D02113", "D02118", "D02122", "CAPFED"],
    scale,
    tooltip,
    ciudades,
    centered,
    zoom;

  function _init() {
    _createMap();
    _createTooltip();
    _createPath();
  };

  function _createTooltip() {
    //Crea el tooltip
    tooltip = d3.select("body").append("div")
                .attr("id", "tooltip")
                .style("opacity", 0);

    svg.on("mousemove", mousemove);

    function mousemove() {
      tooltip.style("left", (d3.event.pageX + 20) + "px").style("top", (d3.event.pageY - 30) + "px");
    }
  }

  function _createMap() {

    svg = d3.select('#'+containerId).append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("class", "poblacion");

  };

  function _getName(e) {
    return e.replace(/\s+/g, "-").toLowerCase()
  };

  function zoomed() {
    mapa_svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  };

  function _createPath() {
    scale = d3.geo.mercator().scale(900).center([-65, -34]).translate([width / 2 - 30, height / 2 - 125]);
    projection = scale;
    path = d3.geo.path().projection(scale);

    d3.json(window.location.pathname+"data/argentina.json", function(error, e) {

        zoom = d3.behavior.zoom()
          .translate([0, 0])
          .scale(1)
          .scaleExtent([1, 8])
          .on("zoom", zoomed);

        svg.call(zoom).on("zoom", zoomed);

        //mapa
        mapa_svg = svg.append("g").classed("mapa", !0).attr("transform", "translate(0, 0)");

        departamentos = mapa_svg.append("g").attr("class", "departamentos");
        provincias = mapa_svg.append("g").attr("class", "provincias");
        legend = svg.append("g").attr("class", "legend");

        ciudades = mapa_svg.append("g").attr("class", "ciudades");

        var featuresProvincias = topojson.feature(e, e.objects.provincias).features,
            featuresDepartamentos = topojson.feature(e, e.objects.departamentos).features;

        provincias.selectAll("path")
          .data(featuresProvincias)
          .enter()
          .append("path")
          .attr("id", function (e) {
              return _getName(e.properties.PROVINCIA)
          })
          .attr("d", path)
          .attr("class", "provincia");


        gran_buenos_aires = departamentos.append("g")
          .attr("class", "gran-buenos-aires");

        gran_buenos_aires_mesh = topojson.mesh(e, {
            type: "GeometryCollection",
            geometries: e.objects.departamentos.geometries.filter(function (e) {
                return AMBA_IDS.indexOf(e.id) !== -1
            })
        });

        featuresProvincias.forEach(function (e) {
            var r = _getName(e.properties.PROVINCIA);
            departamentos.append("g")
            .attr("id", "provincia-" + r)
              .selectAll("path")
              .data(featuresDepartamentos.filter(function (e) {
                return r === _getName(e.properties.p_id) && AMBA_IDS.indexOf(e.id) == -1;
              }))
              .enter()
              .append("path")
              .attr("id", function (e) {
                  return e.id;
              })
              .attr("d", path)
              .attr("class", "departamento")
        });

        departamentos.select("g#provincia-buenos-aires")
          .append("g")
          .attr("id", "gran-buenos-aires")
          .selectAll("path")
          .data(featuresDepartamentos.filter(function (e) {
              return AMBA_IDS.indexOf(e.id) !== -1
          }))
          .enter()
          .append("path")
          .attr("id", function (e) {
              return e.id
          })
          .attr("d", path)
          .attr("class", "departamento");

         //Tooltip
        var m = mapa_svg.selectAll("path.departamento");

          m.on("mouseover", function(d) {
              var innerHTML = d.properties.a + '<br/><strong>' + d.properties.p + '</strong>';
              tooltip.transition()
                     .duration(100)
                     .style("opacity", .9)

              tooltip.html(innerHTML);
              $(this)[0].classList.add("hover");
          })
          .on("mouseout", function(d) {
              $(this)[0].classList.remove("hover");
              tooltip.transition()
                      .duration(200)
                      .style("opacity", 0);
          });

        //callback
        cb();

    });

  };

  _init();

  return {
   
    update: function(ciudades,field,name){

      if(ciudades.length === 0) {
        return;
      }

      var r = d3.scale.linear()
      .range([0, 100])
      .domain([
        d3.min(ciudades, function(d) { return d[field]; }),
        d3.max(ciudades, function(d) { return d[field]; })
        ]);

      var group = svg.selectAll('g.ciudades');

      var circulos = group
      .selectAll('circle.ciudad')
      .data(ciudades)
      .enter()
      .append("circle")
      .attr("id", function(d){
        return d.ciudad;
      })
      .attr("class", "ciudad")
      .attr("transform", function(d) {
        return "translate(" + projection([d.lon,d.lat]) + ")";
      });

      svg.selectAll('circle.ciudad')
      .on("mouseover", function(d) {
              var innerHTML = d.ciudad + '<br/><strong>' + name + '<br/>' + DatavizTurismo.dotSeparateNumber(d[field]) + '</strong>';        
              tooltip.transition()        
                     .duration(100)      
                     .style("opacity", .9)

              tooltip.html(innerHTML);
              $(this)[0].classList.add("hover");
          })
          .on("mouseout", function(d) {
              $(this)[0].classList.remove("hover");
              tooltip.transition()        
                      .duration(200)      
                      .style("opacity", 0);   
          })
      .transition(500)
      .attr("r",function(d){
        return r(d[field]);
      });

    }

  }

}
