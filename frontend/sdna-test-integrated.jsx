import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

const SDNATest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showDetailedResult, setShowDetailedResult] = useState(false);
  const [resultId, setResultId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const questions = [
    // PART 1: 성과와 실리(C) vs 관계와 평판(H)
    { part: 1, text: "나는 지금하는 업무가 경쟁이 심하더라도 좋은 성과과 인정을 얻을 수 있다면 충분히 감내할 수 있다.", type: 'C' },
    { part: 1, text: "단골 가게라도 더 조건이 좋은 경쟁 업체가 생긴다면, 의리보다는 나의 실익을 위해 과감히 이용처를 옮길 것이다.", type: 'C' },
    { part: 1, text: "업무 성과가 조금 떨어지더라도, 함께 일하는 동료들과 원만한 관계와 팀 분위기를 유지하는 것이 더 중요하다.", type: 'H' },
    { part: 1, text: "나에게 성공이란 높은 지위에 오르는 것보다, 어려울 때 나를 도와줄 사람이 많은 든든한 평판을 쌓는 것이다.", type: 'H' },
    // PART 2: 변화와 탐험(V) vs 안정과 효율(S)
    { part: 2, text: "익숙한 환경에 머물기보다, 새로운 기회가 있다면 낯선 곳이나 새로운 분야로 나를 던져보는 것을 즐긴다.", type: 'V' },
    { part: 2, text: "메뉴 선택이나 취미 생활 등 일상에서 항상 안 해본 것, 안 가본 곳을 찾아 새로운 자극을 얻으려 한다.", type: 'V' },
    { part: 2, text: "이미 효과가 검증된 익숙한 방식을 반복하는 것이, 불확실한 도전을 하는 것보다 훨씬 효율적이고 안전하다.", type: 'S' },
    { part: 2, text: "사용하던 앱이나 기기의 기능이 갑자기 추가되면 흥미롭기보다는, 다시 적응해야 하는 상황에 스트레스나 피로감을 느낀다.", type: 'S' },
    // PART 3: 확장과 네트워크(E) vs 집중과 깊이(I)
    { part: 3, text: "한 사람에게 정착하기 전, 최대한 다양한 사람들을 겪어보며 나에게 최적인 짝을 찾아낼 기회를 가져야 한다.", type: 'E' },
    { part: 3, text: "인맥은 좁고 깊은 관계보다, 언제든 정보를 주고받을 수 있는 넓고 다양한 분야의 네트워크가 생존에 더 유리하다.", type: 'E' },
    { part: 3, text: "여러 사람을 만나기보다 처음부터 신중하게 한 사람을 골라, 그 관계를 깊고 단단하게 만드는 것에 전념하고 싶다.", type: 'I' },
    { part: 3, text: "여러 모임에 얼굴을 비치기보다, 내 인생을 책임질 수 있는 극소수의 핵심 인물들과 깊은 유대를 맺는 것이 더 중요하다.", type: 'I' },
    // PART 4: 돌파와 실행(D) vs 신중과 보전(P)
    { part: 4, text: "정보가 부족해 불안한 상황이라도, 기회라는 판단이 서면 망설임 없이 빠르게 행동에 옮기는 편이다.", type: 'D' },
    { part: 4, text: "누군가 나의 권리를 침해하거나 부당하게 행동한다면, 참기보다 그 자리에서 즉시 문제를 제기하여 상황을 바로잡는다.", type: 'D' },
    { part: 4, text: "아무리 좋은 기회처럼 보여도 리스크가 존재한다면, 최대한 정보를 수집하며 신중하게 때를 기다리는 것이 현명하다.", type: 'P' },
    { part: 4, text: "타인과 갈등이 생겼을 때 에너지를 써서 맞서기보다, 일단 적당히 거리를 두며 상황이 조용해지기를 기다리는 편이다.", type: 'P' },
  ];

  const typeDescriptions = {
    CVED: { label: "CVED", short: "경쟁적 개척자", full: "성과를 중시하며 새로운 기회를 적극적으로 추구합니다. 변화 속에서도 자신의 이익을 명확히 추구하며, 광범위한 영향력을 확보하려 합니다." },
    CVEI: { label: "CVEI", short: "전략적 혁신가", full: "변화를 주도하면서도 선택된 소수와의 깊은 네트워크를 유지합니다. 새로운 분야에서 성과를 추구하되, 핵심 관계는 깊게 돌봅니다." },
    CVPD: { label: "CVPD", short: "신중한 탐험가", full: "새로운 것을 좋아하지만 신중하게 접근하는 성향입니다. 변화의 기회를 탐색하되 리스크를 항상 고려합니다." },
    CVPI: { label: "CVPI", short: "숙고하는 전문가", full: "변화를 추구하면서도 깊이 있는 통찰력을 유지합니다. 새로운 영역에 도전하되 신중함과 전문성을 바탕으로 합니다." },
    CSED: { label: "CSED", short: "효율적 네트워커", full: "검증된 방식으로 광범위한 영향력을 추구합니다. 안정적 기반 위에서 다양한 네트워크를 구축하고 활용합니다." },
    CSEI: { label: "CSEI", short: "정교한 달성자", full: "안정적 방식으로 선택된 목표를 집중해서 달성합니다. 효율성을 바탕으로 한 분야에서 깊은 성과를 추구합니다." },
    CSPD: { label: "CSPD", short: "신중한 실리주의자", full: "신중함과 실익을 모두 추구하는 보수적 유형입니다. 안정적이고 검증된 방식을 통해 자신의 이익을 보호합니다." },
    CSPI: { label: "CSPI", short: "견고한 전문가", full: "안정성과 깊이를 모두 추구하는 신뢰할 수 있는 유형입니다. 한 분야에서 깊은 전문성을 바탕으로 영향력을 확보합니다." },
    HVED: { label: "HVED", short: "협력적 개척자", full: "관계를 중시하면서 새로운 기회를 함께 탐험합니다. 변화 속에서도 타인과의 조화를 유지하고 공동의 이익을 추구합니다." },
    HVEI: { label: "HVEI", short: "공감적 혁신가", full: "변화 속에서도 핵심 인물들과 깊은 유대를 유지합니다. 새로운 분야에 도전하되 신뢰할 수 있는 관계를 소중히 합니다." },
    HVPD: { label: "HVPD", short: "신중한 협력자", full: "새로운 경험을 추구하면서도 관계를 신중하게 관리합니다. 변화를 원하되 타인과의 갈등을 최소화하려 합니다." },
    HVPI: { label: "HVPI", short: "깊이 있는 동료", full: "변화 속에서도 신뢰할 수 있는 관계를 지키려 합니다. 소수의 핵심 관계 속에서 안정감을 추구합니다." },
    HSED: { label: "HSED", short: "안정적 리더", full: "검증된 환경에서 광범위한 협력 네트워크를 구축합니다. 안정성을 바탕으로 다양한 사람들과의 협력을 주도합니다." },
    HSEI: { label: "HSEI", short: "신뢰의 중심", full: "안정적이면서 소수의 핵심 관계를 깊게 돌봅니다. 신뢰와 깊이를 바탕으로 주변 사람들에게 의존할 수 있는 존재가 됩니다." },
    HSPD: { label: "HSPD", short: "공감적 관리자", full: "신중하고 안정적이면서 다양한 관계를 유지합니다. 타인과의 갈등을 피하고 평화로운 환경을 추구합니다." },
    HSPI: { label: "HSPI", short: "깊은 신뢰자", full: "안정성과 깊이, 신중함 모두를 추구하는 든든한 유형입니다. 신뢰와 헌신을 바탕으로 핵심 관계를 평생 지켜갑니다." },
  };

  const typePercentages = {
    CVED: 6, CVEI: 8, CVPD: 7, CVPI: 5,
    CSED: 9, CSEI: 8, CSPD: 6, CSPI: 7,
    HVED: 7, HVEI: 6, HVPD: 8, HVPI: 7,
    HSED: 8, HSEI: 9, HSPD: 7, HSPI: 10,
  };

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setTestCompleted(true);
    }
  };

  const calculateResult = () => {
    let scores = { C: 0, H: 0, V: 0, S: 0, E: 0, I: 0, D: 0, P: 0 };
    
    questions.forEach((question, index) => {
      const answerValue = answers[index];
      if (answerValue === undefined) return;

      const scoreValue = answerValue;

      if (question.type === 'C') {
        scores.C += scoreValue;
        scores.H += (6 - scoreValue);
      } else if (question.type === 'H') {
        scores.H += scoreValue;
        scores.C += (6 - scoreValue);
      } else if (question.type === 'V') {
        scores.V += scoreValue;
        scores.S += (6 - scoreValue);
      } else if (question.type === 'S') {
        scores.S += scoreValue;
        scores.V += (6 - scoreValue);
      } else if (question.type === 'E') {
        scores.E += scoreValue;
        scores.I += (6 - scoreValue);
      } else if (question.type === 'I') {
        scores.I += scoreValue;
        scores.E += (6 - scoreValue);
      } else if (question.type === 'D') {
        scores.D += scoreValue;
        scores.P += (6 - scoreValue);
      } else if (question.type === 'P') {
        scores.P += scoreValue;
        scores.D += (6 - scoreValue);
      }
    });

    const type = 
      (scores.C > scores.H ? 'C' : 'H') +
      (scores.V > scores.S ? 'V' : 'S') +
      (scores.E > scores.I ? 'E' : 'I') +
      (scores.D > scores.P ? 'D' : 'P');

    return { type, scores };
  };

  const saveResultToBackend = async () => {
    try {
      setIsSaving(true);
      const { type, scores } = calculateResult();
      const answersArray = Array.from({ length: 16 }, (_, i) => answers[i] || 0);

      const response = await fetch(`${API_BASE_URL}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          scores,
          answers: answersArray,
        }),
      });

      if (!response.ok) {
        throw new Error('결과 저장 실패');
      }

      const data = await response.json();
      setResultId(data.resultId);
    } catch (error) {
      console.error('결과 저장 오류:', error);
      alert('결과 저장에 실패했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareLink = () => {
    if (resultId) {
      const shareUrl = `${window.location.origin}?resultId=${resultId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const { type: resultType, scores: resultScores } = testCompleted ? calculateResult() : {};

  const handleRetakeTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setTestStarted(false);
    setTestCompleted(false);
    setShowAdModal(false);
    setShowDetailedResult(false);
    setResultId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* DNA 배경 효과 */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* 시작 화면 */}
        {!testStarted && !testCompleted && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            {/* 로고 영역 */}
            <div className="w-24 h-24 mb-8 rounded-lg border-2 border-slate-700 flex items-center justify-center bg-slate-800/50">
              <span className="text-slate-600 text-sm">로고</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 text-center">
              생존·번식 유형 테스트
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-8">
              S-DNA
            </h2>

            <p className="text-slate-300 text-center mb-6 max-w-md leading-relaxed">
              당신의 생존 전략과 번식 투자 방식을 파악하는 16가지 유형 테스트입니다. 총 16개의 문항에 5단계로 응답하세요.
            </p>

            <button
              onClick={() => setTestStarted(true)}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
            >
              테스트 시작
            </button>

            <p className="text-slate-500 text-xs mt-8">약 3-5분 소요</p>
          </div>
        )}

        {/* 테스트 화면 */}
        {testStarted && !testCompleted && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            {/* 진행률 */}
            <div className="w-full max-w-md mb-8">
              <div className="flex justify-between text-slate-400 text-sm mb-2">
                <span>PART {questions[currentQuestion].part}</span>
                <span>{currentQuestion + 1} / {questions.length}</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 문제 */}
            <div className="w-full max-w-md mb-8">
              <p className="text-white text-lg font-semibold text-center leading-relaxed">
                {questions[currentQuestion].text}
              </p>
            </div>

            {/* 선택지 */}
            <div className="w-full max-w-md space-y-3">
              {[
                { value: 5, label: "그렇다" },
                { value: 4, label: "조금 그렇다" },
                { value: 3, label: "보통이다" },
                { value: 2, label: "조금 그렇지 않다" },
                { value: 1, label: "그렇지 않다" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-4 rounded-lg font-medium transition-all duration-200 ${
                    answers[currentQuestion] === option.value
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 결과 화면 */}
        {testCompleted && !showDetailedResult && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="text-center mb-8">
              <p className="text-slate-400 text-sm mb-4">당신의 유형은</p>
              <div className="text-6xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {resultType}
                </span>
              </div>
              <p className="text-xl text-slate-200 font-semibold mb-8">
                {typeDescriptions[resultType]?.short}
              </p>
              <p className="text-slate-300 max-w-md mx-auto mb-12 leading-relaxed">
                {typeDescriptions[resultType]?.full}
              </p>
            </div>

            <div className="space-y-4 w-full max-w-md">
              <button
                onClick={() => {
                  saveResultToBackend();
                  setShowAdModal(true);
                }}
                disabled={isSaving}
                className="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '상세 결과 보기'}
              </button>
              <button
                onClick={handleRetakeTest}
                className="w-full px-6 py-4 bg-slate-800 text-slate-300 font-bold rounded-lg hover:bg-slate-700 transition-all duration-300 border border-slate-700"
              >
                테스트 다시 하기
              </button>
            </div>
          </div>
        )}

        {/* 광고 모달 */}
        {showAdModal && !showDetailedResult && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-lg max-w-sm w-full p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <p className="text-slate-400 text-sm">광고</p>
                <button
                  onClick={() => {
                    setShowAdModal(false);
                    setShowDetailedResult(true);
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* 배너 광고 영역 */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-8 mb-4 border border-slate-600 text-center">
                <p className="text-slate-300 text-sm">쿠팡 파트너스</p>
                <p className="text-slate-500 text-xs mt-2">(배너 광고 영역)</p>
              </div>

              <p className="text-slate-400 text-xs text-center">
                X를 눌러 광고를 닫으면 상세 결과를 볼 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* 상세 결과 화면 */}
        {testCompleted && showDetailedResult && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
              {/* 유형 제목 */}
              <div className="text-center mb-8">
                <p className="text-slate-400 text-sm mb-2">당신의 유형</p>
                <div className="text-5xl md:text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {resultType}
                  </span>
                </div>
                <p className="text-xl text-slate-200 font-semibold">
                  {typeDescriptions[resultType]?.short}
                </p>
              </div>

              {/* 상세 설명 */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
                <h3 className="text-slate-200 font-bold mb-3">유형 설명</h3>
                <p className="text-slate-300 leading-relaxed">
                  {typeDescriptions[resultType]?.full}
                </p>
              </div>

              {/* 4개 축 점수 */}
              <div className="space-y-4 mb-8">
                <h3 className="text-slate-200 font-bold">당신의 성향</h3>
                {[
                  { 
                    label: '성과와 실리 vs 관계와 평판',
                    fullLabel: '경쟁형(Competitive) vs 협력형(Harmonious)',
                    pos: 'C', neg: 'H', posLabel: '성과 중심', negLabel: '관계 중심' 
                  },
                  { 
                    label: '변화와 탐험 vs 안정과 효율',
                    fullLabel: '개척형(Variable) vs 안주형(Steady)',
                    pos: 'V', neg: 'S', posLabel: '변화 추구', negLabel: '안정 중시' 
                  },
                  { 
                    label: '확장과 네트워크 vs 집중과 깊이',
                    fullLabel: '확장형(Expansive) vs 집중형(Intensive)',
                    pos: 'E', neg: 'I', posLabel: '확장형', negLabel: '집중형' 
                  },
                  { 
                    label: '돌파와 실행 vs 신중과 보전',
                    fullLabel: '과감형(Daring) vs 신중형(Prudent)',
                    pos: 'D', neg: 'P', posLabel: '과감형', negLabel: '신중형' 
                  },
                ].map((axis, idx) => {
                  const posScore = resultScores[axis.pos];
                  const negScore = resultScores[axis.neg];
                  const total = posScore + negScore;
                  const posPercent = Math.round((posScore / total) * 100);
                  const negPercent = 100 - posPercent;

                  return (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <p className="text-slate-300 text-sm font-semibold mb-1">{axis.label}</p>
                      <p className="text-slate-400 text-xs mb-3 italic">{axis.fullLabel}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-400 flex-1">{axis.posLabel}</span>
                        <span className="text-xs font-bold text-cyan-400">{posPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                          style={{ width: `${posPercent}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 flex-1">{axis.negLabel}</span>
                        <span className="text-xs font-bold text-purple-400">{negPercent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 전체 분포 */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8">
                <h3 className="text-slate-200 font-bold mb-3">전체 분포</h3>
                <p className="text-slate-400 text-sm mb-4">당신의 유형은 인구의 약 {typePercentages[resultType]}%를 차지합니다.</p>
                <div className="bg-slate-700/50 rounded p-3 mb-4">
                  <p className="text-slate-300 text-xs">
                    이 테스트는 당신의 생존 전략과 번식 투자 방식을 분석하여 16가지 유형 중 하나로 분류합니다.
                  </p>
                </div>

                {/* 공유 링크 */}
                {resultId && (
                  <div className="bg-slate-700/50 rounded p-3 border border-slate-600">
                    <p className="text-slate-300 text-xs font-semibold mb-2">결과 공유</p>
                    <button
                      onClick={copyShareLink}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors"
                    >
                      {copySuccess ? (
                        <>
                          <Check size={14} className="text-green-400" />
                          <span>복사됨!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>공유 링크 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <button
                onClick={handleRetakeTest}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
              >
                처음부터 다시 하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SDNATest;
