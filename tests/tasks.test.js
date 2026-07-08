const request = require('supertest');
const app = require('../src/app');

beforeEach(() => {
  app._resetTasks();
});

describe('POST /tasks', () => {
  test('returns 201 with the created task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Buy groceries', priority: 'Low' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, title: 'Buy groceries', priority: 'Low' });
  });

  test('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ priority: 'High' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 400 when priority is invalid', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'Test task', priority: 'Critical' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('GET /tasks', () => {
  test('returns 200 with an empty array when no tasks exist', async () => {
    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  test('returns 200 with an array containing all added tasks', async () => {
    await request(app).post('/tasks').send({ title: 'Task A', priority: 'High' });
    await request(app).post('/tasks').send({ title: 'Task B', priority: 'Medium' });

    const res = await request(app).get('/tasks');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ title: 'Task A', priority: 'High' });
    expect(res.body[1]).toMatchObject({ title: 'Task B', priority: 'Medium' });
  });
});

describe('DELETE /tasks/:id', () => {
  test('returns 204 and removes the task', async () => {
    const created = await request(app)
      .post('/tasks')
      .send({ title: 'Delete me', priority: 'Low' });

    const { id } = created.body;

    const delRes = await request(app).delete(`/tasks/${id}`);
    expect(delRes.status).toBe(204);

    // Task should no longer appear in the list
    const listRes = await request(app).get('/tasks');
    expect(listRes.body.find(t => t.id === id)).toBeUndefined();
  });

  test('returns 404 when deleting a non-existent task', async () => {
    const res = await request(app).delete('/tasks/9999');
    expect(res.status).toBe(404);
  });
});
