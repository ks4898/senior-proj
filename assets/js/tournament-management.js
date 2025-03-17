document.addEventListener('DOMContentLoaded', function() {
    fetchMatches();
    setupEventListeners();
  });
  
  async function fetchMatches() {
    try {
      const response = await fetch('/matches');
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const matches = await response.json();
      renderMatches(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  }
  
  function renderMatches(matches) {
    const matchesContainer = document.getElementById('matches-container');
    matchesContainer.innerHTML = '';
    matches.forEach(match => {
      const matchElement = document.createElement('div');
      matchElement.className = 'match';
      matchElement.innerHTML = `
        <h3>Match ${match.MatchID}</h3>
        <p>${match.Team1Name} vs ${match.Team2Name}</p>
        <p>Date: ${new Date(match.MatchDate).toLocaleDateString()}</p>
        <input type="number" id="score-team1-${match.MatchID}" placeholder="Team 1 Score">
        <input type="number" id="score-team2-${match.MatchID}" placeholder="Team 2 Score">
        <button onclick="postResult(${match.MatchID})">Post Result</button>
      `;
      matchesContainer.appendChild(matchElement);
    });
  }
  
  async function postResult(matchId) {
    const team1Score = document.getElementById(`score-team1-${matchId}`).value;
    const team2Score = document.getElementById(`score-team2-${matchId}`).value;
    
    if (!team1Score || !team2Score) {
      alert('Please enter scores for both teams');
      return;
    }
  
    try {
      const response = await fetch('/post-match-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId, team1Score, team2Score }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to post match result');
      }
  
      alert('Match result posted successfully');
      fetchMatches(); // Refresh the matches list
    } catch (error) {
      console.error('Error posting match result:', error);
      alert('Failed to post match result');
    }
  }
  
  function setupEventListeners() {
    const generateReportBtn = document.getElementById('generate-report-btn');
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