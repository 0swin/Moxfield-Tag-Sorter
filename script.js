document.addEventListener('DOMContentLoaded', function() {
    const copyBtn = document.getElementById('copy-btn');
    const tableViewBtn = document.getElementById('table-view-btn');
    const csvViewBtn = document.getElementById('csv-view-btn');
    const inputArea = document.getElementById('input');
    const outputArea = document.getElementById('output');
    const tableOutput = document.getElementById('table-output');
    const statusMessage = document.getElementById('status-message');

    let parsedData = null;
    let debounceTimeout = null;
    
    // Function to process input with debounce
    function processInputWithDebounce() {
        // Clear any existing timeout
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
          // Show processing status
        statusMessage.textContent = 'Processing...';
        statusMessage.className = 'text-macchiato-overlay1 italic min-h-[20px] mb-3';
        
        // Set a timeout to process input after a delay
        debounceTimeout = setTimeout(() => {
            const inputText = inputArea.value.trim();
              if (!inputText) {
                outputArea.textContent = 'Please enter some data to convert.';
                tableOutput.innerHTML = '<p class="p-4 text-macchiato-overlay1 italic text-center">Please enter some data to convert.</p>';
                statusMessage.textContent = '';
                return;
            }
            
            try {
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
                  // Clear status message
                statusMessage.textContent = 'Conversion complete!';
                statusMessage.className = 'text-macchiato-green italic min-h-[20px] mb-3';
                setTimeout(() => {
                    statusMessage.textContent = '';
                    statusMessage.className = 'text-macchiato-overlay1 italic min-h-[20px] mb-3';
                }, 2000);            } catch (error) {
                statusMessage.textContent = 'Error: ' + error.message;
                statusMessage.className = 'text-macchiato-red italic min-h-[20px] mb-3';
            }
        }, 500); // 500ms delay for debounce
    }
    
    // Add input event listener for real-time conversion
    inputArea.addEventListener('input', processInputWithDebounce);copyBtn.addEventListener('click', function() {
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
        document.querySelectorAll('.btn-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        // Add active class to clicked button
        activeButton.classList.add('active');
    }// Parse input text and return structured data
    function parseInput(text) {
        // Split input into lines
        const lines = text.split('\n').filter(line => line.trim());
        
        // Parse each line into cards and tags
        const rows = [];
        let maxTags = 0;
          for (const line of lines) {
            const parts = line.split(' #');
            let card = parts[0].trim();
            
            // Strip set tags and numbers from card name
            // Pattern: removes (SET) followed by optional space and number at the end
            // Examples: "1 Bounty Board (OTC) 37" -> "1 Bounty Board"
            //           "2 Lightning Bolt (M11)" -> "2 Lightning Bolt"
            card = card.replace(/\s*\([A-Z0-9]+\)\s*\d*\s*$/, '');
            
            const tags = parts.slice(1).map(tag => tag.trim());
            
            rows.push({ card, tags });
            maxTags = Math.max(maxTags, tags.length);
        }
        
        // Sort by number of tags (descending)
        rows.sort((a, b) => b.tags.length - a.tags.length);        // Create header row
        const headerRow = ['#', 'Card Name'];
        for (let i = 0; i < maxTags; i++) {
            headerRow.push(`Tag ${i + 1}`);
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
        for (let i = 0; i < rows.length; i++) {
            const { card, tags } = rows[i];
            // Escape commas in card names by wrapping in quotes
            const escapedCard = card.includes(',') ? `"${card}"` : card;
            
            // Create a row with the line number, card name, and its tags, padding with empty entries if needed
            const csvRow = [(i + 1).toString(), escapedCard, ...tags];
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
    }    // Create HTML table from parsed data
    function createTable(data) {
        if (!data) return;
        
        const { rows, headerRow } = data;
        
        // Create table element
        const table = document.createElement('table');
        table.classList.add('w-full', 'border-collapse');
          // Create table header
        const thead = document.createElement('thead');
        const headerTr = document.createElement('tr');
          // Add all headers
        headerRow.forEach((headerText, index) => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.classList.add('bg-macchiato-surface1', 'text-macchiato-text', 'py-2', 'px-4', 'text-left', 'sticky', 'top-0');
            if (index === 0) { // First column (line number)
                th.style.width = '40px'; // Set a fixed width for the line number column
            }
            headerTr.appendChild(th);
        });
        
        thead.appendChild(headerTr);
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
          // Add rows with line numbers
        rows.forEach((row, index) => {
            const tr = document.createElement('tr');
            if (index % 2 === 1) {
                tr.classList.add('bg-macchiato-surface0/50');
            }
            tr.classList.add('hover:bg-macchiato-surface0');
              // Add line number cell
            const tdLineNumber = document.createElement('td');
            tdLineNumber.textContent = index + 1; // Line numbers start at 1
            tdLineNumber.classList.add('text-center', 'text-macchiato-overlay1', 'bg-macchiato-surface1', 'font-mono');
            tdLineNumber.style.width = '40px';
            tr.appendChild(tdLineNumber);            // Add card name cell
            const tdCard = document.createElement('td');
            tdCard.textContent = row.card;
            tdCard.classList.add('py-2', 'px-4', 'border-b', 'border-macchiato-overlay0');
            tr.appendChild(tdCard);
            
            // Add tag cells
            for (let i = 0; i < headerRow.length - 2; i++) {
                const td = document.createElement('td');
                td.textContent = row.tags[i] || '';
                td.classList.add('py-2', 'px-4', 'border-b', 'border-macchiato-overlay0');
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
