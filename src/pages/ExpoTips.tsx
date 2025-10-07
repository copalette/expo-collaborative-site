import React, { useEffect, useMemo, useState } from 'react';

type Category = 'movement' | 'reservation' | 'food' | 'family' | 'relax' | 'tech';
type TimeSlot = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

type CrowdLevel = 'low' | 'medium' | 'high';
type EnergyLevel = 'low' | 'medium' | 'high';

type SortKey = 'priority' | 'time' | 'area';

type ExpoTip = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  category: Category;
  timeSlot: TimeSlot;
  area: string;
  estimatedMinutes: number;
  crowdLevel: CrowdLevel;
  energyLevel: EnergyLevel;
  tags: string[];
  prerequisites?: string[];
  bestFor: string;
};

type RouteSegment = {
  time: string;
  title: string;
  description: string;
  linkedTipIds: string[];
};

type RoutePlan = {
  id: string;
  title: string;
  overview: string;
  energyLevel: EnergyLevel;
  focus: string;
  segments: RouteSegment[];
};

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
};

const categoryMeta: Record<Category, { label: string; icon: string; gradient: string }> = {
  movement: { label: '動線最適化', icon: '🧭', gradient: 'from-blue-500/90 to-cyan-500/90' },
  reservation: { label: '予約・準備', icon: '📱', gradient: 'from-purple-500/90 to-indigo-500/90' },
  food: { label: 'グルメ攻略', icon: '🍜', gradient: 'from-amber-500/90 to-orange-500/90' },
  family: { label: 'ファミリー', icon: '👨‍👩‍👧', gradient: 'from-pink-500/90 to-rose-500/90' },
  relax: { label: 'リラックス', icon: '🌿', gradient: 'from-emerald-500/90 to-teal-500/90' },
  tech: { label: 'テクノロジー', icon: '🤖', gradient: 'from-sky-500/90 to-blue-600/90' },
};

const timeSlotMeta: Record<TimeSlot, { label: string; icon: string }> = {
  morning: { label: '午前', icon: '🌅' },
  midday: { label: '昼前', icon: '🌤️' },
  afternoon: { label: '午後', icon: '🌇' },
  evening: { label: '夕方', icon: '🌆' },
  night: { label: '夜', icon: '🌙' },
};

const crowdBadge: Record<CrowdLevel, string> = {
  high: 'bg-red-50 text-red-700 border border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  low: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const energyBadge: Record<EnergyLevel, string> = {
  high: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  medium: 'bg-sky-50 text-sky-700 border border-sky-200',
  low: 'bg-slate-50 text-slate-700 border border-slate-200',
};

const baseTips: ExpoTip[] = [
  {
    id: 'fast-gate-strategy',
    title: '南ゲート×モバイルチケットで最速入場',
    summary: '開場45分前の南ゲート待機とモバイルチケットの事前表示で、人気パビリオンの初回枠に滑り込む戦術。',
    detail: '南ゲートは入場レーンが多く開きやすいので、午前7:45の到着が目安。代表者がチケットをまとめて表示し、残りのメンバーは荷物検査用に列を二手に分けると待機時間が約40%短縮できます。',
    category: 'movement',
    timeSlot: 'morning',
    area: '南ゲート',
    estimatedMinutes: 60,
    crowdLevel: 'high',
    energyLevel: 'high',
    tags: ['チーム行動', '時短', '朝活'],
    prerequisites: ['公式アプリへのログイン', 'チケット事前ダウンロード'],
    bestFor: '大人グループ'
  },
  {
    id: 'smart-locker',
    title: '入口ロッカーの即時確保',
    summary: '荷物を早めに預けて身軽に動くと、午前中の行動範囲が広がり体力も温存できる。',
    detail: 'ゲート横のスマートロッカーは9時台に満室になることが多いので、入場後3分以内にアプリから空きロッカーを検索。大型荷物を預けておけば、人気パビリオンの階段移動もラクになります。',
    category: 'movement',
    timeSlot: 'morning',
    area: 'ウェルカムプラザ',
    estimatedMinutes: 10,
    crowdLevel: 'medium',
    energyLevel: 'medium',
    tags: ['荷物対策', '体力温存'],
    bestFor: '誰でも'
  },
  {
    id: 'mobile-order-lunch',
    title: '11:15のモバイルオーダーで昼の行列回避',
    summary: '昼のピークを避けるため、11時台前半にアプリで人気フードを予約し、受け取りブースへ直行。',
    detail: 'フードパビリオン「ワールドダイニング」は11:45以降混雑が急増。入場後にアプリから11:15受け取り枠を確保し、午前中の展示を一息で切り上げて移動すると待ち時間を最大30分短縮できます。',
    category: 'food',
    timeSlot: 'midday',
    area: 'ワールドダイニング',
    estimatedMinutes: 35,
    crowdLevel: 'high',
    energyLevel: 'medium',
    tags: ['アプリ活用', 'グルメ'],
    prerequisites: ['公式アプリの支払い設定'],
    bestFor: '食事優先派'
  },
  {
    id: 'siesta-lounge',
    title: '14時のクールダウンラウンジ活用',
    summary: '体力が落ちてくる午後は空調の効いたクールダウンラウンジで20分休憩し、次の動線を整理。',
    detail: '人気展示を終えた13:45頃に、北ゾーンのクールダウンラウンジへ。ワイヤレス充電とリクライニングシートがあり、次に向かうエリアの混雑状況をアプリで確認しながら戦略を立て直せます。',
    category: 'relax',
    timeSlot: 'afternoon',
    area: '北ゾーンクールラウンジ',
    estimatedMinutes: 25,
    crowdLevel: 'medium',
    energyLevel: 'low',
    tags: ['休憩', '充電', 'アプリ活用'],
    bestFor: 'ペース重視派'
  },
  {
    id: 'sunset-dock',
    title: '夕暮れデッキでリモート抽選結果を確認',
    summary: '夕方の抽選結果解放に合わせて、見晴らしの良いデッキで次の行程を決める。',
    detail: '17時に更新されるナイトショー抽選結果は、中央デッキのベンチで確認。落選した場合は、徒歩5分のサブイベントへ切り替える動線が最もスムーズです。',
    category: 'reservation',
    timeSlot: 'evening',
    area: '中央デッキ',
    estimatedMinutes: 15,
    crowdLevel: 'medium',
    energyLevel: 'low',
    tags: ['抽選', '夕方プラン'],
    bestFor: 'ナイトショー狙い'
  },
  {
    id: 'night-illumination',
    title: '閉場前のイルミネーション一筆書き',
    summary: '20時以降の人の波が落ち着くタイミングで、イルミネーションスポットを一気に回る。',
    detail: '19:50にスタートし、北→中央→水辺ゾーンの順で回ると逆走する人が少なく快適。写真撮影は中央エリアで済ませ、最後に水辺で余韻を楽しむと足止まりがありません。',
    category: 'movement',
    timeSlot: 'night',
    area: '北～水辺ゾーン',
    estimatedMinutes: 45,
    crowdLevel: 'medium',
    energyLevel: 'medium',
    tags: ['写真映え', '夜プラン'],
    bestFor: 'カップル・友人'
  },
  {
    id: 'kids-base-camp',
    title: 'キッズベースキャンプで待機と合流',
    summary: '子ども連れは、ベースキャンプで遊び場と休憩スペースを確保して大人が順番に展示を巡る。',
    detail: '屋内型のキッズベースキャンプ（予約制）は保護者用の遠隔呼び出し端末付き。大人が交代で人気展示を回り、戻ってきたタイミングで合流できるので無駄な移動が減ります。',
    category: 'family',
    timeSlot: 'afternoon',
    area: 'ファミリーゾーン',
    estimatedMinutes: 50,
    crowdLevel: 'high',
    energyLevel: 'medium',
    tags: ['ファミリー', '交代制'],
    prerequisites: ['前日までの予約'],
    bestFor: '小学生連れ'
  },
  {
    id: 'tech-fastpass',
    title: 'テック系パビリオンの整理券二重確保',
    summary: '午前中に2つのテック展示の整理券を取得し、午後の空き時間に差し込む。',
    detail: '午前10時に未来技術館、10時15分に宇宙探査館の整理券を取得。時間帯が被らないようアプリが自動調整するので、受け取り後は通知設定をONにしておけば安心です。',
    category: 'tech',
    timeSlot: 'morning',
    area: 'テクノロジーゾーン',
    estimatedMinutes: 20,
    crowdLevel: 'high',
    energyLevel: 'medium',
    tags: ['整理券', 'テクノロジー'],
    prerequisites: ['公式アプリ', '通知ON'],
    bestFor: 'ITファン'
  },
  {
    id: 'waterfront-relax',
    title: '水辺ゾーンの芝生でピクニック休憩',
    summary: '15時台の風が心地よい時間に、水辺ゾーンでテイクアウトグルメと芝生休憩でリセット。',
    detail: '水辺ゾーンの芝生エリアは15:00〜16:00が比較的空いています。折りたたみクッションがあると快適度がアップ。近くのドリンクスタンドで電解質ドリンクを確保しておきましょう。',
    category: 'relax',
    timeSlot: 'afternoon',
    area: '水辺ゾーン',
    estimatedMinutes: 30,
    crowdLevel: 'low',
    energyLevel: 'low',
    tags: ['休憩', '自然'],
    bestFor: 'ゆったり派'
  },
  {
    id: 'late-arrival-plan',
    title: '15時入場組の逆張りルート',
    summary: '午後入場でもメイン展示を押さえるため、空き始めるサイド展示→夕方抽選→夜の空白時間を活用。',
    detail: '15時入場の場合は、まずは混雑ピークが過ぎたサイド展示へ向かい18時の抽選開放を狙う。夜は大屋根リングを時計回りに移動すると逆走が減り、ショー開始5分前でも座席確保が狙えます。',
    category: 'movement',
    timeSlot: 'afternoon',
    area: 'サイド展示エリア',
    estimatedMinutes: 120,
    crowdLevel: 'medium',
    energyLevel: 'medium',
    tags: ['逆張り', '午後入場'],
    bestFor: '遅めスタート組'
  }
];

const recommendedRoutes: RoutePlan[] = [
  {
    id: 'morning-sprint',
    title: '朝イチ制覇スプリント',
    overview: '南ゲートからテクノロジーゾーンまでを一直線に攻め、午前中に人気展示を2つ確保する短期集中ルート。',
    energyLevel: 'high',
    focus: '人気展示優先',
    segments: [
      { time: '07:45', title: '南ゲート集合', description: '代表者はモバイルチケットを表示しつつ、荷物検査レーンを分担。', linkedTipIds: ['fast-gate-strategy'] },
      { time: '09:05', title: 'ロッカー確保', description: '身軽になってからリング内をショートカットしてテクノロジーゾーンへ。', linkedTipIds: ['smart-locker'] },
      { time: '10:00', title: '整理券ダブルゲット', description: '未来技術館と宇宙探査館の整理券を連続取得。通知設定を忘れずに。', linkedTipIds: ['tech-fastpass'] },
      { time: '11:10', title: '早めランチ確保', description: 'ワールドダイニングの受け取り時間を11:15で確保し、午前の行程を締める。', linkedTipIds: ['mobile-order-lunch'] },
    ],
  },
  {
    id: 'family-balance',
    title: 'ファミリーゆったり戦略',
    overview: '子どもの体力に合わせてメリハリを付け、大人も交代で展示を楽しむバランス重視ルート。',
    energyLevel: 'medium',
    focus: '家族全員が楽しむ',
    segments: [
      { time: '10:30', title: 'キッズベースキャンプ確保', description: '呼び出し端末を設定し、合流ポイントを共有。', linkedTipIds: ['kids-base-camp'] },
      { time: '12:00', title: '効率ランチ', description: '家族向けメニューをモバイルオーダーで予約し、ベースキャンプで受け取り。', linkedTipIds: ['mobile-order-lunch'] },
      { time: '14:15', title: '芝生で休憩', description: '水辺ゾーンの芝生で午後に備えてリフレッシュ。', linkedTipIds: ['waterfront-relax'] },
      { time: '17:00', title: '夕方抽選チェック', description: '夕方の抽選結果を中央デッキで確認し、夜のプランを確定。', linkedTipIds: ['sunset-dock'] },
    ],
  },
  {
    id: 'late-starter',
    title: '午後スタートでも満喫プラン',
    overview: '午後入場でも密度高く回れるよう、混雑が落ちるエリアから夜の見どころまで逆張りで攻める。',
    energyLevel: 'medium',
    focus: 'ピーク回避',
    segments: [
      { time: '15:00', title: 'サイド展示を先取り', description: '空き始めた展示を押さえつつ、大屋根リングを逆時計回りで進む。', linkedTipIds: ['late-arrival-plan'] },
      { time: '16:00', title: 'クールダウン', description: '北ゾーンクールラウンジで休憩し、夜の動線を確認。', linkedTipIds: ['siesta-lounge'] },
      { time: '17:00', title: '抽選結果を即確認', description: '中央デッキでナイトショー抽選結果をチェックして次の行き先を決める。', linkedTipIds: ['sunset-dock'] },
      { time: '19:50', title: 'イルミネーション巡り', description: '北から水辺ゾーンへ抜けるイルミルートで締めくくる。', linkedTipIds: ['night-illumination'] },
    ],
  },
];

const checklistItems: ChecklistItem[] = [
  { id: 'app-login', label: '公式アプリにログイン', description: 'チケット表示・整理券取得に必須。前日にログイン状態を確認。' },
  { id: 'payment-setup', label: '支払い設定を登録', description: 'モバイルオーダーとロッカー利用を即時に行うため。' },
  { id: 'route-share', label: 'ルートと連絡手段を共有', description: '同行者と集合場所・合流時間をチャットで共有。' },
  { id: 'rest-kit', label: '休憩グッズの準備', description: '折りたたみクッション、モバイルバッテリー、冷却グッズなど。' },
  { id: 'rain-plan', label: '雨天時の代替プラン確認', description: '屋内パビリオンへの切り替えルートを用意。' },
];

const storageKeys = {
  bookmarks: 'expo-tips-bookmarks',
  checklist: 'expo-tips-checklist',
};

const ExpoTips: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(storageKeys.bookmarks);
    return stored ? JSON.parse(stored) : [];
  });
  const [completedChecklist, setCompletedChecklist] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(storageKeys.checklist);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(storageKeys.bookmarks, JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem(storageKeys.checklist, JSON.stringify(completedChecklist));
  }, [completedChecklist]);

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const toggleTimeSlot = (timeSlot: TimeSlot) => {
    setSelectedTimeSlots(prev => prev.includes(timeSlot) ? prev.filter(t => t !== timeSlot) : [...prev, timeSlot]);
  };

  const toggleBookmark = (tipId: string) => {
    setBookmarks(prev => prev.includes(tipId) ? prev.filter(id => id !== tipId) : [...prev, tipId]);
  };

  const toggleChecklistItem = (itemId: string) => {
    setCompletedChecklist(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };

  const tipsWithBookmarks = useMemo(() => {
    return baseTips.map(tip => ({
      ...tip,
      bookmarked: bookmarks.includes(tip.id),
    }));
  }, [bookmarks]);

  const filteredTips = useMemo(() => {
    const selectedCategorySet = new Set(selectedCategories);
    const selectedTimeSet = new Set(selectedTimeSlots);

    const filtered = tipsWithBookmarks.filter(tip => {
      if (onlyBookmarks && !tip.bookmarked) return false;
      if (selectedCategorySet.size > 0 && !selectedCategorySet.has(tip.category)) return false;
      if (selectedTimeSet.size > 0 && !selectedTimeSet.has(tip.timeSlot)) return false;
      return true;
    });

    const priorityOrder: Category[] = ['movement', 'reservation', 'tech', 'food', 'family', 'relax'];

    return filtered.sort((a, b) => {
      if (sortKey === 'time') {
        return a.estimatedMinutes - b.estimatedMinutes;
      }

      if (sortKey === 'area') {
        return a.area.localeCompare(b.area, 'ja');
      }

      const priorityA = priorityOrder.indexOf(a.category);
      const priorityB = priorityOrder.indexOf(b.category);
      if (priorityA !== priorityB) return priorityA - priorityB;

      if (a.timeSlot !== b.timeSlot) {
        const slotOrder: TimeSlot[] = ['morning', 'midday', 'afternoon', 'evening', 'night'];
        return slotOrder.indexOf(a.timeSlot) - slotOrder.indexOf(b.timeSlot);
      }

      return a.estimatedMinutes - b.estimatedMinutes;
    });
  }, [tipsWithBookmarks, selectedCategories, selectedTimeSlots, onlyBookmarks, sortKey]);

  const stats = useMemo(() => {
    const total = filteredTips.length;
    const highEnergy = filteredTips.filter(tip => tip.energyLevel === 'high').length;
    const morningFocus = filteredTips.filter(tip => tip.timeSlot === 'morning').length;
    const bookmarkedCount = filteredTips.filter(tip => tip.bookmarked).length;
    return { total, highEnergy, morningFocus, bookmarkedCount };
  }, [filteredTips]);

  const checklistProgress = Math.round((completedChecklist.length / checklistItems.length) * 100);

  const getRouteCompletion = (route: RoutePlan) => {
    const totalSegments = route.segments.length;
    if (totalSegments === 0) return 0;
    const completed = route.segments.filter(segment => segment.linkedTipIds.every(id => bookmarks.includes(id))).length;
    return Math.round((completed / totalSegments) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-slate-100 pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl px-8 py-10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-indigo-200"> Expo Navigator </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                万博を上手に回るための実践チップ集
              </h1>
              <p className="text-slate-200 leading-relaxed">
                混雑を避けて見たい展示に辿り着き、グルメも休憩も取りこぼさないためのリアルタイム攻略ノートです。
                アプリ活用術から午後の体力マネジメントまで、シーン別に最適な動き方をまとめました。
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500/40 to-purple-500/40 border border-white/20 rounded-2xl p-6 w-full md:w-80 shadow-lg">
              <p className="text-sm text-indigo-100 mb-4">現在の絞り込み状況</p>
              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span>表示中のチップ</span>
                  <span className="font-semibold text-white">{stats.total}件</span>
                </div>
                <div className="flex justify-between text-base">
                  <span>ブックマーク済</span>
                  <span className="font-semibold text-white">{stats.bookmarkedCount}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-200">
                  <span>朝の動き</span>
                  <span>{stats.morningFocus}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-200">
                  <span>体力勝負</span>
                  <span>{stats.highEnergy}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="bg-white/8 border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            <div className="flex-1 space-y-4">
              <h2 className="text-xl font-semibold text-white">シーンで絞り込む</h2>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(categoryMeta) as Category[]).map(category => {
                  const active = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`px-4 py-2 rounded-full border transition-all ${active ? 'border-white bg-white/20 text-white shadow-lg' : 'border-white/20 text-slate-200 hover:border-white/40 hover:bg-white/10'}`}
                    >
                      <span className="mr-2">{categoryMeta[category].icon}</span>
                      {categoryMeta[category].label}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(timeSlotMeta) as TimeSlot[]).map(timeSlot => {
                  const active = selectedTimeSlots.includes(timeSlot);
                  return (
                    <button
                      key={timeSlot}
                      type="button"
                      onClick={() => toggleTimeSlot(timeSlot)}
                      className={`px-3 py-2 rounded-full border text-sm transition-all ${active ? 'border-indigo-300 bg-indigo-500/30 text-white shadow-lg' : 'border-white/20 text-slate-200 hover:border-white/40 hover:bg-white/10'}`}
                    >
                      <span className="mr-1">{timeSlotMeta[timeSlot].icon}</span>
                      {timeSlotMeta[timeSlot].label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-4 py-3 cursor-pointer hover:border-white/40 transition">
                <input
                  type="checkbox"
                  checked={onlyBookmarks}
                  onChange={() => setOnlyBookmarks(prev => !prev)}
                  className="h-4 w-4 rounded border-white/40 bg-transparent"
                />
                <span className="text-sm text-slate-100">ブックマークだけを見る</span>
              </label>
              <div className="bg-white/10 border border-white/10 rounded-2xl px-4 py-3">
                <label className="block text-xs uppercase tracking-wide text-slate-300 mb-2">並び替え</label>
                <select
                  value={sortKey}
                  onChange={event => setSortKey(event.target.value as SortKey)}
                  className="bg-transparent text-white text-sm focus:outline-none"
                >
                  <option value="priority" className="text-slate-900">重要度（おすすめ）</option>
                  <option value="time" className="text-slate-900">所要時間が短い順</option>
                  <option value="area" className="text-slate-900">エリア順</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          {filteredTips.map(tip => (
            <article key={tip.id} className="bg-white/8 border border-white/10 rounded-3xl p-6 shadow-lg hover:border-indigo-200/50 transition">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${categoryMeta[tip.category].gradient} shadow`}
                  >
                    {categoryMeta[tip.category].icon} {categoryMeta[tip.category].label}
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-white">{tip.title}</h3>
                  <p className="mt-2 text-slate-200 leading-relaxed">{tip.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleBookmark(tip.id)}
                  className={`text-2xl transition transform hover:scale-110 ${tip.bookmarked ? 'text-yellow-300' : 'text-slate-400 hover:text-slate-200'}`}
                  aria-label="ブックマーク切り替え"
                >
                  {tip.bookmarked ? '★' : '☆'}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{timeSlotMeta[tip.timeSlot].icon}</span>
                  <span>{timeSlotMeta[tip.timeSlot].label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📍</span>
                  <span>{tip.area}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <span>{tip.estimatedMinutes}分目安</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${crowdBadge[tip.crowdLevel]}`}>
                    混雑:{' '}
                    {tip.crowdLevel === 'high' ? '多い' : tip.crowdLevel === 'medium' ? '普通' : '穏やか'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${energyBadge[tip.energyLevel]}`}>
                    体力:{' '}
                    {tip.energyLevel === 'high' ? 'しっかり' : tip.energyLevel === 'medium' ? 'ほどほど' : 'ゆったり'}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-300 leading-relaxed">{tip.detail}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {tip.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/10 rounded-full text-xs text-slate-100">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 text-xs text-slate-300">
                <p>おすすめ: {tip.bestFor}</p>
                {tip.prerequisites && (
                  <p className="mt-1">準備: {tip.prerequisites.join(' / ')}</p>
                )}
              </div>
            </article>
          ))}
          {filteredTips.length === 0 && (
            <div className="col-span-full bg-white/10 border border-white/10 rounded-3xl p-10 text-center text-slate-300">
              条件に合うチップが見つかりません。フィルターを調整してみてください。
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {recommendedRoutes.map(route => {
            const completion = getRouteCompletion(route);
            return (
              <div key={route.id} className="bg-white/8 border border-white/10 rounded-3xl p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-sm text-indigo-200 uppercase tracking-wide">Suggested Route</span>
                    <h3 className="mt-2 text-xl font-semibold text-white">{route.title}</h3>
                    <p className="mt-2 text-sm text-slate-200 leading-relaxed">{route.overview}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${energyBadge[route.energyLevel]}`}>
                    体力:{' '}
                    {route.energyLevel === 'high' ? 'しっかり' : route.energyLevel === 'medium' ? 'ほどほど' : 'ゆったり'}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>達成度</span>
                    <span>{completion}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-400" style={{ width: `${completion}%` }} />
                  </div>
                </div>

                <ul className="mt-4 space-y-3">
                  {route.segments.map(segment => {
                    const segmentComplete = segment.linkedTipIds.every(id => bookmarks.includes(id));
                    return (
                      <li key={segment.time} className="bg-white/5 border border-white/10 rounded-2xl p-3">
                        <div className="flex items-center justify-between text-sm text-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-full">{segment.time}</span>
                            <span>{segment.title}</span>
                          </div>
                          <span className={`text-lg ${segmentComplete ? 'text-emerald-300' : 'text-slate-500'}`}>
                            {segmentComplete ? '✔' : '•'}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-300 leading-relaxed">{segment.description}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="bg-white/8 border border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-white">エリア別 混雑予測と代替案</h3>
            <p className="mt-2 text-sm text-slate-200">混雑が集中する時間帯と、回避のためのチップをセットでチェック。</p>
            <div className="mt-4 space-y-4">
              {[{
                area: 'テクノロジーゾーン',
                peak: '09:30 - 12:00',
                note: '午前は整理券配布で混雑。',
                tips: ['fast-gate-strategy', 'tech-fastpass']
              }, {
                area: 'ワールドダイニング',
                peak: '12:00 - 14:00',
                note: '昼食ピークで60分待ちラインに。',
                tips: ['mobile-order-lunch']
              }, {
                area: '大屋根リング',
                peak: '19:00 - 20:30',
                note: 'ショー前後で逆走が発生。',
                tips: ['night-illumination', 'late-arrival-plan']
              }].map(info => (
                <div key={info.area} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm uppercase tracking-wide text-indigo-200">{info.area}</p>
                      <p className="text-base font-semibold text-white">ピーク: {info.peak}</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-slate-200">混雑警戒</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-300">{info.note}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {info.tips.map(tipId => {
                      const relatedTip = baseTips.find(tip => tip.id === tipId);
                      if (!relatedTip) return null;
                      return (
                        <button
                          key={tipId}
                          type="button"
                          onClick={() => {
                            if (!selectedCategories.includes(relatedTip.category)) {
                              setSelectedCategories(prev => [...prev, relatedTip.category]);
                            }
                          }}
                          className="px-3 py-1 bg-indigo-500/30 border border-indigo-300/40 rounded-full text-xs text-white hover:bg-indigo-500/50 transition"
                        >
                          {categoryMeta[relatedTip.category].icon} {relatedTip.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/8 border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">準備チェックリスト</h3>
              <span className="text-sm text-slate-300">進捗 {checklistProgress}%</span>
            </div>
            <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${checklistProgress}%` }} />
            </div>
            <ul className="mt-4 space-y-3">
              {checklistItems.map(item => {
                const checked = completedChecklist.includes(item.id);
                return (
                  <li key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="mt-1 h-5 w-5 rounded border-white/40 bg-transparent"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{item.label}</p>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">ワンポイントアドバイス</h3>
              <p className="mt-2 text-sm text-slate-200">フィルターした条件から、次に押さえておきたいチップを提案します。</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategories([]);
                setSelectedTimeSlots([]);
                setOnlyBookmarks(false);
                setSortKey('priority');
              }}
              className="px-4 py-2 border border-white/30 rounded-full text-sm text-slate-100 hover:bg-white/10 transition"
            >
              条件をリセット
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {(['movement', 'food', 'relax'] as Category[]).map(category => {
              const topTip = filteredTips.find(tip => tip.category === category) ?? baseTips.find(tip => tip.category === category);
              if (!topTip) return null;
              return (
                <div key={category} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-wide text-indigo-200">{categoryMeta[category].label}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{topTip.title}</p>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{topTip.summary}</p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-300">
                    <span className="px-2 py-1 bg-white/10 rounded-full">{timeSlotMeta[topTip.timeSlot].icon} {timeSlotMeta[topTip.timeSlot].label}</span>
                    <span className="px-2 py-1 bg-white/10 rounded-full">{topTip.estimatedMinutes}分</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExpoTips;
