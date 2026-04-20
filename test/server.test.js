const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer, state } = require('../server');

const resetProjects = () => {
  state.projects = [
    {
      id: 1,
      title: 'Launch landing page',
      description: 'Create a responsive homepage for the startup.',
      status: 'In Progress'
    },
    {
      id: 2,
      title: 'Set up analytics',
      description: 'Track signups, clicks, and conversion funnel.',
      status: 'Planned'
    }
  ];
};

test('API supports health, CRUD, and deletion', async () => {
  resetProjects();
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);

  const listResponse = await fetch(`${baseUrl}/api/projects`);
  assert.equal(listResponse.status, 200);
  const list = await listResponse.json();
  assert.equal(list.length, 2);

  const createResponse = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Ship MVP',
      description: 'Release first version to pilot users.',
      status: 'Planned'
    })
  });
  assert.equal(createResponse.status, 201);
  const created = await createResponse.json();
  assert.equal(created.id, 3);

  const updateResponse = await fetch(`${baseUrl}/api/projects/3`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Ship MVP',
      description: 'Release first version to pilot users.',
      status: 'Completed'
    })
  });
  assert.equal(updateResponse.status, 200);
  const updated = await updateResponse.json();
  assert.equal(updated.status, 'Completed');

  const deleteResponse = await fetch(`${baseUrl}/api/projects/3`, {
    method: 'DELETE'
  });
  assert.equal(deleteResponse.status, 204);

  const finalResponse = await fetch(`${baseUrl}/api/projects`);
  const finalList = await finalResponse.json();
  assert.equal(finalList.length, 2);

  await new Promise((resolve) => server.close(resolve));
});
