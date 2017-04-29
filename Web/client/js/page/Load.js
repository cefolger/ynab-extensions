yext.page.Load = ((() => {
	var storedData = {}; 
	var transactionsByCategory; 
	var dateBounds; 
	
	var splitFile = data => {
		// split file into array of lines
		lines = data.split('\n');
		
		var monthlyBudgets = yext.transforms.YnabTransform.monthlyBudgets(lines);
		var budgetsWithCategories = yext.transforms.YnabTransform.masterCategories(monthlyBudgets);
		var budgetsWithSubCategories = yext.transforms.YnabTransform.subCategories(budgetsWithCategories);
		storedData = budgetsWithSubCategories; 
	}; 
	
	var splitBudgetFile = data => {
		lines = data.split('\n'); 
		transactionsByCategory = yext.transforms.YnabTransform.transactionsByCategory(lines);
		yext.transforms.YnabTransform.transactionsByLocation(lines); 
		storedIncomes =  yext.transforms.YnabTransform.monthlyIncomes(lines); 
		dateBounds = yext.transforms.YnabTransform.dateBounds(storedIncomes);
		storedData = yext.transforms.YnabTransform.budgetsWithIncomesAndExpenses(storedIncomes, storedData );
		storedData = yext.transforms.YnabTransform.categoriesWithCategoryBalances(storedData);
	}; 
	
	var generateStatTable = ($statRoot, $statUl, data, id) => {
		var $tpcStats = $('<div></div>').appendTo($statRoot);
		$tpcStats.attr('id', id); 
		$('<li><a href="#tpc">Transactions per category</a></li>').appendTo($statUl);
		var $tpcTable = $('<table><thead><tr><th>Name</th><th>Count</th></tr></thead><tbody></tbody>').appendTo($tpcStats);  
		$.each(data, (key, value) => {
			var $tr = $('<tr></tr>').appendTo($tpcTable);
			$tr.append( $('<td>' + value.name + '</td><td>' + value.value + '</td>')); 
		}); 
	}; 
	
	return {
		loadBudgetFile(fileInputObject, callback) {
			var file = fileInputObject.files[0]; 
			var reader = new FileReader(); 
			reader.onload = () => {
				splitFile(reader.result); 
				callback(); 
			}; 
			
			reader.readAsText(file); 
		}, 
		
		loadRegisterFile(fileInputObject, callback) {
			var file = fileInputObject.files[0]; 
			var reader = new FileReader(); 
			reader.onload = () => {
				splitBudgetFile(reader.result); 
				callback(); 
			}; 
			
			reader.readAsText(file); 
		},
		
		getDateBounds() {
			return dateBounds; 
		},
		
		getData() {
			return storedData; 
		},
		
		selectMonth(monthString) {
			$('#budget-usage').empty(); 
			$('#allocations').empty(); 
			$('#spendingtrends').empty(); 
			$('#categorybalancetrends').empty(); 
			$('#runningbalance').empty(); 
			$('#graph').empty(); 
			
			var dataBounds = yext.page.Load.getDateBounds(); 
			var data = yext.transforms.GraphTransform.spendingAsPercentageOfIncomeMasterCategories(yext.page.Load.getData()[monthString].masterCategories,yext.page.Load.getData()[monthString].income	);
			var budgetUsage = new yext.graph.BudgetUsageGraph( $('#budget-usage')).plot( yext.transforms.GraphTransform.currentBudgetUsage(yext.page.Load.getData()[monthString]) ); 
			
			new yext.graph.PieChart('allocations').plot(yext.transforms.GraphTransform.allocationPercentage(yext.page.Load.getData()[monthString]), 'Allocations to each master category');  
			var spendingData =  yext.transforms.GraphTransform.spendingTrendGraph(yext.page.Load.getData(), dateBounds[0][0], dateBounds[1][0], dateBounds[1][0], dateBounds[1][1]);
			new yext.graph.LineChart('spendingtrends').plot(spendingData.data, spendingData.labels, 'Spending over time for top 5 master categories'); 
			
			var categoryBalanceData = yext.transforms.GraphTransform.categoryBalancesOverTime(yext.page.Load.getData(), dateBounds[0][0], dateBounds[1][0], dateBounds[1][0], dateBounds[1][1]); 
			new yext.graph.LineChart('categorybalancetrends').plot(categoryBalanceData.data, categoryBalanceData.labels, 'Cumulative category balances over time for top 5 master categories');
			
			var totalSpendingData = yext.transforms.GraphTransform.spendingPerCategoryOverTime(yext.page.Load.getData(), dateBounds[0][0], dateBounds[1][0], dateBounds[1][0], dateBounds[1][1]);
			new yext.graph.LineChart('runningbalance').plot(totalSpendingData.data, totalSpendingData.labels, 'Cumulative spending each month for top 5 master categories');
			
			new yext.graph.PieChart('graph').plot(data, 'Outflows as a percentage of total income'); 
			
			$('#stats').find('div').remove();
			var $statRoot = $('<div></div>').appendTo($('#stats')); 
			var $statUl =  $('<ul></ul>').appendTo($statRoot); 
			
			generateStatTable($statRoot, $statUl,yext.transforms.StatTransform.transactionsPerCategory(transactionsByCategory), 'tpcStats' ); 
			
			$statRoot.tabs(); 
		}
	};
}))(); 

$(document).ready(() => {
	$('#load').click(() => {
		yext.page.Load.loadBudgetFile( $('#import')[0], () => {
			yext.page.Load.loadRegisterFile( $('#import-register')[0], () => {
	           $("#graph").bind('jqplotDataHighlight', (ev, seriesIndex, pointIndex, data) => {
	              $('#tooltip').show(); 
	              $('#tooltip').text(data[0] + ' : $' + data[1].toFixed(2)); 
	              $('#tooltip').offset({ left: ev.pageX, top: ev.pageY}); 
	           }); 
		
			   $("#graph").bind('jqplotDataUnhighlight', (ev, seriesIndex, pointIndex, data) => {
				   $('#tooltip').hide(); 
			   });

			   var $select = $('select[name=month]'); 
			   $select.change(function() {
				   if($(this).val() === 'default') {
					   return; 
				   }
				   
				   yext.page.Load.selectMonth($(this).val()); 
				   $('#tabs').tabs(); 
			   }); 
			   
			   $.each(yext.page.Load.getData(), (key, value) => {
				   $select.append($('<option></option>', { value: key}).text(key));
				   
				   $select[0].selectedIndex = 1;
				   $select.change();
			   }); 
			   
		}); 
	}); 
}); 
}); 