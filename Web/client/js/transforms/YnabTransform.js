yext.transforms.YnabTransform = (function() {
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; 
	
	return {
		/**
		 *  input: array of lines in CVS format representing transactions 
		 *  output: object map containing month : income pairs
		 */
		monthlyIncomes: function( linePerTransactionArray) {
			var results = {}; 
			
			$.each(linePerTransactionArray, function(index, line) {
				line = line.replace(/"/g, ''); 
				
				if(index === 0) return; // ignore column header 
				// get date
				var date = line.split(',')[3];
				if(date === "" || !date) return; 
				
				var actualDate = new Date(date);
				var dateEntry = months[actualDate.getMonth()] + ' ' + actualDate.getFullYear(); 

				var entry = results[dateEntry] || { income: 0 }; 
				results[dateEntry] = entry; 
				results[dateEntry].month = actualDate.getMonth() + 1; 
				results[dateEntry].year = actualDate.getFullYear(); 
				
				var category = line.split(',')[6]; 
				if(category === "Income") {
					entry.income += parseInt( line.split(',')[10].replace('$', ''));  
				}; 
			}); 
			
			return results; 
		},
		
		transactionsByCategory: function( linePerTransactionArray) {
			var results = {}; 
			
			$.each(linePerTransactionArray, function(index, line) {
				line = line.replace(/"/g, ''); 
				
				if(index === 0) return; // ignore column header 
				// get date
				var date = line.split(',')[3];
				if(date === "" || !date) return; 
				
				var actualDate = new Date(date);
				var dateEntry = months[actualDate.getMonth()] + ' ' + actualDate.getFullYear(); 

				var category = line.split(',')[6]; 

				var entry = results[category] || { transactions:[] };
				results[category] = entry; 
				results[category].transactions.push(line); 
			});  
			
			console.log(results); 
			return results; 
		},
		
		/*
		 * input: monthlyIncomes: object containing months and incomes
		 * input: monthlyBudgets: object containing budgets by month
		 * output: objects containing budgets and incomes for each month
		 */
		budgetsWithIncomesAndExpenses : function(monthlyIncomes, monthlyBudgets) {
			var results = jQuery.extend(true, {}, monthlyBudgets); // deep copy  
			
			$.each(Object.keys(monthlyBudgets), function(index, month) {
				if(monthlyIncomes[month]) {
					results[month].income = monthlyIncomes[month].income;
					results[month].month = monthlyIncomes[month].month;
					results[month].year = monthlyIncomes[month].year; 
				}
				else {
					results[month].income = 0; 	
				}
			}); 
			
			return results; 
		},
		
		/*
		 * input: object containing all master categories (with subcategories)
		 * output: object with each subcategory containing its current category balance, and it's category balance contribution for the month
		 */
		categoriesWithCategoryBalances : function(budgets) {
			var results = jQuery.extend(true, {}, budgets); // deep copy  
			
			var addBalanceToCategory = function(masterCategory) {
				$.each(Object.keys(masterCategory), function(index, subcategoryName) {
					var category = masterCategory[subcategoryName]; 
					var inflow = parseInt(category.inflow.replace('$', '')); 
					var outflow = parseInt(category.outflow.replace('$', '')); 
					var contribution = inflow - outflow; 
					
					category.contribution = contribution;  // TODO tesT
				}); 
			}; 
			
			var addBalanceToBudget = function(budget) {
				$.each(Object.keys(budget.masterCategories), function(index, masterCategory) {
					addBalanceToCategory( budget.masterCategories[masterCategory]); 
				}); 
			}; 
			
			$.each(Object.keys(results), function(index, monthlyBudget) {
				addBalanceToBudget(results[monthlyBudget]); 
			}); 
			
			return results; 
		}, 
		
		monthlyBudgets : function(linePerMonthPerCategoryArray) {
			 var results = {}; 
			
			$.each(linePerMonthPerCategoryArray, function(index, entry) {
				if(index <= 1) return; // continue 
				
				entry = entry.replace(/"/g, ''); 
				
				// split the line
				var columns = entry.split(','); 
				if(columns[0] === "") {
					return; // continue; 
				}
				
				var monthEntry = results[columns[0]] || { rows: [] };
				results[columns[0]] = monthEntry; 
				monthEntry.rows.push( columns.slice(1) ); 
			}); 
			
			return results; 
		},
		
		masterCategories : function(monthlyBudgets) {
			var results = jQuery.extend(true, {}, monthlyBudgets); // deep copy  
			
			$.each(Object.keys(results), function(index, budget) {
				// for each monthly budget 
				var entry = results[budget];
				entry.masterCategories = {}; 
				
				// for each entry 
				$.each(entry.rows, function(index, value) {
					var wholeCategory = value[0]; 
					// get master category
					var master = wholeCategory.substring(0, wholeCategory.indexOf(':')); 
					var category = entry.masterCategories[master] || { rows: [] }; 
					entry.masterCategories[master] = category; 
					category.rows.push( value.slice(2) ); 
				}); 			
				
				delete entry.masterCategories['']; 
				delete entry.rows; 
			}); 
			
			return results; 
		},

		subCategories : function (budgetsWithMasterCategories) {
			var results = jQuery.extend(true, {}, budgetsWithMasterCategories); // deep copy  
			
			$.each(Object.keys(results), function(index, budget) {
				$.each (Object.keys( results[budget].masterCategories ), function(index, masterCategory) {
					$.each( results[budget].masterCategories[masterCategory].rows, function(index, subcategory) {
						var newSubcategory = {
								inflow: subcategory[1],
								outflow: subcategory[2], 
								balance: subcategory[3]
						}
						
						results[budget].masterCategories[masterCategory][subcategory[0]] = newSubcategory; 
					}); 
					
					delete results[budget].masterCategories[masterCategory].rows; 
				}); 
			}); 
			
			return results; 
		},
		
		
	}; 
})(); 