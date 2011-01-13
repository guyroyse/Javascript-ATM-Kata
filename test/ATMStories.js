describe("ATM Story Tests", function(){
    beforeEach(function() {});
    it("Allows Judy to withdraw money when she has a balance available", function() {
        $('input#accountNumber').val('1234567890');
        $('input#PIN').val('1234');
        $('input#amount').val(10);
        $('input#withdraw').click();
        expect($('#cashDrawer').val()).toEqual('10');
    });
    it("Prevents Judy from withdrawing money when she doesn't have it available", function() {
        $('input#accountNumber').val('1234567890');
        $('input#PIN').val('1234');
        $('input#amount').val(110);
        $('input#withdraw').click();
        expect($('#cashDrawer').val()).toEqual('0');
    });
    it("Prevents Judy from withdrawing money when she puts in an incorrect pin", function() {
        $('input#accountNumber').val('1234567890');
        $('input#PIN').val('5678');
        $('input#amount').val(25);
        $('input#withdraw').click();
        expect($('#cashDrawer').val()).toEqual('0');
 });
    it("Prevents Judy from withdrawing money when she puts in an incorrect account number", function() {
        $('input#accountNumber').val('0987654321');
        $('input#PIN').val('1234');
        $('input#amount').val(25);
        $('input#withdraw').click();
        expect($('#cashDrawer').val()).toEqual('0');
   });
    it("Updates Judys balance when she withdraws money", function() {
        $('input#accountNumber').val('0987654321');
        $('input#PIN').val('1234');
        $('input#amount').val(10);
        $('input#withdraw').click();
        expect($('#accountBalance').text()).toEqual('90');
    });
});
