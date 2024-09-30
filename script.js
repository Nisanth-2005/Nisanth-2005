// Function to dynamically generate input fields for extra workers and attendance (days worked)
function generateWorkerFields() {
    const extraWorkers = document.getElementById('extraWorkers').value;
    const extraWorkFields = document.getElementById('extraWorkFields');

    // Clear existing fields before generating new ones
    extraWorkFields.innerHTML = '';

    // If extra workers are entered, generate input fields for each worker
    if (extraWorkers > 0) {
        for (let i = 1; i <= extraWorkers; i++) {
            const workerField = document.createElement('div');
            workerField.classList.add('form-group');

            // Label for Worker
            const label = document.createElement('label');
            label.textContent = `Worker ${i} - Name, Extra Work (KG), Cost per KG (INR), and Days Worked (out of 7):`;

            // Input for Worker Name
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.id = `workerName_${i}`;
            nameInput.placeholder = `Worker ${i} Name`;

            // Input for Extra Work (KG)
            const extraWorkInput = document.createElement('input');
            extraWorkInput.type = 'number';
            extraWorkInput.id = `extraWork_${i}`;
            extraWorkInput.placeholder = `Extra work done by Worker ${i} (in KG)`;
            extraWorkInput.min = 0;

            // Input for Cost per KG
            const extraWorkCostInput = document.createElement('input');
            extraWorkCostInput.type = 'number';
            extraWorkCostInput.id = `extraWorkCost_${i}`;
            extraWorkCostInput.placeholder = `Cost per KG for Worker ${i} (in INR)`;
            extraWorkCostInput.min = 0;

            // Input for Days Worked
            const daysWorkedInput = document.createElement('input');
            daysWorkedInput.type = 'number';
            daysWorkedInput.id = `daysWorked_${i}`;
            daysWorkedInput.placeholder = `Days worked out of 7`;
            daysWorkedInput.min = 0;
            daysWorkedInput.max = 7;

            workerField.appendChild(label);
            workerField.appendChild(nameInput);
            workerField.appendChild(extraWorkInput);
            workerField.appendChild(extraWorkCostInput);
            workerField.appendChild(daysWorkedInput);

            extraWorkFields.appendChild(workerField);
        }
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

    // Calculate extra work cost and weekly salary for each worker
    for (let i = 1; i <= extraWorkers; i++) {
        const name = document.getElementById(`workerName_${i}`).value;
        const extraWork = document.getElementById(`extraWork_${i}`).value;
        const extraWorkCost = document.getElementById(`extraWorkCost_${i}`).value;
        const daysWorked = document.getElementById(`daysWorked_${i}`).value;

        const workerExtraCost = extraWork * extraWorkCost;
        totalExtraWorkCost += workerExtraCost;

        // Weekly salary calculation based on attendance
        const weeklySalary = dailyWage * daysWorked;
        totalSalary += weeklySalary;

        // Store data for each worker
        extraWorkerData.push({
            name: name,
            dailyWage: dailyWage,
            extraWork: extraWork,
            extraWorkCost: workerExtraCost,
            daysWorked: daysWorked,
            weeklySalary: weeklySalary
        });
    }

    const totalCost = parseFloat(totalSalary) + parseFloat(expenses) + parseFloat(totalExtraWorkCost);

    const dateTime = new Date();
    const formattedDate = dateTime.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedTime = dateTime.toLocaleTimeString('en-IN');

    document.getElementById('result').innerHTML = `
        <p>Date: ${formattedDate}</p>
        <p>Time: ${formattedTime}</p>
        <p>Total Salary for Workers: INR ${totalSalary}</p>
        <p>Total Expenses: INR ${expenses}</p>
        <p>Total Extra Work Cost: INR ${totalExtraWorkCost}</p>
        <p><strong>Total Today’s Expense: INR ${totalCost}</strong></p>
    `;

    // Store the data locally with the date as a key
    const storedData = JSON.parse(localStorage.getItem('businessData')) || [];
    storedData.push({
        date: formattedDate,
        time: formattedTime,
        totalSalary,
        totalExpenses: expenses,
        totalExtraWorkCost,
        totalCost,
        extraWorkerData
    });
    localStorage.setItem('businessData', JSON.stringify(storedData));

    // Download data as Excel file
    downloadExcel({
        date: formattedDate,
        time: formattedTime,
        totalSalary,
        totalExpenses: expenses,
        totalExtraWorkCost,
        totalCost,
        extraWorkerData
    });
}

function downloadExcel(data) {
    const worksheetData = [
        ['Date', 'Time', 'Total Salary', 'Total Expenses', 'Total Extra Work Cost', 'Total Cost'],
        [data.date, data.time, data.totalSalary, data.totalExpenses, data.totalExtraWorkCost, data.totalCost],
        ['Worker Name', 'Daily Wage', 'Days Worked (out of 7)', 'Weekly Salary', 'Extra Work (KG)', 'Extra Work Cost'],
    ];

    data.extraWorkerData.forEach(worker => {
        worksheetData.push([worker.name, worker.dailyWage, worker.daysWorked, worker.weeklySalary, worker.extraWork, worker.extraWorkCost]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
    XLSX.writeFile(workbook, `Business_Expenses_${data.date}_${data.time}.xlsx`);
}

// Function to display stored data based on date range (daily, weekly, monthly, yearly)
function displayStoredData(range) {
    const storedData = JSON.parse(localStorage.getItem('businessData')) || [];
    let filteredData = [];

    // Filter data based on the range (daily, weekly, monthly, yearly)
    const today = new Date();

    storedData.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (range === 'daily' && entryDate.toDateString() === today.toDateString()) {
            filteredData.push(entry);
        } else if (range === 'weekly' && (today - entryDate) / (1000 * 60 * 60 * 24) <= 7) {
            filteredData.push(entry);
        } else if (range === 'monthly' && today.getMonth() === entryDate.getMonth() && today.getFullYear() === entryDate.getFullYear()) {
            filteredData.push(entry);
        } else if (range === 'yearly' && today.getFullYear() === entryDate.getFullYear()) {
            filteredData.push(entry);
        }
    });

    let resultHtml = '<ul>';
    filteredData.forEach((entry) => {
        resultHtml += `
            <li>Date: ${entry.date}, Time: ${entry.time}, Total Expense: INR ${entry.totalCost}</li>
        `;
    });
    resultHtml += '</ul>';
    document.getElementById('storedDataDisplay').innerHTML = resultHtml;
}

function displayWorkerPayments(range) {
    const workerName = document.getElementById('workerName').value;
    const storedData = JSON.parse(localStorage.getItem('businessData')) || [];

    let filteredData = [];
    const today = new Date();

    storedData.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (entry.extraWorkerData) {
            entry.extraWorkerData.forEach((worker) => {
                if (worker.name.toLowerCase() === workerName.toLowerCase()) {
                    if (range === 'weekly' && (today - entryDate) / (1000 * 60 * 60 * 24) <= 7) {
                        filteredData.push(worker);
                    } else if (range === 'monthly' && today.getMonth() === entryDate.getMonth() && today.getFullYear() === entryDate.getFullYear()) {
                        filteredData.push(worker);
                    }
                }
            });
        }
    });

    let resultHtml = `<h4>${workerName}'s ${range.charAt(0).toUpperCase() + range.slice(1)} Payments</h4><ul>`;
    let totalPayment = 0;

    filteredData.forEach((worker) => {
        resultHtml += `
            <li>Extra Work: ${worker.extraWork} KG, Extra Work Cost: INR ${worker.extraWorkCost}, Daily Wage: INR ${worker.dailyWage}, Weekly Salary: INR ${worker.weeklySalary}</li>
        `;
        totalPayment += parseFloat(worker.extraWorkCost) + parseFloat(worker.weeklySalary);
    });

    resultHtml += `</ul><strong>Total ${range.charAt(0).toUpperCase() + range.slice(1)} Payment: INR ${totalPayment}</strong>`;
    document.getElementById('workerPaymentDisplay').innerHTML = resultHtml;
}
