var atm = (function() {

	var balance = 100;
	
	var validatePin = function(pin) {
		return (pin == '1234');
	};
	
	var validateAccountNumber = function(accountNumber) {
		return (accountNumber == '1234567890');
	};
	
	var validateCredentials = function(accountNumber, pin) {
		return validatePin(pin) && validateAccountNumber(accountNumber);
	}
	
	return {
		withdraw: function(amount, accountNumber, pin) {
			if (!validateCredentials(accountNumber, pin)) amount = 0;
			if (amount > balance) amount = 0;
			balance -= amount;
			return amount;
		},
		getBalance: function() {
			return balance;
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
		var amountWithdrawn = atm.withdraw(view.getAmount(), view.getAccountNumber(), view.getPin());
		view.setCashDrawer(amountWithdrawn);
		view.setBalance(atm.getBalance());
	});
});