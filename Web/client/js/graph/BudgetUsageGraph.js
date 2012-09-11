yext.graph.BudgetUsageGraph = function(graphTarget) {
	var target = graphTarget; 
	var that = this; 
	
	/*	 
	 * input: object containing master categories and subcategories  
	 */
	this.plot = function(masterCategories) {
		var mainDiv = $('<div class="budget-usage-container"></div>').appendTo(target);
		var inProgress = false; 
		
		$.each(Object.keys(masterCategories), function(index, category) {
			var item = $('<div class="budget-progress-item"></div>').appendTo(mainDiv);
			var clickableSpan =$('<span class="budget-link">' + category + ': </span>');  
			item.append ( clickableSpan);
			
			var progressDiv = $('<div class="budget-progress-div"></div>').appendTo(item);
			var labelSpan = $('<span class="budget-progress-value">' + '$' + masterCategories[category].used + '</span>');
			labelSpan.appendTo(progressDiv); 
			
			progressDiv.progressbar({ value: masterCategories[category].percentage });
			
			clickableSpan.click(function() {
				if(inProgress) { 
					return; 
				}
				
				$('.sub-budget').remove(); 
				
				inProgress = true; 
				mainDiv.animate({width: '58%'}, function() {
					that.subplot(masterCategories[category]);
					inProgress = false; 
				}); 
				
				$(this).parent().parent().find('.budget-link').removeClass('highlighted-item');
				$(this).parent().parent().find('.ui-progressbar').removeClass('highlighted-item');
				$(this).addClass('highlighted-item');
				$(this).parent().find('.ui-progressbar').addClass('highlighted-item'); 
			}); 
		}); 
	}; 
	
	this.subplot = function(masterCategory) {
		var mainDiv = $('<div class="budget-usage-container sub-budget"></div>').insertBefore(target.find('.budget-usage-container')).hide();
		
		$.each(Object.keys(masterCategory), function(index, category) {
			if(category === 'total' || category === 'used' || category === 'percentage') { 
				return; // continue
			}
			
			var item = $('<div class="budget-progress-item"></div>').appendTo(mainDiv);
			item.append ( $('<span>' + category + ': </span>')); 
			
			var progressDiv = $('<div class="budget-progress-div"></div>').appendTo(item);
			var labelSpan = $('<span class="budget-progress-value">' + '$' + masterCategory[category].used + '</span>');
			labelSpan.appendTo(progressDiv); 
			
			progressDiv.progressbar({ value: masterCategory[category].percentage });
		}); 
		
		mainDiv.fadeIn('fast');
	}; 
}; 