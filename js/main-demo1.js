window.onload = function(){
    
    var w = 900, h = 500;

    var container = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "container")
        .style("background-color", "rgba(0,0,0,0.2)");
    
    var innerRect = container.append("rect")
        .datum(400)
        .attr("width", function(d){
            return d * 2;
        })
        .attr("height", function(d){
            return d;
        })
        .attr("class", "innerRect")
        .attr("x", 50)
        .attr("y", 50)
        .style("fill", "#FFFFFF");
     
    var cityPop = [
        { 
            city: 'New York City',
            population: 8175133
        },
        {
            city: 'Los Angeles',
            population: 3792621
        },
        {
            city: 'Chicago',
            population: 2695598
        },
        {
            city: 'Houston',
            population: 2099451
        }
    ];
    
    var x = d3.scaleLinear()
        .range([120, 710])
        .domain([0, 3]);
    
    var minPop = d3.min(cityPop, function(d){
        return d.population;
    })
    
    var maxPop = d3.max(cityPop, function(d){
        return d.population;
    })
    
    var y = d3.scaleLinear()
        .range([450, 50])
        .domain([0, 9500000]);
    
    var color = d3.scaleLinear()
        .range([
            "#FDBE85",
            "#D94701"
        ])
        .domain([
            minPop,
            maxPop
        ]);
    
    var circles = container.selectAll(".circles")
        .data(cityPop)
        .enter()
        .append("circle")
        .attr("class", "circles")
        .attr("id", function(d){
            return d.city;
        })
        .attr("r", function(d){
            var area = d.population * 0.001;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d,i){
            return x(i);
        })
        .attr("cy", function(d){
            return y(d.population);
        })
        .style("fill", function(d){
            return color(d.population);
        })
        .style("stroke", "#000");
    
    var yAxis = d3.axisLeft(y);
    
    var axis = container.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(50, 0)")
        .call(yAxis);
    
    var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("City Populations");
    
    var labels = container.selectAll(".labels")
        .data(cityPop)
        .enter()
        .append("text")
        .attr("class", "labels")
        .attr("text-anchor", "left")
        .attr("y", function(d){
            return y(d.population) -2;
        });
    
    var nameLine = labels.append("tspan")
        .attr("class", "nameLine")
        .attr("x", function(d,i){
            return x(i) + Math.sqrt(d.population * 0.0015 / Math.PI) + 2;
        })
        .text(function(d){
            return d.city;
        });
    
    var format = d3.format(",");
    
    var popLine = labels.append("tspan")
        .attr("class", "popLine")
        .attr("x", function(d,i){
            return x(i) + Math.sqrt(d.population * 0.0015 / Math.PI) + 2;
        })
        .attr("dy", "15")
        .text(function(d){
            return "Pop. " + format(d.population);
        });
        
};
