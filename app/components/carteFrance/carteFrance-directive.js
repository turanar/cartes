'use strict';

angular.module('myApp.carteFrance.carteFrance-directive', ['d3.promise']).
directive('carteFrance', ['d3Promise', function(d3Promise) {
	var isFrance = false;
	
	function build_map(scope, element, attrs) {
    	var previous = d3.select("#carte-svg");
    	previous.remove();
    	
		var isFrance = false;
		if(scope.region === undefined || scope.region == "") {
    		isFrance = true;
    		var url = "/files/france.topo.json";
    		d3.select('#backBtn').attr('style', 'display:none');
    	} else {
    		var url = "/files/regions/region-" + scope.region + ".topo.json";
    		d3.select('#backBtn').attr('style', '');
    	}
    	var width = scope.width, height = scope.height;
        var promise = d3Promise.json(url);
        
        var mouseover = function(element, d, i) {
        	d3.select(element).attr('fill', '#ff8080');
        };
        
        var mouseout = function(element, d, i) {
        	d3.select(element).attr('fill', '#c0c0ff');
        };
        
    	promise.then(function(data) {
        	var regions = topojson.feature(data, (isFrance) ? data.objects.france : data.objects.zones);
        	
        	// Calcul du meilleur scale et center en fonction du contenu du topojson
            var projection = d3.geo.conicConformal().scale(1);
            var path = d3.geo.path().projection(projection);
			var bbox_path = path.bounds(regions);
            var scale = 0.95 / Math.max((bbox_path[1][0] - bbox_path[0][0]) / width,(bbox_path[1][1] - bbox_path[0][1]) / height);
            var bbox_feature = d3.geo.bounds(regions);
            var center = [(bbox_feature[1][0] + bbox_feature[0][0]) / 2,(bbox_feature[1][1] + bbox_feature[0][1]) / 2];
            
            // Appliquer le scale et le center a la projection
            projection.scale(scale)
              .center(center)
              .translate([width/2, height/2]);
            
            var div = d3.selectAll(element).append("div")
            	.style({
            		"padding":"6px",
            		"width":((width/1)+12)+"px",
            		"height":((height/1)+12)+"px"
            	})
            	.attr('id', 'carte-svg');
            console.log(div);
            // Creation de l'element SVG
            var svg = div.append("svg")
				.attr("width", width)
				.attr("height", height);
            
            // Creation des zones
            svg.selectAll(".zones")
	            .data(regions.features)
	            .enter().append("path")
	            .attr("data-code-region", function(d) {return d.id })
	            .attr('fill', '#c0c0ff')
	            .attr('stroke', 'white')
	            .attr('stroke-width', '1.0')
	            .attr('style','cursor:pointer;')
	            .attr("d", path)
	            .on('mouseover', function(d, i) {
	            	mouseover(this, d, i);
	            })
	            .on('mouseout', function(d, i) {
	            	mouseout(this, d, i);
	            })
	            .on('click', function(d, i) {
	            	if(isFrance) {
	            		isFrance = false;
	            		d3.select("#carte-svg").remove();
	            		scope.region = d.id;
	            		build_map(scope, element, attrs);
	            	}
	            })
	            .append("title").text(function (d) { return (isFrance) ? d.properties.NOM_REG : d.properties.LIB_ZE2010; });	
            
            if(!isFrance) {
	            // Creation des libelles
	            svg.selectAll("text")
					.data(regions.features)
					.enter().append("text")
					.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
					.attr("dy", ".35em")
					.attr("class","carteRegionLabel")
					.style({"pointer-events": "none", "text-anchor": "middle"})
					.html(function(d) {	return d.properties.LIB_ZE2010; });	
            }
        });	        	
    };	
	
    function link(scope, element, attrs) {
    	var item = angular.element(element);
    	var div = angular.element('<div />').attr('style','padding:5px');
    	var anchor = angular.element('<a id="backBtn" style="display:none" class="btn btn-default"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span> Retour</a>');
    	div.append(anchor);
    	item.append(div);
    	anchor.on('click', function(){
    		scope.region = "";
    		build_map(scope, element, attrs);
    	});
    	build_map(scope, element, attrs);
    };
    
	return {
	    restrict: 'A',
	    scope: {width:'@', height:'@', region:'@'},
	    link: link
	}
}]);
