(function($){

    var form = $("form"),
        inputBalance = form.find("input[name='balance']"),
        inputAdd = form.find("input[name='add']"),
        minAdd = 5.50,
        fare = 2.75,
        bonus = 0.11;

    form.submit(function(){
        var balance = inputBalance.val(),
            add = inputAdd.val();
        
        if (!isNaN(balance) && !isNaN(add)) {

            var balanceVal = parseFloat(balance),
                addVal = parseFloat(add);

            if (balanceVal === 0 && addVal === 0) {
                errorMsg("enter numbers...");
            } else {
                var valid = validate(balanceVal, addVal);

                if (valid) {
                    formSubmit(balanceVal, addVal);
                } else {
                    errorMsg("add $5.50 or more for a 11% bonus!");
                }
            }

        } else {
            errorMsg("enter numbers..");
        }
        
        return false;
    });

    form.find("input").each(function(){
        $(this).focus(function(){
            if (this.value === "0" || this.value === "0.00") { this.value = ""; }
        }).blur(function(){
            if (this.value === "") { this.value = "0"; }
        });
    });

    var template = '' +
        '<ul>\
            <li>Balance Total: <span>$<%= total %></span></li>\
            <li>Bonus: <i><%= bonusCalc %></i> <span>$<%= addBonus %></span></li>\
            <li>Rides:  <i>(<%= ridesAmount %>)</i> <span><%= rides %></span></li>\
            <li>Balance after Rides:<br/><span>$<%= after %></span></li>\
        </ul>';

    var prev = access();
    if (prev.length > 0) {
        inputBalance.val(prev[0]);
        inputAdd.val(prev[1]);
        form.submit();
    }

    function formSubmit(balance, add) {

        var sub = balance + add;

        if (sub > 200) {
            sub = (sub < 1000) ? ("$" + fmt(sub)) : "over $1k";
            errorMsg("C'mon.. "+sub+"?? You want to get mugged?");
            return false;
        }

        inputBalance.val(fmt(balance));
        inputAdd.val(fmt(add));

        var target = $("#result"),
            addBonus = parseFloat((add * bonus).toFixed(2)),
            total = balance + add + addBonus,
            rides = Math.floor(total / fare),
            ridesAmount = fmt(rides * 2.75),
            after = total - (rides * fare);
        
        var markup = _.template(template);
        
        var data = {
            total: fmt(total),
            addBonus: fmt(addBonus),
            bonusCalc: (add > 0) ? ["(", (fmt(add) + " x 11%"), ")"].join("") : "",
            rides: rides,
            ridesAmount: " x $" + fare + " = $" + ridesAmount,
            after: fmt(after)
        };

        var html = markup(data);
        
        target.html(html);
        success(balance, add);
        
    }

    function fmt(val) {
        val = (parseFloat(val)).toFixed(2);
        val = val + ((val.indexOf(".") === -1) ? ".00" : "");
        return val;

    }

    function validate(balance, add) {

        var ret = false;

        if (balance > 0) {

            if (add === 0) {
                ret = true;
            } else if (add >= minAdd) {
                ret = true;
            }

        } else if (balance === 0) {

            if (add >= minAdd) {
                ret = true;
            }

        }

        return ret;

    }

    function errorMsg(val) {
        $("#result").html('<div class="error">'+val+'</div>');
    }

    function success(balance, add) {
        // save to local storage
        if (!window.localStorage) { return false; }
        localStorage.setItem("__subway_calc_vals", [balance, add].join(","));
    }

    function access() {

        if (!window.localStorage) { return false; }

        var ret = [],
            vals = localStorage.getItem("__subway_calc_vals");

        if (vals && vals.length > 1) {
            ret = vals.split(",");
        }

        return ret;

    }

}(jQuery));