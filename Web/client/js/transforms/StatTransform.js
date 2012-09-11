yext.transforms.StatTransform = (function() {
	return {
		transactionsPerCategory: function(categoryTransactions) {
			var rows = []; 
			
			$.each(categoryTransactions, function(key, value) {
				var row = { 'name': key, 'value': Object.keys(value.transactions).length}; 
				rows.push(row); 
			}); 
			
			return rows; 
		} 
	}
})(); 