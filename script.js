// Array to store expense data categorized by timeframes
const expenseData = {
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
};

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

function generateWorkerFields() {
    const extraWorkers = document.getElementById('extraWorkers').value;
    const extraWorkFields = document.getElementById('extraWorkFields');
    extraWorkFields.innerHTML = ''; // Clear existing fields

    for (let i = 1; i <= extraWorkers; i++) {
        extraWorkFields.innerHTML += `
            <div class="form-group">
                <label for="workerName_${i}">Worker ${i} Name:</label>
                <input type="text" id="workerName_${i}" placeholder="Enter Worker ${i}'s Name">
            </div>
            <div class="form-group">
                <label for="extraWork_${i}">Worker ${i} Shell Cutting (KG):</label>
                <input type="number" id="extraWork_${i}" min="0" placeholder="Enter shell cutting in KG">
            </div>
            <div class="form-group">
                <label for="extraWorkCost_${i}">Worker ${i} Cost per KG for Shell Cutting (INR):</label>
                <input type="number" id="extraWorkCost_${i}" min="0" placeholder="Enter cost per KG of shell cutting">
            </div>
            <div class="form-group">
                <label for="daysWorked_${i}">Worker ${i} Days Worked (out of 7):</label>
                <input type="number" id="daysWorked_${i}" min="0" max="7" placeholder="Enter days worked">
            </div>
        `;
    }
}

function calculate() {
    const workers = document.getElementById('workers').value;
    const dailyWage = document.getElementById('dailyWage').value;
    const expenses = document.getElementById('expenses').value;
    const extraWorkers = document.getElementById('extraWorkers').value;

    let totalSalary = 0;
    let totalExtraWorkCost = 0;
    const extraWorkerData = [];

    // Clear any existing table content before regenerating
    const tableBody = document.getElementById('expenseTableBody');
    tableBody.innerHTML = '';

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN');

    // Calculate shell cutting cost and weekly salary for each worker
    for (let i = 1; i <= extraWorkers; i++) {
        const name = document.getElementById(`workerName_${i}`).value;
        const extraWork = document.getElementById(`extraWork_${i}`).value;
        const extraWorkCost = document.getElementById(`extraWorkCost_${i}`).value;
        const daysWorked = document.getElementById(`daysWorked_${i}`).value;

        const workerExtraCost = extraWork * extraWorkCost;
        totalExtraWorkCost += workerExtraCost;

        const weeklySalary = dailyWage * daysWorked;
        totalSalary += weeklySalary;

        const workerData = {
            name,
            dailyWage,
            daysWorked,
            weeklySalary,
            extraWork,
            workerExtraCost,
            date: formattedDate
        };

        // Store worker data by timeframe
        expenseData.daily.push(workerData);
        expenseData.weekly.push(workerData);
        expenseData.monthly.push(workerData);
        expenseData.yearly.push(workerData);

        // Append to table
        tableBody.innerHTML += `
            <tr>
                <td>${name}</td>
                <td>${dailyWage}</td>
                <td>${daysWorked}</td>
                <td>${weeklySalary}</td>
                <td>${extraWork}</td>
                <td>${workerExtraCost}</td>
                <td>${formattedDate}</td>
            </tr>
        `;
    }

    const totalExpenses = parseFloat(expenses) + totalSalary + totalExtraWorkCost;
    document.getElementById('result').innerHTML = `<strong>Total Expenses: ${totalExpenses} INR</strong>`;
    
    // Show the expense table
    document.getElementById('expenseTable').style.display = 'table';
}

function downloadPDF(reportType) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text(`Business Expenses Report - ${reportType}`, 14, 10);
    doc.autoTable({
        head: [['Worker Name', 'Daily Wage (INR)', 'Days Worked', 'Weekly Salary (INR)', 'Shell Cutting (KG)', 'Shell Cutting Cost (INR)', 'Date']],
        body: expenseData[reportType].map(worker => [
            worker.name,
            worker.dailyWage,
            worker.daysWorked,
            worker.weeklySalary,
            worker.extraWork,
            worker.workerExtraCost,
            worker.date
        ]),
        startY: 30
    });

    doc.save(`${reportType}-business-expenses.pdf`);
}
