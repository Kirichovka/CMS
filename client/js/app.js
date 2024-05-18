document.addEventListener('DOMContentLoaded', function() {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const addProjectModal = document.getElementById('addProjectModal');
    const addDatabaseModal = document.getElementById('addDatabaseModal');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const closeAddProjectModal = document.getElementById('closeAddProjectModal');
    const closeAddDatabaseModal = document.getElementById('closeAddDatabaseModal');
    const content = document.getElementById('content');
    const databasesContent = document.getElementById('databases-content');
    let currentProject = null;

    // Показываем окно логина при загрузке страницы
    loginModal.style.display = "block";

    showRegister.onclick = function() {
        loginModal.style.display = "none";
        registerModal.style.display = "block";
    }

    showLogin.onclick = function() {
        registerModal.style.display = "none";
        loginModal.style.display = "block";
    }

    closeAddProjectModal.onclick = function() {
        addProjectModal.style.display = "none";
    }

    closeAddDatabaseModal.onclick = function() {
        addDatabaseModal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == loginModal) {
            loginModal.style.display = "none";
        } else if (event.target == registerModal) {
            registerModal.style.display = "none";
        } else if (event.target == addProjectModal) {
            addProjectModal.style.display = "none";
        } else if (event.target == addDatabaseModal) {
            addDatabaseModal.style.display = "none";
        }
    }

    // Регистрация пользователя
    document.getElementById('register-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const mysqlUsername = document.getElementById('mysql-username').value;
        const mysqlPassword = document.getElementById('mysql-password').value;
        const mysqlHost = document.getElementById('mysql-host').value;

        console.log('Registering user with data:', { username, password, mysqlUsername, mysqlPassword, mysqlHost });

        const response = await fetch('http://localhost:3001/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username, 
                password, 
                mysqlUsername, 
                mysqlPassword, 
                mysqlHost,
                projects: [],
                databases: [],
                tables: [],
                content: []
            })
        });

        if (response.ok) {
            const newUser = await response.json();
            console.log('User registered successfully:', newUser);
            document.getElementById('register-message').textContent = 'Registration successful';
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            registerModal.style.display = "none";
            content.style.display = "block";
            loadProjects();
        } else {
            console.error('Error during registration');
            document.getElementById('register-message').textContent = 'Error during registration';
        }
    });

    // Логин пользователя
    document.getElementById('login-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        console.log('Logging in with credentials:', { username, password });

        const response = await fetch('http://localhost:3001/users');
        const users = await response.json();

        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            console.log('Login successful:', user);
            document.getElementById('login-message').textContent = 'Login successful';
            localStorage.setItem('currentUser', JSON.stringify(user));
            loginModal.style.display = "none";
            content.style.display = "block";
            loadProjects();
        } else {
            console.error('Invalid login credentials');
            document.getElementById('login-message').textContent = 'Invalid login credentials';
        }
    });

    function loadProjects() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.projects) {
            console.error('No current user or projects found');
            return;
        }
        
        console.log('Loading projects:', currentUser.projects);
        const contentList = document.getElementById('content-list');
        contentList.innerHTML = '';

        const addProjectDiv = document.createElement('div');
        addProjectDiv.className = 'content-item add-project';
        addProjectDiv.textContent = '+ Add Project';
        addProjectDiv.onclick = function() {
            console.log('Add project button clicked');
            addProjectModal.style.display = "block";
        };
        contentList.appendChild(addProjectDiv);

        currentUser.projects.forEach(project => {
            const div = document.createElement('div');
            div.className = 'content-item';
            div.textContent = project.name;
            div.onclick = function() {
                console.log('Project clicked:', project.name);
                currentProject = project;
                loadDatabases();
            };
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = async (event) => {
                event.stopPropagation();
                console.log('Delete project button clicked for project:', project.name);
                const updatedProjects = currentUser.projects.filter(p => p.name !== project.name);
                currentUser.projects = updatedProjects;
                await updateUser(currentUser);
                loadProjects();
            };
            div.appendChild(deleteButton);
            contentList.appendChild(div);
        });
    }

    function loadDatabases() {
        console.log('Loading databases for project:', currentProject);
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.error('No current user found');
            return;
        }

        console.log('Current user data:', currentUser);

        const databasesList = document.getElementById('databases-list');
        databasesList.innerHTML = '';

        const addDatabaseDiv = document.createElement('div');
        addDatabaseDiv.className = 'content-item add-database';
        addDatabaseDiv.textContent = '+ Add Database';
        addDatabaseDiv.onclick = function() {
            console.log('Add database button clicked');
            addDatabaseModal.style.display = "block";
        };
        databasesList.appendChild(addDatabaseDiv);

        fetch('http://localhost:3001/databases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mysqlUsername: currentUser.mysqlUsername,
                mysqlPassword: currentUser.mysqlPassword,
                mysqlHost: currentUser.mysqlHost
            })
        })
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(databases => {
            console.log('Databases loaded:', databases);
            if (Array.isArray(databases)) {
                databases.forEach(database => {
                    const div = document.createElement('div');
                    div.className = 'content-item';
                    div.textContent = database.name;
                    databasesList.appendChild(div);
                });
            } else {
                console.error('Expected an array but got:', databases);
            }
        })
        .catch(error => {
            console.error('Error loading databases:', error);
            if (error.response) {
                error.response.json().then(err => {
                    console.error('Server error details:', err);
                });
            }
        });

        content.style.display = "none";
        databasesContent.style.display = "block";
        document.getElementById('current-project-name').textContent = currentProject.name;
    }

    document.getElementById('add-project-form').addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('Add project form submitted');

        const projectName = document.getElementById('project-name').value;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        console.log('Current user before adding project:', currentUser);
        
        if (!currentUser.projects) {
            currentUser.projects = [];
        }
        
        currentUser.projects.push({ name: projectName });
        await updateUser(currentUser);
        console.log('Current user after adding project:', currentUser);
        addProjectModal.style.display = "none";
        loadProjects();
    });

    document.getElementById('add-database-form').addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('Add database form submitted');

        const databaseName = document.getElementById('database-name').value;
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        console.log('Creating database with data:', { databaseName, currentUser });

        fetch('http://localhost:3001/create-database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mysqlUsername: currentUser.mysqlUsername,
                mysqlPassword: currentUser.mysqlPassword,
                mysqlHost: currentUser.mysqlHost,
                databaseName: databaseName
            })
        })
        .then(response => {
            if (response.ok) {
                console.log('Database created successfully');
                if (!currentUser.databases) {
                    currentUser.databases = [];
                }
                currentUser.databases.push({ name: databaseName });
                return updateUser(currentUser);
            } else {
                throw new Error('Failed to create database');
            }
        })
        .then(() => {
            console.log('Current user after adding database:', currentUser);
            addDatabaseModal.style.display = "none";
            loadDatabases();
        })
        .catch(error => console.error('Error creating database:', error));
    });

    async function updateUser(user) {
        console.log('Updating user:', user);
        const response = await fetch(`http://localhost:3001/users/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            const updatedUser = await response.json();
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            console.log('User successfully updated:', updatedUser);
        } else {
            console.error('Failed to update user');
        }
    }
});
