// BUDGET CONTROLLER
var budgetController = (function() {

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Function to sum the items in the exp/inc arrays
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value // sum = sum + cur.value || We can use .value because cur is an object created from any of the above constructors.
        });
        data.totals[type] = sum;
    };

    // The object of our data structure
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

    return {
        addItem: function(type, des, val){

            var newItem, ID;

            // Create a new ID. Note that  "id" is a property of the Expense and Income function constructions above.

            // Deconstructing the ID value:
            // 1) ID = data.allItems[type] || "type" is a parameter of our function that will be either "inc" or "exp", that
            //    way we can pick one of the two arrays depending on what we pass in.

            // 2) [data.allItems[type].length - 1], this is a way to select the last item in the array that we picked in the last step.
            //    For example, exp: ["Mango", "Orange"] is an array with a length of 2, but the index is always one number less than 
            //    the length, "Mango" has and index of 0 and "Orange" is 1. This way we've selected the last item, "Orange".

            // 3) .id + 1 || Remember that each item of the array is actually an object (Income/Expense), and that object
            // contains a property called "id", that is initially set to 0 in our else statement. Then we add +1 to it.
            // That's how we sum points to our IDs.


            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }

            // Create new item based on "inc" or "exp" type
            if(type === "exp"){
                newItem = new Expense(ID, des, val)
            }else if(type === "inc"){
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        // Method to delete an item
        deleteItem: function(type, id){
            var ids, index;

            // id = 6
            // data.allItems[type][id]
            // ids = [1 2 4 6 8]
            // index = 3
            // ids = [1 2 4 8] || This is what would happen after using .splice(index, 1)

            ids = data.allItems[type].map(function(current) { // The content of allItems[type] is an array of objects with the id property
                return current.id; // This would return an array with all the ids of the objects contained in allItems[type]
            });

            index = ids.indexOf(id); // Find the index of every id in the array, just like in the example above with id = 6

            if(index !== -1){
                data.allItems[type].splice(index, 1) // Find that index and delete it from data.allItems[type]
            };

        },

        calculateBudget: function(){

            // Calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                // This calculates the "percentage" property in the Expense object that is originally set to -1
                cur.calcPercentage(data.totals.inc); // CalcPercentage is a method of the Expense object that we created up there
            });
        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage(); // Get percentage is a method of the Expense object that we created up there
            });
            return allPerc; // The result is an array with all the percentages calculated
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function(){
            console.log(data);
        }
    }
})();


// UI CONTROLLER
var UIcontroller = (function(){
    
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container", // This class contains both the income and expense items added
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    }

    // Function to format our numbers
    var formatNumber = function(num, type){
        var numSplit, int, dec;

        // 1. "+" or "-" before number

        // 2. Exactly 2 decimal points

        // 3. Comma separating the thousands

        // Examples:
        // 2310.4567 ---> + 2,310.46
        // 2000 ---> 2,000.00

        num = Math.abs(num); // Get the absolute value of the number
        num = num.toFixed(2); // Convert a number into a string, keeping only (2) decimals:

        numSplit = num.split("."); // Divide the string in the dot. Then get an array with the parts before and after the point.

        int = numSplit[0]; // Returns the integer, the whole number that isn't a fraction
        dec = numSplit[1]; // Returns the decimals of the number, everything after the .
        
        // If statement for the comma in the thousands
        // if(int.length > 3 && int.length < 6){
        //     int = int.substring(0, int.length - 3) + "," + int.substring(int.length - 3, int.length); // Ex. input: 2456 || output: 2,456
        // }else if(int.length > 6){
        //     // Else if for millions. Ex. input: 1500200 || output: 1,500,200
        //     int = int.substring(0, int.length - 6) + "," + int.substring(int.length - 6, int.length - 3) + "," + int.substring(int.length - 3, int.length);
        // }

        // Function to put a comma every 3 digits
        function toCommas(value) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        // Call the toCommas function and store it in a variable
        var intWithCommas = toCommas(int);

        // Use the ternary operator to put a "+" or "-" sign depending on the type and return the value
        return (type === "exp" ? "-" : "+") + " " + intWithCommas + "." + dec;
    };

    // Create a forEach function for a NodeList. The "list" arg refers to the NodeList
    var nodeListForEach = function(list, callback){  
        for(var i = 0; i < list.length; i++){
            callback(list[i], i)
        }
    };

    // Get the input data stored in a function that returns an object
    return {
        getInput: function(){
           return {
            type: document.querySelector(DOMstrings.inputType).value, // It'll be either inc or exp
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
           }
        },

        addListItem: function(obj, type){
            var html, newHTML, element;

            // Create the HTML string with placeholder text
            
            if(type === "inc"){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === "exp"){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder text with some actual data
            newHTML = html.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);

           el.parentNode.removeChild(el); // We go up one level to be able to remove the child
        },

        clearFields: function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);

            // Use the call method to borrow the slice() from the Array's prototype so we can use it on fields
            fieldsArr = Array.prototype.slice.call(fields);

            // Use a forEach to reset the value of the inputs. When using forEach, the callback is invoked with three arguments:
            // 1. The value of the element, 2. the index of the element and 3. the array object being traversed.
            // You can call them whatever you like, in this case we called them "current", "index", and "array".
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        // Update the budget, total income, expenses and percentage on the UI
        displayBudget: function(obj){

            // Use the ternary operator to set the type of the budget
            var type;
            obj.budget > 0 ? type = "inc" : type = "exp";

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, "exp");
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },

        // Display the percentages of every expense
        displayPercentages: function(percentages){
            // querySelectorAll returns a NodeList, not an array, so we need to create a forEach function for NodeLists
             // This is the id of the percentage of every expense in our HTML
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            // Call our ForEach function for nodeLists
            nodeListForEach(fields, function(current, index){
              if(percentages[index] > 0){
                current.textContent = percentages[index] + "%"; // Percentages is the argument we pass in this function
              }else {
                  current.textContent = "---";
              }
            });
        },

        displayMonth: function(){
            var now, month, months, year;
            // Save the current date into a new variable using the date object constructor
            now = new Date();

            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; 
            month = now.getMonth();  // Returns the index number of the current month (it's zero-based)
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        },

        changedType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + "," +
                DOMstrings.inputDescription + "," +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        },

        // Method that returns the above object "DOMstrings" so that objects outside this scope can use it
        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UIctrl){

    // Setup event Listeners
    var setupEventListeners = function(){

        // Get the DOMstrings from the UIcontroller 
        var DOM = UIcontroller.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keydown", function(event){ // We have access to the .key and .which properties because
            if (event.key === "Enter" || event.which === 13){ // they belong to the KeyboardEvent object
               ctrlAddItem() 
            }
        });
        // Event Listener to delete items
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        // Event listener to change the color of the input outline when we change it from income to expense
        document.querySelector(DOM.inputType).addEventListener("change", UIctrl.changedType);
    };

    var updateBudget = function(){
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UIctrl.displayBudget(budget);

    };

    var updatePercentages = function(){

        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read them from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UIctrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function(){
        var input, newItem;

        // 1. Get the field input data
        input = UIcontroller.getInput();

        // Don't allow empty strings/NaN to be passed in
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){

        // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        // 3. Add the item to the UI
        UIctrl.addListItem(newItem, input.type);

        // 4. Clear the fields
        UIctrl.clearFields();

        // 5. Calculate and update budget
        updateBudget();

        // 6. Calculate and update the percentages
        updatePercentages();
        }
    };

    ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // This returns "inc-0" where 0 increases with each item
        console.log(itemID);

        // We only want this function to proceed if there's a defined ID, so we use an if statement
        if(itemID){

            // 0. Get the parts of an ID
            splitID = itemID.split("-");
            type = splitID[0]; // This returns "inc/exp"
            ID = parseInt(splitID[1]); // This returns "0" where 0 is a number that increases with each item

            // 1. Delete the items from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
            UIctrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 6. Calculate and update the percentages
            updatePercentages();
        }

    };


    return {
        init: function(){
            // Call the displayMonth function to display the current month in the UI
            UIctrl.displayMonth();
            // Call the displayBudget function with 0 when we start our app
            UIctrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIcontroller); 

// budgetController and UIcontroller are passed in as arguments so that we can use their methods & properties 

// Call the controller.init() function so that the EventListeners are setup and everything starts running
controller.init();