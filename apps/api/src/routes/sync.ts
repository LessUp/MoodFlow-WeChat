/**
 * 同步路由
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { MoodRecord } from '../models/MoodRecord';
import type { MoodRecordMap } from '@moodflow/types';

export const syncRouter = Router();

// 使用认证中间件
syncRouter.use(authenticate);

// 请求验证 schema
const syncRecordsSchema = z.object({
  records: z.record(z.object({
    mood: z.string().optional(),
    note: z.string().optional(),
    ts: z.number(),
    tags: z.array(z.string()).optional()
  }))
});

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const upsertRecordSchema = z.object({
  mood: z.string().optional(),
  note: z.string().optional(),
  tags: z.array(z.string()).optional()
});

/**
 * GET /api/sync/records - 获取所有记录
 */
syncRouter.get('/records', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  
  const records = await MoodRecord.find({ userId });
  
  const data: MoodRecordMap = {};
  for (const record of records) {
    data[record.dateKey] = {
      mood: record.mood,
      note: record.note,
      ts: record.ts,
      tags: record.tags
    };
  }
  
  res.json({
    success: true,
    data
  });
}));

/**
 * POST /api/sync/records - 上传/合并记录
 */
syncRouter.post('/records', asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { records } = syncRecordsSchema.parse(req.body);

    const entries = Object.entries(records);
    const dateKeys = entries.map(([dateKey]) => dateKey);

    const existingDocs = await MoodRecord.find(
      { userId, dateKey: { $in: dateKeys } },
      { dateKey: 1, ts: 1 }
    );
    const existingTsByKey = new Map<string, number>();
    for (const doc of existingDocs) {
      existingTsByKey.set(doc.dateKey, doc.ts);
    }

    const ops: any[] = [];
    let updated = 0;
    let created = 0;

    for (const [dateKey, entry] of entries) {
      const mood = entry.mood || '';
      const note = entry.note || '';
      const tags = entry.tags || [];

      if (!mood && !note) {
        ops.push({ deleteOne: { filter: { userId, dateKey } } });
        continue;
      }

      const existingTs = existingTsByKey.get(dateKey);

      if (existingTs !== undefined) {
        if (entry.ts > existingTs) {
          ops.push({
            updateOne: {
              filter: { userId, dateKey },
              update: { $set: { mood, note, tags, ts: entry.ts } }
            }
          });
          updated++;
        }
      } else {
        ops.push({
          insertOne: {
            document: { userId, dateKey, mood, note, tags, ts: entry.ts }
          }
        });
        created++;
      }
    }

    if (ops.length > 0) {
      await MoodRecord.bulkWrite(ops, { ordered: false });
    }

    res.json({
      success: true,
      data: { updated, created }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: error.errors[0].message }
      });
    }
    throw error;
  }
}));

/**
 * PUT /api/sync/records/:dateKey - 更新单条记录
 */
syncRouter.put('/records/:dateKey', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const dateKey = dateKeySchema.parse(req.params.dateKey);
  const { mood, note, tags } = upsertRecordSchema.parse(req.body);
  
  const ts = Date.now();
  
  if (!mood && !note) {
    // 删除记录
    await MoodRecord.deleteOne({ userId, dateKey });
    return res.json({
      success: true,
      data: { deleted: true }
    });
  }
  
  await MoodRecord.findOneAndUpdate(
    { userId, dateKey },
    { mood, note: note || '', tags: tags || [], ts },
    { upsert: true, new: true }
  );
  
  res.json({
    success: true,
    data: { dateKey, mood, note, tags, ts }
  });
}));

/**
 * DELETE /api/sync/records/:dateKey - 删除单条记录
 */
syncRouter.delete('/records/:dateKey', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const dateKey = dateKeySchema.parse(req.params.dateKey);
  
  await MoodRecord.deleteOne({ userId, dateKey });
  
  res.json({
    success: true,
    data: { deleted: true }
  });
}));

/**
 * DELETE /api/sync/records - 清空所有记录
 */
syncRouter.delete('/records', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  
  const result = await MoodRecord.deleteMany({ userId });
  
  res.json({
    success: true,
    data: { deleted: result.deletedCount }
  });
}));

/**
 * GET /api/sync/status - 获取同步状态
 */
syncRouter.get('/status', asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  
  const count = await MoodRecord.countDocuments({ userId });
  const latest = await MoodRecord.findOne({ userId }).sort({ ts: -1 });
  
  res.json({
    success: true,
    data: {
      totalRecords: count,
      lastSyncTs: latest?.ts || 0
    }
  });
}));
