import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import sdnaLogo from './assets/sdna-logo.png';
import { typeData } from './typeData';

const SDNATest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showDetailedResult, setShowDetailedResult] = useState(false);
  const [resultId, setResultId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [sharedResult, setSharedResult] = useState(null);
  const [loadingShared, setLoadingShared] = useState(false);
  const [sharedError, setSharedError] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('resultId');
    if (!sharedId) return;
    setLoadingShared(true);
    fetch(`${API_BASE_URL}/results/${sharedId}`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { setSharedResult(data); setLoadingShared(false); })
      .catch(() => { setSharedError(true); setLoadingShared(false); });
  }, []);

  const questions = [
    { part: 1, text: '나는 지금하는 업무가 경쟁이 심하더라도 좋은 성과와 인정을 얻을 수 있다면 충분히 감내할 수 있다.', type: 'C' },
    { part: 1, text: '단골 가게라도 더 조건이 좋은 경쟁 업체가 생긴다면, 의리보다는 나의 실익을 위해 과감히 이용처를 옮길 것이다.', type: 'C' },
    { part: 1, text: '업무 성과가 조금 떨어지더라도, 함께 일하는 동료들과 원만한 관계와 팀 분위기를 유지하는 것이 더 중요하다.', type: 'H' },
    { part: 1, text: '나에게 성공이란 높은 지위에 오르는 것보다, 어려울 때 나를 도와줄 사람이 많은 든든한 평판을 쌓는 것이다.', type: 'H' },
    { part: 2, text: '익숙한 환경에 머물기보다, 새로운 기회가 있다면 낯선 곳이나 새로운 분야로 나를 던져보는 것을 즐긴다.', type: 'V' },
    { part: 2, text: '메뉴 선택이나 취미 생활 등 일상에서 항상 안 해본 것, 안 가본 곳을 찾아 새로운 자극을 얻으려 한다.', type: 'V' },
    { part: 2, text: '이미 효과가 검증된 익숙한 방식을 반복하는 것이, 불확실한 도전을 하는 것보다 훨씬 효율적이고 안전하다.', type: 'S' },
    { part: 2, text: '사용하던 앱이나 기기의 기능이 갑자기 추가되면 흥미롭기보다는, 다시 적응해야 하는 상황에 스트레스나 피로감을 느낀다.', type: 'S' },
    { part: 3, text: '한 사람에게 정착하기 전, 최대한 다양한 사람들을 겪어보며 나에게 최적인 짝을 찾아낼 기회를 가져야 한다.', type: 'E' },
    { part: 3, text: '인맥은 좁고 깊은 관계보다, 언제든 정보를 주고받을 수 있는 넓고 다양한 분야의 네트워크가 생존에 더 유리하다.', type: 'E' },
    { part: 3, text: '여러 사람을 만나기보다 처음부터 신중하게 한 사람을 골라, 그 관계를 깊고 단단하게 만드는 것에 전념하고 싶다.', type: 'I' },
    { part: 3, text: '여러 모임에 얼굴을 비치기보다, 내 인생을 책임질 수 있는 극소수의 핵심 인물들과 깊은 유대를 맺는 것이 더 중요하다.', type: 'I' },
    { part: 4, text: '정보가 부족해 불안한 상황이라도, 기회라는 판단이 서면 망설임 없이 빠르게 행동에 옮기는 편이다.', type: 'D' },
    { part: 4, text: '누군가 나의 권리를 침해하거나 부당하게 행동한다면, 참기보다 그 자리에서 즉시 문제를 제기하여 상황을 바로잡는다.', type: 'D' },
    { part: 4, text: '아무리 좋은 기회처럼 보여도 리스크가 존재한다면, 최대한 정보를 수집하며 신중하게 때를 기다리는 것이 현명하다.', type: 'P' },
    { part: 4, text: '타인과 갈등이 생겼을 때 에너지를 써서 맞서기보다, 일단 적당히 거리를 두며 상황이 조용해지기를 기다리는 편이다.', type: 'P' },
  ];

  const typePercentages = {
    CVED: 6, CVEP: 8, CVID: 7, CVIP: 5,
    CSED: 9, CSEP: 8, CSID: 6, CSIP: 7,
    HVED: 7, HVEP: 6, HVID: 8, HVIP: 7,
    HSED: 8, HSEP: 9, HSID: 7, HSIP: 10,
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
      if (question.type === 'C') { scores.C += answerValue; scores.H += (6 - answerValue); }
      else if (question.type === 'H') { scores.H += answerValue; scores.C += (6 - answerValue); }
      else if (question.type === 'V') { scores.V += answerValue; scores.S += (6 - answerValue); }
      else if (question.type === 'S') { scores.S += answerValue; scores.V += (6 - answerValue); }
      else if (question.type === 'E') { scores.E += answerValue; scores.I += (6 - answerValue); }
      else if (question.type === 'I') { scores.I += answerValue; scores.E += (6 - answerValue); }
      else if (question.type === 'D') { scores.D += answerValue; scores.P += (6 - answerValue); }
      else if (question.type === 'P') { scores.P += answerValue; scores.D += (6 - answerValue); }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, scores, answers: answersArray }),
      });
      if (!response.ok) throw new Error('결과 저장 실패');
      const data = await response.json();
      setResultId(data.resultId);
    } catch (error) {
      console.error('결과 저장 오류:', error);
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

  const handleRetakeTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setTestStarted(false);
    setTestCompleted(false);
    setShowDetailedResult(false);
    setResultId(null);
    setSharedResult(null);
    setSharedError(false);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const { type: resultType, scores: resultScores } = testCompleted ? calculateResult() : {};
  const currentTypeData = resultType ? typeData[resultType] : null;

  const axes = [
    { label: '지위와 성과 vs 관계와 평판', sublabel: '경쟁형(Competitive) vs 협력형(Harmonious)', pos: 'C', neg: 'H', posLabel: '성과 중심', negLabel: '관계 중심' },
    { label: '변화와 탐험 vs 안정과 효율', sublabel: '개척형(Variable) vs 안주형(Steady)', pos: 'V', neg: 'S', posLabel: '변화 추구', negLabel: '안정 중시' },
    { label: '기회와 네트워크 vs 집중과 확신', sublabel: '확장형(Expansive) vs 집중형(Intensive)', pos: 'E', neg: 'I', posLabel: '확장형', negLabel: '집중형' },
    { label: '돌파와 실행 vs 신중과 안정', sublabel: '과감형(Daring) vs 신중형(Prudent)', pos: 'D', neg: 'P', posLabel: '과감형', negLabel: '신중형' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* 배경 효과 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full opacity-5 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500 rounded-full opacity-5 blur-3xl"></div>
      </div>

      <div className="relative z-10">

        {/* ── 시작 화면 ── */}
        {!testStarted && !testCompleted && !sharedResult && !loadingShared && !sharedError && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
            <img
              src={sdnaLogo}
              alt="S-DNA 로고"
              className="w-28 h-28 object-contain mb-8 rounded-2xl"
            />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 text-center leading-tight">
              생존·번식 유형 테스트
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-8">
              S-DNA
            </h2>
            <p className="text-slate-300 text-center mb-10 max-w-md leading-relaxed text-base md:text-lg">
              당신의 생존 전략과 번식 투자 방식을 파악하는 16가지 유형 테스트입니다.
              총 16개의 문항에 5단계로 응답하세요.
            </p>
            <button
              onClick={() => setTestStarted(true)}
              className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-lg font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              테스트 시작
            </button>
            <p className="text-slate-500 text-sm mt-6">약 3–5분 소요</p>
            <footer className="mt-12 text-center space-y-2 max-w-sm">
              <p className="text-slate-600 text-xs leading-relaxed">
                본 테스트는 사용자의 답변을 기반으로 한 심리 검사이며, 진화심리학적 가설을 바탕으로 설계되었습니다.
                임상적 진단이나 과학적 증명과는 차이가 있을 수 있습니다.
              </p>
              <p className="text-slate-700 text-xs">
                © 2026 S-DNA. All Rights Reserved.{' '}
                <a href="mailto:sohneun22@gmail.com" className="hover:text-slate-500 transition-colors">
                  sohneun22@gmail.com
                </a>
              </p>
            </footer>
          </div>
        )}

        {/* ── 테스트 화면 ── */}
        {testStarted && !testCompleted && !sharedResult && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-lg mb-10">
              <div className="flex justify-between text-slate-400 text-sm mb-3">
                <span className="font-medium">PART {questions[currentQuestion].part}</span>
                <span>{currentQuestion + 1} / {questions.length}</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="w-full max-w-lg mb-10 px-2">
              <p className="text-white text-xl font-semibold text-center leading-relaxed">
                {questions[currentQuestion].text}
              </p>
            </div>

            <div className="w-full max-w-lg space-y-3">
              {[
                { value: 5, label: '그렇다' },
                { value: 4, label: '조금 그렇다' },
                { value: 3, label: '보통이다' },
                { value: 2, label: '조금 그렇지 않다' },
                { value: 1, label: '그렇지 않다' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full py-5 px-6 rounded-xl font-semibold text-base transition-all duration-200 ${
                    answers[currentQuestion] === option.value
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── 기본 결과 화면 ── */}
        {testCompleted && !showDetailedResult && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
            <p className="text-slate-400 text-sm mb-4 tracking-widest uppercase">당신의 유형은</p>
            <div className="text-7xl md:text-8xl font-black mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {resultType}
            </div>
            {currentTypeData && (
              <>
                <p className="text-2xl md:text-3xl text-white font-bold mb-4">
                  {currentTypeData.nickname}
                </p>
                <p className="text-slate-400 text-center italic mb-10 max-w-sm leading-relaxed text-base">
                  "{currentTypeData.tagline}"
                </p>
              </>
            )}
            <div className="space-y-3 w-full max-w-sm">
              <button
                onClick={() => { saveResultToBackend(); setShowDetailedResult(true); }}
                disabled={isSaving}
                className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-base font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '상세 결과 보기'}
              </button>
              <button
                onClick={handleRetakeTest}
                className="w-full py-5 bg-slate-800 text-slate-300 text-base font-semibold rounded-xl hover:bg-slate-700 transition-all duration-300 border border-slate-700"
              >
                테스트 다시 하기
              </button>
            </div>
          </div>
        )}

        {/* ── 공유 결과 로딩 ── */}
        {loadingShared && (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-slate-400 text-base animate-pulse">결과를 불러오는 중...</p>
          </div>
        )}

        {/* ── 공유 결과 에러 ── */}
        {sharedError && (
          <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
            <p className="text-slate-400 text-base text-center">결과를 찾을 수 없습니다.</p>
            <button onClick={handleRetakeTest} className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl">
              테스트 시작하기
            </button>
          </div>
        )}

        {/* ── 공유된 결과 화면 ── */}
        {sharedResult && !loadingShared && (() => {
          const sType = sharedResult.type;
          const sScores = sharedResult.scores;
          const sData = typeData[sType];
          if (!sData) return null;
          return (
            <div className="max-w-lg mx-auto px-5 py-14 space-y-6">
              <div className="text-center bg-slate-800/60 border border-slate-700 rounded-2xl py-3 px-4 mb-2">
                <p className="text-cyan-400 text-xs font-semibold">친구의 S-DNA 결과</p>
              </div>
              <div className="text-center mb-2">
                <p className="text-slate-400 text-xs tracking-widest uppercase mb-3">유형</p>
                <div className="text-6xl md:text-7xl font-black mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{sType}</div>
                <p className="text-2xl text-white font-bold">{sData.nickname}</p>
              </div>
              <div className="border-l-4 border-cyan-500 pl-5 py-1">
                <p className="text-slate-300 italic leading-relaxed text-base">"{sData.tagline}"</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                <h3 className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-3">유형 요약</h3>
                <p className="text-slate-300 leading-relaxed text-sm">{sData.summary}</p>
              </div>
              <div>
                <h3 className="text-slate-200 font-bold text-base mb-3">본능적 행동 양식</h3>
                <div className="space-y-3">
                  {sData.behaviors.map((b, idx) => (
                    <div key={idx} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-slate-200 font-bold text-sm">{b.title}</span>
                        {b.label && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 font-medium">{b.label}</span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{b.content}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-slate-200 font-bold text-base mb-3">성향 점수</h3>
                <div className="space-y-3">
                  {axes.map((axis, idx) => {
                    const posScore = sScores[axis.pos];
                    const negScore = sScores[axis.neg];
                    const total = posScore + negScore;
                    const posPercent = Math.round((posScore / total) * 100);
                    return (
                      <div key={idx} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
                        <p className="text-slate-300 text-sm font-semibold mb-1">{axis.label}</p>
                        <p className="text-slate-500 text-xs mb-4 italic">{axis.sublabel}</p>
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                          <span>{axis.posLabel}</span>
                          <span className="font-bold text-cyan-400">{posPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" style={{ width: `${posPercent}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{axis.negLabel}</span>
                          <span className="font-bold text-purple-400">{100 - posPercent}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleRetakeTest}
                className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-base font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300"
              >
                나도 테스트 하기
              </button>
              <footer className="text-center space-y-2 pt-2 pb-4">
                <p className="text-slate-600 text-xs leading-relaxed">본 테스트는 사용자의 답변을 기반으로 한 심리 검사이며, 진화심리학적 가설을 바탕으로 설계되었습니다. 임상적 진단이나 과학적 증명과는 차이가 있을 수 있습니다.</p>
                <p className="text-slate-700 text-xs">© 2026 S-DNA. All Rights Reserved. <a href="mailto:sohneun22@gmail.com" className="hover:text-slate-500 transition-colors">sohneun22@gmail.com</a></p>
              </footer>
            </div>
          );
        })()}

        {/* ── 상세 결과 화면 ── */}
        {testCompleted && showDetailedResult && currentTypeData && (
          <div className="max-w-lg mx-auto px-5 py-14 space-y-6">

            {/* 유형 헤더 */}
            <div className="text-center mb-2">
              <p className="text-slate-400 text-xs tracking-widest uppercase mb-3">당신의 유형</p>
              <div className="text-6xl md:text-7xl font-black mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {resultType}
              </div>
              <p className="text-2xl text-white font-bold">{currentTypeData.nickname}</p>
            </div>

            {/* 태그라인 */}
            <div className="border-l-4 border-cyan-500 pl-5 py-1">
              <p className="text-slate-300 italic leading-relaxed text-base">
                "{currentTypeData.tagline}"
              </p>
            </div>

            {/* 유형 요약 */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
              <h3 className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-3">유형 요약</h3>
              <p className="text-slate-300 leading-relaxed text-sm">{currentTypeData.summary}</p>
            </div>

            {/* 본능적 행동 양식 */}
            <div>
              <h3 className="text-slate-200 font-bold text-base mb-3">본능적 행동 양식</h3>
              <div className="space-y-3">
                {currentTypeData.behaviors.map((behavior, idx) => (
                  <div key={idx} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-slate-200 font-bold text-sm">{behavior.title}</span>
                      {behavior.label && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 font-medium">
                          {behavior.label}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{behavior.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 성향 점수 바 */}
            <div>
              <h3 className="text-slate-200 font-bold text-base mb-3">나의 성향 점수</h3>
              <div className="space-y-3">
                {axes.map((axis, idx) => {
                  const posScore = resultScores[axis.pos];
                  const negScore = resultScores[axis.neg];
                  const total = posScore + negScore;
                  const posPercent = Math.round((posScore / total) * 100);
                  const negPercent = 100 - posPercent;
                  return (
                    <div key={idx} className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5">
                      <p className="text-slate-300 text-sm font-semibold mb-1">{axis.label}</p>
                      <p className="text-slate-500 text-xs mb-4 italic">{axis.sublabel}</p>
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>{axis.posLabel}</span>
                        <span className="font-bold text-cyan-400">{posPercent}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-700"
                          style={{ width: `${posPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{axis.negLabel}</span>
                        <span className="font-bold text-purple-400">{negPercent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 전체 분포 + 공유 */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-slate-200 font-bold text-base mb-2">전체 분포</h3>
                <p className="text-slate-400 text-sm">
                  당신의 유형은 인구의 약{' '}
                  <span className="text-cyan-400 font-bold">{typePercentages[resultType]}%</span>를 차지합니다.
                </p>
              </div>

              {resultId && (
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-slate-400 text-xs font-semibold mb-2">결과 공유</p>
                  <button
                    onClick={copyShareLink}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-xl transition-colors"
                  >
                    {copySuccess ? (
                      <><Check size={15} className="text-green-400" /><span className="text-green-400">복사됨!</span></>
                    ) : (
                      <><Copy size={15} /><span>공유 링크 복사</span></>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 다시하기 */}
            <button
              onClick={handleRetakeTest}
              className="w-full py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-base font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/40 transition-all duration-300"
            >
              처음부터 다시 하기
            </button>

            {/* 푸터 */}
            <footer className="text-center space-y-2 pt-2 pb-4">
              <p className="text-slate-600 text-xs leading-relaxed">
                본 테스트는 사용자의 답변을 기반으로 한 심리 검사이며, 진화심리학적 가설을 바탕으로 설계되었습니다.
                임상적 진단이나 과학적 증명과는 차이가 있을 수 있습니다.
              </p>
              <p className="text-slate-700 text-xs">
                © 2026 S-DNA. All Rights Reserved.{' '}
                <a href="mailto:sohneun22@gmail.com" className="hover:text-slate-500 transition-colors">
                  sohneun22@gmail.com
                </a>
              </p>
            </footer>
          </div>
        )}

      </div>
    </div>
  );
};

export default SDNATest;
