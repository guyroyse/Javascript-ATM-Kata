var atm = (function() {
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
			if (amount > this.balance) amount = 0;
			return amount;
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
		$('#accountBalance').val(amount);		
	}
};

$(function() {
	$('input#withdraw').click(function() {
		var amountWithdrawn = atm.withdraw(view.getAmount(), view.getAccountNumber(), view.getPin());
		view.setCashDrawer(amountWithdrawn);
	});
});