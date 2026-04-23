# S-DNA 생존·번식 유형 테스트 - 배포 가이드

## 📋 프로젝트 구조

```
sdna-test/
├── backend/                 # Node.js/Express 서버
│   ├── server.js           # 메인 서버 파일
│   ├── package.json        # 의존성 정의
│   └── .env.example        # 환경변수 템플릿
│
└── frontend/               # React 프론트엔드
    ├── sdna-test-integrated.jsx  # 백엔드 통합 버전
    └── sdna-test.jsx             # 단독 작동 버전
```

---

## 🚀 빠른 시작 (로컬 개발)

### 1단계: 백엔드 설정

```bash
# 백엔드 디렉토리에서
cd backend
npm install

# .env 파일 생성
cp .env.example .env
# .env 파일을 열어서 MONGODB_URI 설정

# 개발 서버 실행
npm run dev
# http://localhost:5000 에서 실행됨
```

**MongoDB 연결 옵션:**

- **로컬 MongoDB 사용:**
  ```
  MONGODB_URI=mongodb://localhost:27017/sdna-test
  ```

- **MongoDB Atlas (클라우드) 사용:**
  ```
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sdna-test
  ```
  [MongoDB Atlas 가입하기](https://www.mongodb.com/cloud/atlas)

### 2단계: 프론트엔드 설정

```bash
# 새로운 React 프로젝트 생성
npx create-react-app sdna-test
cd sdna-test

# 필요한 라이브러리 설치
npm install lucide-react

# src/App.jsx에 sdna-test-integrated.jsx 코드 붙여넣기

# .env 파일 생성 (루트 디렉토리)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# 개발 서버 실행
npm start
# http://localhost:3000 에서 실행됨
```

---

## 📦 프로덕션 배포

### 백엔드 배포 (Heroku)

```bash
# Heroku CLI 설치 후
heroku login
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_uri

# MongoDB Atlas 연결 문자열 설정
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/sdna-test"

git push heroku main
```

### 프론트엔드 배포 (Vercel)

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 루트에서
vercel

# 배포 중 환경변수 설정
# REACT_APP_API_URL=https://your-backend.herokuapp.com/api
```

또는 **Netlify**를 사용:

```bash
npm run build
# build 폴더를 Netlify에 드래그 앤 드롭
```

---

## 🔧 백엔드 API 문서

### 1. 결과 저장
**POST** `/api/results`

```json
{
  "type": "CVED",
  "scores": {
    "C": 32, "H": 12,
    "V": 28, "S": 16,
    "E": 24, "I": 20,
    "D": 30, "P": 14
  },
  "answers": [5, 4, 3, 2, 1, 5, 4, 3, 2, 1, 5, 4, 3, 2, 1, 5]
}
```

**응답:**
```json
{
  "success": true,
  "resultId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "type": "CVED"
}
```

### 2. 결과 조회
**GET** `/api/results/:id`

**응답:**
```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "type": "CVED",
  "scores": {...},
  "answers": [...],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 3. 전체 통계
**GET** `/api/stats`

**응답:**
```json
{
  "totalCount": 1250,
  "typeDistribution": {
    "CVED": 6.5,
    "CVEI": 8.2,
    ...
  },
  "axisStats": {
    "avgC": 22.5,
    "avgH": 21.3,
    ...
  }
}
```

### 4. 최근 결과 목록 (관리자)
**GET** `/api/results?limit=50&page=1`

---

## 🎨 주요 기능

### 현재 구현된 기능
✅ 16개 문제 + 5단계 척도  
✅ 4개 축별 점수 계산  
✅ 16가지 유형 분류  
✅ 결과 저장 및 공유  
✅ 공유 링크 생성  
✅ 반응형 모바일 UI  

### 향후 확장 가능 기능
- [ ] 사용자 계정 시스템
- [ ] 결과 히스토리 저장
- [ ] SNS 공유 기능
- [ ] 실시간 통계 대시보드
- [ ] 추천 알고리즘
- [ ] 유형별 커뮤니티

---

## 📊 축 설명

| 축 | 양측 | 의미 |
|----|------|------|
| **C-H** | 경쟁형(Competitive) | 성과와 실리를 중시 |
| | 협력형(Harmonious) | 관계와 평판을 중시 |
| **V-S** | 개척형(Variable) | 변화와 새로운 기회 추구 |
| | 안주형(Steady) | 안정성과 효율성 추구 |
| **E-I** | 확장형(Expansive) | 광범위한 네트워크 선호 |
| | 집중형(Intensive) | 깊이 있는 관계 선호 |
| **D-P** | 과감형(Daring) | 고위험 고수익 전략 |
| | 신중형(Prudent) | 저위험 저수익 전략 |

---

## 🔐 보안 고려사항

- CORS 설정 (현재: 모든 도메인 허용 → 프로덕션에서는 변경)
- Rate limiting 추가 필요
- 사용자 인증 구현 필요
- 민감한 데이터는 암호화

**CORS 프로덕션 설정:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## 📝 환경변수 설정

**`.env` 파일 예시:**
```
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/sdna-test

# 서버
PORT=5000
NODE_ENV=production

# 프론트엔드 (create-react-app)
REACT_APP_API_URL=https://api.yourdomain.com/api
```

---

## 🐛 문제 해결

### MongoDB 연결 오류
```
MongooseError: Cannot connect to mongodb://localhost:27017
```
→ MongoDB가 실행 중인지 확인하세요.
```bash
# Mac/Linux
mongod

# 또는 MongoDB Atlas 사용
```

### CORS 에러
```
Access to XMLHttpRequest blocked by CORS policy
```
→ `.env`에서 `REACT_APP_API_URL` 설정 확인

### 포트 충돌
```
Error: listen EADDRINUSE: address already in use :::5000
```
→ 다른 포트 사용: `PORT=5001 npm run dev`

---

## 📞 지원

질문이나 버그 보고는 프로젝트 이슈로 등록해주세요.

---

**마지막 업데이트:** 2024년 1월
**버전:** 1.0.0
