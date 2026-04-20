const state = {
    stage: 'AUDIO_TEST',
    currentTrial: 0,
    trials: [],
    results: [],
    startTime: 0,
    errorsInTrial: 0,
    rapportNumber: [1, 7, 9],
    rapportAttempts: 0,
    pendingStage: null
};

const DEMO_TRIALS = {
    STAGE_1: [
        { num: 7, voice: 'masculina', isSwitch: false }, { num: 2, voice: 'masculina', isSwitch: false },
        { num: 3, voice: 'masculina', isSwitch: false }, { num: 4, voice: 'masculina', isSwitch: false },
        { num: 1, voice: 'masculina', isSwitch: false }, { num: 8, voice: 'masculina', isSwitch: false }
    ],
    STAGE_2: [
        { num: 8, voice: 'feminina', isSwitch: false }, { num: 3, voice: 'feminina', isSwitch: false },
        { num: 9, voice: 'feminina', isSwitch: false }, { num: 1, voice: 'feminina', isSwitch: false },
        { num: 4, voice: 'feminina', isSwitch: false }, { num: 7, voice: 'feminina', isSwitch: false }
    ],
    STAGE_3: [
        { num: 2, voice: 'feminina', isSwitch: true },
        { num: 6, voice: 'masculina', isSwitch: true }, 
        { num: 4, voice: 'masculina', isSwitch: false },
        { num: 2, voice: 'feminina', isSwitch: true },
        { num: 9, voice: 'feminina', isSwitch: false },
        { num: 1, voice: 'masculina', isSwitch: true }
    ]
};

function render() {
    const container = document.getElementById('screen-container');
    container.innerHTML = '';

    if (state.stage === 'AUDIO_TEST') {
        const template = document.getElementById('audio-test-template');
        const clone = template.content.cloneNode(true);
        container.appendChild(clone);
    } 
    else if (state.stage.includes('_INSTR') || state.stage === 'POSITIONING') {
        renderInstructions(container);
    }
    else if (state.stage.startsWith('STAGE_')) {
        const trial = state.trials[state.currentTrial];
        container.innerHTML = `
            <div class="test-icon" id="feedback-icon">🔊</div>
            <div class="key-hints">
                <div class="key-box" id="key-a"><b>A</b><span>PAR<br>ou &lt; 5</span></div>
                <div class="key-box" id="key-l"><b>L</b><span>ÍMPAR<br>ou &gt; 5</span></div>
            </div>`;
        playAudio(trial.num, trial.voice);
    } 
    else if (state.stage === 'RESULTS') {
        renderResults(container);
    }
}

function renderInstructions(container) {
    let templateId;
    if (state.stage === 'STAGE_1_INSTR') templateId = 'stage1-instr-template';
    else if (state.stage === 'STAGE_2_INSTR') templateId = 'stage2-instr-template';
    else if (state.stage === 'STAGE_3_INSTR') templateId = 'stage3-instr-template';
    else if (state.stage === 'POSITIONING') templateId = 'positioning-template';
    const template = document.getElementById(templateId);
    container.innerHTML = template.innerHTML;
}

function playAudio(nums, voice) {
    if (!Array.isArray(nums)) nums = [nums];
    let index = 0;
    const playNext = () => {
        if (index < nums.length) {
            const audio = new Audio(`src/audio/${voice}/${nums[index]}.mp3`);
            const proceed = () => {
                index++;
                if (index < nums.length) {
                    setTimeout(playNext, 500);
                } else {
                    state.startTime = performance.now();
                }
            };
            audio.onended = proceed;
            audio.onerror = () => {
                console.warn(`Áudio não encontrado: ${voice}/${nums[index]}.mp3. Avançando...`);
                proceed();
            };
            audio.play().catch(err => {
                console.warn(`Erro ao tentar tocar ${voice}/${nums[index]}.mp3:`, err);
                proceed();
            });
        }
    };
    playNext();
}

function playRapportAudio() {
    playAudio(state.rapportNumber, 'masculina');
}

function checkRapport() {
    const val = document.getElementById('rapport-in').value.trim().replace(/\s+/g, '');
    if (val === '179') {
        state.stage = 'STAGE_1_INSTR'; render();
    } else {
        state.rapportAttempts++;
        const msg = document.getElementById('rapport-msg');
        msg.innerText = state.rapportAttempts >= 5 ? "Problema no áudio? Contate o avaliador." : "Tente novamente!";
    }
}

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();

    if (state.stage === 'POSITIONING' && key === ' ') {
        const next = state.pendingStage;
        state.stage = next;
        state.trials = DEMO_TRIALS[next];
        state.currentTrial = 0;
        render();
        return;
    }

    if (state.stage.includes('_INSTR') && key === ' ') {
        const next = state.stage.replace('_INSTR', '');
        state.pendingStage = next;
        state.stage = 'POSITIONING';
        render();
        return;
    }

    if (!state.stage.startsWith('STAGE_') || state.stage.includes('_INSTR')) return;
    if (key !== 'a' && key !== 'l') return;

    const btn = document.getElementById(`key-${key}`);
    const trial = state.trials[state.currentTrial];
    const isCorrect = validate(trial, key);

    if (btn) btn.classList.add('active-press');

    if (isCorrect) {
        btn.classList.add('success');
        const rt = performance.now() - state.startTime;
        state.results.push({ stage: state.stage, rt, numErrors: state.errorsInTrial, isSwitch: trial.isSwitch });

        setTimeout(() => {
            btn.classList.remove('active-press', 'success');
            state.errorsInTrial = 0; state.currentTrial++;
            if (state.currentTrial < state.trials.length) render();
            else advance();
        }, 150);
    } else {
        state.errorsInTrial++;
        btn.classList.add('fail');
        document.getElementById('feedback-icon').classList.add('shake');
        new Audio('src/audio/error.mp3').play();
        setTimeout(() => {
            btn.classList.remove('active-press', 'fail');
            document.getElementById('feedback-icon').classList.remove('shake');
        }, 300);
    }
});

function validate(trial, key) {
    if (trial.voice === 'masculina') return (trial.num % 2 === 0 && key === 'a') || (trial.num % 2 !== 0 && key === 'l');
    return (trial.num < 5 && key === 'a') || (trial.num > 5 && key === 'l');
}

function advance() {
    if (state.stage === 'STAGE_1') state.stage = 'STAGE_2_INSTR';
    else if (state.stage === 'STAGE_2') state.stage = 'STAGE_3_INSTR';
    else state.stage = 'RESULTS';
    render();
}

function renderResults(container) {
    const res = state.results;
    const d = res.filter(r => r.stage === 'STAGE_1' || r.stage === 'STAGE_2');
    const a = res.filter(r => r.stage === 'STAGE_3');

    const mean = arr => arr.length ? Math.round(arr.reduce((s, x) => s + x.rt, 0) / arr.length) : 0;
    const errs = arr => arr.reduce((s, x) => s + x.numErrors, 0);

    const RT_D = mean(d), RT_A = mean(a);
    const ED = errs(d), EA = errs(a);
    const switchT = a.filter(r => r.isSwitch), nonSwitch = a.filter(r => !r.isSwitch);
    const TR = mean(switchT), TnR = mean(nonSwitch);
    const ER = errs(switchT), EnR = errs(nonSwitch);

    container.innerHTML = `
        <div class="results-card">
            <h2 style="text-align:center; margin-bottom:1.5rem;">Resultados do Teste</h2>
            <h3 class="section-label">Performance Geral</h3>
            <div class="card-group">
                <div class="metric-card"><h4>RT Médio (Direto)</h4><p>${RT_D} ms</p></div>
                <div class="metric-card"><h4>Total Erros (Direto)</h4><p>${ED}</p></div>
                <div class="metric-card"><h4>RT Médio (Alternado)</h4><p>${RT_A} ms</p></div>
                <div class="metric-card"><h4>Total Erros (Alternado)</h4><p>${EA}</p></div>
                <div class="metric-card"><h4>Diferença RT (Alt - Dir)</h4><p>${RT_A - RT_D} ms</p></div>
                <div class="metric-card"><h4>Diferença Erros (Alt - Dir)</h4><p>${EA - ED}</p></div>
            </div>
            <h3 class="section-label">Análise de Custo de Troca</h3>
            <div class="card-group">
                <div class="metric-card"><h4>RT Troca (TR)</h4><p>${TR} ms</p></div>
                <div class="metric-card"><h4>RT Não-Troca (TnR)</h4><p>${TnR} ms</p></div>
                <div class="metric-card"><h4>CTT (TR - TnR)</h4><p>${TR - TnR} ms</p></div>
                <div class="metric-card"><h4>Erros Troca (ER)</h4><p>${ER}</p></div>
                <div class="metric-card"><h4>Erros Não-Troca (EnR)</h4><p>${EnR}</p></div>
                <div class="metric-card"><h4>CTE (ER - EnR)</h4><p>${ER - EnR}</p></div>
            </div>
            <button class="btn-action btn-restart" onclick="location.reload()">Reiniciar</button>
        </div>`;
}

render();