// Array to store expense data categorized by timeframes
const expenseData = {
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
};

// Store the daily expense records in localStorage
function storeDailyData() {
    const workers = document.getElementById('workers').value;
    const expenses = document.getElementById('expenses').value;
    const shellCuttingCost = document.getElementById('shellCuttingCost').value;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN');
    const records = [];

    for (let i = 1; i <= workers; i++) {
        const name = document.getElementById(`workerName_${i}`).value;
        const dailyWage = document.getElementById(`dailyWage_${i}`).value;
        const extraWork = document.getElementById(`extraWork_${i}`).value;
        const daysWorked = document.getElementById(`daysWorked_${i}`).value;

        const workerExtraCost = extraWork * shellCuttingCost;
        const dailySalary = dailyWage * daysWorked;

        const workerData = {
            name,
            dailyWage,
            daysWorked,
            dailySalary,
            extraWork,
            workerExtraCost,
            date: formattedDate
        };

        records.push(workerData);
    }

    // Store daily record in localStorage
    const dailyRecords = JSON.parse(localStorage.getItem('dailyExpenses')) || [];
    dailyRecords.push({ date: formattedDate, records });
    localStorage.setItem('dailyExpenses', JSON.stringify(dailyRecords));
}

// Generate input fields for each worker
function generateWorkerFields() {
    const workers = document.getElementById('workers').value;
    const workerFields = document.getElementById('workerFields');
    workerFields.innerHTML = ''; // Clear existing fields

    for (let i = 1; i <= workers; i++) {
        workerFields.innerHTML += `
            <div class="form-group">
                <label for="workerName_${i}">Worker ${i} Name:</label>
                <input type="text" id="workerName_${i}" placeholder="Enter Worker ${i}'s Name">
            </div>
            <div class="form-group">
                <label for="dailyWage_${i}">Worker ${i} Daily Wage (INR):</label>
                <input type="number" id="dailyWage_${i}" min="0" placeholder="Enter Worker ${i}'s Daily Wage">
            </div>
            <div class="form-group">
                <label for="extraWork_${i}">Worker ${i} Shell Cutting (KG):</label>
                <input type="number" id="extraWork_${i}" min="0" placeholder="Enter Worker ${i}'s Shell Cutting in KG">
            </div>
            <div class="form-group">
                <label for="daysWorked_${i}">Worker ${i} Days Worked (out of 7):</label>
                <input type="number" id="daysWorked_${i}" min="0" max="7" placeholder="Enter Worker ${i}'s Days Worked">
            </div>
        `;
    }
}

// Calculate daily salary and shell cutting cost for each worker
function calculate() {
    storeDailyData();  // Store the data for today

    const workers = document.getElementById('workers').value;
    const expenses = document.getElementById('expenses').value;
    const shellCuttingCost = document.getElementById('shellCuttingCost').value;

    let totalSalary = 0;
    let totalExtraWorkCost = 0;

    const tableBody = document.getElementById('expenseTableBody');
    tableBody.innerHTML = ''; // Clear previous table data

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN');

    // Calculate total cost and salaries for each worker
    for (let i = 1; i <= workers; i++) {
        const name = document.getElementById(`workerName_${i}`).value;
        const dailyWage = document.getElementById(`dailyWage_${i}`).value;
        const extraWork = document.getElementById(`extraWork_${i}`).value;
        const daysWorked = document.getElementById(`daysWorked_${i}`).value;

        const workerExtraCost = extraWork * shellCuttingCost;
        totalExtraWorkCost += workerExtraCost;

        const dailySalary = dailyWage * daysWorked;
        totalSalary += dailySalary;

        // Append to table
        tableBody.innerHTML += `
            <tr>
                <td>${name}</td>
                <td>${dailyWage}</td>
                <td>${daysWorked}</td>
                <td>${dailySalary}</td>
                <td>${extraWork}</td>
                <td>${workerExtraCost}</td>
                <td>${formattedDate}</td>
            </tr>
        `;
    }

    const totalExpenses = parseFloat(expenses) + totalSalary + totalExtraWorkCost;
    document.getElementById('result').innerHTML = `<strong>Total Expenses: ${totalExpenses} INR</strong>`;
    
    // Show the table
    document.getElementById('expenseTable').style.display = 'table';
}

function displayDateTime() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-IN');
    document.getElementById('dateTime').innerHTML = `Date: ${formattedDate}, Time: ${formattedTime}`;
}

// Download report as PDF
function downloadPDF(reportType) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text(`Business Expenses Report - ${reportType}`, 14, 10);
    const reportData = retrieveDataForReport(reportType);

    doc.autoTable({
        head: [['Worker Name', 'Daily Wage (INR)', 'Days Worked', 'Daily Salary (INR)', 'Shell Cutting (KG)', 'Shell Cutting Cost (INR)', 'Date']],
        body: reportData.flatMap(record => record.records.map(worker => [
            worker.name,
            worker.dailyWage,
            worker.daysWorked,
            worker.dailySalary,
            worker.extraWork,
            worker.workerExtraCost,
            worker.date
        ])),
        startY: 30
    });

    doc.save(`${reportType}-business-expenses.pdf`);
}

// Retrieve data from localStorage for reports
function retrieveDataForReport(type) {
    const dailyRecords = JSON.parse(localStorage.getItem('dailyExpenses')) || [];
    switch (type) {
        case 'daily':
            return dailyRecords.slice(-1);
        case 'weekly':
            return dailyRecords.slice(-7);
        case 'monthly':
            return dailyRecords.slice(-30);
        case 'yearly':
            return dailyRecords.slice(-365);
        default:
            return [];
    }
}
