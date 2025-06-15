document.addEventListener('DOMContentLoaded', function () {
    // DOM要素の取得
    const questionnaireSection = document.getElementById('questionnaireSection');
    const resultSection = document.getElementById('resultSection');
    const prevBtn = document.getElementById('prevBtn');
    const progressIndicator = document.getElementById('progressIndicator');
    const questionNumber = document.getElementById('questionNumber');
    const restartBtn = document.getElementById('restartBtn');
    const q2OptionsContainer = document.getElementById('q2Options');
    const shareOnXBtn = document.getElementById('shareOnXBtn'); // HTMLにこのIDのボタンがあるか確認

    // 回答を格納する変数
    let answers = {
        q1: '', // 職種分類
        q2: '', // 業務分類
        q3: '', // 業務特徴
        q4: '', // 効率化ニーズ
        q5: ''  // PC使用時間
    };

    let currentQuestionIndex = 0;
    const questionSlides = document.querySelectorAll('.question-slide');
    const totalQuestions = questionSlides.length;

    // Q2の選択肢データ
    const q2ChoicesData = {
        corporate: [ // Q1: コーポレート・バックオフィス系
            { value: 'office_assistant', icon: '📋', text: 'A. 一般事務, 営業事務, 秘書' },
            { value: 'admin_dept', icon: '⚖️', text: 'B. 総務, 人事, 経理, 財務, 法務, 広報' },
            { value: 'management_planning', icon: '📊', text: 'C. 経営企画・管理職' },
            { value: 'corporate_other', icon: '📎', text: 'D. その他（例：バックオフィス系の特殊業務）' }
        ],
        tech_rd: [ // Q1: 専門技術・研究開発系
            { value: 'it_engineer', icon: '💻', text: 'A. ITエンジニア・技術職' },
            { value: 'data_research', icon: '📈', text: 'B. データ分析・リサーチ系' },
            { value: 'researcher', icon: '🔬', text: 'C. 研究職' },
            { value: 'tech_other', icon: '⚙️', text: 'D. その他（例：エンジニア系の特殊業務）' }
        ],
        human_service: [ // Q1: ヒューマンサービス・専門職系
            { value: 'education_childcare', icon: '🧑‍🏫', text: 'A. 教員, 保育士' },
            { value: 'medical_professional', icon: '⚕️', text: 'B. 医師, 看護師, 薬剤師, 理学療法士' },
            { value: 'care_professional', icon: '🤲', text: 'C. 介護専門職' },
            { value: 'human_other', icon: '🤝', text: 'D. その他（例：ケア系の特殊業務）' }
        ],
        business_customer: [ // Q1: ビジネス推進・顧客対応系
            { value: 'sales', icon: '💼', text: 'A. 営業' },
            { value: 'customer_support', icon: '🎧', text: 'B. カスタマーサポート・オペレーター' },
            { value: 'hospitality_retail', icon: '🛍️', text: 'C. 接客・販売・サービス系' },
            { value: 'web_marketing_planning', icon: '🌐', text: 'D. Web・マーケティング・企画職' }
        ]
    };

    // メインクラスタを判定する関数
    function determineMainCluster(q1, q2) {
        if (q1 === 'corporate') {
            if (['office_assistant', 'admin_dept', 'management_planning'].includes(q2)) return 'T';
            return 'T';
        }
        if (q1 === 'tech_rd') {
            if (['it_engineer', 'data_research', 'researcher'].includes(q2)) return 'D';
            return 'D';
        }
        if (q1 === 'human_service') {
            if (['education_childcare', 'medical_professional', 'care_professional'].includes(q2)) return 'H';
            return 'H';
        }
        if (q1 === 'business_customer') {
            if (q2 === 'sales' || q2 === 'web_marketing_planning' || q2 === 'customer_support') return 'T';
            if (q2 === 'hospitality_retail') return 'S';
            return 'S';
        }
        console.warn(`Unknown main cluster for Q1: ${q1}, Q2: ${q2}`);
        return 'Unknown';
    }

    // 活用事例のHTML要素を生成するヘルパー関数
    function createUseCaseElement(useCase) {
        const useCaseItem = document.createElement('div');
        useCaseItem.className = 'use-case-item';
        useCaseItem.innerHTML = `
            <div class="use-case-description">${useCase.description}</div>
            <div class="time-saved">月${useCase.timeSaved.toFixed(1)}時間</div>
        `;
        return useCaseItem;
    }

    // 質問表示の更新とイベントリスナー設定
    function updateQuestionDisplay() {
        questionSlides.forEach((slide, index) => {
            if (index === currentQuestionIndex) {
                slide.classList.add('active');
                const currentOptions = slide.querySelectorAll('.option');

                currentOptions.forEach(option => {
                    const newOption = option.cloneNode(true);
                    option.parentNode.replaceChild(newOption, option);
                    newOption.addEventListener('click', handleOptionClick);

                    const questionId = slide.id;
                    if (answers[questionId] && newOption.dataset.value === answers[questionId]) {
                        newOption.classList.add('selected');
                    }
                });
            } else {
                slide.classList.remove('active');
            }
        });

        progressIndicator.style.width = `${(currentQuestionIndex + 1) / totalQuestions * 100}%`;
        questionNumber.textContent = `質問 ${currentQuestionIndex + 1}/${totalQuestions}`;
        prevBtn.disabled = currentQuestionIndex === 0;
    }

    // Q2の選択肢を動的に生成・更新
    function updateQ2Options() {
        q2OptionsContainer.innerHTML = '';
        const selectedQ1Value = answers.q1;

        if (q2ChoicesData[selectedQ1Value]) {
            q2ChoicesData[selectedQ1Value].forEach(choice => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.dataset.value = choice.value;
                optionDiv.innerHTML = `
                    <div class="option-icon">${choice.icon}</div>
                    <div class="option-text">${choice.text}</div>
                `;
                q2OptionsContainer.appendChild(optionDiv);
            });
        } else {
            console.warn(`No Q2 choices found for Q1 value: ${selectedQ1Value}`);
        }
    }

    // オプション選択のイベントハンドラ
    function handleOptionClick(e) {
        const clickedOption = e.currentTarget;
        const questionSlide = clickedOption.closest('.question-slide');
        if (!questionSlide) {
            console.error("Could not find parent .question-slide for clicked option");
            return;
        }

        const questionId = questionSlide.id;
        const selectedValue = clickedOption.dataset.value;
        const allOptionsInSlide = questionSlide.querySelectorAll('.option');

        allOptionsInSlide.forEach(opt => opt.classList.remove('selected'));
        clickedOption.classList.add('selected');
        answers[questionId] = selectedValue;

        if (questionId === 'q1') {
            answers.q2 = ''; // Q1変更時はQ2の回答をリセット
            const q2Slide = document.getElementById('q2');
            if (q2Slide) {
                q2Slide.querySelectorAll('.option.selected').forEach(opt => opt.classList.remove('selected'));
            }
            updateQ2Options();
        }

        if (currentQuestionIndex < totalQuestions - 1) {
            currentQuestionIndex++;
            updateQuestionDisplay();
        } else {

            showResults();
        }
    }

    // 結果を表示する関数
    function showResults() {
        questionnaireSection.classList.remove('active');
        resultSection.classList.add('active');

        const mainCluster = determineMainCluster(answers.q1, answers.q2);

        const mainClusterResultEl = document.getElementById('mainClusterResult');
        if (mainClusterResultEl) {
            mainClusterResultEl.textContent = mainCluster;
        } else {
            console.error("Element with ID 'mainClusterResult' not found in showResults! Check your HTML.");
        }

        let totalTimeSaved = 0;
        const useCasesList = document.getElementById('useCasesList');
        if (!useCasesList) {
            console.error("Element with ID 'useCasesList' not found! Check your HTML.");
            return; // useCasesListがないと処理を続けられない
        }
        useCasesList.innerHTML = '';

        // メインクラスタに合致する活用事例
        const mainClusterOnlyUseCases = useCasesData.filter(useCase => {
            if (!mainCluster || mainCluster === "Unknown") return false;
            return useCase.applicableMainClusters.includes(mainCluster) || useCase.applicableMainClusters.includes("ALL");
        }).sort((a, b) => b.timeSaved - a.timeSaved);

        if (mainClusterOnlyUseCases.length === 0 && mainCluster && mainCluster !== "Unknown") {
            console.warn(`No use cases found for main cluster: ${mainCluster}. Check data.js applicableMainClusters and mainCluster determination.`);
        }

        // サブクラスタ事例の選定 (メインクラスタ一致が前提で、Q3/Q4/Q5のいずれかに一致)
        let subClusterCandidateCases = [];
        if (mainCluster && mainCluster !== "Unknown") {
            useCasesData.forEach(useCase => {
                const isMainClusterMatch = useCase.applicableMainClusters.includes(mainCluster) || useCase.applicableMainClusters.includes("ALL");
                if (!isMainClusterMatch) return;
                if (!useCase.subClusters) return;

                const q3Match = useCase.subClusters.q3 && (useCase.subClusters.q3.includes(answers.q3) || useCase.subClusters.q3.includes("ALL"));
                const q4Match = useCase.subClusters.q4 && (useCase.subClusters.q4.includes(answers.q4) || useCase.subClusters.q4.includes("ALL"));
                const q5Match = useCase.subClusters.q5 && (useCase.subClusters.q5.includes(answers.q5) || useCase.subClusters.q5.includes("ALL"));

                if (q3Match || q4Match || q5Match) {
                    subClusterCandidateCases.push(useCase);
                }
            });
        }
        const uniqueSubClusterUseCases = Array.from(new Set(subClusterCandidateCases.map(uc => uc.id)))
            .map(id => subClusterCandidateCases.find(uc => uc.id === id))
            .sort((a, b) => b.timeSaved - a.timeSaved);

        const mainCasesToShow = mainClusterOnlyUseCases.slice(0, 5);
        const subCasesToShow = uniqueSubClusterUseCases.filter(
            subCase => !mainCasesToShow.find(mainCase => mainCase.id === subCase.id)
        ).slice(0, 3);
        let displayedUseCases = [];

        if (mainCasesToShow.length > 0) {
            const heading = document.createElement('h4');
            heading.textContent = `あなたの業種におすすめの活用事例`;
            useCasesList.appendChild(heading);
            mainCasesToShow.forEach(useCase => {
                if (!displayedUseCases.find(uc => uc.id === useCase.id)) {
                    const useCaseItem = createUseCaseElement(useCase);
                    useCasesList.appendChild(useCaseItem);
                    totalTimeSaved += useCase.timeSaved;
                    displayedUseCases.push(useCase);
                }
            });
        }
        if (subCasesToShow.length > 0) {
            const heading = document.createElement('h4');
            heading.textContent = `あなたの業務スタイルに合う活用事例`;
            useCasesList.appendChild(heading);
            subCasesToShow.forEach(useCase => {
                if (!displayedUseCases.find(uc => uc.id === useCase.id)) {
                    const useCaseItem = createUseCaseElement(useCase);
                    useCasesList.appendChild(useCaseItem);
                    totalTimeSaved += useCase.timeSaved;
                    displayedUseCases.push(useCase);
                }
            });
        }
        if (displayedUseCases.length === 0) {
            useCasesList.innerHTML = '<p>あなたにぴったりの具体的な活用事例は見つかりませんでした。一般的なAI活用をお試しください。</p>';
            console.warn("No use cases to display. Main cases count:", mainCasesToShow.length, "Sub cases count (after filter):", subCasesToShow.length);
        }

        const totalTimeSavedEl = document.getElementById('totalTimeSaved');
        if (totalTimeSavedEl) {
            totalTimeSavedEl.textContent = totalTimeSaved.toFixed(1);
        } else {
            console.error("Element with ID 'totalTimeSaved' not found in showResults! Check your HTML.");
        }
    }

    // 「もう一度診断する」ボタンは削除
    
    // 「前へ」ボタン
    prevBtn.addEventListener('click', function () {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            updateQuestionDisplay(); // 前の質問の表示とイベントリスナー再設定、選択状態復元
        }
    });

    // Xシェアボタンのイベントリスナー
    if (shareOnXBtn) {
        shareOnXBtn.addEventListener('click', function () {
            const timeSavedTextEl = document.getElementById('totalTimeSaved');
            const mainClusterTextEl = document.getElementById('mainClusterResult');

            const timeSavedText = timeSavedTextEl ? timeSavedTextEl.textContent : "XX";
            const mainClusterText = mainClusterTextEl ? mainClusterTextEl.textContent : "診断結果";

            const tweetText = `生成AI活用診断の結果、私は【${mainClusterText}クラスタ】で月${timeSavedText}時間の業務短縮が期待できるみたい！🙌\n皆さんも試してみませんか？\n\n#生成AI業務効率化 #AI活用診断\n`;
            const toolUrl = window.location.href;
            const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(toolUrl)}`;
            window.open(twitterIntentUrl, '_blank', 'width=600,height=400');
        });
    } else {
        console.warn("Share on X button ('shareOnXBtn') not found. Check your HTML.");
    }

    // 初期表
    if (questionSlides.length > 0) { // 質問スライドが存在する場合のみ初期化
        updateQuestionDisplay();
    } else {
        console.error("No question slides found. Questionnaire cannot be initialized.");
    }
});
