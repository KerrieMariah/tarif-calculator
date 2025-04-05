document.addEventListener('DOMContentLoaded', function() {
    const tariffForm = document.getElementById('tariff-form');
    const resultsSection = document.getElementById('results-section');
    let impactChart = null;

    tariffForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateTariffImpact();
    });

    function calculateTariffImpact() {
        // Get form values
        const country = document.getElementById('country').value;
        const newTariff = parseFloat(document.getElementById('new-tariff').value);
        const currentUnitCost = parseFloat(document.getElementById('current-unit-cost').value);
        const previousDuties = parseFloat(document.getElementById('previous-duties').value);
        const currentRetailPrice = parseFloat(document.getElementById('current-retail-price').value);
        
        // Calculate new total duties
        const newTotalDuties = previousDuties + newTariff;
        
        // Calculate costs with duties
        const oldCostWithDuties = currentUnitCost * (1 + (previousDuties / 100));
        const newCostWithDuties = currentUnitCost * (1 + (newTotalDuties / 100));
        
        // Calculate margins
        const oldMargin = ((currentRetailPrice - oldCostWithDuties) / currentRetailPrice) * 100;
        const newMargin = ((currentRetailPrice - newCostWithDuties) / currentRetailPrice) * 100;
        
        // Calculate proposed retail price to maintain old margin
        const proposedRetailPrice = newCostWithDuties / (1 - (oldMargin / 100));
        
        // Update results
        document.getElementById('new-total-duties').textContent = `${newTotalDuties.toFixed(2)}%`;
        document.getElementById('old-margin').textContent = `${oldMargin.toFixed(2)}%`;
        document.getElementById('new-margin').textContent = `${newMargin.toFixed(2)}%`;
        document.getElementById('proposed-retail-price').textContent = formatCurrency(proposedRetailPrice);
        
        // Show results section
        resultsSection.style.display = 'block';
        
        // Create or update chart with new data
        createImpactChart(currentRetailPrice, proposedRetailPrice);
        
        // Update impact text
        const percentageChange = ((proposedRetailPrice - currentRetailPrice) / currentRetailPrice) * 100;
        const impactText = `Due to the new tariff of ${newTariff}% on goods from ${country}, the total duties have increased from ${previousDuties}% to ${newTotalDuties}%. To maintain your current profit margin of ${oldMargin.toFixed(2)}%, the retail price would need to increase from ${formatCurrency(currentRetailPrice)} to ${formatCurrency(proposedRetailPrice)}, a ${percentageChange.toFixed(2)}% increase.`;
        
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

    function generateImpactText(origin, destination, category, currentTariff, proposedTariff, percentageChange) {
        const countryNames = {
            'us': 'the United States',
            'cn': 'China',
            'eu': 'the European Union',
            'uk': 'the United Kingdom',
            'jp': 'Japan',
            'other': 'your selected country'
        };
        
        const categoryNames = {
            'electronics': 'electronics',
            'automotive': 'automotive products',
            'agriculture': 'agricultural products',
            'textiles': 'textiles',
            'steel': 'steel and metals',
            'other': 'products in this category'
        };
        
        let impact = '';
        
        if (percentageChange > 0) {
            impact = `The proposed tariff increase from ${currentTariff}% to ${proposedTariff}% on ${categoryNames[category]} imported from ${countryNames[origin]} to ${countryNames[destination]} would result in a ${percentageChange.toFixed(2)}% cost increase. This may impact competitiveness and potentially lead to higher consumer prices.`;
        } else if (percentageChange < 0) {
            impact = `The proposed tariff reduction from ${currentTariff}% to ${proposedTariff}% on ${categoryNames[category]} imported from ${countryNames[origin]} to ${countryNames[destination]} would result in a ${Math.abs(percentageChange).toFixed(2)}% cost decrease. This could improve competitiveness and potentially lead to lower consumer prices.`;
        } else {
            impact = `There is no change in tariff rates, so costs will remain the same for ${categoryNames[category]} imported from ${countryNames[origin]} to ${countryNames[destination]}.`;
        }
        
        return impact;
    }
}); 