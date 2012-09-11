yext.page.Load = (function() {
	var storedData = {}; 
	
	var splitFile = function(data) {
		// split file into array of lines
		lines = data.split('\n');
		
		var monthlyBudgets = yext.transforms.YnabTransform.monthlyBudgets(lines);
		var budgetsWithCategories = yext.transforms.YnabTransform.masterCategories(monthlyBudgets);
		var budgetsWithSubCategories = yext.transforms.YnabTransform.subCategories(budgetsWithCategories);
		storedData = budgetsWithSubCategories; 
	}; 
	
	var splitBudgetFile = function(data) {
		lines = data.split('\n'); 
		 storedIncomes =  yext.transforms.YnabTransform.monthlyIncomes(lines); 
		 storedData = yext.transforms.YnabTransform.budgetsWithIncomesAndExpenses(storedIncomes, storedData );
		 storedData = yext.transforms.YnabTransform.categoriesWithCategoryBalances(storedData);
	}; 
	
	return {
		loadBudgetFile: function(fileInputObject, callback) {
			var file = fileInputObject.files[0]; 
			var reader = new FileReader(); 
			reader.onload = function() {
				splitFile(reader.result); 
				callback(); 
			}; 
			
			reader.readAsText(file); 
		}, 
		
		loadRegisterFile: function(fileInputObject, callback) {
			var file = fileInputObject.files[0]; 
			var reader = new FileReader(); 
			reader.onload = function() {
				splitBudgetFile(reader.result); 
				callback(); 
			}; 
			
			reader.readAsText(file); 
		},
		
		getData: function() {
			return storedData; 
		},
		
		selectMonth: function(monthString) {
			$('#budget-usage').empty(); 
			$('#allocations').empty(); 
			$('#spendingtrends').empty(); 
			$('#categorybalancetrends').empty(); 
			$('#runningbalance').empty(); 
			$('#graph').empty(); 
			
			console.log(yext.page.Load.getData()); 
			
			var data = yext.transforms.GraphTransform.spendingAsPercentageOfIncomeMasterCategories(yext.page.Load.getData()[monthString].masterCategories,yext.page.Load.getData()[monthString].income	);
			var budgetUsage = new yext.graph.BudgetUsageGraph( $('#budget-usage')).plot( yext.transforms.GraphTransform.currentBudgetUsage(yext.page.Load.getData()[monthString]) ); 
			
			new yext.graph.PieChart('allocations').plot(yext.transforms.GraphTransform.allocationPercentage(yext.page.Load.getData()[monthString]), 'Allocations to each master category');  
			var spendingData =  yext.transforms.GraphTransform.spendingTrendGraph(yext.page.Load.getData(), '05', '9', '2012', '2012');
			new yext.graph.LineChart('spendingtrends').plot(spendingData.data, spendingData.labels, 'Spending over time for top 5 master categories'); 
			
			var categoryBalanceData = yext.transforms.GraphTransform.categoryBalancesOverTime(yext.page.Load.getData(), '05', '9', '2012', '2012'); 
			new yext.graph.LineChart('categorybalancetrends').plot(categoryBalanceData.data, categoryBalanceData.labels, 'Cumulative category balances over time for top 5 master categories');
			
			var totalSpendingData = yext.transforms.GraphTransform.spendingPerCategoryOverTime(yext.page.Load.getData(), '05', '9', '2012', '2012');
			new yext.graph.LineChart('runningbalance').plot(totalSpendingData.data, totalSpendingData.labels, 'Cumulative spending each month for top 5 master categories');
			
			new yext.graph.PieChart('graph').plot(data, 'Outflows as a percentage of total income'); 
		}
	}
})(); 

$(document).ready(function() {
	$('#load').click(function() {
		yext.page.Load.loadBudgetFile( $('#import')[0], function() {
			yext.page.Load.loadRegisterFile( $('#import-register')[0], function() {
	           $("#graph").bind('jqplotDataHighlight', function(ev, seriesIndex, pointIndex, data) {
	              $('#tooltip').show(); 
	              $('#tooltip').text(data[0] + ' : $' + data[1].toFixed(2)); 
	              $('#tooltip').offset({ left: ev.pageX, top: ev.pageY}); 
	           }); 
		
			   $("#graph").bind('jqplotDataUnhighlight', function(ev, seriesIndex, pointIndex, data) {
				   $('#tooltip').hide(); 
			   });
			   
			   var $select = $('select[name=month]'); 
			   $.each(yext.page.Load.getData(), function(key, value) {
				   $select.append($('<option></option>', { value: key}).text(key));
			   }); 
			   
			   $select.change(function() {
				   if($(this).val() === 'default') {
					   return; 
				   }
				   
				   yext.page.Load.selectMonth($(this).val()); 
				   $('#tabs').tabs(); 
			   }); 
		}); 
	}); 
}); 
}); 