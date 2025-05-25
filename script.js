document.addEventListener('DOMContentLoaded', function() {
    const convertBtn = document.getElementById('convert-btn');
    const copyBtn = document.getElementById('copy-btn');
    const tableViewBtn = document.getElementById('table-view-btn');
    const csvViewBtn = document.getElementById('csv-view-btn');
    const inputArea = document.getElementById('input');
    const outputArea = document.getElementById('output');
    const tableOutput = document.getElementById('table-output');

    let parsedData = null;

    convertBtn.addEventListener('click', function() {
        const inputText = inputArea.value.trim();
        if (!inputText) {
            outputArea.textContent = 'Please enter some data to convert.';
            tableOutput.innerHTML = 'Please enter some data to convert.';
            return;
        }

        // Process the input
        parsedData = parseInput(inputText);
        const csvData = generateCsvContent(parsedData);
        
        // Update both views
        outputArea.textContent = csvData;
        createTable(parsedData);
        
        // Default to table view
        tableOutput.style.display = 'block';
        outputArea.style.display = 'none';
        setActiveTab(tableViewBtn);
    });    copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(outputArea.textContent)
            .then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    });
    
    // View toggle buttons
    tableViewBtn.addEventListener('click', function() {
        tableOutput.style.display = 'block';
        outputArea.style.display = 'none';
        setActiveTab(tableViewBtn);
    });
    
    csvViewBtn.addEventListener('click', function() {
        tableOutput.style.display = 'none';
        outputArea.style.display = 'block';
        setActiveTab(csvViewBtn);
    });
    
    function setActiveTab(activeButton) {
        // Remove active class from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Add active class to clicked button
        activeButton.classList.add('active');
    }    // Parse input text and return structured data
    function parseInput(text) {
        // Split input into lines
        const lines = text.split('\n').filter(line => line.trim());
        
        // Parse each line into cards and tags
        const rows = [];
        let maxTags = 0;
        
        for (const line of lines) {
            const parts = line.split(' #');
            const card = parts[0].trim();
            const tags = parts.slice(1).map(tag => tag.trim());
            
            rows.push({ card, tags });
            maxTags = Math.max(maxTags, tags.length);
        }
        
        // Sort by number of tags (descending)
        rows.sort((a, b) => b.tags.length - a.tags.length);
        
        // Create header row
        const headerRow = ['Card'];
        for (let i = 0; i < maxTags; i++) {
            headerRow.push(`Tag${i + 1}`);
        }
        
        return { rows, headerRow, maxTags };
    }
    
    // Generate CSV content from parsed data
    function generateCsvContent(data) {
        if (!data) return '';
        
        const { rows, headerRow, maxTags } = data;
        
        // Create CSV content
        let csvContent = headerRow.join(',') + '\n';
        
        // Add data rows
        for (const row of rows) {
            const { card, tags } = row;
            // Escape commas in card names by wrapping in quotes
            const escapedCard = card.includes(',') ? `"${card}"` : card;
            
            // Create a row with the card and its tags, padding with empty entries if needed
            const csvRow = [escapedCard, ...tags];
            while (csvRow.length < headerRow.length) {
                csvRow.push('');
            }
            
            // Properly escape any values that contain commas or quotes
            const escapedRow = csvRow.map(value => {
                if (value.includes(',') || value.includes('"')) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            });
            
            csvContent += escapedRow.join(',') + '\n';
        }
        
        return csvContent;
    }
    
    // Create HTML table from parsed data
    function createTable(data) {
        if (!data) return;
        
        const { rows, headerRow } = data;
        
        // Create table element
        const table = document.createElement('table');
        
        // Create table header
        const thead = document.createElement('thead');
        const headerTr = document.createElement('tr');
        
        headerRow.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerTr.appendChild(th);
        });
        
        thead.appendChild(headerTr);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        rows.forEach(row => {
            const tr = document.createElement('tr');
            
            // Add card name cell
            const tdCard = document.createElement('td');
            tdCard.textContent = row.card;
            tr.appendChild(tdCard);
            
            // Add tag cells
            for (let i = 0; i < headerRow.length - 1; i++) {
                const td = document.createElement('td');
                td.textContent = row.tags[i] || '';
                tr.appendChild(td);
            }
            
            tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
        
        // Clear previous content and add table
        tableOutput.innerHTML = '';
        tableOutput.appendChild(table);
    }
    
    // Legacy function for backward compatibility
    function convertToCsv(text) {
        const data = parseInput(text);
        return generateCsvContent(data);
    }
});
