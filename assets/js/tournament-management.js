document.addEventListener('DOMContentLoaded', function () {
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

    try {
        const response = await fetch('/post-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ matchId, scoreTeam1: team1Score, scoreTeam2: team2Score }),
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

// Add this function to allow teams to update their publicity content
async function updateTeamPublicity(teamId, content) {
    try {
        const response = await fetch(`/update-team-publicity/${teamId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            throw new Error('Failed to update team publicity');
        }

        const result = await response.json();
        alert('Team publicity updated successfully!');
    } catch (error) {
        console.error('Error updating team publicity:', error);
        alert('Failed to update team publicity');
    }
}

function setupEventListeners() {
    // Add any additional event listeners here
    // Add this to your existing event listeners
    document.getElementById('updatePublicityBtn').addEventListener('click', function () {
        const teamId = getCurrentTeamId(); // Implement this function to get the current team's ID
        const content = document.getElementById('publicityContent').value;
        updateTeamPublicity(teamId, content);
    });
}