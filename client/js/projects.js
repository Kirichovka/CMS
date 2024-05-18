document.getElementById('project-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const projectName = document.getElementById('project-name').value;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    currentUser.projects.push({ name: projectName });

    const response = await fetch(`http://localhost:3000/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentUser)
    });

    if (response.ok) {
        document.getElementById('project-message').textContent = 'Project added successfully';
        loadProjects();
    } else {
        document.getElementById('project-message').textContent = 'Error adding project';
    }
});

async function loadProjects() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';

    currentUser.projects.forEach(project => {
        const li = document.createElement('li');
        li.textContent = project.name;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = async () => {
            const updatedProjects = currentUser.projects.filter(p => p.name !== project.name);
            currentUser.projects = updatedProjects;

            await fetch(`http://localhost:3000/users/${currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(currentUser)
            });
            loadProjects();
        };
        li.appendChild(deleteButton);
        projectList.appendChild(li);
    });
}

// Load projects on page load
document.addEventListener('DOMContentLoaded', loadProjects);
