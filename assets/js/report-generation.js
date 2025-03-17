document.addEventListener('DOMContentLoaded', function() {
    setupReportGeneration();
});

function setupReportGeneration() {
    const generateReportBtn = document.getElementById('generateReportBtn');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
}

async function generateReport() {
    try {
        const response = await fetch('/generate-report');
        if (!response.ok) {
            throw new Error('Failed to generate report');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'tournament_report.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to generate report');
    }
}
