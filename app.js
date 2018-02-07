// ------------------ BUDGET Controller ------------------
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (item) {
            sum += item.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            // Create new item  based on 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            // Push in data structure
            data.allItems[type].push(newItem);
            // Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {

            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage 
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentage: function () {
            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        // For tests
        testing: function () {
            console.log(data);
        }
    }

})();

// ------------------ UI Controller ------------------
var UIController = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2); // put 2 decimals
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + int + '.' + dec;

    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            for (var i = 0; i < fields.length; i++) {
                fields[i].value = "";
            }

            fields[0].focus();
        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            for (var i = 0; i < percentages.length; i++) {
                if (percentages[i] > 0) {
                    fields[i].textContent = percentages[i] + '%';
                } else {
                    fields[i].textContent = '---';
                }
            }
        },
        
        displayMonth: function(){
            var now, month, months, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'June', 'July', 'August', 'September', 'Octomber', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' +year;
        },

        changeType: function(){
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            for (var i = 0; i<fields.length; i++){
                fields[i].classList.toggle('red-focus');
            }
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
                
        getDOMstrings: function () {
            return DOMstrings;
        },

        displayBudget: function (obj) {

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, (obj.budget >= 0) ? 'inc' : 'exp');
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        }
    };

})();

// ------------- Global APP Controller ------------------

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
                
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function () {
        // 1. Calculate budget  
        budgetCtrl.calculateBudget();

        // 2. Return budget
        var budget = budgetCtrl.getBudget();

        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentage = function () {

        // 1. Calculate percentage
        budgetCtrl.calculatePercentage();

        // 2. Read from budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function () {
        var input, newItem;

        // 1. Get the filed input data
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields

            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Update percentage
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function (event) {

        var itemID, splitID, type, ID;

        // DOM traversing for EVENT delegation
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }

        // 1. Delete Item from the data structure
        budgetCtrl.deleteItem(type, ID);

        // 2. Delete the item from the UI
        UICtrl.deleteListItem(itemID);

        // 3. Update and show the budget
        updateBudget();

        // 4. Update percentage
        updatePercentage();

    };

    return {
        init: function () {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }


})(budgetController, UIController);

controller.init();
