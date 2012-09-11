/**
 *   GraphTransform contains functions that take in budget data and transform it into data suitable for graphing
 */
yext.transforms.GraphTransform = (function() {
	/* allBudgets: object containing all monthly budgets
	 * start month/year and end month/year: date range to filter
	 * 
	 * output: an array of budgets that fit in the date range (pure function)  
	 */
	var monthRange = function(allBudgets, startMonth, endMonth, startYear, endYear) {
		// get data in range 
		var allBudgetsTemp = jQuery.extend(true, {}, allBudgets); // deep copy  
		var relevantBudgets = [];
		var startDate = new Date(startMonth + '/01/' + startYear);
		var endDate = new Date(endMonth + '/25/' + endYear); 
	
		// extract relevant budgets
		$.each(Object.keys(allBudgetsTemp), function(index, budgetName) {
			var budget = allBudgetsTemp[budgetName]; 
			budget.monthString = budgetName; 
			var budgetDate = new Date(budget.month + '/25/' + budget.year); 
			
			if(budgetDate >= startDate && budgetDate <= endDate) {
				relevantBudgets.push(budget); 
			}
		}); 
		
		return relevantBudgets; 
	}; 
	
	/**
	 *  allBudgets: object containing all monthly budgets
	 *  start month/year and end month/year: date range to consider
	 *  balanceFunction: function that takes in a subcategory and returns an amount to add to the master category's running total 
	 *  
	 *  output: 
	 *  object: {
	 *  	data: array of data points for the top 5 master categories
	 *  	labels: array of labels for the categories 
	 *  }
	 */
	var balanceOverTime = function(allBudgets, startMonth, endMonth, startYear, endYear, balanceFunction) {
		var relevantBudgets = monthRange(allBudgets, startMonth, endMonth, startYear, endYear);
		
		var arrays = {}; 
		// now generate array of series 
		$.each(relevantBudgets, function(index, budget) {
			$.each(Object.keys(budget.masterCategories), function(index, masterCategoryName) {
				arrays[masterCategoryName] = arrays[masterCategoryName] || []; 
				// generate a pair for each category
				var category = budget.masterCategories[masterCategoryName];
				var total = 0; 
				
				$.each(Object.keys(category), function(index, subcategoryName) {
					var subcategory = category[subcategoryName]; 
					var amount = balanceFunction(subcategory); 
					total += amount; 
				}); 
				
				arrays[masterCategoryName].push([new Date(budget.month + '/01/' + budget.year), total]); 
			}); 
		}); 
		
		// map to result arrays
		var seriesArrays = []; 
		var labelArrays = []; 
	
		$.each(Object.keys(arrays), function(index, seriesName) {
			seriesArrays.push(arrays[seriesName]); 
			arrays[seriesName].name = seriesName; 
		}); 
		
		seriesArray = seriesArrays.sort(function(a, b) {
			var getTotal = function(array) {
				var total = 0; 
				
				$.each(array, function(index, value) {
					total += value[1]; 
				}); 
				
				return total; 
			}; 
			
			return getTotal(b) - getTotal(a); 
		}); 
		
		$.each(seriesArrays, function(index, value) {
			labelArrays.push(value.name); 
		}); 
		
		seriesArrays = seriesArrays.splice(0, 5); 
		labelArrays = labelArrays.splice(0, 5); 
		
		var results = {
				data: seriesArrays,
				labels: labelArrays
		}
		
		return results; 
	};
	
	return {
		/**
		 *  input: object map of master categories, containing subcategories and outflows etc. 
		 *  input: the income for the month
		 *  output: array of  [subcategory, value] pairs 
		 */
		spendingAsPercentageOfIncomeAllCategories : function(masterCategories, income) {
			var results = []; 
			
			$.each (Object.keys(masterCategories), function(index, categoryName) {
				var category = masterCategories[categoryName]; 
				
				$.each(Object.keys(category), function(index, subcategoryName) {
					var subCategory = category[subcategoryName]; 
					var pair = [categoryName + ': ' + subcategoryName, parseInt(subCategory.outflow.replace('$','')) / income * 100];
					if(pair[1] != 0) {
						results.push(pair);
					}
				}); 
			}); 
			
			return results; 
		},
		
		/**
		 *  input: object map of master categories, containing subcategories and outflows etc. 
		 *  input: the income for the month
		 *  output: array of  [master category, value] pairs 
		 */
		spendingAsPercentageOfIncomeMasterCategories : function(masterCategories, income) {
			var results = [];
			var masterCategoryOutflows = {}; 
			var totalExpenses = 0; 
			
			$.each (Object.keys(masterCategories), function(index, categoryName) {
				var category = masterCategories[categoryName]; 
				var categoryOutflow = masterCategoryOutflows[categoryName] || { amount: 0}; 
				masterCategoryOutflows[categoryName] = categoryOutflow; 
				
				$.each(Object.keys(category), function(index, subcategoryName) {
					var subCategory = category[subcategoryName]; 
					masterCategoryOutflows[categoryName].amount +=  parseInt(subCategory.outflow.replace('$','')); 
				}); 
			}); 
			
			$.each(Object.keys(masterCategoryOutflows), function(index, value) {
				var pair = [ value,  masterCategoryOutflows[value].amount]; 
				results.push(pair); 
				totalExpenses += masterCategoryOutflows[value].amount; 
			}); 
			
			
			results.push(['Non-allocated', income - totalExpenses]); 
			return results; 
		},
		
		/**
		 *  input : object map of master categories with subcategories and category balances
		 *  input: onlyMasterCategories (true) to return master categories, false to return subcategories 
		 *  output: array of category balances and master category name  
		 */
		allocationPercentage: function(budget, onlyMasterCategories) {
			var results = []; 
			var income = budget.income; 
			var masterCategoryOutflows = {}; 
			var totalExpenses = 0; 
			
			$.each (Object.keys(budget.masterCategories), function(index, categoryName) {
				var category = budget.masterCategories[categoryName]; 
				var categoryOutflow = masterCategoryOutflows[categoryName] || { amount: 0}; 
				masterCategoryOutflows[categoryName] = categoryOutflow; 
				
				$.each(Object.keys(category), function(index, subcategoryName) {
					var subCategory = category[subcategoryName]; 
					
					var balance = parseInt(subCategory.balance.replace('$', '')); 
					var inflow = parseInt(subCategory.inflow.replace('$', '')); 
					var outflow = parseInt(subCategory.outflow.replace('$', '')); 
					
					var total = inflow; 
					
					masterCategoryOutflows[categoryName].amount += total; 
				}); 
			}); 
			
			$.each(Object.keys(masterCategoryOutflows), function(index, value) {
				var pair = [ value,  masterCategoryOutflows[value].amount]; 
				results.push(pair); 
				totalExpenses += masterCategoryOutflows[value].amount; 
			}); 
			
			var remaining = income - totalExpenses; 
			if(remaining != 0) {
				results.push(['Unallocated', remaining]); 
			}
			
			return results; 
		},
		
		/*
		 *  allBudgets: object containing budgets for each month
		 *  start month/year and end month/year: date range for the graph
		 *  
		 *  output:  { data, labels } where data is an array of series for graphing and labels is an array of the series labels
		 * 
		 */
		spendingPerCategoryOverTime: function(allBudgets, startMonth, endMonth, startYear, endYear) {
			var budgetArray = []; 
			for (var key in allBudgets) {
				budgetArray.push({name: key, data: allBudgets[key]});
			}
			
			// have to sort the data first
			var newBudgets = budgetArray.sort(function(a, b) {
				var aDate = new Date(a.month + '/01/' + a.year); 
				var bDate = new Date(b.month + '/01/' + b.year); 
				
				return bDate - aDate; 
			}); 
			
			$.each(budgetArray, function(index, budget) {
				if(index == 0) return; // continue
				
				var categories = budget.data.masterCategories; 
				$.each(Object.keys(categories), function(categoryIndex, masterCategoryName) {
					$.each(Object.keys(categories[masterCategoryName]), function(scIndex, subcategoryName) {
						var subcategory = categories[masterCategoryName][subcategoryName]; 
						var currentBalance = parseInt(subcategory.outflow.replace('$', '')); 
						
						if(budgetArray[index-1].data.masterCategories[masterCategoryName][subcategoryName].runningBalance) {
							var previousMonthBalance = budgetArray[index-1].data.masterCategories[masterCategoryName][subcategoryName].runningBalance;
							subcategory.runningBalance = currentBalance + previousMonthBalance;
						}
						else {
							subcategory.runningBalance = currentBalance; 
						}
					}); 
				}); 
			});
			
			// convert array back to budget object
			var budgetObject = {}; 
			$.each(budgetArray, function(index, budget) {
				budgetObject[budget.name] = budget.data; 
				delete budget.name; 
			}); 
			
			return balanceOverTime(budgetObject, startMonth, endMonth, startYear, endYear, function(subcategory) {
				if(subcategory.runningBalance) {
					return subcategory.runningBalance;
				}
				else {
					return 0; 
				}
			}); 
		}, 
		
		categoryBalancesOverTime: function(allBudgets, startMonth, endMonth, startYear, endYear) {
			return balanceOverTime(allBudgets, startMonth, endMonth, startYear, endYear, function(subcategory) {
				return parseInt(subcategory.balance.replace('$', '')); 
			}); 
		},
		
		/**
		 *  input: object containing all budgets 
		 *  input: start month in the form m
		 *  input: end month in the form m
		 *  input: start year in the form yyyy
		 *  input: stop year in the form yyyy
		 *  output: {
		 *  		  data: array of series with data points
		 *  		labels: array of series labels
		 *  }
		 */
		spendingTrendGraph: function(allBudgets, startMonth, endMonth, startYear, endYear) {
			return balanceOverTime(allBudgets, startMonth, endMonth, startYear, endYear, function(subcategory) {
				var amount = parseInt(subcategory.outflow.replace('$', '')); 
				return amount; 
			}); 
		},
		
		/*
		 * input: budget object containing master categories with balances
		 * output: object map containing master categories (with each subcategory) and the % used for each one 
		 */
		currentBudgetUsage : function(budget) {
			var results = {}; 
			
			$.each(Object.keys(budget.masterCategories), function(index, masterCategoryName) {
				// calculate amount that can be used this month 
				var masterCategory = budget.masterCategories[masterCategoryName];
				results[masterCategoryName] = { total: 0, used: 0, percentage: 0};
				
				$.each(Object.keys(masterCategory), function(index, subcategoryName) {
					var subCategory = masterCategory[subcategoryName];
					var balance = parseInt(subCategory.balance.replace('$', '')); 
					var inflow = parseInt(subCategory.inflow.replace('$', '')); 
					var outflow = parseInt(subCategory.outflow.replace('$', '')); 
					
					var total = (balance - inflow + outflow) + inflow; 
					results[masterCategoryName].total += total; 
					results[masterCategoryName].used += (total - balance); 
					
					var percentage = 0; 
					if(total != 0) {
						percentage = (total - balance) / total * 100; 
					}
					
					results[masterCategoryName][subcategoryName] = {
						total: total, 
						used: (total - balance),
						percentage: percentage
					}; 
				}); 
				
				if(results[masterCategoryName].total !== 0) {
					results[masterCategoryName].percentage = results[masterCategoryName].used / results[masterCategoryName].total * 100; 
				}
				else {
					delete results[masterCategoryName]; 
				}
			}); 
			
			return results; 
		}
	}
	
})(); 