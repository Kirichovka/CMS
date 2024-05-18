document.getElementById('database-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const databaseName = document.getElementById('database-name').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser.databases) {
        currentUser.databases = [];
    }

    currentUser.databases.push({ name: databaseName });

    const response = await fetch(`http://localhost:3000/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentUser)
    });

    if (response.ok) {
        document.getElementById('database-message').textContent = 'Database added successfully';
        loadDatabases();
    } else {
        document.getElementById('database-message').textContent = 'Error adding database';
    }
});

async function loadDatabases() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const databaseList = document.getElementById('database-list');
    databaseList.innerHTML = '';

    if (currentUser.databases) {
        currentUser.databases.forEach(database => {
            const li = document.createElement('li');
            li.textContent = database.name;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = async () => {
                const updatedDatabases = currentUser.databases.filter(db => db.name !== database.name);
                currentUser.databases = updatedDatabases;

                await fetch(`http://localhost:3000/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(currentUser)
                });
                loadDatabases();
            };
            li.appendChild(deleteButton);
            databaseList.appendChild(li);
        });
    }
}

// Load databases on page load
document.addEventListener('DOMContentLoaded', loadDatabases);
