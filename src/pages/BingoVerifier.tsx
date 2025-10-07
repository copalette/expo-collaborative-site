import React, { useCallback, useEffect, useMemo, useState } from 'react';

type BingoCell = number | 'FREE';

type BingoCard = {
  id: string;
  label: string;
  grid: BingoCell[][];
  createdAt: string;
  notes?: string;
};

type VerificationResult = {
  cardId: string;
  timestamp: string;
  status: 'valid' | 'invalid' | 'not-found';
  completedLines: string[];
  missingNumbers: number[];
  snapshot?: BingoCell[][];
};

const NUMBER_RANGE = Array.from({ length: 75 }, (_, index) => index + 1);

const STORAGE_KEYS = {
  drawn: 'bingo-drawn-numbers',
  cards: 'bingo-card-registry',
  logs: 'bingo-verification-log',
};

const columnRanges: Array<{ start: number; end: number; heading: string }> = [
  { heading: 'B', start: 1, end: 15 },
  { heading: 'I', start: 16, end: 30 },
  { heading: 'N', start: 31, end: 45 },
  { heading: 'G', start: 46, end: 60 },
  { heading: 'O', start: 61, end: 75 },
];

const generateId = () => `BNG-${Math.random().toString(36).slice(-4).toUpperCase()}${Date.now().toString(36).slice(-2).toUpperCase()}`;

type ManualCardDraft = {
  label: string;
  numbers: string;
  notes: string;
  error?: string;
};

const BingoVerifier: React.FC = () => {
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.drawn);
    return stored ? JSON.parse(stored) : [];
  });
  const [cards, setCards] = useState<BingoCard[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.cards);
    return stored ? JSON.parse(stored) : [];
  });
  const [verificationLogs, setVerificationLogs] = useState<VerificationResult[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.logs);
    return stored ? JSON.parse(stored) : [];
  });
  const [manualDraft, setManualDraft] = useState<ManualCardDraft>({ label: '', numbers: '', notes: '' });
  const [lookupId, setLookupId] = useState('');
  const [lastResult, setLastResult] = useState<VerificationResult | null>(null);

  const drawnSet = useMemo(() => new Set(drawnNumbers), [drawnNumbers]);
  const recentCalls = useMemo(() => [...drawnNumbers].slice(-5).reverse(), [drawnNumbers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.drawn, JSON.stringify(drawnNumbers));
  }, [drawnNumbers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.cards, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(verificationLogs.slice(0, 50)));
  }, [verificationLogs]);

  const toggleNumber = useCallback((number: number) => {
    setDrawnNumbers(prev => {
      if (prev.includes(number)) {
        return prev.filter(value => value !== number);
      }
      return [...prev, number];
    });
  }, []);

  const undoLastCall = useCallback(() => {
    setDrawnNumbers(prev => prev.slice(0, -1));
  }, []);

  const clearBoard = useCallback(() => {
    setDrawnNumbers([]);
  }, []);

  const generateRandomCard = () => {
    const grid: BingoCell[][] = Array.from({ length: 5 }, () => Array<BingoCell>(5).fill(0));

    columnRanges.forEach((column, columnIndex) => {
      const pool = columnRange(column.start, column.end);
      const picks = shuffle(pool).slice(0, columnIndex === 2 ? 4 : 5).sort((a, b) => a - b);
      let pickIndex = 0;
      for (let row = 0; row < 5; row += 1) {
        if (columnIndex === 2 && row === 2) {
          grid[row][columnIndex] = 'FREE';
          continue;
        }
        grid[row][columnIndex] = picks[pickIndex];
        pickIndex += 1;
      }
    });

    grid[2][2] = 'FREE';

    const newCard: BingoCard = {
      id: generateId(),
      label: `自動生成カード ${cards.length + 1}`,
      grid,
      createdAt: new Date().toISOString(),
    };

    setCards(prev => [newCard, ...prev]);
    setManualDraft({ label: '', numbers: '', notes: '' });
  };

  const parseManualCard = () => {
    const cleaned = manualDraft.numbers.replace(/[,\n]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleaned) {
      setManualDraft(draft => ({ ...draft, error: 'カードの数字を入力してください（スペース区切りで25個）。' }));
      return;
    }

    const tokens = cleaned.split(' ');
    if (tokens.length < 24 || tokens.length > 25) {
      setManualDraft(draft => ({ ...draft, error: '25個の数字を入力してください（中央マスは自動でFREEになります）。' }));
      return;
    }

    const numbers = tokens.map(token => Number(token)).filter(value => Number.isFinite(value));
    if (numbers.length !== tokens.length) {
      setManualDraft(draft => ({ ...draft, error: '数字以外の値が含まれています。' }));
      return;
    }

    if (new Set(numbers).size !== numbers.length) {
      setManualDraft(draft => ({ ...draft, error: '同じ数字が重複しています。' }));
      return;
    }

    const outOfRange = numbers.find(value => value < 1 || value > 75);
    if (outOfRange) {
      setManualDraft(draft => ({ ...draft, error: '1〜75の範囲で入力してください。' }));
      return;
    }

    const grid: BingoCell[][] = Array.from({ length: 5 }, () => Array<BingoCell>(5).fill(0));
    let index = 0;
    for (let row = 0; row < 5; row += 1) {
      for (let column = 0; column < 5; column += 1) {
        if (row === 2 && column === 2) {
          grid[row][column] = 'FREE';
          continue;
        }
        grid[row][column] = numbers[index] ?? 0;
        index += 1;
      }
    }

    const newCard: BingoCard = {
      id: generateId(),
      label: manualDraft.label || `手入力カード ${cards.length + 1}`,
      grid,
      createdAt: new Date().toISOString(),
      notes: manualDraft.notes ? manualDraft.notes.trim() : undefined,
    };

    setCards(prev => [newCard, ...prev]);
    setManualDraft({ label: '', numbers: '', notes: '' });
  };

  const handleVerify = (cardId?: string) => {
    const targetId = (cardId ?? lookupId).trim();
    if (!targetId) return;

    const card = cards.find(item => item.id === targetId);
    if (!card) {
      const result: VerificationResult = {
        cardId: targetId,
        timestamp: new Date().toISOString(),
        status: 'not-found',
        completedLines: [],
        missingNumbers: [],
      };
      setLastResult(result);
      setVerificationLogs(prev => [result, ...prev]);
      return;
    }

    const analysis = analyseCard(card, drawnSet);
    const result: VerificationResult = {
      cardId: card.id,
      timestamp: new Date().toISOString(),
      status: analysis.completedLines.length > 0 ? 'valid' : 'invalid',
      completedLines: analysis.completedLines,
      missingNumbers: analysis.missingNumbers,
      snapshot: card.grid,
    };
    setLastResult(result);
    setVerificationLogs(prev => [result, ...prev]);
  };

  const coverageStats = useMemo(() => {
    const coverageByColumn = columnRanges.map((column, index) => {
      const numbersInColumn = NUMBER_RANGE.filter(value => value >= column.start && value <= column.end);
      const covered = numbersInColumn.filter(value => drawnSet.has(value));
      return {
        heading: column.heading,
        covered: covered.length,
        total: numbersInColumn.length,
      };
    });

    return {
      totalCalled: drawnNumbers.length,
      coverageByColumn,
    };
  }, [drawnNumbers, drawnSet]);

  const handleDeleteCard = (cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
  };

  const handleResetLogs = () => {
    setVerificationLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100 px-4 pb-16 pt-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-sky-200">Bingo Integrity Suite</p>
              <h1 className="text-3xl font-bold text-white md:text-4xl">ビンゴ検証ダッシュボード</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-200">
                紙のビンゴカードでも、カードIDを読み取るだけで揃い判定を即座に可視化。進行チームは抽選履歴を共有しながら、
                不正のないビンゴ判定をワンタップで確認できます。
              </p>
            </div>
            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/10 p-5 text-sm text-slate-200">
              <p className="text-xs uppercase text-sky-200">直近コール</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentCalls.length === 0 && <span className="text-xs text-slate-400">まだ番号が呼ばれていません</span>}
                {recentCalls.map(number => (
                  <span key={number} className="rounded-full bg-sky-500/20 px-3 py-1 text-sm font-semibold text-white">
                    {formatBall(number)}
                  </span>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-xs">
                {coverageStats.coverageByColumn.map(column => (
                  <div key={column.heading} className="flex items-center justify-between text-slate-300">
                    <span>{column.heading}</span>
                    <span>{column.covered} / {column.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">抽選管理ボード</h2>
                <p className="text-xs text-slate-300">呼び上げた番号をタップで記録。重複コールや聞き漏れを防ぎます。</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <button
                  type="button"
                  onClick={undoLastCall}
                  className="rounded-full border border-white/20 px-4 py-2 text-slate-100 hover:border-white/40"
                >
                  直前を取り消す
                </button>
                <button
                  type="button"
                  onClick={clearBoard}
                  className="rounded-full border border-rose-300/50 px-4 py-2 text-rose-200 hover:bg-rose-400/20"
                >
                  リセット
                </button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-5 gap-3 text-center text-sm">
              {columnRanges.map(column => (
                <div key={column.heading} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-lg font-bold text-sky-200">{column.heading}</p>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {columnRange(column.start, column.end).map(number => {
                      const active = drawnSet.has(number);
                      return (
                        <button
                          key={number}
                          type="button"
                          onClick={() => toggleNumber(number)}
                          className={`rounded-xl border px-2 py-2 font-semibold transition ${active ? 'border-emerald-400/70 bg-emerald-400/30 text-white shadow-lg shadow-emerald-500/30' : 'border-white/10 bg-transparent text-slate-100 hover:border-white/40 hover:bg-white/10'}`}
                        >
                          {number}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white">カード登録</h2>
            <p className="mt-1 text-xs text-slate-300">
              事前に印刷した紙カードへIDやQRを付ける想定です。カードIDで照合すれば現物確認なしで判定可能になります。
            </p>
            <div className="mt-4 space-y-4 text-sm">
              <button
                type="button"
                onClick={generateRandomCard}
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-3 font-semibold text-white shadow-lg hover:from-sky-400 hover:to-indigo-400"
              >
                ランダムカードを生成
              </button>
              <div className="space-y-2">
                <label className="block text-xs text-slate-300">カード名（任意）</label>
                <input
                  type="text"
                  value={manualDraft.label}
                  onChange={event => setManualDraft(draft => ({ ...draft, label: event.target.value, error: undefined }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky-300 focus:outline-none"
                  placeholder="例: 受付チーム05"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-300">数字を入力（スペース区切り25個・中央FREE）</label>
                <textarea
                  value={manualDraft.numbers}
                  onChange={event => setManualDraft(draft => ({ ...draft, numbers: event.target.value, error: undefined }))}
                  className="h-28 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky-300 focus:outline-none"
                  placeholder="例: 3 12 8 ..."
                />
                {manualDraft.error && <p className="text-xs text-rose-300">{manualDraft.error}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-slate-300">メモ（任意）</label>
                <input
                  type="text"
                  value={manualDraft.notes}
                  onChange={event => setManualDraft(draft => ({ ...draft, notes: event.target.value, error: undefined }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white focus:border-sky-300 focus:outline-none"
                  placeholder="配布先や席番号など"
                />
              </div>
              <button
                type="button"
                onClick={parseManualCard}
                className="w-full rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-slate-100 hover:border-white/40"
              >
                手入力カードを登録
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">カード照合コンソール</h2>
                <p className="text-xs text-slate-300">カードIDを入力すると、現在の抽選状況と照合し即座にライン判定します。</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={lookupId}
                  onChange={event => setLookupId(event.target.value)}
                  placeholder="カードIDを入力"
                  className="w-40 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-sky-300 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleVerify()}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-emerald-400"
                >
                  照合
                </button>
              </div>
            </div>

            {lastResult && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-white/10 px-3 py-1 font-semibold text-white">{lastResult.cardId}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${lastResult.status === 'valid' ? 'bg-emerald-400/30 text-emerald-100 border border-emerald-300/50' : lastResult.status === 'invalid' ? 'bg-rose-400/20 text-rose-100 border border-rose-300/50' : 'bg-slate-500/20 text-slate-200 border border-slate-400/50'}`}>
                    {lastResult.status === 'valid' ? 'ビンゴ成立' : lastResult.status === 'invalid' ? '未成立' : 'カード未登録'}
                  </span>
                  <span className="text-xs text-slate-300">{new Date(lastResult.timestamp).toLocaleTimeString('ja-JP')}</span>
                </div>

                {lastResult.status !== 'not-found' && lastResult.snapshot && (
                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-sky-200">カードビュー</p>
                      <div className="mt-2 grid grid-cols-5 gap-1 text-center text-sm">
                        {['B', 'I', 'N', 'G', 'O'].map(label => (
                          <div key={label} className="rounded-lg bg-white/10 py-1 text-xs font-semibold text-sky-200">{label}</div>
                        ))}
                        {lastResult.snapshot.flat().map((cell, index) => {
                          const active = cell === 'FREE' || drawnSet.has(cell as number);
                          return (
                            <div
                              key={`${cell}-${index}`}
                              className={`rounded-lg border px-2 py-2 text-xs font-semibold ${active ? 'border-emerald-300/60 bg-emerald-400/25 text-white' : 'border-white/10 bg-white/5 text-slate-200'}`}
                            >
                              {cell === 'FREE' ? 'FREE' : cell}
                              {cell !== 'FREE' && !drawnSet.has(cell) && <span className="mt-1 block text-[10px] text-rose-200">未コール</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-4 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-sky-200">成立ライン</p>
                        {lastResult.completedLines.length === 0 ? (
                          <p className="mt-2 text-xs text-slate-300">判定済みラインはありません。未コールの数字を確認してください。</p>
                        ) : (
                          <ul className="mt-2 space-y-1 text-xs text-emerald-100">
                            {lastResult.completedLines.map(line => (
                              <li key={line}>✔ {line}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-sky-200">未コールの数字</p>
                        {lastResult.missingNumbers.length === 0 ? (
                          <p className="mt-2 text-xs text-emerald-100">すべてのマスが呼ばれています。</p>
                        ) : (
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-rose-200">
                            {lastResult.missingNumbers.map(number => (
                              <span key={number} className="rounded-full border border-rose-300/60 px-3 py-1">{formatBall(number)}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {lastResult.status === 'not-found' && (
                  <p className="mt-4 text-xs text-rose-200">このIDのカードは登録されていません。入力ミスか未登録の可能性があります。</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">登録済みカード</h2>
                <p className="text-xs text-slate-300">QRや短縮IDを紙カードへ印字しておけば、番号確認はID検索のみで完結できます。</p>
              </div>
              <button
                type="button"
                onClick={handleResetLogs}
                className="rounded-full border border-white/20 px-4 py-2 text-xs text-slate-200 hover:border-white/40"
              >
                判定ログを初期化
              </button>
            </div>
            <div className="mt-4 max-h-72 overflow-y-auto pr-2">
              {cards.length === 0 ? (
                <p className="text-xs text-slate-300">まだカードが登録されていません。</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {cards.map(card => (
                    <li key={card.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{card.label}</p>
                          <p className="text-xs text-slate-300">ID: {card.id}</p>
                          {card.notes && <p className="text-xs text-slate-400">メモ: {card.notes}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleVerify(card.id)}
                            className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-100 hover:border-white/40"
                          >
                            このカードを照合
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card.id)}
                            className="rounded-full border border-rose-300/40 px-3 py-1 text-xs text-rose-100 hover:bg-rose-400/20"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white">判定ログ</h2>
          <p className="mt-1 text-xs text-slate-300">大会後の振り返りや参加者からの問い合わせ対応に使える監査証跡。</p>
          <div className="mt-4 max-h-64 overflow-y-auto pr-3 text-xs text-slate-200">
            {verificationLogs.length === 0 && <p className="text-slate-400">まだ判定履歴はありません。</p>}
            {verificationLogs.map(log => (
              <div key={`${log.cardId}-${log.timestamp}`} className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">{log.cardId}</span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${log.status === 'valid' ? 'bg-emerald-400/30 text-emerald-100 border border-emerald-300/50' : log.status === 'invalid' ? 'bg-rose-400/20 text-rose-100 border border-rose-300/50' : 'bg-slate-500/20 text-slate-200 border border-slate-400/50'}`}>
                    {log.status === 'valid' ? '成立' : log.status === 'invalid' ? '未成立' : '未登録'}
                  </span>
                  <span className="text-[11px] text-slate-300">{new Date(log.timestamp).toLocaleString('ja-JP')}</span>
                </div>
                {log.status !== 'not-found' && (
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
                    <span>ライン: {log.completedLines.length}</span>
                    {log.completedLines.slice(0, 3).map(line => (
                      <span key={line} className="rounded-full border border-white/20 px-2 py-1">{line}</span>
                    ))}
                    {log.missingNumbers.length > 0 && (
                      <span>未コール: {log.missingNumbers.slice(0, 5).map(number => formatBall(number)).join(', ')}{log.missingNumbers.length > 5 ? '…' : ''}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const columnRange = (start: number, end: number) => {
  const range: number[] = [];
  for (let value = start; value <= end; value += 1) {
    range.push(value);
  }
  return range;
};

const shuffle = (array: number[]) => {
  const cloned = [...array];
  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
  }
  return cloned;
};

const formatBall = (number: number) => {
  if (number >= 1 && number <= 15) return `B-${number}`;
  if (number <= 30) return `I-${number}`;
  if (number <= 45) return `N-${number}`;
  if (number <= 60) return `G-${number}`;
  return `O-${number}`;
};

const analyseCard = (card: BingoCard, drawnSet: Set<number>) => {
  const completedLines: string[] = [];
  const missingNumbers: number[] = [];

  const isMarked = (cell: BingoCell) => cell === 'FREE' || drawnSet.has(cell as number);

  // rows
  for (let row = 0; row < 5; row += 1) {
    const rowCells = card.grid[row];
    if (rowCells.every(cell => isMarked(cell))) {
      completedLines.push(`横ライン ${row + 1}`);
    }
  }

  // columns
  for (let column = 0; column < 5; column += 1) {
    const columnCells = card.grid.map(row => row[column]);
    if (columnCells.every(cell => isMarked(cell))) {
      completedLines.push(`縦ライン ${column + 1}`);
    }
  }

  // diagonals
  const mainDiagonal = card.grid.map((row, index) => row[index]);
  if (mainDiagonal.every(cell => isMarked(cell))) {
    completedLines.push('斜めライン ↘︎');
  }

  const antiDiagonal = card.grid.map((row, index) => row[4 - index]);
  if (antiDiagonal.every(cell => isMarked(cell))) {
    completedLines.push('斜めライン ↗︎');
  }

  card.grid.flat().forEach(cell => {
    if (cell !== 'FREE' && !drawnSet.has(cell)) {
      missingNumbers.push(cell);
    }
  });

  return { completedLines, missingNumbers };
};

export default BingoVerifier;
