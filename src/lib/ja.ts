// ── Japanese locale strings ───────────────────────────────────────────────────
// HUMAN = needs translator review (marked with 🔴)
// DEEPL = machine translated

const JA = {

  // ── Questions ────────────────────────────────────────────────────────────────
  q_story:   "あなたのストーリーは？",
  q_intent:  "どのようにお役に立てますか？",
  q_who:     "仕事を楽しんでいますか？",
  q_where:   "現状を教えてください。",
  q_why:     "何が動機ですか？",
  q_role:    "新しいチームメンバーは —",
  q_env:     "どんな環境で活躍できますか？",
  q_pay:     "予算は？",

  // ── Answers ──────────────────────────────────────────────────────────────────
  a_story_A: "ほうきで潮は止められない", // 🔴 HUMAN — "You can't hold the tide with a broom"
  a_story_B: "ユーザーに仕える",
  a_story_C: "問いはただひとつ：なぜ？",

  a_intent_A: "気になって",
  a_intent_B: "新しいものを作っている",
  a_intent_C: "人を探している",

  a_who_A: "はい",
  a_who_B: "いいえ",
  a_who_C: "パス",

  a_where_A: "イノベーション中！",
  a_where_B: "変化の途中。",
  a_where_C: "暗闇に穴を掘っている。", // 🔴 HUMAN

  a_why_A: "技術がある",
  a_why_B: "レベルアップしたい",
  a_why_C: "ギャップを見つけた",

  a_role_A: "すぐに動き出す",
  a_role_B: "点をつなぐ",
  a_role_C: "道を切り開く",

  a_env_A: "プロセスの中で",
  a_env_B: "プレッシャーの下で",
  a_env_C: "曖昧さの中で",

  a_pay_A: "競争力のある報酬",
  a_pay_B: "予算に制約がある",
  a_pay_C: "最適な人材のためならいくらでも",

  // ── Quips ────────────────────────────────────────────────────────────────────
  quip_story_A: "では、潮が何を必要としているか見てみましょう。", // 🔴 HUMAN
  quip_story_B: "フリンの子よ、ようこそ。", // 🔴 HUMAN — Tron reference
  quip_story_C: "時間を持つ唯一の方法は、それを取ることだ。", // 🔴 HUMAN

  quip_intent_A: "猫でないといいですが。",
  quip_intent_B: "素晴らしい。",
  quip_intent_C: "それが互いにとって良いか確かめましょう。",

  quip_who: "個人的な質問をされると活力が湧きますね。",

  quip_where_A: "了解。",
  quip_where_B: "良いですね。問題が本物だということです。",
  quip_where_C: "少し大げさですが、同意します。", // 🔴 HUMAN

  quip_why_A: "問題より先に解決策。見ていましょう。",
  quip_why_B: "改善は誠実です。",
  quip_why_C: "必要性こそが真の変化の鍵。",

  quip_role_A: "実行力。常に必要とされています。",
  quip_role_B: "統合力。過小評価されています。",
  quip_role_C: "0から1へ。最も難しい問題。",

  quip_pay_A: "フェアです。",
  quip_pay_B: "それが、問題を解決できた人を失う理由です。",
  quip_pay_C: "良いですね。それが適切な人材を得る方法です。",

  // ── Cross-references ──────────────────────────────────────────────────────────
  crossref_pioneer_why:  "道を切り開くには、解決すべき本物の問題が必要です。",
  crossref_pioneer_env:  "道を切り開くこととプロセスに従うことは、なかなか両立しません。",
  crossref_senior_pay:   "シニア採用と予算制約は、あなたの有利にはなりません。",

  // ── End states — headlines ────────────────────────────────────────────────────
  headline_win_default:    "素晴らしい適合ですね！",
  headline_win_cold:       "適合かもしれません！",
  headline_win_seeker:     "好奇心が実を結びました。",
  headline_win_hero:       "心当たりがあります。",
  headline_soft:           "席は埋まるでしょう。",
  headline_borderline:     "可能性はあります。",
  headline_kill_pricing:   "ここまで。シニア要求、ジュニア予算。",
  headline_kill_contra:    "ここまで。道を切り開く。プロセスに従う。",
  headline_kill_tech:      "ここまで。問題より先に解決策。",
  headline_kill_authority: "ここまで。新領域。余地なし。予算なし。",

  // ── End states — body ─────────────────────────────────────────────────────────
  body_win:           "連絡を取りましょう。",
  body_soft:          "ギャップではなく。求人票は別のことのために書かれ、採用は別の目的のためかもしれません。いずれにしても——部分的な適合です。",
  body_borderline:    "シグナルが一致していません。多くのことが決定ではなく推測されていた可能性があります。主張してください——またはブリーフを見直してください。",
  body_kill_pricing:  "制約が誰か他の人の代わりに推測されていた可能性があります。いずれにしても——この役割が必要とするものとオファーされているものの差は構造的であり、交渉の余地はありません。",
  body_kill_contra:   "これらは対立する好みではなく——まったく異なる種類の仕事を表しています。一方が他方の代わりに推測されていた可能性があります。再投稿前にどちらが本当かを確認する価値があります。",
  body_kill_tech:     "ここに本物のギャップがあるかもしれません——まだ名前がついていないだけかもしれません。技術を出発点にすると、解決策ではなく正当化を見つける傾向があります。ブリーフにはまず問題が必要です。",
  body_kill_authority:"一緒に解決しない3つのことです。それぞれが別の人によって決定された可能性があります。このブリーフが描く採用は、3つすべてが変わる必要があります——回避策を交渉するのではなく。",

  // ── Terminals ────────────────────────────────────────────────────────────────
  terminal_shipped:  "完了。",
  terminal_filled:   "埋まった。",
  terminal_pending:  "保留中。",
  terminal_eol:      "終点。", // 🔴 HUMAN — "end of line" Tron ref

  // ── CTAs ─────────────────────────────────────────────────────────────────────
  cta_retry:    "もう一度？",
  cta_refresh:  "更新",
  cta_contact:  "連絡する",
  cta_details:  "詳細を伝える",
  cta_more:     "追加することはありますか？",

  // ── UI labels ────────────────────────────────────────────────────────────────
  powered: "Claude / AIインタラクション",
};

export default JA;
export type LocaleKey = keyof typeof JA;
