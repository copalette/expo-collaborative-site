import React, { useEffect, useMemo, useState } from 'react';

interface Task {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  notes: string;
}

interface Period {
  id: string;
  name: string;
  timeframe: string;
  description: string;
  tasks: Task[];
}

type ConditionLevel = 'stable' | 'fragile';
type SupportLevel = 'family' | 'medical' | 'self';
type GoalFocus = 'health' | 'legacy' | 'lifestyle';

interface Option<T> {
  value: T;
  label: string;
  note: string;
}

interface SimulationPhase {
  id: string;
  title: string;
  timeframe: string;
  focus: string;
  actions: string[];
  watchPoints: string[];
}

interface AiGuidance {
  focusSummary: string;
  prompts: string[];
  reminders: string[];
  nudges: string[];
}

type PhaseAdjustments = Record<
  string,
  {
    actions?: string[];
    watchPoints?: string[];
  }
>;

const STORAGE_KEY = 'life-plan-simulator-v1';

const conditionOptions: Option<ConditionLevel>[] = [
  {
    value: 'stable',
    label: '体調は概ね安定している',
    note: '主治医の管理下で徐々に活動量を増やしていく前提です。早めに生活リズムを取り戻し、再発リスクの兆候をモニタリングしましょう。'
  },
  {
    value: 'fragile',
    label: '体調に波があり再入院リスクが高い',
    note: '小さな変化でも医療チームと共有し、無理をしないペース配分が必要です。訪問看護など外部支援を柔軟に組み込みます。'
  }
];

const supportOptions: Option<SupportLevel>[] = [
  {
    value: 'family',
    label: '家族サポート中心',
    note: '家族と役割分担を明確にし、介護負担が偏らないよう情報共有と休息プランを組み込みます。'
  },
  {
    value: 'medical',
    label: '医療・専門職サポート中心',
    note: '訪問看護・リハビリ・栄養指導など専門職を活用。記録をデジタルで共有し、ケアカンファレンスを定期開催します。'
  },
  {
    value: 'self',
    label: '基本は自立＋必要時支援',
    note: 'セルフマネジメントを徹底しつつ、不調時に頼れる連絡先と緊急対応フローを用意しておきましょう。'
  }
];

const goalOptions: Option<GoalFocus>[] = [
  {
    value: 'health',
    label: '再発予防と体力回復を最優先',
    note: '睡眠・食事・運動の記録をAIと共有し、主治医の方針と矛盾がないか定期的に点検します。'
  },
  {
    value: 'legacy',
    label: '終活ドキュメントと家族への引き継ぎ',
    note: '財産・連絡先・希望を早めに整理し、第三者チェック（司法書士・行政書士等）で抜け漏れを防ぎます。'
  },
  {
    value: 'lifestyle',
    label: '生活の質と楽しみの再設計',
    note: '食の楽しみや趣味活動を安全に再開するための代替案を複数用意し、体調に合わせて選択します。'
  }
];

const simulationProfile = {
  age: 71,
  condition: '大きな手術後（開腹手術想定）から3か月',
  primaryGoal: '生活の質を保ちながら終活を前向きに進める',
  secondaryGoal: '体調管理と再発リスクの抑制',
  cautions: [
    '手術部位の回復ペースに合わせた運動強度の調整',
    '血圧・血糖など既往症がある場合の相乗リスク',
    '医師・家族・AI間での情報の齟齬を防ぐ仕組みづくり'
  ]
};

const basePhases: SimulationPhase[] = [
  {
    id: 'phase-1',
    title: 'リカバリー期',
    timeframe: '退院〜3か月',
    focus: '体力の底上げと生活リズムの再構築',
    actions: [
      '主治医の指示に沿った通院スケジュールを確保し、家族とも共有する',
      '体温・血圧・体重・痛みレベルを毎日記録し、週1回まとめて振り返る',
      '医師の許可する範囲でのリハビリ運動（10分散歩×2回など）を継続する'
    ],
    watchPoints: [
      '発熱・急な体重減少・創部の赤みや腫れがあれば24時間以内に医療機関へ連絡',
      '服薬の飲み忘れやサプリ併用時は必ず主治医と薬剤師に相談'
    ]
  },
  {
    id: 'phase-2',
    title: '再適応期',
    timeframe: '3か月〜12か月',
    focus: '活動量の拡大と生活基盤の整備',
    actions: [
      '筋力トレーニングやストレッチを週2〜3回のプログラムに組み込む',
      '月1回の体調棚卸し（睡眠・食事・メンタル）をAIと一緒に分析する',
      '社会活動や趣味を負担の少ない形で再開し、孤立を防ぐ'
    ],
    watchPoints: [
      '疲労感や息切れが続く場合は運動強度を一段階戻し、医療チームに相談'
    ]
  },
  {
    id: 'phase-3',
    title: '前向き終活期',
    timeframe: '1年〜3年',
    focus: '大切な人と資産を守る準備の仕上げ',
    actions: [
      '財産・保険・医療情報を一冊にまとめ、共有先と保管場所を決める',
      'エンディングノートや遺言の草案を作成し、専門家にレビューを依頼する',
      '思い出の整理やメッセージ作成の時間を定期的にスケジュールに組み込む'
    ],
    watchPoints: [
      '判断力低下の兆候（同じ質問の繰り返し等）を家族と共有し、早期に対応する'
    ]
  },
  {
    id: 'phase-4',
    title: '継続テーマ',
    timeframe: '常時',
    focus: '心身の安定と暮らしの楽しみを維持',
    actions: [
      '栄養バランスと咀嚼負担を考慮した献立テンプレートを作成する',
      '週1回の「未来の自分会議」で体調・気分・やりたいことを言語化する',
      '支えてくれる人への感謝や関係づくりを意識的に行う'
    ],
    watchPoints: [
      '孤立感や塞ぎ込みの兆候があれば地域包括支援センター等に相談する'
    ]
  }
];

const conditionAdjustments: Record<ConditionLevel, PhaseAdjustments> = {
  stable: {
    'phase-1': {
      actions: ['医師が許可したらウォーキングを15分×2回に延ばし、心拍数も記録する'],
      watchPoints: ['体重増加が急な場合は塩分・水分バランスを見直し循環器を受診']
    },
    'phase-2': {
      actions: ['地域サークルやオンライン講座に月1回参加し、活動の幅を広げる']
    },
    'phase-3': {
      actions: ['自分史ワークショップなど外部イベントで経験を語る機会を持つ']
    }
  },
  fragile: {
    'phase-1': {
      actions: ['訪問看護やリハ専門職に週1回状態をチェックしてもらう'],
      watchPoints: ['1日の歩数・活動量を医療者と共有し、翌週のメニューを調整する']
    },
    'phase-2': {
      actions: ['屋内でできるチェアエクササイズや呼吸リハを中心に据える'],
      watchPoints: ['低血糖・低血圧の兆候（めまい・ふらつき）を感じたら即休止する']
    },
    'phase-3': {
      actions: ['成年後見制度や家族信託の相談先をピックアップしておく'],
      watchPoints: ['判断力に不安がある場合は第三者の同席で意思決定を行う']
    }
  }
};

const supportAdjustments: Record<SupportLevel, PhaseAdjustments> = {
  family: {
    'phase-1': {
      actions: ['家族にバイタル記録を共有し、週次で気付きメモを話し合う'],
      watchPoints: ['介護負担が偏らないよう、家族間で役割をローテーションする']
    },
    'phase-2': {
      actions: ['家族と一緒に食事のメニューをAIに相談し、楽しめる形に工夫する']
    },
    'phase-3': {
      actions: ['家族会議を設定し、資産や意思表示の共有を年1回更新する']
    }
  },
  medical: {
    'phase-1': {
      actions: ['訪問看護・管理栄養士・薬剤師とのオンライン記録を整備する']
    },
    'phase-2': {
      actions: ['月1回リハビリの評価を受け、歩行速度や筋力の推移を可視化する'],
      watchPoints: ['医療職との情報共有漏れを防ぐため記録テンプレートを統一する']
    },
    'phase-3': {
      actions: ['在宅医療・緩和ケアチームとの連携体制を事前に整える']
    }
  },
  self: {
    'phase-1': {
      actions: ['緊急連絡先リスト・服薬リストをスマホと紙で二重管理する'],
      watchPoints: ['体調不調時に誰へ連絡するかを事前にリハーサルしておく']
    },
    'phase-2': {
      actions: ['デジタルツール（カレンダー・記録アプリ）でセルフマネジメントを強化する']
    },
    'phase-3': {
      actions: ['信頼できる友人・専門家にサブ相談先を確保する']
    }
  }
};

const goalAdjustments: Record<GoalFocus, PhaseAdjustments> = {
  health: {
    'phase-1': {
      actions: ['食事記録を写真付きで残し、週次でAIに栄養バランスをチェックしてもらう']
    },
    'phase-2': {
      actions: ['睡眠と心拍のデータを取り込み、疲労度が高い週はメニューを軽くする'],
      watchPoints: ['HbA1c・LDLなど検査値をスプレッドシートで推移管理する']
    }
  },
  legacy: {
    'phase-2': {
      actions: ['大切な写真やデータの整理計画をAIと作り、クラウド保管を決める']
    },
    'phase-3': {
      actions: ['専門家との面談前に質問リストをAIで整理し、抜け漏れを確認する'],
      watchPoints: ['法的手続きの期限や必要書類をガントチャートで可視化する']
    },
    'phase-4': {
      actions: ['家族や友人へのメッセージ動画・手紙の制作計画を立てる']
    }
  },
  lifestyle: {
    'phase-2': {
      actions: ['外出計画を体調スコアと連動させ、低負荷の旅行プランを検討する']
    },
    'phase-3': {
      actions: ['趣味や学びのクラスを体調に合わせてセミパーソナル化する']
    },
    'phase-4': {
      actions: ['小さな楽しみ（季節の味覚・お茶時間）を週次ルーティンに組み込む'],
      watchPoints: ['楽しみの予定がゼロ週を作らないようリマインダーを設定する']
    }
  }
};

const buildSimulationPlan = (
  conditionLevel: ConditionLevel,
  supportLevel: SupportLevel,
  goalFocus: GoalFocus
): SimulationPhase[] => {
  const condition = conditionAdjustments[conditionLevel];
  const support = supportAdjustments[supportLevel];
  const goal = goalAdjustments[goalFocus];

  return basePhases.map((phase) => {
    const cumulativeActions = new Set<string>(phase.actions);
    const cumulativeWatchPoints = new Set<string>(phase.watchPoints);

    [condition, support, goal].forEach((adjustment) => {
      const phaseAdjustment = adjustment[phase.id];
      if (phaseAdjustment?.actions) {
        phaseAdjustment.actions.forEach((action) => cumulativeActions.add(action));
      }
      if (phaseAdjustment?.watchPoints) {
        phaseAdjustment.watchPoints.forEach((watchPoint) => cumulativeWatchPoints.add(watchPoint));
      }
    });

    return {
      ...phase,
      actions: Array.from(cumulativeActions),
      watchPoints: Array.from(cumulativeWatchPoints)
    };
  });
};

const buildScenarioHighlights = (
  conditionLevel: ConditionLevel,
  supportLevel: SupportLevel,
  goalFocus: GoalFocus
): string[] => {
  const highlights: string[] = [];

  if (conditionLevel === 'fragile') {
    highlights.push('体調の波を前提に、週単位でプランを見直せる柔軟性を確保しましょう。');
  } else {
    highlights.push('安定している今のうちに、活動量と終活タスクの両立リズムを整えましょう。');
  }

  switch (supportLevel) {
    case 'family':
      highlights.push('家族と情報共有ノートを作り、気付きと感情を見える化すると介護負担が偏りにくくなります。');
      break;
    case 'medical':
      highlights.push('専門職との連携力を活かし、記録テンプレートとカンファレンス日程を固定化しましょう。');
      break;
    case 'self':
      highlights.push('セルフマネジメント力は高いので、緊急時に頼る連絡網と意思表示カードを常備しましょう。');
      break;
  }

  switch (goalFocus) {
    case 'health':
      highlights.push('睡眠・栄養・運動データをAIと連携し、主治医の方針と矛盾がないかダブルチェックを習慣化。');
      break;
    case 'legacy':
      highlights.push('家族へのメッセージや資産リストは早期に着手し、専門家レビューで抜け漏れを防ぎましょう。');
      break;
    case 'lifestyle':
      highlights.push('楽しみの予定をカレンダー化し、体調スコアと連動させて無理のない達成感を積み上げましょう。');
      break;
  }

  return highlights;
};

const buildAiGuidance = (
  conditionLevel: ConditionLevel,
  supportLevel: SupportLevel,
  goalFocus: GoalFocus
): AiGuidance => {
  const condition = conditionOptions.find((option) => option.value === conditionLevel);
  const support = supportOptions.find((option) => option.value === supportLevel);
  const goal = goalOptions.find((option) => option.value === goalFocus);

  const focusSummary = [condition?.label, support?.label, goal?.label]
    .filter(Boolean)
    .join(' / ');

  const prompts: string[] = [
    `私は${simulationProfile.age}歳で${simulationProfile.condition}です。${condition?.note ?? ''}。${support?.label ?? ''}の体制で、${goal?.label ?? ''}を重視しています。今週の食事・運動・休養のバランス調整案を一緒に作ってください。`,
    '次回診察までに医師へ相談すべきポイントを整理したいので、最新の体調記録を聞き取ってチェックリスト化してください。',
    '終活ドキュメント（財産リスト・希望するケア・家族へのメッセージ）を段階的に仕上げるロードマップを提案してください。'
  ];

  const reminders: string[] = [
    'AIの提案は医療判断ではないため、診断や処方が必要な内容は必ず主治医と確認しましょう。',
    support?.note ?? ''
  ].filter(Boolean);

  const nudges: string[] = [
    condition?.note ?? '',
    goal?.note ?? '',
    '体調・食事・気分の記録を週1回まとめてAIに共有すると、変化の兆候に気付きやすくなります。'
  ].filter(Boolean);

  return { focusSummary, prompts, reminders, nudges };
};

const defaultPeriods: Period[] = [
  {
    id: '1',
    name: '退院後 0〜3か月',
    timeframe: '体調を整える集中期',
    description: '生活リズムと医療情報の土台づくりに集中する期間です。',
    tasks: [
      {
        id: '1-1',
        title: '通院・検査スケジュールを家族と共有し、カレンダーに登録する',
        category: '医療',
        priority: 'high',
        completed: false,
        notes: ''
      },
      {
        id: '1-2',
        title: '服薬リストと副作用メモを作成し、AIにも定期報告する',
        category: '健康管理',
        priority: 'high',
        completed: false,
        notes: ''
      },
      {
        id: '1-3',
        title: '医師が許可したリハビリ運動を1週間分プログラム化する',
        category: '運動',
        priority: 'medium',
        completed: false,
        notes: ''
      },
      {
        id: '1-4',
        title: '食事・体調・気分のテンプレートを作成し、毎日入力する',
        category: '記録',
        priority: 'medium',
        completed: false,
        notes: ''
      }
    ]
  },
  {
    id: '2',
    name: '3か月〜12か月',
    timeframe: '生活リズムの再構築期',
    description: '活動量を増やしつつ、終活の下準備を進めます。',
    tasks: [
      {
        id: '2-1',
        title: '週次でAIに体調レポートを送り、改善点をレビューしてもらう',
        category: 'AI活用',
        priority: 'high',
        completed: false,
        notes: ''
      },
      {
        id: '2-2',
        title: '趣味・社会活動の再開プランを3段階（軽負荷〜高負荷）で設計する',
        category: '生活',
        priority: 'medium',
        completed: false,
        notes: ''
      },
      {
        id: '2-3',
        title: '医療費・生活費の見直しを行い、1年分のキャッシュフローを確認する',
        category: '財務',
        priority: 'medium',
        completed: false,
        notes: ''
      },
      {
        id: '2-4',
        title: 'デジタル資産（写真・アカウント）の棚卸しリストを作り始める',
        category: '整理',
        priority: 'low',
        completed: false,
        notes: ''
      }
    ]
  },
  {
    id: '3',
    name: '1年〜3年',
    timeframe: '前向き終活の実行期',
    description: '法的手続きや想いの整理を専門家と連携しながら進めます。',
    tasks: [
      {
        id: '3-1',
        title: '遺言・家族信託など専門家相談の候補を3件リストアップする',
        category: '法務',
        priority: 'high',
        completed: false,
        notes: ''
      },
      {
        id: '3-2',
        title: '医療・介護の希望を書き出し、家族と話し合う機会を作る',
        category: '医療',
        priority: 'medium',
        completed: false,
        notes: ''
      },
      {
        id: '3-3',
        title: '大切な人へのメッセージを動画または手紙で作成し保管する',
        category: '思い出',
        priority: 'medium',
        completed: false,
        notes: ''
      },
      {
        id: '3-4',
        title: '住環境のバリアフリー化や片付け計画を専門家と検討する',
        category: '住環境',
        priority: 'low',
        completed: false,
        notes: ''
      }
    ]
  },
  {
    id: '4',
    name: '継続的に行うこと',
    timeframe: '全期間',
    description: '日々の暮らしを支え続ける習慣を大切にします。',
    tasks: [
      {
        id: '4-1',
        title: '週1回のセルフチェック（体調・気分・痛み）を行い、AIと共有する',
        category: '記録',
        priority: 'high',
        completed: false,
        notes: ''
      },
      {
        id: '4-2',
        title: '支援してくれる人へ感謝を伝える日を月1回設定する',
        category: '人間関係',
        priority: 'high',
        completed: false,
        notes: ''
      },
      {
        id: '4-3',
        title: '楽しみの予定（外出・趣味・イベント）を四半期ごとに見直す',
        category: '生活',
        priority: 'medium',
        completed: false,
        notes: ''
      },
      {
        id: '4-4',
        title: '地域包括支援センターや医療相談窓口の連絡先を最新に保つ',
        category: 'サポート',
        priority: 'medium',
        completed: false,
        notes: ''
      }
    ]
  }
];

const LifePlan: React.FC = () => {
  const [periods, setPeriods] = useState<Period[]>(defaultPeriods);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notes, setNotes] = useState('');

  const [conditionLevel, setConditionLevel] = useState<ConditionLevel>('stable');
  const [supportLevel, setSupportLevel] = useState<SupportLevel>('family');
  const [goalFocus, setGoalFocus] = useState<GoalFocus>('health');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPeriods(parsed);
        }
      } catch (error) {
        console.warn('Failed to parse saved life plan data:', error);
      }
    }
  }, []);

  const saveToStorage = (data: Period[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const toggleTask = (periodId: string, taskId: string) => {
    const updatedPeriods = periods.map((period) => {
      if (period.id === periodId) {
        return {
          ...period,
          tasks: period.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        };
      }
      return period;
    });
    setPeriods(updatedPeriods);
    saveToStorage(updatedPeriods);
  };

  const updateTaskNotes = (periodId: string, taskId: string, taskNotes: string) => {
    const updatedPeriods = periods.map((period) => {
      if (period.id === periodId) {
        return {
          ...period,
          tasks: period.tasks.map((task) =>
            task.id === taskId ? { ...task, notes: taskNotes } : task
          )
        };
      }
      return period;
    });
    setPeriods(updatedPeriods);
    saveToStorage(updatedPeriods);
    setSelectedTask(null);
    setNotes('');
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return '優先度：高';
      case 'medium':
        return '優先度：中';
      case 'low':
        return '優先度：低';
      default:
        return '';
    }
  };

  const calculateProgress = (tasks: Task[]) => {
    if (tasks.length === 0) {
      return 0;
    }
    const completed = tasks.filter((task) => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const simulationPlan = useMemo(
    () => buildSimulationPlan(conditionLevel, supportLevel, goalFocus),
    [conditionLevel, supportLevel, goalFocus]
  );

  const globalWatchPoints = useMemo(
    () => Array.from(new Set(simulationPlan.flatMap((phase) => phase.watchPoints))),
    [simulationPlan]
  );

  const scenarioHighlights = useMemo(
    () => buildScenarioHighlights(conditionLevel, supportLevel, goalFocus),
    [conditionLevel, supportLevel, goalFocus]
  );

  const aiGuidance = useMemo(
    () => buildAiGuidance(conditionLevel, supportLevel, goalFocus),
    [conditionLevel, supportLevel, goalFocus]
  );

  const activeCondition = conditionOptions.find((option) => option.value === conditionLevel);
  const activeSupport = supportOptions.find((option) => option.value === supportLevel);
  const activeGoal = goalOptions.find((option) => option.value === goalFocus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <div className="container mx-auto px-4 py-10">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🩺 71歳からのライフプラン・シミュレーター
          </h1>
          <p className="text-xl text-gray-600">
            大きな手術を乗り越えた今、体調管理と終活を両立するロードマップをAIと共創しましょう。
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">前提プロフィール</h2>
            <dl className="space-y-3 text-gray-700">
              <div>
                <dt className="text-sm text-gray-500">年齢・状態</dt>
                <dd className="font-medium">{simulationProfile.age}歳 / {simulationProfile.condition}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">優先したいこと</dt>
                <dd className="font-medium">{simulationProfile.primaryGoal}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">2つ目のゴール</dt>
                <dd className="font-medium">{simulationProfile.secondaryGoal}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">今後の注意ポイント</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {simulationProfile.cautions.map((caution) => (
                <li key={caution}>{caution}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2 xl:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">シナリオ概要</h2>
            <p className="text-gray-700 leading-relaxed">
              体調・支援体制・目標を選ぶと、その組み合わせに最適化した行動計画とAI活用ヒントが生成されます。
              状況が変わったらいつでも見直してください。
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">シナリオ設定</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="condition" className="block text-sm font-semibold text-gray-800 mb-2">
                体調の状態
              </label>
              <select
                id="condition"
                value={conditionLevel}
                onChange={(event) => setConditionLevel(event.target.value as ConditionLevel)}
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              >
                {conditionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {activeCondition && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{activeCondition.note}</p>
              )}
            </div>

            <div>
              <label htmlFor="support" className="block text-sm font-semibold text-gray-800 mb-2">
                サポート体制
              </label>
              <select
                id="support"
                value={supportLevel}
                onChange={(event) => setSupportLevel(event.target.value as SupportLevel)}
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              >
                {supportOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {activeSupport && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{activeSupport.note}</p>
              )}
            </div>

            <div>
              <label htmlFor="goal" className="block text-sm font-semibold text-gray-800 mb-2">
                重視したいゴール
              </label>
              <select
                id="goal"
                value={goalFocus}
                onChange={(event) => setGoalFocus(event.target.value as GoalFocus)}
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              >
                {goalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {activeGoal && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{activeGoal.note}</p>
              )}
            </div>
          </div>

          <div className="mt-8 bg-indigo-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">
              現在の設定から読み取れるポイント
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-indigo-900">
              {scenarioHighlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">シミュレーション結果</h2>
          <div className="space-y-6">
            {simulationPlan.map((phase) => (
              <div key={phase.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{phase.title}</h3>
                    <p className="text-sm text-indigo-600 font-medium">{phase.timeframe}</p>
                  </div>
                  <div className="mt-4 md:mt-0 bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full">
                    {phase.focus}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">重点アクション</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {phase.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">医療・家族と共有したいサイン</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {phase.watchPoints.map((watchPoint) => (
                      <li key={watchPoint}>{watchPoint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              体調変化に備えて覚えておきたいこと
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-yellow-900">
              {globalWatchPoints.map((watchPoint) => (
                <li key={watchPoint}>{watchPoint}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-lg p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AIと相談するときのヒント</h2>
          <p className="text-gray-700 mb-4">
            現在のシナリオ：<span className="font-semibold text-indigo-600">{aiGuidance.focusSummary}</span>
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">会話の切り出し例</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {aiGuidance.prompts.map((prompt) => (
                  <li key={prompt}>{prompt}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">安心して活用するためのリマインダー</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {aiGuidance.reminders.map((reminder) => (
                  <li key={reminder}>{reminder}</li>
                ))}
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">継続のコツ</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {aiGuidance.nudges.map((nudge) => (
                  <li key={nudge}>{nudge}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">個別アクションチェックリスト</h2>
          <div className="space-y-8">
            {periods.map((period) => (
              <div key={period.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{period.name}</h3>
                      <p className="text-lg text-indigo-600 font-medium">{period.timeframe}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-indigo-600">
                        {calculateProgress(period.tasks)}%
                      </div>
                      <div className="text-sm text-gray-500">完了</div>
                    </div>
                  </div>
                  <p className="text-gray-600">{period.description}</p>

                  <div className="mt-4 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(period.tasks)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {period.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`border rounded-lg p-4 ${task.completed ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'}`}
                    >
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(period.id, task.id)}
                          className="mt-1 mr-3 h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                {task.title}
                              </span>
                              <div className="flex flex-wrap gap-3 mt-2 text-sm">
                                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                                  {task.category}
                                </span>
                                <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                                  {getPriorityText(task.priority)}
                                </span>
                              </div>
                              {task.notes && (
                                <div className="mt-3 p-3 bg-yellow-50 rounded text-sm text-gray-700">
                                  📝 {task.notes}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedTask(task);
                                setNotes(task.notes);
                              }}
                              className="ml-4 text-indigo-600 hover:text-indigo-800 text-sm"
                            >
                              メモ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">メモを追加</h3>
              <p className="text-sm text-gray-600 mb-4">{selectedTask.title}</p>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full p-3 border rounded-md"
                rows={4}
                placeholder="メモを入力してください..."
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setNotes('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    const periodId = periods.find((period) =>
                      period.tasks.some((task) => task.id === selectedTask.id)
                    )?.id;
                    if (periodId) {
                      updateTaskNotes(periodId, selectedTask.id, notes);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-16 text-center text-gray-500">
          <p>身体のサインを最優先に、AIは伴走役として活用しましょう。</p>
          <p className="mt-2">Powered by Expo 2025 Collaborative Platform</p>
        </footer>
      </div>
    </div>
  );
};

export default LifePlan;
