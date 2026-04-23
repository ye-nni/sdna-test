const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// MongoDB 연결
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sdna-test';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB 연결 성공'))
.catch(err => console.log('MongoDB 연결 실패:', err));

// 결과 스키마
const resultSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['CVED', 'CVEI', 'CVPD', 'CVPI', 'CSED', 'CSEI', 'CSPD', 'CSPI', 
           'HVED', 'HVEI', 'HVPD', 'HVPI', 'HSED', 'HSEI', 'HSPD', 'HSPI']
  },
  scores: {
    C: Number,
    H: Number,
    V: Number,
    S: Number,
    E: Number,
    I: Number,
    D: Number,
    P: Number,
  },
  answers: [Number], // 16개의 답변 (1-5)
  userAgent: String,
  ipAddress: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Result = mongoose.model('Result', resultSchema);

// API 엔드포인트

// 1. 결과 저장
app.post('/api/results', async (req, res) => {
  try {
    const { type, scores, answers } = req.body;

    // 유효성 검사
    if (!type || !scores || !answers || answers.length !== 16) {
      return res.status(400).json({ error: '필수 데이터가 누락되었습니다.' });
    }

    const result = new Result({
      type,
      scores,
      answers,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    });

    await result.save();

    res.status(201).json({
      success: true,
      resultId: result._id,
      type: result.type,
    });
  } catch (error) {
    console.error('결과 저장 오류:', error);
    res.status(500).json({ error: '결과 저장에 실패했습니다.' });
  }
});

// 2. 특정 결과 조회
app.get('/api/results/:id', async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ error: '결과를 찾을 수 없습니다.' });
    }

    res.json(result);
  } catch (error) {
    console.error('결과 조회 오류:', error);
    res.status(500).json({ error: '결과 조회에 실패했습니다.' });
  }
});

// 3. 전체 통계
app.get('/api/stats', async (req, res) => {
  try {
    const totalCount = await Result.countDocuments();

    // 각 유형별 개수
    const typeCounts = await Result.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    // 유형별 비율 계산
    const typeDistribution = {};
    const typeList = ['CVED', 'CVEI', 'CVPD', 'CVPI', 'CSED', 'CSEI', 'CSPD', 'CSPI',
                      'HVED', 'HVEI', 'HVPD', 'HVPI', 'HSED', 'HSEI', 'HSPD', 'HSPI'];

    typeList.forEach(type => {
      const found = typeCounts.find(t => t._id === type);
      const count = found ? found.count : 0;
      typeDistribution[type] = totalCount > 0 
        ? parseFloat(((count / totalCount) * 100).toFixed(2))
        : 0;
    });

    // 축별 통계
    const axisStats = await Result.aggregate([
      {
        $group: {
          _id: null,
          avgC: { $avg: '$scores.C' },
          avgH: { $avg: '$scores.H' },
          avgV: { $avg: '$scores.V' },
          avgS: { $avg: '$scores.S' },
          avgE: { $avg: '$scores.E' },
          avgI: { $avg: '$scores.I' },
          avgD: { $avg: '$scores.D' },
          avgP: { $avg: '$scores.P' },
        },
      },
    ]);

    res.json({
      totalCount,
      typeDistribution,
      axisStats: axisStats[0] || {},
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    res.status(500).json({ error: '통계 조회에 실패했습니다.' });
  }
});

// 4. 최근 결과 목록 (관리자용)
app.get('/api/results', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const results = await Result.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalCount = await Result.countDocuments();

    res.json({
      data: results,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('결과 목록 조회 오류:', error);
    res.status(500).json({ error: '결과 목록 조회에 실패했습니다.' });
  }
});

// 5. 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'S-DNA 테스트 서버가 정상 작동 중입니다.' });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`S-DNA 테스트 서버가 포트 ${PORT}에서 실행 중입니다.`);
});
