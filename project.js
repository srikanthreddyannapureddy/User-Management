const API_URL = 'https://jsonplaceholder.typicode.com/users';
const userTable = document.getElementById('userTable');
const userForm = document.getElementById('userForm');
const formTitle = document.getElementById('formTitle');
const errorBox = document.getElementById('error');

let users = [];
let editingUserId = null;

// Fetch users
async function fetchUsers() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch users');
        users = await response.json();
        renderUsers();
    } catch (error) {
        errorBox.textContent = error.message;
    }
}

// Render users
function renderUsers() {
    userTable.innerHTML = users
        .map(
            (user) => `
      <tr>
        <td>${user.id}</td>
        <td>${user.name.split(' ')[0]}</td>
        <td>${user.name.split(' ')[1]}</td>
        <td>${user.email}</td>
        <td>${user.department || 'N/A'}</td>
        <td>
          <button onclick="editUser(${user.id})">Edit</button>
          <button onclick="deleteUser(${user.id})">Delete</button>
        </td>
      </tr>
    `
        )
        .join('');
}

// Add or Edit user
userForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const department = document.getElementById('department').value;

    const user = {
        name: `${firstName} ${lastName}`,
        email,
        department,
    };

    try {
        if (editingUserId) {
            const response = await fetch(`${API_URL}/${editingUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user),
            });
            if (!response.ok) throw new Error('Failed to update user');
            users = users.map((u) =>
                u.id === editingUserId ? {
                    ...u,
                    ...user
                } : u
            );
        } else {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user),
            });
            if (!response.ok) throw new Error('Failed to add user');
            const newUser = await response.json();
            users.push(newUser);
        }
        resetForm();
        renderUsers();
    } catch (error) {
        errorBox.textContent = error.message;
    }
});

// Edit user
function editUser(id) {
    const user = users.find((u) => u.id === id);
    if (!user) return;
    editingUserId = id;
    formTitle.textContent = 'Edit User';
    document.getElementById('firstName').value = user.name.split(' ')[0];
    document.getElementById('lastName').value = user.name.split(' ')[1];
    document.getElementById('email').value = user.email;
    document.getElementById('department').value = user.department || '';
}

// Delete user
async function deleteUser(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete user');
        users = users.filter((u) => u.id !== id);
        renderUsers();
    } catch (error) {
        errorBox.textContent = error.message;
    }
}

// Reset form
function resetForm() {
    userForm.reset();
    editingUserId = null;
    formTitle.textContent = 'Add User';
}

// Initial fetch
fetchUsers();
