var accounts = (function() {
	var db = proton.db('accounts');
	return {
		addAccount: function(account) {
			db.save(account);
		}, 
		getAccount: function(accountNumber) {
			return db.find({ number: accountNumber }).first();
		},
		updateAccount: function(account) {
			db.update({ number: account.number }, account);
		}
	};
})();

var atm = (function() {

	var updateBalance = function(accountNumber, balance) {
		var account = accounts.getAccount(accountNumber);
		account.balance = balance;
		accounts.updateAccount(account);
	};
	
	var balanceIsSufficient = function(amount, balance) {
		return amount <= balance;
	};
	
	var validCredentials = function(accountNumber, pin) {
		var account = accounts.getAccount(accountNumber);
		return account && pin == account.pin;
	};
	
	var getBalance = function(accountNumber) {
		var account = accounts.getAccount(accountNumber);
		return account ? account.balance : undefined;
	};
	
	var createDefaultWithdrawal = function(accountNumber) {
		return { 
			amount: 0, 
			balance: getBalance(accountNumber) 
		};
	};
	
	return {
		withdraw: function(amount, accountNumber, pin) {
			var withdrawal = createDefaultWithdrawal(accountNumber);
			if (validCredentials(accountNumber, pin) && balanceIsSufficient(amount, withdrawal.balance)) {
				withdrawal.balance -= amount;
				withdrawal.amount = amount;
				updateBalance(accountNumber, withdrawal.balance);
			}
			return withdrawal;
		}
	};
})();

var view = {
	getAmount: function() {
		return $('input#amount').val();
	},
	getPin: function() {
		return $('input#PIN').val();
	},
	getAccountNumber: function() {
		return $('input#accountNumber').val();
	},
	setCashDrawer: function(amount) {
		$('#cashDrawer').val(amount);		
	},
	setBalance: function(amount) {
		$('#accountBalance').text(amount);		
	}
};

$(function() {
	$('input#withdraw').click(function() {
		var withdrawal = atm.withdraw(view.getAmount(), view.getAccountNumber(), view.getPin());
		view.setCashDrawer(withdrawal.amount);
		view.setBalance(withdrawal.balance);
	});
});