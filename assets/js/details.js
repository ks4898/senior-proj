document.addEventListener("DOMContentLoaded", fetchCollegeData);

async function fetchCollegeData() {
    const urlParams = new URLSearchParams(window.location.search);
    const collegeName = urlParams.get("name");

    if (!collegeName) {
        console.error("No college name provided in URL.");
        return;
    }

    try {
        const response = await fetch(`/university?name=${collegeName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const collegeData = await response.json();

        if (!collegeData || !collegeData.Name || !collegeData.Location || !collegeData.Founded) {
            console.error("Invalid college data received.");
            return;
        }

        document.querySelector(".college-name").textContent = collegeData.Name.toUpperCase();
        document.querySelector(".location").textContent = `Location: ${collegeData.Location}`;
        document.querySelector(".founded").textContent = `Founded: ${collegeData.Founded}`;

        if (collegeData.Emblem) {
            document.querySelector(".college-emblem").src = collegeData.Emblem;
            document.querySelector(".college-emblem").setAttribute("alt", `${collegeData.Name} Logo`);
        }
        if (collegeData.ImageURL) {
            document.querySelector(".college-image").src = collegeData.ImageURL;
            document.querySelector(".college-image").setAttribute("alt", `${collegeData.Name} Picture`);
        }

        const desc = document.querySelector(".college-description");
        const para = document.createElement("p");
        desc.appendChild(para);
        para.textContent = collegeData.Description;

        const teamsResponse = await fetch(`/teams-for-college?name=${collegeName}`);
        if (!teamsResponse.ok) {
            throw new Error(`HTTP error! Status: ${teamsResponse.status}`);
        }
        const teams = await teamsResponse.json();

        if (teams.length <= 0) {
            const div = document.createElement("div");
            div.classList.add("team-section");
            div.setAttribute("style", "height: 30vh;");
            const parag = document.createElement("p");
            const parag2 = document.createElement("p");
            parag.textContent = "No teams have applied for this college yet.";
            parag2.textContent = "Please check again later.";
            parag.setAttribute("style", "color: #F1FDFF; margin-top: 1em; text-align: center; font-size: 2em;");
            parag.setAttribute("class", "text-center");
            parag2.setAttribute("style", "color: #F1FDFF; text-align: center; font-size: 2em;");
            parag2.setAttribute("class", "text-center");
            div.appendChild(parag);
            div.appendChild(parag2);
            document.getElementsByTagName("body")[0].appendChild(div);
            return;
        }

        console.log("Teams fetched:", teams);

        const teamsContainer = document.getElementById('teams-container');
        teamsContainer.innerHTML = '';

        const teamMap = {};
        teams.forEach(team => {
            if (!teamMap[team.TeamID]) {
                teamMap[team.TeamID] = { name: team.Name, players: [] };
            }
            if (team.PlayerName) {
                teamMap[team.TeamID].players.push({
                    name: team.PlayerName,
                    imageURL: team.ImageURL,
                    role: team.Role
                });
            }
        });

        Object.keys(teamMap).forEach((teamId, index) => {
            const team = teamMap[teamId];
            team.players.sort((a, b) => (a.role === 'Leader' ? -1 : b.role === 'Leader' ? 1 : 0));

            const teamHTML = `
                <div class="team-section ${index % 2 === 0 ? '' : 'team-section-alt'}">
                    <p class="team-title ${index % 2 === 0 ? '' : 'team-title-alt'}">Team ${index + 1} - ${team.name}</p>
                    <div class="players-container">
                        ${team.players.map((player, playerIndex) => `
                            <div class="player-card">
                                <img src="${player.imageURL}" alt="Player picture">
                                <p>${player.name}${playerIndex === 0 ? ' (Leader)' : ''}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            teamsContainer.innerHTML += teamHTML;
        });

    } catch (error) {
        console.error('Error:', error);
    }
}