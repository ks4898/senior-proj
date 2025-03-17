document.addEventListener("DOMContentLoaded", function () {
    var isEdit = false;
    
    fetchColleges();

        const searchButton = document.getElementById('searchCollegesButton');
        if (searchButton) {
            searchButton.addEventListener('click', function () {
                const searchTerm = document.getElementById('searchCollege').value.trim();
                if (searchTerm) {
                    searchColleges(searchTerm);
                } else {
                    fetchColleges();
                }
            });
        }

    document.getElementById('addCollegeBtn').addEventListener('click', function () {
        isEdit = false;
        const collegeModal = new bootstrap.Modal(document.getElementById('collegeModal'));
        document.getElementById("collegeModalLabel").innerHTML = "Add New College";
        collegeModal.show();
    });

    document.getElementById('editCollegeBtn').addEventListener('click', async function () {
        isEdit = true;

        var selectedColleges = document.getElementsByClassName('selected');
        console.log(selectedColleges.length);
        if (selectedColleges.length === 0) {
            alert('Select a college to edit');
            return;
        }

        const collegeId = document.querySelector('.selected').dataset.collegeId;
        document.getElementById('collegeModal').dataset.collegeId = collegeId;

        if (!collegeId) {
            alert("Couldn't perform edit");
            return;
        }

        try {
            const response = await fetch(`/university?id=${collegeId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch college details');
            }
            const college = await response.json();
            document.getElementById('collegeName').value = college.Name;
            document.getElementById('location').value = college.Location;
            document.getElementById('founded').value = college.Founded;
            document.getElementById('description').value = college.Description;
            document.getElementById('logoURL').value = college.Emblem;
            document.getElementById('pictureURL').value = college.ImageURL;
            const editCollegeModal = new bootstrap.Modal(document.getElementById('collegeModal'));
            document.getElementById("collegeModalLabel").innerHTML = "Edit College with ID: " + collegeId;
            editCollegeModal.show();
        } catch (error) {
            console.error('Error fetching college:', error);
        }
    });

    document.getElementById('saveCollegeBtn').addEventListener('click', async function () {
        if (!isEdit) {
            const collegeName = document.getElementById('collegeName').value;
            const location = document.getElementById('location').value;
            const founded = document.getElementById('founded').value;
            const description = document.getElementById('description').value;
            const logoURL = document.getElementById('logoURL').value;
            const pictureURL = document.getElementById('pictureURL').value;

            if (!collegeName || !location || !founded || !description || !logoURL || !pictureURL) {
                alert('Please fill in all fields.');
                return;
            }

            try {
                const response = await fetch('/add-college', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: collegeName, location: location, founded: founded, description: description, logoURL: logoURL, pictureURL: pictureURL })
                });

                if (!response.ok) {
                    throw new Error('Failed to add college');
                }

                const data = await response.json();
                console.log(data);
                alert('College added successfully!');

                const collegeModal = document.getElementById('collegeModal');
                const instance = bootstrap.Modal.getInstance(collegeModal);

                if (instance) {
                    instance.hide();
                } else {
                    console.warn('Modal instance not found.');
                }
                fetch('/universities').then(response => response.json()).then(data => renderColleges(data));
            } catch (error) {
                console.error('Error adding college:', error);
            }
        } else {
            const collegeId = document.getElementById('collegeModal').dataset.collegeId;
            const collegeName = document.getElementById('collegeName').value;
            const location = document.getElementById('location').value;
            const founded = document.getElementById('founded').value;
            const description = document.getElementById('description').value;
            const logoURL = document.getElementById('logoURL').value;
            const pictureURL = document.getElementById('pictureURL').value;

            if (!collegeName || !location || !founded || !description || !logoURL || !pictureURL) {
                alert('Please fill in all fields.');
                return;
            }

            try {
                const response = await fetch(`/edit-college/${collegeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: collegeName, location: location, founded: founded, description: description, logoURL: logoURL, pictureURL: pictureURL })
                });

                if (!response.ok) {
                    throw new Error('Failed to edit college');
                }

                const data = await response.json();
                console.log(data);
                alert('College added successfully!');

                const collegeModal = document.getElementById('collegeModal');
                const instance = bootstrap.Modal.getInstance(collegeModal);

                if (instance) {
                    instance.hide();
                } else {
                    console.warn('Modal instance not found.');
                }

                fetch('/universities').then(response => response.json()).then(data => renderColleges(data));
            } catch (error) {
                console.error('Error editing college:', error);
            }
        }
    });

    /*document.querySelectorAll('.editCollegeBtn').forEach(button => {
        button.addEventListener('click', async function() {
            const collegeId = button.dataset.collegeId;
            try {
                const response = await fetch(`/university?collegeId=${collegeId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch college details');
                }
                const college = await response.json();
                document.getElementById('editCollegeName').value = college.Name;
                document.getElementById('editLocation').value = college.Location;
                document.getElementById('editFounded').value = college.Founded;
                document.getElementById('editDescription').value = college.Description;
                document.getElementById('editLogoURL').value = college.Emblem;
                document.getElementById('editPictureURL').value = college.ImageURL;
                const editCollegeModal = new bootstrap.Modal(document.getElementById('editCollegeModal'));
                editCollegeModal.show();
            } catch (error) {
                console.error('Error fetching college:', error);
            }
        });
    });
    
    document.getElementById('saveCollegeBtn').addEventListener('click', async function() {
        const collegeId = document.getElementById('collegeModal').dataset.collegeId;
        const collegeName = document.getElementById('collegeName').value;
        const location = document.getElementById('editLocation').value;
        const founded = document.getElementById('editFounded').value;
        const description = document.getElementById('editDescription').value;
        const logoURL = document.getElementById('editLogoURL').value;
        const pictureURL = document.getElementById('editPictureURL').value;
        
        try {
            const response = await fetch(`/edit-college/${collegeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: collegeName, location: location, founded: founded, description: description, logoURL: logoURL, pictureURL: pictureURL })
            });
            
            if (!response.ok) {
                throw new Error('Failed to edit college');
            }
            
            const data = await response.json();
            console.log(data);
            fetch('/universities').then(response => response.json()).then(data => renderColleges(data));
        } catch (error) {
            console.error('Error editing college:', error);
        }
    });*/

    document.getElementById('deleteCollegeBtn').addEventListener('click', async function () {
        console.log("here");

        var selectedColleges = document.getElementsByClassName('selected');
        console.log(selectedColleges.length);
        if (selectedColleges.length === 0) {
            alert('Select a college to delete');
            return;
        }

        const collegeId = document.querySelector('.selected').dataset.collegeId;
        document.getElementById('deleteCollegeModal').dataset.collegeId = collegeId;

        if (!collegeId) {
            alert("Couldn't perform delete");
            return;
        }

        const deleteCollegeModal = new bootstrap.Modal(document.getElementById('deleteCollegeModal'));
        document.getElementById('collegeDetails').innerHTML = "Delete College ID: " + collegeId + " ?";
        deleteCollegeModal.show();
        document.getElementById('confirmDeleteCollegeBtn').addEventListener('click', async function () {
            try {
                const response = await fetch(`/delete-college/${collegeId}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Failed to delete college');
                }
                const data = await response.json();
                console.log(data);
                alert('College deleted successfully!');
                const modal = document.getElementById('deleteCollegeModal');
                const instance = bootstrap.Modal.getInstance(modal);
                if (instance) {
                    instance.hide();
                } else {
                    console.warn('Modal instance not found.');
                }
                fetch('/universities').then(response => response.json()).then(data => renderColleges(data));
            } catch (error) {
                console.error('Error deleting college:', error);
            }
        });
    });
});

async function fetchColleges() {
    try {
        const response = await fetch('/universities');
        if (!response.ok) {
            throw new Error('Failed to fetch colleges: ' + response.statusText);
        }
        const colleges = await response.json();
        renderColleges(colleges);
    } catch (error) {
        console.error('Error fetching colleges:', error);
        alert('Failed to fetch colleges.');
    }
}

function renderColleges(colleges) {
    const tbody = document.getElementById("collegeTableBody");
    tbody.innerHTML = "";
    colleges.forEach(college => {
        const row = document.createElement("tr");
        row.dataset.collegeId = college.UniversityID;
        row.innerHTML = `
            <td>${college.UniversityID}</td>
            <td>${college.Name}</td>
            <td>${college.Location}</td>
            <td>${college.Founded}</td>
            <td>${college.Description}</td>
            <td>${college.Emblem}</td>
            <td>${college.ImageURL}</td>
        `;
        row.addEventListener('click', function() {
            document.querySelectorAll('#collegeTableBody tr').forEach(row => row.classList.remove('selected'));
            document.querySelectorAll('#teamTableBody tr').forEach(row => row.classList.remove('selected'));
            this.classList.add('selected');
        });
        tbody.appendChild(row);
    });
}

// search colleges func
async function searchColleges(searchTerm) {
    try {
        const response = await fetch(`/fetchColleges?search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error('Failed to search colleges: ' + response.statusText);
        }
        const colleges = await response.json();
        renderColleges(colleges);
    } catch (error) {
        console.error('Error searching colleges:', error);
        alert('Failed to search colleges.');
    }
}