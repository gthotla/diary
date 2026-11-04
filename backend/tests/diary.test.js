import { jest } from '@jest/globals';

// Mock dependencies using unstable_mockModule
jest.unstable_mockModule('ioredis', () => ({
    default: jest.fn(() => ({
        on: jest.fn(),
        quit: jest.fn(),
    })),
}));

jest.unstable_mockModule('mongoose', () => {
    const mockSchemaInstance = {
        pre: jest.fn(),
        post: jest.fn(),
        methods: {},
        plugin: jest.fn(),
        virtual: jest.fn().mockReturnThis(),
        set: jest.fn(),
    };
    const mockSchema = jest.fn(() => mockSchemaInstance);
    mockSchema.Types = { ObjectId: 'ObjectId' };
    return {
        default: {
            connect: jest.fn(),
            connection: { host: 'localhost' },
            Schema: mockSchema,
            model: jest.fn(),
            models: {},
        },
    };
});

jest.unstable_mockModule('../config/db.js', () => ({
    default: jest.fn(),
}));

jest.unstable_mockModule('../config/redis.js', () => ({
    initializeRedis: jest.fn(),
    closeRedisConnection: jest.fn(),
    getRedisClient: jest.fn(),
    isRedisAvailable: jest.fn(),
}));

jest.unstable_mockModule('../services/diaryService.js', () => ({
    getAllDiaryEntries: jest.fn(),
    createDiaryEntry: jest.fn(),
    getDiaryEntryById: jest.fn(),
    updateEntry: jest.fn(),
    deleteEntry: jest.fn(),
    getDiaryInRange: jest.fn(),
    getEntriesByTime: jest.fn(),
}));

jest.unstable_mockModule('../services/recentEntriesService.js', () => ({
    getRecentEntries: jest.fn(),
}));

jest.unstable_mockModule('../services/awsS3.js', () => ({
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getCloudFrontSignedUrl: jest.fn(),
}));

jest.unstable_mockModule('../middleware/auth.js', () => ({
    authMiddleware: (req, res, next) => {
        req.user = { userId: 'test-user-id' };
        next();
    }
}));

jest.unstable_mockModule('prom-client', () => ({
    default: {
        Registry: jest.fn().mockImplementation(() => ({
            registerMetric: jest.fn(),
            contentType: 'text/plain',
            metrics: jest.fn().mockResolvedValue('metrics'),
        })),
        collectDefaultMetrics: jest.fn(),
        Histogram: jest.fn().mockImplementation(() => ({
            startTimer: jest.fn().mockReturnValue(() => { }),
        })),
    },
}));

// Import app dynamically
const { app } = await import('../server.js');
const diaryService = await import('../services/diaryService.js');
import request from 'supertest';

describe('Diary Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/diary', () => {
        it('should return all diary entries', async () => {
            const mockEntries = [
                {
                    _id: '1',
                    title: 'Test Entry',
                    entry: 'Test Content',
                    date: new Date().toISOString(),
                    mood: 'Happy',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            diaryService.getAllDiaryEntries.mockResolvedValue(mockEntries);

            const res = await request(app).get('/api/diary');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].title).toBe('Test Entry');
            expect(diaryService.getAllDiaryEntries).toHaveBeenCalledWith('test-user-id');
        });
    });

    describe('POST /api/diary', () => {
        it('should create a new diary entry', async () => {
            const newEntry = {
                title: 'New Entry',
                entry: 'New Content',
                mood: 'Excited',
                date: new Date().toISOString()
            };

            const createdEntry = { ...newEntry, _id: '2' };
            diaryService.createDiaryEntry.mockResolvedValue(createdEntry);

            const res = await request(app)
                .post('/api/diary')
                .send(newEntry);

            expect(res.statusCode).toBe(201);
            expect(res.body.title).toBe('New Entry');
            expect(diaryService.createDiaryEntry).toHaveBeenCalled();
        });
    });

    describe('Operational endpoints', () => {
        it('should report a healthy service', async () => {
            const res = await request(app).get('/api/health');

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body).toEqual(expect.objectContaining({
                timestamp: expect.any(String),
                uptime: expect.any(Number)
            }));
        });

        it('should report liveness without requiring external services', async () => {
            const res = await request(app).get('/api/health/live');

            expect(res.statusCode).toBe(200);
            expect(res.body.alive).toBe(true);
            expect(res.body.uptime).toEqual(expect.any(Number));
        });

        it('should expose Prometheus metrics', async () => {
            const res = await request(app).get('/metrics');

            expect(res.statusCode).toBe(200);
            expect(res.headers['content-type']).toContain('text/plain');
            expect(res.text).toBe('metrics');
        });

        it('should fail readiness when required services are unavailable', async () => {
            const res = await request(app).get('/api/health/ready');

            expect(res.statusCode).toBe(503);
            expect(res.body.ready).toBe(false);
            expect(res.body.services).toEqual(expect.arrayContaining([
                expect.objectContaining({ service: 'mongodb', ready: false }),
                expect.objectContaining({ service: 'redis', ready: false })
            ]));
        });
    });
});
