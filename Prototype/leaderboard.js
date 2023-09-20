//Data storing nicknames and results, this will be changed for a network request
const data = {
  "history": [
      { "name": "team groovy", "score": 20 },
      { "name": "team ungroovy", "score": 18 },
      { "name": "imagine it continues like this for 10 people in the list", "score": 18 },
      { "name": "imagine it continues like this for 10 people in the list", "score": 18 }
  ]
};

var tableContainer = document.getElementById("table-container"); // Reference for the table
var table = document.createElement("table"); // Create HTML table element

// Add the first row
var topHeaderRow = table.insertRow(0);
var headerCell1 = topHeaderRow.insertCell(0);
var headerCell2 = topHeaderRow.insertCell(1);

headerCell1.innerHTML = "<b>Nickname</b>"; //Add the headers
headerCell2.innerHTML = "<b>Score</b>";

// Loop and populate table with data
for (var j = 0; j < data.history.length; j++) {
  var rowData = data.history[j];
  var row = table.insertRow(j + 1); // start at 1 and incriment
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);

  cell1.innerHTML = rowData.name; //insert words
  cell2.innerHTML = rowData.score;
}

// update table
tableContainer.appendChild(table);