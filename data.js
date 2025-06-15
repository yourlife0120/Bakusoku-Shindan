// data.js

// 職種名からメインクラスタへの大まかなマッピング補助関数 (例)
function mapJobsToMainCluster(jobsString) {
    const jobs = jobsString.toLowerCase().split(',').map(j => j.trim());
    let clusters = new Set();
    if (jobs.some(j => ['一般事務', '営業事務', '秘書', '経営企画', '管理職', '総務', '人事', '経理', '財務', '法務', '広報', 'マーケティング担当', '営業', 'webマーケティング', '商品企画', 'テレマーケティング'].includes(j))) {
        clusters.add('T');
    }
    if (jobs.some(j => ['itサポート', 'ヘルプデスク', 'システムエンジニア', 'プログラマー', 'ネットワークエンジニア', 'データサイエンティスト', 'リサーチャー', '研究者', 'データ入力'].includes(j))) {
        clusters.add('D');
    }
    if (jobs.some(j => ['医師', '看護師', '准看護師', '保健師', '薬剤師', '理学療法士', '作業療法士', '訪問介護員', '介護福祉士', '教員', '保育士', '教育カウンセラー'].includes(j))) {
        clusters.add('H');
    }
    if (jobs.some(j => ['飲食店スタッフ', 'ホテルスタッフ', '販売スタッフ', '警備員', 'テレマーケティング'].includes(j))) {
        clusters.add('S');
    }
    if (clusters.size === 0) return ["ALL"];
    return Array.from(clusters);
}

function guessQ3SubCluster(description, jobs) {
    const desc = description.toLowerCase();
    if (desc.includes('手順') || desc.includes('テンプレ') || desc.includes('フォーマット') || desc.includes('定型')) return ["routine_manual", "process_oriented"];
    if (desc.includes('要約') || desc.includes('下書き') || desc.includes('補助') || desc.includes('整形')) return ["semi_routine_flexible"];
    if (desc.includes('アイデア') || desc.includes('企画') || desc.includes('提案')) return ["highly_flexible"];
    return ["ALL"];
}

function guessQ4SubCluster(description, jobs) {
    const desc = description.toLowerCase();
    if (desc.includes('自動') || desc.includes('省力化') || desc.includes('効率化') || desc.includes('rpa')) return ["automation"];
    if (desc.includes('メール') || desc.includes('コミュニケーション') || desc.includes('説明') || desc.includes('共有')) return ["communication"];
    if (desc.includes('データ') || desc.includes('分析') || desc.includes('リスト化') || desc.includes('集計')) return ["data_utilization"];
    if (desc.includes('デザイン') || desc.includes('図') || desc.includes('イラスト') || desc.includes('クリエイティブ')) return ["creative_design"];
    return ["ALL"];
}

function guessQ5SubCluster(jobsString) {
    const jobs = jobsString.toLowerCase().split(',').map(j => j.trim());
    if (jobs.some(j => ['プログラマー', 'システムエンジニア', 'データサイエンティスト', '一般事務', '営業事務', '秘書', '経営企画', 'itサポート', 'webマーケティング'].includes(j))) {
        return ["all_day_pc", "6_8_hours_dev"];
    }
    if (jobs.some(j => ['訪問介護員', '介護福祉士', '医師', '看護師', '保育士', '飲食店スタッフ', 'ホテルスタッフ', '販売スタッフ'].includes(j))) {
        return ["few_hours_on_site", "less_digital"];
    }
    return ["ALL"];
}


const useCasesData = [
    {
        id: "mail_reply_draft",
        description: "メール返信の下書き作成",
        timeSaved: 1.65,
        details: "お客様からの問い合わせや社内の依頼への返信文をAIに生成させる",
        targetJobs: "一般事務, 営業事務, 秘書, ITサポート・ヘルプデスク, テレマーケティング",
        applicableMainClusters: mapJobsToMainCluster("一般事務, 営業事務, 秘書, ITサポート・ヘルプデスク, テレマーケティング"),
        subClusters: {
            q3: guessQ3SubCluster("お客様からの問い合わせや社内の依頼への返信文をAIに生成させる"),
            q4: ["communication", "automation"],
            q5: guessQ5SubCluster("一般事務, 営業事務, 秘書, ITサポート・ヘルプデスク, テレマーケティング")
        }
    },
    {
        id: "faq_manual_creation",
        description: "FAQ・マニュアル作成",
        timeSaved: 0.5,
        details: "社内共有用に繰り返し聞かれる業務の手順をAIでまとめる",
        targetJobs: "ITサポート・ヘルプデスク, システムエンジニア, 総務, 人事, 教育カウンセラー",
        applicableMainClusters: mapJobsToMainCluster("ITサポート・ヘルプデスク, システムエンジニア, 総務, 人事, 教育カウンセラー"),
        subClusters: {
            q3: ["routine_manual", "process_oriented"],
            q4: ["automation", "communication"],
            q5: guessQ5SubCluster("ITサポート・ヘルプデスク, システムエンジニア, 総務, 人事, 教育カウンセラー")
        }
    },
    {
        id: "report_summary",
        description: "報告資料の要点整理",
        timeSaved: 0.65,
        details: "会議用報告のPowerPointや週報の要点を文章から抽出",
        targetJobs: "一般事務, 経営企画, 管理職, 研究者",
        applicableMainClusters: mapJobsToMainCluster("一般事務, 経営企画, 管理職, 研究者"),
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["data_utilization", "automation"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "doc_format_assist",
        description: "書類のフォーマット化支援",
        timeSaved: 0.35,
        details: "社内提出物（報告書・申請書）をテンプレ化する下書き",
        targetJobs: "一般事務, 営業事務, 経理, 財務",
        applicableMainClusters: mapJobsToMainCluster("一般事務, 営業事務, 経理, 財務"),
        subClusters: {
            q3: ["routine_manual", "process_oriented"],
            q4: ["automation"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "claim_response_draft",
        description: "クレーム対応の文案作成",
        timeSaved: 0.5,
        details: "顧客からのクレームに対し、冷静・丁寧な文案をAIで作成",
        targetJobs: "テレマーケティング, 営業, 法務, 総務",
        applicableMainClusters: mapJobsToMainCluster("テレマーケティング, 営業, 法務, 総務"),
        subClusters: {
            q3: ["semi_routine_flexible", "highly_flexible"],
            q4: ["communication"],
            q5: guessQ5SubCluster("テレマーケティング, 営業, 法務, 総務")
        }
    },
    {
        id: "care_record_summary",
        description: "介護記録の要点整理",
        timeSaved: 1.65,
        details: "手書きor口頭で残す業務記録をAIで要約・整形する",
        targetJobs: "訪問介護員, 介護福祉士",
        applicableMainClusters: ["H"],
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["automation", "communication"],
            q5: ["few_hours_on_site", "less_digital"]
        }
    },
    {
        id: "medical_record_draft",
        description: "カルテ・看護記録の下書き支援",
        timeSaved: 1.0,
        details: "症状や処置内容を音声で話し、記録文に整形させる",
        targetJobs: "医師, 看護師・准看護師",
        applicableMainClusters: ["H"],
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["automation", "communication"],
            q5: ["few_hours_on_site"]
        }
    },
    {
        id: "user_notice_creation",
        description: "利用者向けお知らせ文の作成",
        timeSaved: 0.35,
        details: "デイサービスや施設のお知らせをAIで作成・清書",
        targetJobs: "総務, 広報, 教員, 保育士",
        applicableMainClusters: mapJobsToMainCluster("総務, 広報, 教員, 保育士"),
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["communication", "creative_design"],
            q5: guessQ5SubCluster("総務, 広報, 教員, 保育士")
        }
    },
    {
        id: "doc_reading_summary",
        description: "説明資料の読み上げ要約",
        timeSaved: 0.5,
        details: "厚労省の資料や研修資料をAIで読み上げ・要点抽出",
        targetJobs: "広報, 人事, 教員, 研究者",
        applicableMainClusters: mapJobsToMainCluster("広報, 人事, 教員, 研究者"),
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["data_utilization", "communication"],
            q5: guessQ5SubCluster("広報, 人事, 教員, 研究者")
        }
    },
    {
        id: "family_explanation_assist",
        description: "保護者・家族への説明補助文",
        timeSaved: 0.5,
        details: "症状やケア内容の説明文をAIで下書き（柔らかい表現）",
        targetJobs: "保育士, 教員, 訪問介護員, 介護福祉士",
        applicableMainClusters: ["H"],
        subClusters: {
            q3: ["semi_routine_flexible", "highly_flexible"],
            q4: ["communication"],
            q5: ["few_hours_on_site"]
        }
    },
    {
        id: "service_manual_assist",
        description: "接客対応マニュアルの作成支援",
        timeSaved: 0.25,
        details: "クレーム対応や接客の事例から簡易マニュアルを作成",
        targetJobs: "飲食店スタッフ, ホテルスタッフ, 販売スタッフ, 警備員",
        applicableMainClusters: ["S"],
        subClusters: {
            q3: ["routine_manual", "process_oriented"],
            q4: ["communication", "automation"],
            q5: ["few_hours_on_site", "less_digital"]
        }
    },
    {
        id: "health_guidance_draft",
        description: "簡単な健康指導案の作成",
        timeSaved: 0.35,
        details: "利用者向け健康アドバイスの文章をAIで作成",
        targetJobs: "保健師, 薬剤師, 理学療法士・作業療法士, 看護師・准看護師",
        applicableMainClusters: ["H"],
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["communication", "creative_design"],
            q5: ["few_hours_on_site"]
        }
    },
    {
        id: "text_creation_general",
        description: "文章の作成（ブログ、メール、レポート、企画書など）",
        timeSaved: 2.0,
        details: "ブログ記事、メール、レポート、企画書など、様々な種類の文章を作成できます。",
        targetJobs: "一般事務, 教員, 広報, マーケティング担当, 営業, 経営企画, 人事, 総務, 秘書, 管理職, Webマーケティング, 商品企画",
        applicableMainClusters: ["T", "D", "H"],
        subClusters: {
            q3: ["ALL"],
            q4: ["automation", "creative_design", "communication"],
            q5: ["all_day_pc", "6_8_hours_dev"]
        }
    },
    {
        id: "text_proofreading",
        description: "文章の校正・添削",
        timeSaved: 1.25,
        details: "作成した文章の誤字脱字や文法ミスをチェックし、より自然で分かりやすい表現に修正できます。",
        targetJobs: "一般事務, 教員, 広報, 研究者, 営業, 経営企画, 人事, 総務, 秘書, 管理職",
        applicableMainClusters: ["T", "D", "H"],
        subClusters: {
            q3: ["ALL"],
            q4: ["automation", "communication"],
            q5: ["all_day_pc", "6_8_hours_dev"]
        }
    },
    {
        id: "article_writing_assist",
        description: "記事・資料の作成（下書きを整形・校正）",
        timeSaved: 1.25,
        details: "自身で書いたラフな下書きを、AIに読みやすく整形・校正してもらう。",
        targetJobs: "広報, Webマーケティング, 商品企画, 研究者",
        applicableMainClusters: mapJobsToMainCluster("広報, Webマーケティング, 商品企画, 研究者"),
        subClusters: {
            q3: ["semi_routine_flexible", "highly_flexible"],
            q4: ["creative_design", "automation"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "vocabulary_idea_support",
        description: "語彙の保管とアイデア（言い換え、絵文字提案など）",
        timeSaved: 0.65,
        details: "難しい言葉の言い換え提案、適切な単語の検索、内容に合う絵文字の提案。",
        targetJobs: "教員, 広報, マーケティング担当, Webデザイナー, 商品企画",
        applicableMainClusters: mapJobsToMainCluster("教員, 広報, マーケティング担当, Webデザイナー, 商品企画"),
        subClusters: {
            q3: ["highly_flexible"],
            q4: ["creative_design", "communication"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "list_creation_scraping",
        description: "リストの作成（Webからの情報抽出）",
        timeSaved: 1.25,
        details: "Webページから特定の情報（企業名、住所など）を抽出し、表形式でリスト化（スクレイピングの代替）。",
        targetJobs: "一般事務, 営業, 営業事務, ITサポート・ヘルプデスク, データ入力, リサーチャー",
        applicableMainClusters: mapJobsToMainCluster("一般事務, 営業, 営業事務, ITサポート・ヘルプデスク, データ入力, リサーチャー"),
        subClusters: {
            q3: ["routine_manual", "semi_routine_flexible"],
            q4: ["automation", "data_utilization"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "quick_q_and_a",
        description: "仕事での質問に素早く回答",
        timeSaved: 1.9,
        details: "業務に関する質問に対して、適切な解決策を調査・提案。",
        targetJobs: "ITサポート・ヘルプデスク, 一般事務, 管理職, 営業, システムエンジニア",
        applicableMainClusters: ["T", "D", "S"],
        subClusters: {
            q3: ["semi_routine_flexible", "highly_flexible"],
            q4: ["communication", "data_utilization"],
            q5: ["ALL"]
        }
    },
    {
        id: "diagram_creation_assist",
        description: "図の作成支援（図解、イラスト生成）",
        timeSaved: 0.85,
        details: "資料に挿入するための図解やイラストを生成（Claude, V0, Napkin AIなどを活用）。",
        targetJobs: "広報, 経営企画, 研究者, Webデザイナー, 教育カウンセラー, 商品企画",
        applicableMainClusters: mapJobsToMainCluster("広報, 経営企画, 研究者, Webデザイナー, 教育カウンセラー, 商品企画"),
        subClusters: {
            q3: ["highly_flexible"],
            q4: ["creative_design"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "programming_assist",
        description: "プログラミングのアシスト（GAS、Pythonなど）",
        timeSaved: 2.65,
        details: "Google Apps Script (GAS) やPython（スクレイピングなど）のコード生成やエラー修正を補助。",
        targetJobs: "プログラマー, システムエンジニア, ネットワークエンジニア, データサイエンティスト",
        applicableMainClusters: ["D"],
        subClusters: {
            q3: ["ALL"],
            q4: ["automation", "data_utilization"],
            q5: ["all_day_pc", "6_8_hours_dev"]
        }
    },
    {
        id: "process_auto_generation",
        description: "業務プロセス自動生成支援",
        timeSaved: 1.0,
        details: "自然言語での指示（例：「新規顧客データをDB登録しウェルカムメール送信」）に基づき、必要な業務プロセスを自動で生成・実行する。",
        targetJobs: "一般事務, 営業, システムエンジニア, 経営企画",
        applicableMainClusters: mapJobsToMainCluster("一般事務, 営業, システムエンジニア, 経営企画"),
        subClusters: {
            q3: ["process_oriented", "routine_manual"],
            q4: ["automation"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "knowledge_management_enhance",
        description: "ナレッジマネジメント強化（過去資料からの情報抽出）",
        timeSaved: 1.25,
        details: "過去のプロジェクト報告書などから必要な情報をAIが自動抽出し、新しい提案書などに活用する。",
        targetJobs: "経営企画, 研究者, 管理職, リサーチャー",
        applicableMainClusters: ["T", "D"],
        subClusters: {
            q3: ["semi_routine_flexible", "highly_flexible"],
            q4: ["data_utilization", "automation"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "excel_copilot_assist",
        description: "Excel活用（Copilotで関数・データ収集分析・グラフ化）",
        timeSaved: 1.65,
        details: "Copilotで関数／データ収集・分析／グラフ化を行う",
        targetJobs: "一般事務, 経理, 財務, 営業事務, ITサポート・ヘルプデスク",
        applicableMainClusters: ["T", "D"],
        subClusters: {
            q3: ["routine_manual", "semi_routine_flexible"],
            q4: ["automation", "data_utilization"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "translation_assist",
        description: "翻訳",
        timeSaved: 0.65,
        details: "ある言語で書かれた文章を別の言語に翻訳できます。",
        targetJobs: "研究者, 広報, 教員, 医師, 法務",
        applicableMainClusters: ["ALL"],
        subClusters: {
            q3: ["ALL"],
            q4: ["communication"],
            q5: ["ALL"]
        }
    },
    {
        id: "meeting_data_analysis",
        description: "会議資料のデータ分析（売上、アンケートの要約・可視化）",
        timeSaved: 1.0,
        details: "売上データやアンケート結果を分かりやすく要約・可視化。",
        targetJobs: "経営企画, 研究者, 営業, マーケティング担当, 財務, データサイエンティスト",
        applicableMainClusters: mapJobsToMainCluster("経営企画, 研究者, 営業, マーケティング担当, 財務, データサイエンティスト"),
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["data_utilization"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "formal_mail_adjustment",
        description: "メールの文章をフォーマルに調整",
        timeSaved: 0.65,
        details: "取引先や上司へのメールを丁寧で適切なトーンに修正。",
        targetJobs: "一般事務, 秘書, 営業, 人事",
        applicableMainClusters: ["T"],
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["communication"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "text_summarization_general",
        description: "文章の要約",
        timeSaved: 0.85,
        details: "長い文章や記事の内容を短くまとめることができます。",
        targetJobs: "教員, 研究者, 広報, Webマーケティング, 経営企画",
        applicableMainClusters: ["T", "D", "H"],
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["data_utilization", "communication"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "meeting_minutes_creation",
        description: "会議の議事録作成（テキストデータから）",
        timeSaved: 1.0,
        details: "会議のテキストデータを要約して議事録を作成したりできます。（高精度な文字起こしは専門ツールとの連携が必要です）",
        targetJobs: "一般事務, 秘書, 営業事務, 経営企画",
        applicableMainClusters: ["T"],
        subClusters: {
            q3: ["routine_manual", "semi_routine_flexible"],
            q4: ["automation", "communication"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "faq_creation_assist",
        description: "FAQの作成支援",
        timeSaved: 0.35,
        details: "よくある質問とその回答をまとめたFAQを作成できます。",
        targetJobs: "ITサポート・ヘルプデスク, Webマーケティング, 営業, 秘書",
        applicableMainClusters: mapJobsToMainCluster("ITサポート・ヘルプデスク, Webマーケティング, 営業, 秘書"),
        subClusters: {
            q3: ["routine_manual", "process_oriented"],
            q4: ["automation", "communication"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "formal_business_mail_assist",
        description: "メール返信（硬いビジネスメール作成補助）",
        timeSaved: 1.0,
        details: "特に初めての相手や目上の人への、硬いビジネスメールの文章作成補助。",
        targetJobs: "一般事務, 秘書, 営業, 人事",
        applicableMainClusters: ["T"],
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["communication"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "long_text_summary_gemini",
        description: "長文要約（Google Gemini活用）",
        timeSaved: 0.65,
        details: "大量のテキスト情報を短時間で理解しやすいように要約（特にGoogle Geminiを活用）。",
        targetJobs: "教員, 研究者, 広報, Webマーケティング",
        applicableMainClusters: mapJobsToMainCluster("教員, 研究者, 広報, Webマーケティング"),
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["data_utilization", "communication"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "info_gathering_ai_search",
        description: "情報収集（AI検索、gensparkなど活用）",
        timeSaved: 1.0,
        details: "特定のキーワードについて、Google検索より深い情報を得る（gensparkなどを活用）。",
        targetJobs: "リサーチャー, 研究者, マーケティング担当, 経営企画",
        applicableMainClusters: ["D", "T"],
        subClusters: {
            q3: ["highly_flexible"],
            q4: ["data_utilization"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "audio_transcription_gemini_tldv",
        description: "録音の文字起こし（Gemini, tldvなど活用）",
        timeSaved: 1.35,
        details: "会議の録音やYouTube動画のデータからテキストを生成し、議事録作成やブログ記事の元データとして活用（Gemini, tldvなどを活用）。",
        targetJobs: "教員, 経営企画, 広報, 医師",
        applicableMainClusters: mapJobsToMainCluster("教員, 経営企画, 広報, 医師"),
        subClusters: {
            q3: ["semi_routine_flexible", "routine_manual"],
            q4: ["automation", "communication"],
            q5: ["all_day_pc", "few_hours_on_site"]
        }
    },
    {
        id: "presentation_creation_conversion",
        description: "プレゼン資料作成/変換（既存資料からスライド自動作成）",
        timeSaved: 1.0,
        details: "Word文書やExcelファイルなど既存の資料から、プレゼンテーションに適した形式のスライドを自動で作成・変換する。",
        targetJobs: "経営企画, 教員, 広報, 商品企画",
        applicableMainClusters: mapJobsToMainCluster("経営企画, 教員, 広報, 商品企画"),
        subClusters: {
            q3: ["semi_routine_flexible", "highly_flexible"],
            q4: ["creative_design", "automation"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "image_ocr",
        description: "画像の文字起こし（PDF等からの文字起こし）",
        timeSaved: 0.85,
        details: "PDF等のデータからの文字起こし",
        targetJobs: "一般事務, 研究者, 経営企画, リサーチャー",
        applicableMainClusters: mapJobsToMainCluster("一般事務, 研究者, 経営企画, リサーチャー"),
        subClusters: {
            q3: ["routine_manual", "semi_routine_flexible"],
            q4: ["automation", "data_utilization"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "auto_meeting_minutes_audio",
        description: "会議の議事録を自動で作成（音声データから）",
        timeSaved: 1.0,
        details: "音声データを文字起こしし、議事録として整理。",
        targetJobs: "一般事務, 秘書, 営業事務",
        applicableMainClusters: ["T"],
        subClusters: {
            q3: ["routine_manual", "semi_routine_flexible"],
            q4: ["automation", "communication"],
            q5: ["all_day_pc"]
        }
    },
    {
        id: "smooth_business_mail_reply",
        description: "ビジネスメールの返信をスムーズに作成（急ぎの返信サポート）",
        timeSaved: 0.85,
        details: "急ぎのメール返信を適切な言葉遣いでサポート。",
        targetJobs: "一般事務, 秘書, 営業",
        applicableMainClusters: ["T"],
        subClusters: {
            q3: ["semi_routine_flexible"],
            q4: ["communication", "automation"],
            q5: ["all_day_pc"]
        }
    }
];