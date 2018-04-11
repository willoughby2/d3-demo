window.onload = setMap();

function setMap(){
    
    d3.queue()
        .defer(d3.csv, "data/wa_obesity_data.csv")
        .defer(d3.json, "data/washington.topojson")
        .await(callback);
    
    function callback (error, csvData, washington) {
        console.log(csvData);
        console.log(washington);
    };
}