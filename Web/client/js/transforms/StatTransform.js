yext.transforms.StatTransform = ((() => ({
    transactionsPerCategory(categoryTransactions) {
        var rows = []; 
        
        $.each(categoryTransactions, (key, value) => {
            var row = { 'name': key, 'value': Object.keys(value.transactions).length}; 
            rows.push(row); 
        }); 
        
        return rows; 
    }
})))(); 