document.addEventListener("DOMContentLoaded", function () {
    let isEdit = false;
    fetchTeams();
    fetchUniversities();

    const searchButton = document.getElementById('searchTeamsBtn');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            const searchTerm = document.getElementById('searchTeam').value.trim();
            if (searchTerm) {
                searchTeams(searchTerm);
            } else {
                fetchTeams();
            }
        });
    }

    document.getElementById('addTeamBtn').addEventListener('click', function () {
        isEdit = false;
        const teamModal = new bootstrap.Modal(document.getElementById('addTeamModal'));
        document.getElementById("addTeamModalLabel").innerHTML = "Add New Team";
        teamModal.show();
    });

    document.getElementById('editTeamBtn').addEventListener('click', async function () {
        isEdit = true;
        var selectedTeams = document.getElementsByClassName('selected');
        if (selectedTeams.length === 0) {
            alert('Select a team to edit');
            return;
        }
        const teamId = document.querySelector('.selected').dataset.teamId;
        document.getElementById('editTeamModal').dataset.teamId = teamId;

        if (!teamId) {
            alert("Couldn't perform edit");
            return;
        }
        
        try {
            const response = await fetch(`/team?id=${teamId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch team details');
            }
            const team = await response.json();
            document.getElementById('editTeamName').value = team.Name;
            document.getElementById('selectEditCollege').value = team.UniversityID;

            // Fetch team members for leader and delete options
            const membersResponse = await fetch(`/team-members?teamId=${teamId}`);
            if (!membersResponse.ok) {
                throw new Error('Failed to fetch team members');
            }
            const members = await membersResponse.json();
            populateTeamMembersSelect(members);

            const editTeamModal = new bootstrap.Modal(document.getElementById('editTeamModal'));
            document.getElementById("editTeamModalLabel").innerHTML = "Edit Team with ID: " + teamId;
            editTeamModal.show();
        } catch (error) {
            console.error('Error fetching team:', error);
        }
    });

    document.getElementById('createTeamBtn').addEventListener('click', async function () {
        const teamName = document.getElementById('addTeamName').value;
        const universityId = document.getElementById('selectAddCollege').value;
        if (!teamName || !universityId) {
            alert('Please fill in all fields.');
            return;
        }
        try {
            const response = await fetch('/add-team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: teamName, universityId: universityId })
            });
            if (!response.ok) {
                throw new Error('Failed to add team');
            }
            const data = await response.json();
            console.log(data);
            alert('Team added successfully!');
            const teamModal = document.getElementById('addTeamModal');
            const instance = bootstrap.Modal.getInstance(teamModal);
            if (instance) {
                instance.hide();
            } else {
                console.warn('Modal instance not found.');
            }
            fetchTeams();
        } catch (error) {
            console.error('Error adding team:', error);
        }
    });

    document.getElementById('saveTeamBtn').addEventListener('click', async function () {
        const teamId = document.getElementById('editTeamModal').dataset.teamId;
        const teamName = document.getElementById('editTeamName').value;
        const universityId = document.getElementById('selectEditCollege').value;
        const newLeaderId = document.getElementById('selectEditLeader').value;
        const memberToDeleteId = document.getElementById('selectDeleteMember').value;

        if (!teamName || !universityId) {
            alert('Please fill in all required fields.');
            return;
        }

        const requestBody = {
            name: teamName,
            universityId: universityId
        };

        if (newLeaderId) {
            requestBody.newLeaderId = newLeaderId;
        }

        if (memberToDeleteId) {
            requestBody.memberToDeleteId = memberToDeleteId;
        }

        try {
            const response = await fetch(`/edit-team/${teamId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error('Failed to edit team');
            }

            const data = await response.json();
            console.log(data);
            alert('Team updated successfully!');
            const teamModal = document.getElementById('editTeamModal');
            const instance = bootstrap.Modal.getInstance(teamModal);
            if (instance) {
                instance.hide();
            } else {
                console.warn('Modal instance not found.');
            }
            fetchTeams();
        } catch (error) {
            console.error('Error editing team:', error);
        }
    });

    document.getElementById('deleteTeamBtn').addEventListener('click', async function () {
        var selectedTeams = document.getElementsByClassName('selected');
        if (selectedTeams.length === 0) {
            alert('Select a team to delete');
            return;
        }
        const teamId = document.querySelector('.selected').dataset.teamId;
        document.getElementById('deleteTeamModal').dataset.teamId = teamId;

        if (!teamId) {
            alert("Couldn't perform delete");
            return;
        }

        const deleteTeamModal = new bootstrap.Modal(document.getElementById('deleteTeamModal'));
        document.getElementById('teamDetails').innerHTML = "Delete Team ID: " + teamId + " ?";
        deleteTeamModal.show();
    });

    document.getElementById('confirmDeleteTeamBtn').addEventListener('click', async function () {
        const teamId = document.getElementById('deleteTeamModal').dataset.teamId;
        try {
            const response = await fetch(`/delete-team/${teamId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete team');
            }
            const data = await response.json();
            console.log(data);
            alert('Team deleted successfully!');
            const modal = document.getElementById('deleteTeamModal');
            const instance = bootstrap.Modal.getInstance(modal);
            if (instance) {
                instance.hide();
            } else {
                console.warn('Modal instance not found.');
            }
            fetchTeams();
        } catch (error) {
            console.error('Error deleting team:', error);
        }
    });
});

async function fetchTeams() {
    try {
        const response = await fetch('/teams');
        if (!response.ok) {
            throw new Error('Failed to fetch teams: ' + response.statusText);
        }
        const teams = await response.json();
        renderTeams(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        alert('Failed to fetch teams.');
    }
}

function renderTeams(teams) {
    const tbody = document.getElementById("teamTableBody");
    tbody.innerHTML = "";
    teams.forEach(team => {
        const row = document.createElement("tr");
        row.dataset.teamId = team.TeamID;
        row.innerHTML = `
            <td>${team.TeamID}</td>
            <td>${team.Name}</td>
            <td>${team.UniversityID}</td>
            <td>${team.UniversityName}</td>
            <td>${new Date(team.CreatedDate).toLocaleDateString()}</td>
        `;
        row.addEventListener('click', function() {
            document.querySelectorAll('#teamTableBody tr').forEach(row => row.classList.remove('selected'));
            document.querySelectorAll('#collegeTableBody tr').forEach(row => row.classList.remove('selected'));
            this.classList.add('selected');
        });
        tbody.appendChild(row);
    });
}

async function searchTeams(searchTerm) {
    try {
        const response = await fetch(`/search-teams?query=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error('Failed to search teams: ' + response.statusText);
        }
        const teams = await response.json();
        renderTeams(teams);
    } catch (error) {
        console.error('Error searching teams:', error);
        alert('Failed to search teams.');
    }
}

async function fetchUniversities() {
    try {
        const response = await fetch('/universities');
        if (!response.ok) {
            throw new Error('Failed to fetch universities: ' + response.statusText);
        }
        const universities = await response.json();
        populateUniversitySelect(universities);
    } catch (error) {
        console.error('Error fetching universities:', error);
        alert('Failed to fetch universities.');
    }
}

function populateUniversitySelect(universities) {
    const addSelect = document.getElementById('selectAddCollege');
    const editSelect = document.getElementById('selectEditCollege');
    addSelect.innerHTML = '<option value="">Select a college</option>';
    editSelect.innerHTML = '<option value="">Select a college</option>';
    universities.forEach(university => {
        const option = document.createElement('option');
        option.value = university.UniversityID;
        option.textContent = university.Name;
        addSelect.appendChild(option.cloneNode(true));
        editSelect.appendChild(option);
    });
}

function populateTeamMembersSelect(members) {
    const leaderSelect = document.getElementById('selectEditLeader');
    const deleteSelect = document.getElementById('selectDeleteMember');
    leaderSelect.innerHTML = '<option value="">Select new leader</option>';
    deleteSelect.innerHTML = '<option value="">Select member to delete</option>';
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.UserID;
        option.textContent = member.Name;
        leaderSelect.appendChild(option.cloneNode(true));
        deleteSelect.appendChild(option);
    });
}
