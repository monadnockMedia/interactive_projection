/**
 * Created by scott on 6/12/14.
 */

window.iprojConfig;

configFile = process.env.HOME+"/exhibit/iproj.json";

try{
	//user config
	window.iprojConfig = require(configFile);
}catch(e){
	//defaults
	window.iprojConfig = require("./iproj.json")
}
console.log("config loaded", window.iprojConfig);
path = window.iprojConfig.dbPath;

var ds = new Datasource(path);

ds.setup().then(
    function(defs){
        d3.select("body").append("div").attr("id", FREDChart.wrapperDivId);

        $("body").plainOverlay({
            fillColor: "green",
            //progress: function() { return $('<img src="images/wait.gif"/>'); }
        });

        var menu = d3.select("#"+FREDChart.wrapperDivId).append("div").attr("id", FREDChart.menuDivId);

        d3.select("#"+FREDChart.wrapperDivId).append("div").attr("id", FREDChart.chartDivId);
        var chartElemSelector = "#"+FREDChart.chartDivId;

        var cat = menu.selectAll("div").data(Object.keys(defs)).enter().append("h3").text(function(d){return d});

        cat.append("div").attr("class", "accord-items")
            .selectAll("p").data(function(d){return defs[d]}).enter()
            .insert("p")
            .on("click", function (d, i) {
				$("p").removeClass("selected");
				$(this).addClass("selected");
				console.log("Add Selected");
                console.log(d.chart_type + " " + d.category + " " + i);
                $("body").plainOverlay("show");
                console.log("modal show");
                selectChart(chartElemSelector, defs, d.chart_type, d.region_type, d.category, i);
            })
            .text(function(d){return d.chart_name});


        var items = $(".accord-items").detach();
        var headers = $("h3");

        $.each( headers, function( i, val ) {
            $(headers[i]).after(items[i]);
        });


//        $( "p" ).on( "click", function() {
//            $("p").removeClass("selected");
//            $(this).addClass("selected");
//            console.log($(this).prop("__data__")); //this is the definition, to pass to db.js function
//        });


        $( "#accordion" ).accordion({
            heightStyle: "content",
            collapsible: true
        });
    }
);

var selectChart = function(chartElemSelector, defs, chartType, regionType, category, chartIndex) {
    // turn on wait screen
    //$.blockUI();//{ message: '<img src="images/wait.gif" />' });
    //var alert = $.fn.jAlert({"message":"test"});
//    console.log("modal open");


    var regionMetadata = ds.placeKey[regionType];
    switch (chartType) {
        case "line": // TBD: no data def yet
            var defTimeline = defs[category][+chartIndex]; // line
            ds.get(defTimeline).then(
                function (dataTimeline) {
                    $("body").plainOverlay("hide");
                    console.log("modal hide");
                    new FREDTimeline.init(chartElemSelector, defTimeline, dataTimeline, regionMetadata);
                });
            break;
        case "scatter":
            var defScatter = defs[category][+chartIndex]; // scatter
            ds.get(defScatter).then(
                function (dataScatter) {
                    $("body").plainOverlay("hide");
                    console.log("modal hide");
                    new FREDScatterPlot.init(chartElemSelector, defScatter, dataScatter.scatter, regionMetadata);
                });
            break;
        case "usmap":
            var defUSMap = defs[category][+chartIndex]; // usmap
            ds.get(defUSMap).then(
                function (dataUSMap) {
                    $("body").plainOverlay("hide");
                    console.log("modal hide");
                    new FREDUSMap.init(chartElemSelector, defUSMap, dataUSMap.usmap);
                });
            break;
        case "worldmap":
            var defWorldMap = defs[category][+chartIndex]; // worldmap
            ds.get(defWorldMap).then(
                function (dataWorldMap) {
                    $("body").plainOverlay("hide");
                    console.log("modal hide");
                    new FREDWorldMap.init(chartElemSelector, defWorldMap, dataWorldMap.worldmap);
                });
            break;
        default:
            $("body").plainOverlay("hide");
            console.log("Error: unknown chart type" + def.chart_type);
    }
}