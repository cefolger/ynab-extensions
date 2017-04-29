yext.graph.LineChart = function(graphTargetObjectId) {
	var target = graphTargetObjectId; 
	
	this.plot = (dataArray, labelArray, title) => {
        var plot1 = jQuery.jqplot (target, dataArray, 
        { 
        	 axes:{xaxis:{renderer:$.jqplot.DateAxisRenderer}},
      	  title,      	  
            seriesColors: ['#EA5439', '#F3AD51', '#EBE598', '#74A9C6', '#C8DF68', '#8CA257', '#92C6B5'],
            legend: { show:true, location: 'e', labels: labelArray },
          }
        );
	}; 
}; 