const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PUBLIC_DIR = path.join(__dirname, 'public');
const DEFAULT_PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

const state = {
  projects: [
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
  ]
};

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': MIME_TYPES['.json'] });
  res.end(JSON.stringify(payload));
};

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const validateProject = ({ title, description, status }) => {
  if (!title || !description || !status) {
    return 'title, description, and status are required';
  }

  return null;
};

const serveStaticFile = (reqPath, res) => {
  const safePath = reqPath === '/' ? '/index.html' : reqPath;
  const fullPath = path.join(PUBLIC_DIR, safePath);

  if (!fullPath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(fullPath, (error, content) => {
    if (error) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    const extension = path.extname(fullPath);
    const contentType = MIME_TYPES[extension] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
};

const requestHandler = async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, { status: 'ok' });
    return;
  }

  if (pathname === '/api/projects' && req.method === 'GET') {
    sendJson(res, 200, state.projects);
    return;
  }

  if (pathname === '/api/projects' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const error = validateProject(body);

      if (error) {
        sendJson(res, 400, { error });
        return;
      }

      const project = {
        id: state.projects.length ? state.projects[state.projects.length - 1].id + 1 : 1,
        title: body.title,
        description: body.description,
        status: body.status
      };

      state.projects.push(project);
      sendJson(res, 201, project);
      return;
    } catch (_err) {
      sendJson(res, 400, { error: 'Invalid JSON payload' });
      return;
    }
  }

  if (pathname.startsWith('/api/projects/') && (req.method === 'PUT' || req.method === 'DELETE')) {
    const id = Number(pathname.split('/').pop());
    const index = state.projects.findIndex((project) => project.id === id);

    if (index === -1) {
      sendJson(res, 404, { error: 'Project not found' });
      return;
    }

    if (req.method === 'DELETE') {
      state.projects.splice(index, 1);
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      const body = await readBody(req);
      const error = validateProject(body);

      if (error) {
        sendJson(res, 400, { error });
        return;
      }

      state.projects[index] = {
        id,
        title: body.title,
        description: body.description,
        status: body.status
      };

      sendJson(res, 200, state.projects[index]);
      return;
    } catch (_err) {
      sendJson(res, 400, { error: 'Invalid JSON payload' });
      return;
    }
  }

  serveStaticFile(pathname, res);
};

const createServer = () => http.createServer((req, res) => {
  requestHandler(req, res).catch(() => {
    sendJson(res, 500, { error: 'Internal server error' });
  });
});

if (require.main === module) {
  const server = createServer();
  server.listen(DEFAULT_PORT, () => {
    console.log(`Server running on http://localhost:${DEFAULT_PORT}`);
  });
}

module.exports = { createServer, state };
