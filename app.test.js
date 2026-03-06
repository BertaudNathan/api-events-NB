
const request = require('supertest');
const app = require('./app');


describe('API Events', () => {
    it('should create a new event', async () => {
         var today = new Date();
        const response = await request(app)
            .post('/events')
            .send({ title: 'Test Event', date: today.toISOString().split('T')[0] });
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Test Event');
        expect(response.body.date).toBe(today.toISOString().split('T')[0]);
    });

    it('should not create an event with missing title', async () => {
        var today = new Date();
        const response = await request(app)
            .post('/events')
            .send({ date: today.toISOString().split('T')[0] });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error');
    }); 

    it('should not create an event with a past date', async () => {
        var today = new Date();
        today.setDate(today.getDate() - 1);
        const response = await request(app)
            .post('/events')
            .send({ title: 'Past Event', date: today.toISOString().split('T')[0] });
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    it('should retrieve all events', async () => {
        const response = await request(app).get('/events');
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});