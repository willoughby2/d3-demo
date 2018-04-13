(function(){
    
    var attrArray = ["obesitynum2004", "obesityper2004", "obesitynum2013", "obesityper2013", "diabetesnum2004", "diabetesper2004", "diabetesnum2013", "diabetesper2013", "inactivitynum2004", "inactivityper2004", "inactivitynum2013", "inactivityper2013"];
    var expressed = attrArray[3];
    
    function setMap() {
    
        var width = 960,
            height = 460;
    
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);
    
        var projection = d3.geoAlbers()
            .center([-24, 47.3])
            .parallels ([-47, 47.5])
            .scale(6500)
            .translate([width / 2, height / 2]);
    
        var path = d3.geoPath()
            .projection(projection);
    
        d3.queue()
            .defer(d3.csv, "data/wa_obesity_data.csv")
            .defer(d3.json, "data/washington.topojson")
            .await(callback);
    
        function callback (error, csvData, washington) {
            
            var washingtonCounties = topojson.feature(washington,   washington.objects.washington).features;
        
            washingtonCounties = joinData(washingtonCounties, csvData);
            
            var colorScale = makeColorScale(csvData);
        
            setEnumerationUnits(washingtonCounties, map, path, colorScale);
        }
    }

    function joinData(washingtonCounties, csvData){

        for (var i=0; i<csvData.length; i++){
            var csvCounties = csvData[i];
            var csvKey = csvCounties.countyfp;
        
            for (var a=0; a<washingtonCounties.length; a++){
                var geojsonProps = washingtonCounties[a].properties;
                var geojsonKey = geojsonProps.countyfp;
            
                if (geojsonKey == csvKey){
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvCounties[attr]);
                        geojsonProps[attr] = val;
                    })
                }
            }
        }
        
        return washingtonCounties;
    }
    
    function setEnumerationUnits(washingtonCounties, map, path, colorScale){
        
        var counties = map.selectAll(".counties")
            .data(washingtonCounties)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "counties" + d.properties.countyfp;
            })
            .attr("d", path)
            .style("fill", function(d){
                return colorScale(d.properties[expressed]);
            })
            .style("fill", function(d){
                return choropleth(d.properties, colorScale)
            });

    }
    
    function makeColorScale(data){
        var colorClasses = [
            "#D4B9DA",
            "#C994C7",
            "#DF65B0",
            "#DD1C77",
            "#980043"
        ];
        
        var colorScale = d3.scaleThreshold()
            .range(colorClasses);
        
        var domainArray = [];
        for (var i=0; i<data.length; i++){
            var val = parseFloat(data[i][expressed]);
            domainArray.push(val);
        };
        
        var clusters = ss.ckmeans(domainArray, 5);
        
        domainArray = clusters.map(function(d){
            return d3.min(d);
        })
        
        domainArray.shift();
        
        colorScale.domain(domainArray);
        
        return colorScale;
        
    }
    
    function choropleth(props, colorScale){
        var val = parseFloat(props[expressed]);
        
        if (typeof val == 'number' && !isNaN(val)){
            return colorScale(val);
        }
        else {
            return "#CCC";
        }
    }

window.onload = setMap();
    
})();