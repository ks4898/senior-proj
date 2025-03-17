document.addEventListener('DOMContentLoaded', function() {
    fetchPlayoffBracket();
  });
  
  async function fetchPlayoffBracket() {
    try {
      const response = await fetch('/playoff-bracket');
      if (!response.ok) {
        throw new Error('Failed to fetch playoff bracket');
      }
      const bracket = await response.json();
      renderPlayoffBracket(bracket);
    } catch (error) {
      console.error('Error fetching playoff bracket:', error);
    }
  }
  
  function renderPlayoffBracket(bracket) {
    const bracketContainer = document.getElementById('playoff-bracket');
    bracketContainer.innerHTML = '';
    
    // Render the bracket structure here
    // This is a simplified example, you'll need to adjust based on your exact bracket structure
    bracket.rounds.forEach((round, roundIndex) => {
      const roundElement = document.createElement('div');
      roundElement.className = 'round';
      roundElement.innerHTML = `<h3>Round ${roundIndex + 1}</h3>`;
      
      round.matches.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.className = 'match';
        matchElement.innerHTML = `
          <p>${match.team1} vs ${match.team2}</p>
          <p>Score: ${match.score1} - ${match.score2}</p>
        `;
        roundElement.appendChild(matchElement);
      });
      
      bracketContainer.appendChild(roundElement);
    });
  }  