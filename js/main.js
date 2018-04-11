window.onload = setMap();

function setMap(){
    
    var width = 960,
        height = 460;
    
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);
    
    var projection = d3.geoAlbers()
        .center([-120,47])
        .rotate([0,0,0])
        .parallels([40,60])
        .scale(2500)
        .translate([width / 2, height / 2]);
    
    var path = d3.geoPath()
        .projection(projection);
    
    d3.queue()
        .defer(d3.csv, "data/wa_obesity_data.csv")
        .defer(d3.json, "data/washington.topojson")
        .await(callback);
    
    function callback (error, csvData, washington) {
        var washingtonCounties = topojson.feature(washington, washington.objects.washington).features;
        
        var counties = map.selectAll("counties")
            .data(washingtonCounties)
            .enter()
            .attr("class", function(d){
                return "counties " + d.properties.countyfp;
            })
            .attr("d", path);
    };
}