(function() {
    
    var attrArray = ["obesityper2004", "obesityper2013", "diabetesper2004", "diabetesper2013", "inactivityper2004", "inactivityper2013"];
    var numArray = ["obesitynum2004", "obesitynum2013", "diabetesnum2004", "diabetesnum2013", "inactivitynum2004", "inactivitynum2013"];
    var expressed = attrArray[0];
    
    var chartWidth = window.innerWidth * 0.3,
        chartHeight = 460,
        topPadding = 35;
    
    var xScale = d3.scaleLinear()
            .range([0, chartWidth])
            .domain([0, 40]);
    
    window.onload = setMap();
    
    function setMap() {
    
        var width = window.innerWidth * .55,
            height = 500;
    
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);
            
    
        var projection = d3.geoAlbers()
            .center([-25, 47.25])
            .parallels([-47, 47.5])
            .scale(5500)
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
            
            setChart(csvData, colorScale);
            
            createDropdown(csvData);
        }
    }

    function joinData(washingtonCounties, csvData) {

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
        
        var county = map.selectAll(".county")
            .data(washingtonCounties)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "county " + d.properties.countyfp;
            })
            .attr("d", path)
            .style("fill", function(d){
                return choropleth(d.properties, colorScale);
            })
            .on("mouseover", function(d){
                highlight(d.properties);
            })
            .on("mouseout", function(d){
                dehighlight(d.properties);
            });
            
        var desc = county.append("desc")
            .text('{"stroke": "#000", "stroke-width": "0.5px"}');

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
    
    function setChart(csvData, colorScale){
        var chartWidth = window.innerWidth * 0.3,
            chartHeight = 460;
        
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", 500)
            .attr("class", "chart");
        
        var xScale = d3.scaleLinear()
            .range([0, chartWidth])
            .domain([0, 40]);
        
        var bars = chart.selectAll(".bars")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function(a,b){
                return b[expressed]-a[expressed];
            })
            .attr("class", function(d){
                return "bars " + d.countyfp;
            })
            .attr("height", chartHeight/ csvData.length - 1)
            .on("mouseover", highlight)
            .on("mouseout", dehighlight);
        
        var desc = bars.append("desc")
            .text('{"stroke": "none", "stroke-width": "0px"}');
            
        
        var chartTitle = chart.append("text")
            .attr("x", 0)
            .attr("y", 25)
            .attr("class", "chartTitle")
            .text("Percentage of " + expressed.slice(0, -7).toUpperCase() + " by County in " + expressed.slice(-4));
        
        updateChart(bars, csvData.length, colorScale);

    }
    
    function createDropdown(csvData){

        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, csvData)
            });


        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Attribute");


        var attrOptions = dropdown.selectAll("attrOptions")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    }
    
    function changeAttribute(attribute, csvData){
        expressed = attribute;
        
        var colorScale = makeColorScale(csvData);
        
        var county = d3.selectAll(".county")
            .transition()
            .duration(1000)
            .style("fill", function(d){
                return choropleth(d.properties, colorScale);
            });
        
        var bars = d3.selectAll(".bars")
            .sort(function(a, b){
                return b[expressed] - a[expressed];
            })
            .transition()
            .delay(function(d, i){
                return i *20;
            })
            .style("fill", function(d){
                return choropleth(d, colorScale);
            });
        
        updateChart(bars, csvData.length, colorScale)
    }
    
    function updateChart(bars, n, colorScale){
        bars.attr("y", function(d, i){
            return i * (chartHeight / n) + topPadding;
            })
            .attr("width", function (d, i){
                return xScale(parseFloat(d[expressed]));
            })
            .attr("x", 0)
            .style("fill", function(d, i){
                return choropleth(d, colorScale);
            });
        
        var chartTitle = d3.select(".chartTitle")
            .text("Percentage of " + expressed.slice(0, -7).toUpperCase() + " by County in " + expressed.slice(-4));
    }
    
    function highlight(props){

        var selected = d3.selectAll("." + props.countyfp)
            .style("stroke", "blue")
            .style("stroke-width", "2");
    }
    
    function dehighlight(props){
        var selected = d3.selectAll("." + props.countyfp)
            .style("stroke", function(){
                return getStyle(this, "stroke")
            })
            .style("stroke-width", function(){
                return getStyle(this, "stroke-width")
            });
        
        function getStyle(element, styleName){
            var styleText = d3.select(element)
                .select("desc")
                .text();
            
            var styleObject = JSON.parse(styleText);
            console.log(styleObject);
            
            return styleObject[styleName];
        }
    }
    
})();