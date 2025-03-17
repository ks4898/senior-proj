document.addEventListener('DOMContentLoaded', function () {

    document.getElementById("admin-box").style = "margin-top: 50px !important;";

    // get user information on page load
    fetch('/user-info')
        .then(response => response.json())
        .then(data => {
            document.getElementById("currentAdmin").innerHTML = (("Welcome, " + data.name) || 'N/A');
            document.getElementById("currentRole").innerHTML = ("You are " + data.role) || 'N/A';

        })
        .catch(error => {
            console.error('Error fetching user info:', error);
            document.getElementById("currentAdmin").innerHTML = 'Error';
            document.getElementById("currentRole").innerHTML = 'Error';
        });

    // session check on page load
    fetch('/check-session')
        .then(response => response.json())
        .then(data => {
            if (!data.loggedIn) {
                window.location.href = '/login';
            } else {
                fetchUsers();
                fetchRoles();
            }
        })
        .catch(error => {
            console.error('Error checking session:', error);
            window.location.href = '/login';
        });

    // event listener for Search button
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', function () {
            const searchTerm = document.getElementById('searchUser').value.trim();
            if (searchTerm) {
                searchUsers(searchTerm);
            } else {
                fetchUsers();
            }
        });
    }

    // event listener for Clear Search button
    const clearSearchButton = document.getElementById('clearSearchBtn');
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', function () {
            document.getElementById("searchUser").value = '';
            fetchUsers();
        });
    }

    // event listener for Add User button to show modal
    const addUserButton = document.getElementById('addUserBtn');
    if (addUserButton) {
        addUserButton.addEventListener('click', function () {
            const userModal = new bootstrap.Modal(document.getElementById('userModal'));
            userModal.show();
        });
    }

    // event listener for Save User button in the modal
    const saveUserButton = document.getElementById('saveUserBtn');
    if (saveUserButton) {
        saveUserButton.addEventListener('click', function () {
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            if (!firstName || !lastName || !email || !password || !role) {
                alert('Please fill in all fields.');
                return;
            }

            const userData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                role: role
            };
            addUser(userData);
        });
    }
});

// get available roles based on admin privileges for current user
async function fetchRoles() {
    try {
        const response = await fetch('/roles', {
            credentials: 'include'
        });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }

        if (response.status === 403) {
            window.location.href = '/';
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to fetch roles');
        }

        const roles = await response.json();
        populateRoleSelect(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        alert('Failed to retrieve roles. Please try again.');
    }
}

// populate combobox with roles
function populateRoleSelect(roles) {
    const roleSelects = document.querySelectorAll('.form-select');

    roleSelects.forEach(select => {
        if (select.id == "role" || select.id == "editRoleSelect") {
            select.innerHTML = ''; // Clear existing options

            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role;
                option.textContent = role;
                select.appendChild(option);
            });
        }
    });
}

// search users func
async function searchUsers(searchTerm) {
    try {
        const response = await fetch(`/users?search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error('Failed to search users: ' + response.statusText);
        }
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error searching users:', error);
        alert('Failed to search users.');
    }
}

// fetch users from db func
async function fetchUsers() {
    try {
        const response = await fetch('/users');
        if (!response.ok) {
            throw new Error('Failed to fetch users: ' + response.statusText);
        }
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        alert('Failed to fetch users.');
    }
}

// display users in table
function displayUsers(users) {
    const userTableBody = document.getElementById('userTableBody');
    userTableBody.innerHTML = '';

    fetch('/user-info')
        .then(response => response.json())
        .then(currentUser => {
            users.forEach(user => {
                let row = userTableBody.insertRow();
                row.insertCell().textContent = user.UserID;
                row.insertCell().textContent = user.Name;
                if (user.Role === "SuperAdmin" && currentUser.role !== "SuperAdmin") {
                    row.insertCell().textContent = "[REDACTED]"
                } else {
                    row.insertCell().textContent = user.Email;
                }
                //row.insertCell().textContent = user.Email;
                row.insertCell().textContent = user.Role;

                let actionsCell = row.insertCell();
                if (user.Role !== "SuperAdmin" &&
                    user.UserID !== currentUser.userId &&
                    user.Role !== currentUser.role) {
                    actionsCell.innerHTML = `
                        <button onclick="editUser(${user.UserID})">Edit</button>
                        <button onclick="deleteUser(${user.UserID})">Delete</button>
                    `;
                } else {
                    actionsCell.innerHTML = "/";
                }
            });
        })
        .catch(error => {
            console.error('Error fetching current user info:', error);
        });
}

// add user func
async function addUser(userData) {
    try {
        const response = await fetch('/add-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (!response.ok) {
            throw new Error('Failed to add user: ' + response.statusText);
        }
        fetchUsers();
        const userModalEl = document.getElementById('userModal');
        const userModal = bootstrap.Modal.getInstance(userModalEl);
        if (userModal) {
            userModal.hide();
        } else {
            console.warn('Modal instance not found.');
        }
        alert('User added successfully!');
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Failed to add user.');
    }
}

// edit user role func
async function editUser(userId) {
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    //await fetchRoles();
    editUserModal.show();
    document.getElementById('editUserId').innerHTML = userId;
    document.getElementById('editUserModal').dataset.userId = userId;

    const saveEditRoleBtn = document.getElementById('saveEditRoleBtn');

    saveEditRoleBtn.onclick = async function () {
        const newRole = document.getElementById('editRoleSelect').value;
        try {
            const response = await fetch(`/edit-user/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to edit user role');
            }

            fetchUsers();
            alert(data.message);
            editUserModal.hide();
        } catch (error) {
            console.error('Error editing user role:', error);
            alert(error.message || 'Failed to edit user role');
        }
    };
}

// delete user func
async function deleteUser(userId) {
    const deleteUserModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
    document.getElementById("userDetails").innerHTML = "Delete User ID: " + userId + " ?";
    deleteUserModal.show();

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    confirmDeleteBtn.onclick = async function () {
        try {
            const response = await fetch(`/delete-user/${userId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error('Failed to delete user: ' + response.statusText);
            }
            fetchUsers();
            alert('User deleted successfully!');
            deleteUserModal.hide();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Forbidden. The user has admin privileges or you are unauthorized');
        }
    }
}