const state = {
    stage: 'AUDIO_TEST',
    currentTrial: 0,
    trials: [],
    results: [],
    startTime: 0,
    errorsInTrial: 0,
    rapportNumber: 7,
    rapportAttempts: 0
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
        container.innerHTML = `
            <div class="card">
                <h2>Rapport - Teste de Áudio</h2>
                <p>Escute o áudio clicando no botão e digite o número ouvido.</p>
                <button class="btn-action" onclick="playAudio(${state.rapportNumber}, 'masculina')">Ouvir Áudio</button><br>
                <input type="number" id="rapport-in" style="padding:15px; font-size:1.5rem; width:80px; text-align:center; border-radius:10px; border:none; margin: 10px 0;"><br>
                <button class="btn-action" onclick="checkRapport()">Validar</button>
                <p id="rapport-msg" style="color:var(--error); font-weight:bold;"></p>
            </div>`;
    } 
    else if (state.stage.includes('_INSTR')) {
        renderInstructions(container);
    }
    else if (state.stage.startsWith('STAGE_')) {
        const trial = state.trials[state.currentTrial];
        const isMasc = trial.voice === 'masculina';
        container.innerHTML = `
            <div class="test-icon" id="feedback-icon">🔊</div>
            <div class="key-hints">
                <div class="key-box" id="key-z"><b>Z</b><span>${isMasc ? 'PAR' : 'MENOR < 5'}</span></div>
                <div class="key-box" id="key-m"><b>M</b><span>${isMasc ? 'ÍMPAR' : 'MAIOR > 5'}</span></div>
            </div>`;
        playAudio(trial.num, trial.voice);
    } 
    else if (state.stage === 'RESULTS') {
        renderResults(container);
    }
}

function renderInstructions(container) {
    let content = "";
    if (state.stage === 'STAGE_1_INSTR') {
        content = `<h2>Etapa direta (1)</h2>
            <p>Para a primeira etapa do teste você escutará uma voz MASCULINA falar uma série de números, um de cada vez.</p>
            <p>Sua tarefa é decidir o mais rápido possível se este número é “PAR” ou “ÍMPAR”.</p>
            <p>Pressione a tecla <b>Z</b> se o número PAR.<br>Pressione a tecla <b>M</b> se o número ÍMPAR.</p>
            <p>Responda da forma mais rápida e precisa que conseguir. Se você errar, um sinal sonoro irá soar. Simplesmente corrija a sua resposta e continue.</p>
            <p><b>Quando estiver preparado pressione ESPAÇO para iniciar.</b></p>`;
    } else if (state.stage === 'STAGE_2_INSTR') {
        content = `<h2>Etapa direta (2)</h2>
            <p>Para a próxima etapa do teste você escutará uma voz FEMININA falar uma série de números, um de cada vez.</p>
            <p>Sua tarefa é decidir o mais rápido possível se este número é “MENOR QUE 5” ou “MAIOR QUE 5”.</p>
            <p>Pressione a tecla <b>Z</b> se o número “MENOR QUE 5”.<br>Pressione a tecla <b>M</b> se o número “MAIOR QUE 5”.</p>
            <p>Responda da forma mais rápida e precisa que conseguir. Se você errar, um sinal sonoro irá soar. Simplesmente corrija a sua resposta e continue.</p>
            <p><i>Ao iniciar: Posicione seu indicador esquerdo sobre a tecla Z e o direito sobre a tecla M.</i></p>
            <p><b>Quando estiver preparado pressione ESPAÇO para iniciar.</b></p>`;
    } else if (state.stage === 'STAGE_3_INSTR') {
        content = `<h2>Etapa alternada</h2>
            <p>Agora vamos combinar as duas tarefas em uma:</p>
            <p>Novamente, você escutará uma série de números, um de cada vez.</p>
            <p><b>Se a voz for MASCULINA:</b> Classifique o número entre PAR ou ÍMPAR.<br>
            <b>Se a voz for FEMININA:</b> Classifique o número entre MENOR ou MAIOR que 5.</p>
            <p>Responda da forma mais rápida e precisa que conseguir. Se você errar, um sinal sonoro irá soar. Simplesmente corrija a sua resposta e continue.</p>
            <p><b>Quando estiver preparado pressione ESPAÇO para iniciar.</b></p>`;
    }
    container.innerHTML = `<div class="card">${content}</div>`;
}

function playAudio(num, voice) {
    const audio = new Audio(`src/audio/${voice}/${num}.mp3`);
    audio.onended = () => { state.startTime = performance.now(); };
    audio.play();
}

function checkRapport() {
    const val = document.getElementById('rapport-in').value;
    if (parseInt(val) === state.rapportNumber) {
        state.stage = 'STAGE_1_INSTR'; render();
    } else {
        state.rapportAttempts++;
        const msg = document.getElementById('rapport-msg');
        msg.innerText = state.rapportAttempts >= 5 ? "Problema no áudio? Contate o avaliador." : "Tente novamente!";
    }
}

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    if (state.stage.includes('_INSTR') && key === ' ') {
        const next = state.stage.replace('_INSTR', '');
        state.stage = next; state.trials = DEMO_TRIALS[next]; state.currentTrial = 0;
        render(); return;
    }

    if (!state.stage.startsWith('STAGE_') || state.stage.includes('_INSTR')) return;
    if (key !== 'z' && key !== 'm') return;

    const btn = document.getElementById(`key-${key}`);
    const trial = state.trials[state.currentTrial];
    const isCorrect = validate(trial, key);

    // FEEDBACK VISUAL IMEDIATO (Acende Branco)
    if (btn) btn.classList.add('active-press');

    if (isCorrect) {
        // FEEDBACK ACERTO (Verde)
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
        // FEEDBACK ERRO (Vermelho)
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
    if (trial.voice === 'masculina') return (trial.num % 2 === 0 && key === 'z') || (trial.num % 2 !== 0 && key === 'm');
    return (trial.num < 5 && key === 'z') || (trial.num > 5 && key === 'm');
}

function advance() {
    if (state.stage === 'STAGE_1') state.stage = 'STAGE_2_INSTR';
    else if (state.stage === 'STAGE_2') state.stage = 'STAGE_3_INSTR';
    else state.stage = 'RESULTS';
    render();
}

function renderResults(container) {
    const res = state.results;
    const d = res.filter(r => r.stage.includes('1') || r.stage.includes('2'));
    const a = res.filter(r => r.stage.includes('3'));
    
    const mean = (arr) => arr.length ? (arr.reduce((s, x) => s + x.rt, 0) / arr.length).toFixed(2) : 0;
    const errs = (arr) => arr.reduce((s, x) => s + x.numErrors, 0);

    const RT_D = mean(d), RT_A = mean(a);
    const ED = errs(d), EA = errs(a);
    
    const switchTrials = a.filter(r => r.isSwitch), nonSwitch = a.filter(r => !r.isSwitch);
    const TR = mean(switchTrials), TnR = mean(nonSwitch);
    const ER = errs(switchTrials), EnR = errs(nonSwitch);

    container.innerHTML = `
        <div class="card" style="text-align:left;">
            <h2 style="text-align:center">Resultados da Avaliação</h2>
            <table class="results-table">
                <tr><th>Métrica</th><th>Valor</th></tr>
                <tr><td>TR Médio Direto (D)</td><td>${RT_D} ms</td></tr>
                <tr><td>TR Médio Alternado (A)</td><td>${RT_A} ms</td></tr>
                <tr><td><b>Custo Total (A - D)</b></td><td><b>${(RT_A - RT_D).toFixed(2)} ms</b></td></tr>
                <tr><td>Erros (D | A)</td><td>${ED} | ${EA}</td></tr>
                <tr><th colspan="2">Análise Residual (Etapa Alternada)</th></tr>
                <tr><td>Tempo Residual (TR)</td><td>${TR} ms</td></tr>
                <tr><td>Tempo Não-Residual (TnR)</td><td>${TnR} ms</td></tr>
                <tr><td><b>Custo de Troca (CTT)</b></td><td><b>${(TR - TnR).toFixed(2)} ms</b></td></tr>
                <tr><td>Custo de Troca Erros (CTE)</td><td>${ER - EnR}</td></tr>
            </table>
            <button class="btn-action" style="width:100%; margin-top:20px;" onclick="location.reload()">Reiniciar</button>
        </div>`;
}

render();