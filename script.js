document.addEventListener('DOMContentLoaded', function() {
    const tariffForm = document.getElementById('tariff-form');
    const resultsSection = document.getElementById('results-section');
    let impactChart = null;

    // Country tariff rates from Excel Sheet1
    const countryTariffs = {
        "Afghanistan": 0.10,
        "Albania": 0.10,
        "Algeria": 0.30,
        "Andorra": 0.10,
        "Angola": 0.32,
        "Anguilla": 0.10,
        // Add all countries from the Excel Sheet1 here
        "China": 0.34,
        // ... other countries
    };

    tariffForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateTariffImpact();
    });

    function calculateTariffImpact() {
        // Get form values
        const country = document.getElementById('country').value;
        const currentUnitCost = parseFloat(document.getElementById('current-unit-cost').value);
        const previousDuties = parseFloat(document.getElementById('previous-duties').value) / 100; // Convert to decimal
        const currentRetailPrice = parseFloat(document.getElementById('current-retail-price').value);
        
        // 1. Look up New Tariff based on selected Country (from Excel SUMIFS formula)
        const newTariff = countryTariffs[country] || 0;
        
        // 2. Calculate New Total Duties = New Tariff + Total Duties Paid prior to April 2nd
        const newTotalDuties = newTariff + previousDuties;
        
        // 3. Calculate Old Margin = (Current Retail Price - (Current Unit Cost * (1 + Previous Duties))) / Current Retail Price
        // This matches the Excel formula: (C9-(C6*(1+C7)))/C9
        const oldMargin = (currentRetailPrice - (currentUnitCost * (1 + previousDuties))) / currentRetailPrice;
        
        // 4. Calculate New Margin at Current Retail Price
        // This matches the Excel formula: (C9-(C6*(1+C8)))/C9
        const newMargin = (currentRetailPrice - (currentUnitCost * (1 + newTotalDuties))) / currentRetailPrice;
        
        // 5. Calculate Proposed Retail Price at Old Margin
        // This matches the Excel formula: (C6*(1+C8))/(1-C10)
        const proposedRetailPrice = (currentUnitCost * (1 + newTotalDuties)) / (1 - oldMargin);
        
        // Update results (convert decimals to percentages for display)
        document.getElementById('new-tariff').textContent = `${(newTariff * 100).toFixed(2)}%`;
        document.getElementById('new-total-duties').textContent = `${(newTotalDuties * 100).toFixed(2)}%`;
        document.getElementById('old-margin').textContent = `${(oldMargin * 100).toFixed(2)}%`;
        document.getElementById('new-margin').textContent = `${(newMargin * 100).toFixed(2)}%`;
        document.getElementById('proposed-retail-price').textContent = formatCurrency(proposedRetailPrice);
        
        // Show results section
        resultsSection.style.display = 'block';
        
        // Create or update chart with new data
        createImpactChart(currentRetailPrice, proposedRetailPrice);
        
        // Update impact text
        const percentageChange = ((proposedRetailPrice - currentRetailPrice) / currentRetailPrice) * 100;
        const impactText = `Due to the new tariff of ${(newTariff * 100).toFixed(2)}% on goods from ${country}, the total duties have increased from ${(previousDuties * 100).toFixed(2)}% to ${(newTotalDuties * 100).toFixed(2)}%. To maintain your current profit margin of ${(oldMargin * 100).toFixed(2)}%, the retail price would need to increase from ${formatCurrency(currentRetailPrice)} to ${formatCurrency(proposedRetailPrice)}, a ${percentageChange.toFixed(2)}% increase.`;
        
        document.getElementById('impact-text').textContent = impactText;
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    }

    function createImpactChart(currentRetailPrice, proposedRetailPrice) {
        const ctx = document.getElementById('impact-chart').getContext('2d');
        
        // Destroy previous chart if it exists
        if (impactChart) {
            impactChart.destroy();
        }
        
        impactChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Current Retail Price', 'Proposed Retail Price'],
                datasets: [{
                    label: 'Price Comparison',
                    data: [currentRetailPrice, proposedRetailPrice],
                    backgroundColor: [
                        'rgba(37, 99, 235, 0.7)',
                        'rgba(245, 158, 11, 0.7)'
                    ],
                    borderColor: [
                        'rgba(37, 99, 235, 1)',
                        'rgba(245, 158, 11, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
});