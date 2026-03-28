import React, { useState, useMemo } from 'react';
import { CURRICULUM } from './constants';
import { generateRevisionMaterial, evaluatePerformance } from './services/gemini';
import { RevisionData } from './types';

const App: React.FC = () => {
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'select' | 'result'>('select');
  const [activeTab, setActiveTab] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<RevisionData | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<string[]>(['A', 'E', 'F']);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalLessonsCount = useMemo(() => {
    return CURRICULUM.reduce((acc, topic) => 
      acc + topic.grades.reduce((gAcc, g) => gAcc + g.lessons.length, 0), 0
    );
  }, []);

  const filteredCurriculum = useMemo(() => {
    if (!searchTerm.trim()) return CURRICULUM;
    const term = searchTerm.toLowerCase();
    return CURRICULUM.map(topic => ({
      ...topic,
      grades: topic.grades.map(g => ({
        ...g,
        lessons: g.lessons.filter(l => l.toLowerCase().includes(term))
      })).filter(g => g.lessons.length > 0)
    })).filter(topic => topic.grades.length > 0);
  }, [searchTerm]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev => 
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const toggleLesson = (lesson: string) => {
    setSelectedLessons(prev => 
      prev.includes(lesson) ? prev.filter(l => l !== lesson) : [...prev, lesson]
    );
  };

  const toggleGrade = (lessons: string[]) => {
    const allSelected = lessons.every(l => selectedLessons.includes(l));
    if (allSelected) {
      setSelectedLessons(prev => prev.filter(l => !lessons.includes(l)));
    } else {
      setSelectedLessons(prev => Array.from(new Set([...prev, ...lessons])));
    }
  };

  const handleGenerate = async () => {
    if (selectedLessons.length === 0) return;
    setIsLoading(true);
    const result = await generateRevisionMaterial(selectedLessons);
    if (result) {
      setData(result);
      setView('result');
      setActiveTab(1);
      setUserAnswers({});
      setIsSubmitted(false);
    }
    setIsLoading(false);
  };

  const calculateScore = () => {
    if (!data) return 0;
    let scorePart1 = 0;
    let scorePart2 = 0;

    data.questions.part1.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) scorePart1 += 0.25;
    });

    data.questions.part2.forEach(q => {
      let correctCount = 0;
      const userAns = userAnswers[q.id] || {};
      q.subQuestions?.forEach(sub => {
        if (userAns[sub.id] === sub.correctAnswer) correctCount++;
      });
      if (correctCount === 1) scorePart2 += 0.1;
      else if (correctCount === 2) scorePart2 += 0.25;
      else if (correctCount === 3) scorePart2 += 0.5;
      else if (correctCount === 4) scorePart2 += 1.0;
    });

    return Number((scorePart1 + scorePart2).toFixed(2));
  };

  const handleSubmitQuiz = async () => {
    setIsEvaluating(true);
    setIsSubmitted(true);
    const results = {
      score: calculateScore(),
      scope: selectedLessons,
      part1: data?.questions.part1.map(q => ({ id: q.id, isCorrect: userAnswers[q.id] === q.correctAnswer })),
      part2: data?.questions.part2.map(q => ({
        id: q.id,
        correctCount: q.subQuestions?.filter(s => userAnswers[q.id]?.[s.id] === s.correctAnswer).length || 0
      }))
    };
    const evaluation = await evaluatePerformance(results);
    setData(prev => prev ? { ...prev, evaluation } : null);
    setIsEvaluating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatKeywords = (text: string) => {
    if (!text) return '';
    return text.replace(/`([^`]+)`/g, '<strong class="font-bold italic text-indigo-800">$1</strong>');
  };

  const enhanceTheoryFormatting = (text: string) => {
    if (!text) return '';
    let processed = text;

    const codeBlocks: string[] = [];
    processed = processed.replace(/```(sql|python|html|css)?\s*([\s\S]*?)```/gi, (match, lang, code) => {
        const languageName = (lang || 'CODE').toUpperCase();
        codeBlocks.push(`<div class="my-3 rounded-lg overflow-hidden border border-slate-700 shadow-sm bg-[#1e1e1e]">
            <div class="bg-slate-800 text-[10px] font-bold text-slate-400 px-3 py-1.5 flex items-center justify-between border-b border-slate-700">
                <span>${languageName}</span>
                <i class="fas fa-terminal opacity-50 text-[8px]"></i>
            </div>
            <pre class="text-slate-300 p-4 overflow-x-auto font-mono text-sm leading-6 whitespace-pre"><code>${code.trim()}</code></pre>
        </div>`);
        return `__CODEBLOCK_${codeBlocks.length - 1}__`;
    });

    processed = formatKeywords(processed);

    processed = processed.replace(/(^|\n)###\s*(.*?)(?=\n|$)/g, '$1<h3 class="text-xl font-black text-blue-900 mt-8 mb-4 border-b-2 border-blue-100 pb-1.5 flex items-center"><span class="w-1.5 h-6 bg-blue-600 mr-2.5 rounded-sm shadow-sm"></span>$2</h3>');

    processed = processed.replace(/(^|\n)\+\s*(.*?)(?=\n|$)/g, '$1<div class="font-bold text-slate-800 mt-4 mb-2 text-lg flex items-baseline"><span class="text-blue-600 mr-2.5 font-black text-xl">+</span><span>$2</span></div>');

    processed = processed.replace(/(^|\n)-\s*(.*?)(?=\n|$)/g, '$1<div class="text-slate-600 mb-2 pl-7 text-[15px] leading-relaxed text-justify relative"><span class="absolute left-1.5 top-2.5 w-1.5 h-1.5 bg-slate-300 rounded-full"></span>$2</div>');

    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-950">$1</strong>');

    processed = processed.replace(/\n/g, '<br/>');
    
    codeBlocks.forEach((block, index) => {
        processed = processed.replace(`__CODEBLOCK_${index}__`, block);
    });
    
    return processed;
  };

  const formatSimpleText = (text: string) => {
    if (!text) return '';
    return formatKeywords(text)
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-800">$1</strong>')
        .replace(/\n/g, '<br/>');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-blue-900/10 backdrop-blur-md flex flex-col items-center justify-center z-50 px-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-sm text-center border border-blue-50">
          <div className="w-14 h-14 mb-4 relative">
             <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
             <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
             <i className="fas fa-microchip absolute inset-0 flex items-center justify-center text-blue-600 text-lg"></i>
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2">Đang thiết kế tài liệu...</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Sẵn sàng cho kỳ thi 2025</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-4 py-1.5 h-14 flex items-center shadow-sm">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm shadow-lg shadow-blue-100">
              <i className="fas fa-database"></i>
            </div>
            <div>
              <h1 className="text-sm md:text-base font-black text-blue-900 leading-none">Trợ lý ôn thi Tin học THPT 2025</h1>
              <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mt-1">Lộ trình định hướng ICT</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {view === 'result' && (
              <button onClick={() => setView('select')} className="text-xs font-black px-3.5 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                <i className="fas fa-sync mr-1.5"></i>ĐỔI BÀI
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
              <i className="fas fa-user-graduate text-sm"></i>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-4 md:p-6 flex-1">
        {view === 'select' ? (
          <div className="animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm mb-6 flex gap-3 items-center">
              <div className="flex-1 relative">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="text" 
                  placeholder="Tìm bài học (SQL, Python, Excel, AI...)"
                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-[15px] focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-100 hidden md:flex items-center gap-3">
                <span className="text-[10px] font-black text-blue-400 uppercase leading-none">Đã chọn:</span>
                <span className="text-lg font-black text-blue-700 leading-none">{selectedLessons.length}</span>
              </div>
            </div>

            <div className="space-y-4">
              {filteredCurriculum.map(topic => (
                <div key={topic.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:border-blue-200 transition-colors group">
                  <button 
                    onClick={() => toggleTopic(topic.id)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg shadow-sm transition-all ${expandedTopics.includes(topic.id) ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-slate-100 text-blue-600'}`}>
                        <i className={`fas ${topic.icon}`}></i>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Chủ đề {topic.id}</span>
                        <h3 className="text-[15px] md:text-base font-bold text-slate-800 leading-tight">{topic.title}</h3>
                      </div>
                    </div>
                    <i className={`fas fa-chevron-down text-slate-400 text-sm transition-transform duration-300 ${expandedTopics.includes(topic.id) ? 'rotate-180' : ''}`}></i>
                  </button>
                  {expandedTopics.includes(topic.id) && (
                    <div className="px-5 pb-5 pt-1 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn border-t border-slate-50">
                      {topic.grades.map((g, idx) => (
                        <div key={idx} className="space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                            <span className="text-[11px] font-black text-slate-500 uppercase">{g.grade}</span>
                            <button onClick={() => toggleGrade(g.lessons)} className="text-[10px] font-black text-blue-600 uppercase px-2 py-0.5 bg-blue-50 rounded-md hover:bg-blue-100">
                              {g.lessons.every(l => selectedLessons.includes(l)) ? 'Bỏ' : 'Tất cả'}
                            </button>
                          </div>
                          {g.lessons.map(lesson => (
                            <label key={lesson} className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${selectedLessons.includes(lesson) ? 'bg-blue-50 border-blue-100 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}>
                              <input 
                                type="checkbox" 
                                checked={selectedLessons.includes(lesson)} 
                                onChange={() => toggleLesson(lesson)} 
                                className="mt-1 w-4 h-4 accent-blue-600"
                              />
                              <span className={`text-[14px] font-bold leading-tight ${selectedLessons.includes(lesson) ? 'text-blue-900' : 'text-slate-600'}`}>{lesson}</span>
                            </label>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="flex p-1.5 bg-slate-200/40 rounded-2xl mb-8 shadow-inner max-w-md mx-auto backdrop-blur-sm border border-slate-200/50">
              {[
                { id: 1, label: 'Lý thuyết', icon: 'fa-book-open' },
                { id: 2, label: 'Luyện tập', icon: 'fa-code' },
                { id: 3, label: 'AI Phân tích', icon: 'fa-brain' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-[13px] font-black transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <i className={`fas ${tab.icon} text-xs`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-12 min-h-[600px]">
              {activeTab === 1 && (
                <div className="animate-fadeIn">
                  <h2 className="text-3xl font-black text-slate-800 mb-8 flex items-center gap-4">
                    Tóm tắt kiến thức
                    <span className="h-1 bg-blue-100 flex-1 rounded-full"></span>
                  </h2>
                  <div className="markdown-content text-[16px] leading-relaxed" dangerouslySetInnerHTML={{ __html: enhanceTheoryFormatting(data?.theory || '') }} />
                </div>
              )}

              {activeTab === 2 && (
                <div className="animate-fadeIn space-y-12">
                  {isSubmitted && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white flex items-center justify-between shadow-2xl shadow-blue-200">
                      <div>
                        <h3 className="text-3xl font-black mb-1">KẾT QUẢ: {calculateScore()}/10</h3>
                        <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Tiêu chuẩn TN THPT môn Tin học</p>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
                        <i className="fas fa-medal"></i>
                      </div>
                    </div>
                  )}

                  <section>
                    <h3 className="text-xl font-black text-blue-900 mb-6 uppercase tracking-widest flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-lg shadow-blue-100">I</span>
                        Phần I: Trắc nghiệm MCQ
                    </h3>
                    <div className="space-y-8">
                      {data?.questions.part1.map(q => (
                        <div key={q.id} className={`p-6 rounded-3xl border transition-all ${isSubmitted ? 'bg-slate-50/30' : 'hover:bg-slate-50/50 border-slate-100'}`}>
                          <p className="font-bold text-slate-800 text-[17px] mb-5 leading-relaxed">
                             <span className="text-blue-600 mr-2">Câu {q.id}.</span>
                             <span dangerouslySetInnerHTML={{ __html: formatSimpleText(q.question || '') }} />
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options?.map(opt => {
                              const char = opt.trim().charAt(0);
                              const isSelected = userAnswers[q.id] === char;
                              const isCorrect = q.correctAnswer === char;
                              let btnClass = "bg-white border-slate-200 text-slate-700";
                              if (isSubmitted) {
                                if (isCorrect) btnClass = "bg-green-600 border-green-600 text-white shadow-md";
                                else if (isSelected) btnClass = "bg-red-500 border-red-500 text-white opacity-90";
                                else btnClass = "bg-white border-slate-100 text-slate-300 opacity-60";
                              } else if (isSelected) {
                                btnClass = "bg-blue-600 border-blue-600 text-white shadow-lg ring-4 ring-blue-50";
                              }
                              return (
                                <button key={opt} disabled={isSubmitted} onClick={() => setUserAnswers(prev => ({...prev, [q.id]: char}))} className={`text-left p-4 rounded-2xl border-2 text-[15px] font-bold transition-all ${btnClass}`}>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {isSubmitted && (
                            <div className="mt-5 p-5 bg-white rounded-2xl border border-slate-100 text-[14px] leading-relaxed shadow-sm">
                                <p className="font-black text-blue-600 uppercase tracking-widest text-[11px] mb-2">Lời giải chi tiết</p>
                                <span className="text-slate-600" dangerouslySetInnerHTML={{ __html: formatSimpleText(q.explanation || '') }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-black text-emerald-900 mb-6 uppercase tracking-widest flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-lg shadow-emerald-100">II</span>
                        Phần II: Đúng/Sai (Định hướng ICT)
                    </h3>
                    <div className="space-y-10">
                      {data?.questions.part2.map(q => (
                        <div key={q.id} className="p-8 rounded-[2.5rem] border border-emerald-100 bg-white shadow-xl shadow-emerald-50/20">
                          <div className="bg-emerald-50/50 p-6 rounded-3xl mb-6 border-l-8 border-emerald-500">
                             <p className="text-[11px] font-black uppercase text-emerald-600 tracking-widest mb-3">Câu {q.id}: Bối cảnh thực tiễn</p>
                             <div className="text-[15px] md:text-base leading-relaxed text-slate-700 italic text-justify" dangerouslySetInnerHTML={{ __html: formatSimpleText(q.context || '') }} />
                          </div>
                          <p className="font-black text-slate-800 text-lg mb-6 leading-tight">{q.question}</p>
                          <div className="space-y-4">
                            {q.subQuestions?.map(sub => {
                              const userSub = userAnswers[q.id]?.[sub.id];
                              const isSubCorrect = userSub === sub.correctAnswer;
                              return (
                                <div key={sub.id} className={`p-4 rounded-2xl border transition-all ${isSubmitted ? (isSubCorrect ? 'bg-green-50/30 border-green-100' : 'bg-red-50/30 border-red-100') : 'bg-slate-50/30 border-slate-100'}`}>
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                                    <span className="text-[15px] font-bold text-slate-700 flex-1 leading-relaxed">
                                       <span className="text-emerald-600 font-black mr-2">{sub.id.toUpperCase()}.</span>
                                       {sub.text}
                                    </span>
                                    <div className="flex gap-2">
                                      {[true, false].map(val => {
                                        let btnClass = "bg-white text-slate-400 border-slate-200";
                                        if (isSubmitted) {
                                            if (sub.correctAnswer === val) btnClass = "bg-emerald-600 border-emerald-600 text-white shadow-md";
                                            else if (userSub === val) btnClass = "bg-red-400 border-red-400 text-white opacity-40 scale-95";
                                        } else if (userSub === val) {
                                            btnClass = val ? "bg-emerald-600 border-emerald-600 text-white shadow-lg" : "bg-red-600 border-red-600 text-white shadow-lg";
                                        }
                                        return (
                                          <button key={String(val)} disabled={isSubmitted} onClick={() => {
                                            const current = userAnswers[q.id] || {};
                                            setUserAnswers(prev => ({...prev, [q.id]: {...current, [sub.id]: val}}));
                                          }} className={`w-20 py-2 rounded-xl text-[12px] font-black uppercase border-2 transition-all ${btnClass}`}>
                                            {val ? 'ĐÚNG' : 'SAI'}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  {isSubmitted && (
                                    <div className="mt-4 text-[13px] text-slate-500 border-t border-slate-100 pt-3 flex items-start gap-2">
                                      <i className="fas fa-info-circle mt-1 text-emerald-400"></i>
                                      <span dangerouslySetInnerHTML={{ __html: formatSimpleText(sub.explanation || '') }} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xl font-black text-amber-900 mb-6 uppercase tracking-widest flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-lg shadow-amber-100">III</span>
                        Phần III: Tự luận (Vận dụng)
                    </h3>
                    <div className="space-y-6">
                        {data?.questions.part3.map(q => (
                           <div key={q.id} className="p-8 rounded-[2rem] border-2 border-amber-100 bg-amber-50/20">
                                <p className="font-bold text-slate-800 text-[17px] mb-5 leading-relaxed">
                                   <span className="text-amber-600 font-black mr-2">Câu {q.id}.</span>
                                   {q.question}
                                </p>
                                <textarea className="w-full p-5 text-base rounded-2xl border-2 border-slate-100 bg-white focus:ring-4 focus:ring-amber-100 min-h-[120px] shadow-inner transition-all" placeholder="Ghi chú câu trả lời hoặc phác thảo thuật toán tại đây..."></textarea>
                                {isSubmitted && (
                                    <div className="mt-6 p-6 bg-white rounded-2xl border-2 border-amber-200 text-[15px] text-slate-700 shadow-sm">
                                        <p className="font-black text-amber-500 uppercase tracking-widest text-[11px] mb-3">Hướng dẫn giải & Đáp án mẫu</p>
                                        <div dangerouslySetInnerHTML={{ __html: enhanceTheoryFormatting(q.explanation || '') }} />
                                    </div>
                                )}
                           </div>
                        ))}
                    </div>
                  </section>

                  {!isSubmitted && (
                    <div className="pt-10 flex justify-center sticky bottom-10 z-20">
                        <button onClick={handleSubmitQuiz} className="px-14 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-300/60 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-4 border-4 border-white active:scale-95">
                            <i className="fas fa-paper-plane"></i> NỘP BÀI & XEM GIẢI CHI TIẾT
                        </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 3 && (
                <div className="animate-fadeIn">
                  {isSubmitted ? (
                    <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 shadow-inner">
                        <h2 className="text-2xl font-black text-blue-900 mb-6 flex items-center gap-3">
                          <i className="fas fa-magic text-blue-500"></i>
                          Lời khuyên từ Trợ lý AI
                        </h2>
                        <div className="markdown-content text-[16px] leading-relaxed" dangerouslySetInnerHTML={{ __html: enhanceTheoryFormatting(data?.evaluation || '') }} />
                    </div>
                  ) : (
                    <div className="py-32 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 text-3xl">
                           <i className="fas fa-brain"></i>
                        </div>
                        <p className="text-slate-400 font-bold max-w-xs mx-auto">Hoàn thành bài làm để AI phân tích lỗ hổng kiến thức và gợi ý lộ trình ôn tập tiếp theo.</p>
                        <button onClick={() => setActiveTab(2)} className="mt-8 px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-black text-sm hover:bg-blue-50 transition-all">LÀM BÀI NGAY</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {view === 'select' && selectedLessons.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-white via-white/90 to-transparent">
          <div className="max-w-4xl mx-auto flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
             <div className="flex-1 px-4">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1 block">Lộ trình đã thiết lập</span>
                <p className="text-slate-800 font-black text-[15px]">{selectedLessons.length} bài học ICT được chọn</p>
             </div>
             <button onClick={handleGenerate} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[15px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95">
                <i className="fas fa-bolt"></i> BẮT ĐẦU ÔN TẬP
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;