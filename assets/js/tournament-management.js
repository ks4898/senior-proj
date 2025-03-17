document.addEventListener('DOMContentLoaded', function() {
    fetchTournaments();
    setupEventListeners();
});

async function fetchTournaments() {
    try {
        const response = await fetch('/tournaments');
        if (!response.ok) {
            throw new Error('Failed to fetch tournaments');
        }
        const tournaments = await response.json();
        renderTournaments(tournaments);
    } catch (error) {
        console.error('Error fetching tournaments:', error);
    }
}

function renderTournaments(tournaments) {
    const tournamentsContainer = document.getElementById('tournaments-container');
    tournamentsContainer.innerHTML = '';
    tournaments.forEach(tournament => {
        const tournamentElement = document.createElement('div');
        tournamentElement.className = 'tournament';
        tournamentElement.innerHTML = `
            <h3>${tournament.Name}</h3>
            <p>Start Date: ${new Date(tournament.StartDate).toLocaleDateString()}</p>
            <p>End Date: ${new Date(tournament.EndDate).toLocaleDateString()}</p>
            <p>Location: ${tournament.Location}</p>
            <button onclick="signUpForTournament(${tournament.TournamentID})">Sign Up</button>
        `;
        tournamentsContainer.appendChild(tournamentElement);
    });
}

async function signUpForTournament(tournamentId) {
    const userId = getCurrentUserId();
    const teamId = getCurrentUserTeamId();

    if (!teamId) {
        alert('You must be part of a team to sign up for a tournament.');
        return;
    }

    try {
        const response = await fetch('/signup-tournament', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tournamentId, teamId }),
        });

        if (!response.ok) {
            throw new Error('Failed to sign up for tournament');
        }

        const result = await response.json();
        if (result.success) {
            alert('Successfully signed up for the tournament!');
            processPayment(userId, teamId, tournamentId);
        } else {
            alert('Failed to sign up for the tournament: ' + result.message);
        }
    } catch (error) {
        console.error('Error signing up for tournament:', error);
        alert('Failed to sign up for the tournament');
    }
}

async function processPayment(userId, teamId, tournamentId) {
    const amount = 50; // Set the tournament fee amount
    try {
        const response = await fetch('/process-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, teamId, tournamentId, amount }),
        });

        if (!response.ok) {
            throw new Error('Failed to process payment');
        }

        const result = await response.json();
        if (result.success) {
            alert('Payment processed successfully!');
        } else {
            alert('Failed to process payment: ' + result.message);
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        alert('Failed to process payment');
    }
}

function setupEventListeners() {
    const createTournamentBtn = document.getElementById('createTournamentBtn');
    if (createTournamentBtn) {
        createTournamentBtn.addEventListener('click', createTournament);
    }
}

async function createTournament() {
    const name = document.getElementById('tournamentName').value;
    const startDate = document.getElementById('tournamentStartDate').value;
    const endDate = document.getElementById('tournamentEndDate').value;
    const location = document.getElementById('tournamentLocation').value;

    try {
        const response = await fetch('/add-tournament', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, startDate, endDate, location }),
        });

        if (!response.ok) {
            throw new Error('Failed to create tournament');
        }

        const result = await response.json();
        alert('Tournament created successfully!');
        fetchTournaments();
    } catch (error) {
        console.error('Error creating tournament:', error);
        alert('Failed to create tournament');
    }
}

function getCurrentUserId() {
    // Implement this function to return the current user's ID
    // You might get this from a session or local storage
}

function getCurrentUserTeamId() {
    // Implement this function to return the current user's team ID
    // You might get this from a session or local storage
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
  
  // Add this to your existing event listeners
  document.getElementById('updatePublicityBtn').addEventListener('click', function() {
    const teamId = getCurrentTeamId(); // Implement this function to get the current team's ID
    const content = document.getElementById('publicityContent').value;
    updateTeamPublicity(teamId, content);
  });
  