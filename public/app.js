const form = document.getElementById('project-form');
const list = document.getElementById('project-list');
const template = document.getElementById('project-item-template');

const fetchProjects = async () => {
  const response = await fetch('/api/projects');
  const projects = await response.json();
  renderProjects(projects);
};

const renderProjects = (projects) => {
  list.innerHTML = '';

  projects.forEach((project) => {
    const fragment = template.content.cloneNode(true);
    fragment.querySelector('.project-title').textContent = project.title;
    fragment.querySelector('.project-description').textContent = project.description;
    fragment.querySelector('.project-status').textContent = `Status: ${project.status}`;

    fragment.querySelector('.delete-btn').addEventListener('click', async () => {
      await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE'
      });

      await fetchProjects();
    });

    list.appendChild(fragment);
  });
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = {
    title: formData.get('title')?.toString().trim(),
    description: formData.get('description')?.toString().trim(),
    status: formData.get('status')?.toString().trim()
  };

  await fetch('/api/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  form.reset();
  await fetchProjects();
});

fetchProjects();
