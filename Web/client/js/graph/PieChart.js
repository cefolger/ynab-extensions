yext.graph.PieChart = function(graphTargetObjectId) {
	var target = graphTargetObjectId; 
	
	this.plot = function(data, title) {

        var plot1 = jQuery.jqplot (target, [data], 
        { 
      	  title: title,
            seriesDefaults: {
              // Make this a pie chart.
              renderer: jQuery.jqplot.PieRenderer, 
              rendererOptions: {
                // Put data labels on the pie slices.
                // By default, labels show the percentage of the slice.
                showDataLabels: true
              }
            },
            seriesColors: ['#EA5439', '#F3AD51', '#EBE598', '#74A9C6', '#C8DF68', '#8CA257', '#92C6B5'],
            legend: { show:true, location: 'e' }
          }
        );
        
        var targetObject = $('#' + target);
        var tooltip = $('<div class="pie-chart-tooltip"></div>').appendTo($('body')); 
        
        targetObject.bind('jqplotDataHighlight', function(ev, seriesIndex, pointIndex, data) {
        	tooltip.show(); 
        	tooltip.text(data[0] + ' : $' + data[1].toFixed(2)); 
        	tooltip.offset({ left: ev.pageX, top: ev.pageY}); 
        }); 
	
        targetObject.bind('jqplotDataUnhighlight', function(ev, seriesIndex, pointIndex, data) {
        	tooltip.hide(); 
	   });
	}; 
}; 