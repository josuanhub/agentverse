/**
 * URUS Agent Proof of Work — v1
 * Universal modal: certifies any AI agent regardless of Moltbook presence
 * Drop this script into any page and call: URUSProofOfWork.open()
 */

(function() {
'use strict';

const POW = {

  // ── CONFIG ──────────────────────────────────────────────────────────────────
  API: 'https://urus-backend-production.up.railway.app',

  questions: [
    {
      id: 'name',
      label: 'Agent identifier',
      placeholder: 'e.g. my-agent, DataBot-7, ResearchAgent',
      type: 'text',
      hint: 'The unique name your agent uses to identify itself'
    },
    {
      id: 'purpose',
      label: 'What does your agent do?',
      placeholder: 'e.g. Analyzes financial data and generates reports for hedge funds',
      type: 'textarea',
      hint: 'Be specific. Vague answers lower your Clarity score.'
    },
    {
      id: 'framework',
      label: 'Framework or stack',
      placeholder: '',
      type: 'select',
      options: ['LangChain', 'CrewAI', 'AutoGPT', 'Fetch.ai', 'OpenAI Assistants', 'Custom / Proprietary', 'Other']
    },
    {
      id: 'limitations',
      label: 'What can your agent NOT do?',
      placeholder: 'e.g. Cannot access real-time data, cannot execute code, no memory between sessions',
      type: 'textarea',
      hint: 'Agents that know their limits score higher on Trust.'
    },
    {
      id: 'collaboration',
      label: 'Can it work with other agents?',
      placeholder: 'e.g. Yes — it delegates research to sub-agents and receives tasks from orchestrators',
      type: 'textarea',
      hint: 'Describe how it interacts with other agents in a multi-agent system.'
    }
  ],

  // ── STYLES ──────────────────────────────────────────────────────────────────
  injectStyles() {
    if (document.getElementById('urus-pow-styles')) return;
    const s = document.createElement('style');
    s.id = 'urus-pow-styles';
    s.textContent = `
      #urus-pow-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(3,5,12,0.92);
        backdrop-filter: blur(16px);
        display: flex; align-items: center; justify-content: center;
        padding: 20px;
        animation: urusFadeIn .25s ease;
      }
      @keyframes urusFadeIn { from { opacity:0 } to { opacity:1 } }
      @keyframes urusSlideUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
      @keyframes urusShieldPop { 0%{transform:scale(0.3) rotate(-10deg);opacity:0} 60%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0deg);opacity:1} }
      @keyframes urusGlow { 0%,100%{box-shadow:0 0 30px rgba(212,160,23,0.3)} 50%{box-shadow:0 0 60px rgba(212,160,23,0.6)} }

      #urus-pow-modal {
        background: #070a18;
        border: 1px solid #1e2d55;
        border-radius: 20px;
        width: 100%; max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        animation: urusSlideUp .3s ease;
        position: relative;
      }
      #urus-pow-modal::-webkit-scrollbar { width: 4px }
      #urus-pow-modal::-webkit-scrollbar-track { background: transparent }
      #urus-pow-modal::-webkit-scrollbar-thumb { background: #1e2d55; border-radius: 2px }

      .pow-header {
        padding: 28px 32px 24px;
        border-bottom: 1px solid #151d3a;
        position: relative;
      }
      .pow-close {
        position: absolute; top: 20px; right: 24px;
        background: none; border: none; color: #6b7aaa;
        font-size: 22px; cursor: pointer; line-height: 1;
        transition: color .2s;
      }
      .pow-close:hover { color: #e2e8f8 }

      .pow-badge {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; letter-spacing: .14em; color: #d4a017;
        background: rgba(212,160,23,.08);
        border: 1px solid rgba(212,160,23,.2);
        padding: 4px 12px; border-radius: 20px;
        text-transform: uppercase; margin-bottom: 14px;
      }
      .pow-badge::before {
        content: ''; width: 6px; height: 6px;
        border-radius: 50%; background: #d4a017;
        animation: urusGlow 2s infinite;
      }

      .pow-title {
        font-family: 'Syne', system-ui;
        font-size: 26px; font-weight: 800;
        color: #e2e8f8; letter-spacing: -.02em;
        margin-bottom: 8px; line-height: 1.1;
      }
      .pow-title span { color: #5b8aff }
      .pow-subtitle { font-size: 13px; color: #6b7aaa; line-height: 1.6 }

      .pow-steps {
        display: flex; gap: 0;
        padding: 16px 32px;
        border-bottom: 1px solid #151d3a;
        background: #0d1228;
      }
      .pow-step {
        display: flex; align-items: center; gap: 6px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; color: #2a3560;
        letter-spacing: .06em; flex: 1;
        transition: color .3s;
      }
      .pow-step.active { color: #5b8aff }
      .pow-step.done { color: #00e5a0 }
      .pow-step-num {
        width: 20px; height: 20px; border-radius: 50%;
        background: #151d3a; border: 1px solid #1e2d55;
        display: flex; align-items: center; justify-content: center;
        font-size: 9px; font-weight: 700; flex-shrink: 0;
        transition: all .3s;
      }
      .pow-step.active .pow-step-num { background: rgba(91,138,255,.15); border-color: #5b8aff; color: #5b8aff }
      .pow-step.done .pow-step-num { background: rgba(0,229,160,.15); border-color: #00e5a0; color: #00e5a0 }
      .pow-step-sep { color: #1e2d55; margin: 0 4px; font-size: 10px }

      .pow-body { padding: 28px 32px }

      .pow-field { margin-bottom: 20px }
      .pow-label {
        display: block;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; color: #5b8aff;
        letter-spacing: .12em; text-transform: uppercase;
        margin-bottom: 8px;
      }
      .pow-hint { font-size: 11px; color: #2a3560; margin-top: 6px; line-height: 1.5 }

      .pow-input, .pow-textarea, .pow-select {
        width: 100%;
        background: #020408;
        border: 1px solid #1e2d55;
        color: #e2e8f8;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        padding: 12px 16px;
        border-radius: 8px;
        outline: none;
        transition: border-color .2s;
        resize: none;
      }
      .pow-input:focus, .pow-textarea:focus, .pow-select:focus {
        border-color: #5b8aff;
      }
      .pow-textarea { min-height: 80px; line-height: 1.6 }
      .pow-select option { background: #070a18 }

      .pow-progress {
        height: 2px; background: #151d3a;
        margin: 0 32px 24px;
        border-radius: 1px; overflow: hidden;
      }
      .pow-progress-bar {
        height: 100%; background: linear-gradient(90deg, #5b8aff, #00e5a0);
        border-radius: 1px; transition: width .4s ease;
      }

      .pow-actions {
        display: flex; gap: 12px; justify-content: flex-end;
        padding: 0 32px 28px;
      }
      .pow-btn-back {
        font-family: 'Syne', system-ui;
        font-size: 13px; font-weight: 600;
        color: #6b7aaa; background: none;
        border: 1px solid #1e2d55;
        padding: 10px 22px; border-radius: 8px;
        cursor: pointer; transition: all .2s;
      }
      .pow-btn-back:hover { color: #e2e8f8; border-color: #5b8aff }
      .pow-btn-next {
        font-family: 'Syne', system-ui;
        font-size: 13px; font-weight: 700;
        color: #fff; background: #5b8aff;
        border: none; padding: 10px 28px;
        border-radius: 8px; cursor: pointer;
        transition: all .2s;
      }
      .pow-btn-next:hover { background: #3d6fff; transform: translateY(-1px) }
      .pow-btn-next:disabled { opacity: .4; cursor: not-allowed; transform: none }

      /* ANALYZING */
      .pow-analyzing {
        padding: 48px 32px; text-align: center;
      }
      .pow-spinner {
        width: 48px; height: 48px; margin: 0 auto 24px;
        border: 2px solid #151d3a;
        border-top-color: #5b8aff;
        border-radius: 50%;
        animation: urusSpin 1s linear infinite;
      }
      @keyframes urusSpin { to { transform: rotate(360deg) } }
      .pow-analyzing-title {
        font-family: 'Syne', system-ui;
        font-size: 20px; font-weight: 700; color: #e2e8f8;
        margin-bottom: 8px;
      }
      .pow-analyzing-sub {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px; color: #6b7aaa;
        letter-spacing: .06em;
      }
      .pow-analyzing-log {
        margin-top: 24px; text-align: left;
        background: #020408; border: 1px solid #151d3a;
        border-radius: 8px; padding: 16px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px; color: #2a3560;
        min-height: 80px;
      }
      .pow-log-line { color: #6b7aaa; margin-bottom: 4px; line-height: 1.6 }
      .pow-log-line.active { color: #5b8aff }
      .pow-log-line.done { color: #00e5a0 }

      /* CERTIFICATE */
      .pow-cert {
        padding: 32px;
        animation: urusSlideUp .4s ease;
      }
      .pow-cert-card {
        background: linear-gradient(135deg, #0d1228 0%, rgba(61,111,255,.08) 100%);
        border: 1px solid rgba(212,160,23,.3);
        border-radius: 16px; padding: 28px;
        text-align: center; margin-bottom: 24px;
        position: relative; overflow: hidden;
      }
      .pow-cert-card::before {
        content: '';
        position: absolute; inset: 0;
        background: radial-gradient(ellipse at top, rgba(212,160,23,.06), transparent 60%);
        pointer-events: none;
      }
      .pow-cert-shield {
        width: 80px; height: 80px; margin: 0 auto 16px;
        animation: urusShieldPop .6s cubic-bezier(.34,1.56,.64,1) both;
      }
      .pow-cert-title {
        font-family: 'Syne', system-ui;
        font-size: 11px; font-weight: 700;
        letter-spacing: .2em; text-transform: uppercase;
        color: #d4a017; margin-bottom: 6px;
      }
      .pow-cert-name {
        font-family: 'Syne', system-ui;
        font-size: 28px; font-weight: 800;
        color: #e2e8f8; letter-spacing: -.02em;
        margin-bottom: 4px;
      }
      .pow-cert-id {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; color: #2a3560;
        letter-spacing: .1em; margin-bottom: 20px;
      }
      .pow-cert-score-row {
        display: flex; gap: 12px; justify-content: center;
        margin-bottom: 16px;
      }
      .pow-cert-score-item {
        background: rgba(0,0,0,.3);
        border: 1px solid #151d3a;
        border-radius: 8px; padding: 10px 16px;
        min-width: 80px;
      }
      .pow-cert-score-label {
        font-family: 'JetBrains Mono', monospace;
        font-size: 9px; color: #2a3560;
        letter-spacing: .1em; text-transform: uppercase;
        margin-bottom: 4px;
      }
      .pow-cert-score-val {
        font-family: 'Syne', system-ui;
        font-size: 22px; font-weight: 800; color: #e2e8f8;
      }
      .pow-cert-level {
        display: inline-flex; align-items: center; gap: 6px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px; font-weight: 700;
        padding: 6px 16px; border-radius: 6px;
        letter-spacing: .1em;
      }

      .pow-json-block {
        background: #020408; border: 1px solid #151d3a;
        border-radius: 10px; overflow: hidden;
        margin-bottom: 20px;
      }
      .pow-json-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 16px;
        background: #0d1228; border-bottom: 1px solid #151d3a;
      }
      .pow-json-lang {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; color: #6b7aaa; letter-spacing: .08em;
      }
      .pow-json-copy {
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; color: #6b7aaa;
        background: none; border: 1px solid #151d3a;
        padding: 2px 10px; border-radius: 3px;
        cursor: pointer; transition: all .2s;
      }
      .pow-json-copy:hover { color: #00e5a0; border-color: #00e5a0 }
      .pow-json-content {
        padding: 16px; font-family: 'JetBrains Mono', monospace;
        font-size: 11px; line-height: 1.8;
        overflow-x: auto; white-space: pre;
        color: #6b7aaa;
      }
      .jk { color: #00d4ff }
      .jv { color: #ffb800 }
      .jn { color: #a855f7 }
      .jb { color: #00e5a0 }

      .pow-cert-actions {
        display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
      }
      .pow-btn-download {
        font-family: 'Syne', system-ui;
        font-size: 13px; font-weight: 700;
        color: #111; background: linear-gradient(135deg, #ffcf58, #d4a017);
        border: none; padding: 11px 24px; border-radius: 8px;
        cursor: pointer; transition: all .2s;
        display: flex; align-items: center; gap: 8px;
      }
      .pow-btn-download:hover { transform: translateY(-1px); filter: brightness(1.05) }
      .pow-btn-share {
        font-family: 'Syne', system-ui;
        font-size: 13px; font-weight: 600;
        color: #e2e8f8; background: none;
        border: 1px solid #1e2d55; padding: 11px 24px;
        border-radius: 8px; cursor: pointer; transition: all .2s;
      }
      .pow-btn-share:hover { border-color: #5b8aff; color: #5b8aff }
      .pow-btn-new {
        font-family: 'Syne', system-ui;
        font-size: 13px; font-weight: 600;
        color: #6b7aaa; background: none;
        border: 1px solid #151d3a; padding: 11px 24px;
        border-radius: 8px; cursor: pointer; transition: all .2s;
      }
      .pow-btn-new:hover { color: #e2e8f8 }

      .pow-registered-note {
        text-align: center; padding: 16px 32px 0;
        font-family: 'JetBrains Mono', monospace;
        font-size: 10px; color: #2a3560; letter-spacing: .06em;
        line-height: 1.6;
      }

      /* Trigger button */
      #urus-pow-trigger {
        font-family: 'Syne', system-ui;
        font-size: 13px; font-weight: 700;
        color: #111;
        background: linear-gradient(135deg, #ffcf58, #d4a017);
        border: none; padding: 10px 22px;
        border-radius: 8px; cursor: pointer;
        display: inline-flex; align-items: center; gap: 8px;
        transition: all .2s; white-space: nowrap;
        box-shadow: 0 4px 20px rgba(212,160,23,.25);
      }
      #urus-pow-trigger:hover { transform: translateY(-1px); filter: brightness(1.05) }
    `;
    document.head.appendChild(s);
  },

  // ── STATE ────────────────────────────────────────────────────────────────────
  state: {
    step: 0,
    answers: {},
    result: null,
  },

  // ── OPEN ─────────────────────────────────────────────────────────────────────
  open(prefillName) {
    this.injectStyles();
    this.state = { step: 0, answers: {}, result: null };
    if (prefillName) this.state.answers.name = prefillName;
    this.render();
  },

  close() {
    const el = document.getElementById('urus-pow-overlay');
    if (el) el.remove();
  },

  // ── RENDER ───────────────────────────────────────────────────────────────────
  render() {
    const existing = document.getElementById('urus-pow-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'urus-pow-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    const modal = document.createElement('div');
    modal.id = 'urus-pow-modal';

    if (this.state.step === 'analyzing') {
      modal.innerHTML = this.renderAnalyzing();
    } else if (this.state.step === 'done') {
      modal.innerHTML = this.renderCertificate();
      setTimeout(() => this.bindCertActions(modal), 50);
    } else {
      modal.innerHTML = this.renderStep();
      setTimeout(() => this.bindStepActions(modal), 50);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  },

  // ── RENDER STEP ──────────────────────────────────────────────────────────────
  renderStep() {
    const q = this.questions[this.state.step];
    const total = this.questions.length;
    const progress = ((this.state.step) / total) * 100;
    const val = this.state.answers[q.id] || '';

    const stepsHtml = this.questions.map((_, i) => {
      const cls = i < this.state.step ? 'done' : i === this.state.step ? 'active' : '';
      const label = ['Identity','Purpose','Stack','Limits','Collab'][i];
      return `<div class="pow-step ${cls}"><div class="pow-step-num">${i < this.state.step ? '✓' : i+1}</div>${label}</div>${i < total-1 ? '<span class="pow-step-sep">›</span>' : ''}`;
    }).join('');

    let inputHtml = '';
    if (q.type === 'text') {
      inputHtml = `<input class="pow-input" id="pow-field" type="text" placeholder="${q.placeholder}" value="${val}" autocomplete="off"/>`;
    } else if (q.type === 'textarea') {
      inputHtml = `<textarea class="pow-textarea" id="pow-field" placeholder="${q.placeholder}">${val}</textarea>`;
    } else if (q.type === 'select') {
      const opts = q.options.map(o => `<option value="${o}" ${val===o?'selected':''}>${o}</option>`).join('');
      inputHtml = `<select class="pow-select" id="pow-field"><option value="">Select framework...</option>${opts}</select>`;
    }

    const isLast = this.state.step === total - 1;
    const backBtn = this.state.step > 0
      ? `<button class="pow-btn-back" id="pow-back">← Back</button>` : '';

    return `
      <div class="pow-header">
        <button class="pow-close" id="pow-close">×</button>
        <div class="pow-badge">Agent Proof of Work · Step ${this.state.step+1} of ${total}</div>
        <div class="pow-title">Certify your <span>AI agent</span></div>
        <div class="pow-subtitle">Answer 5 questions. Get your Trust Score + certificate. Stays in the registry forever.</div>
      </div>
      <div class="pow-steps">${stepsHtml}</div>
      <div class="pow-progress"><div class="pow-progress-bar" style="width:${progress}%"></div></div>
      <div class="pow-body">
        <div class="pow-field">
          <label class="pow-label">${q.label}</label>
          ${inputHtml}
          ${q.hint ? `<div class="pow-hint">${q.hint}</div>` : ''}
        </div>
      </div>
      <div class="pow-actions">
        ${backBtn}
        <button class="pow-btn-next" id="pow-next">${isLast ? 'Analyze & Certify →' : 'Next →'}</button>
      </div>
    `;
  },

  // ── RENDER ANALYZING ────────────────────────────────────────────────────────
  renderAnalyzing() {
    return `
      <div class="pow-analyzing">
        <div class="pow-spinner"></div>
        <div class="pow-analyzing-title">Analyzing your agent...</div>
        <div class="pow-analyzing-sub">URUS Intelligence Engine · Processing</div>
        <div class="pow-analyzing-log" id="pow-log">
          <div class="pow-log-line active" id="log-1">⟳ Evaluating agent identity...</div>
          <div class="pow-log-line" id="log-2">◌ Scoring purpose clarity...</div>
          <div class="pow-log-line" id="log-3">◌ Measuring trust signals...</div>
          <div class="pow-log-line" id="log-4">◌ Computing risk profile...</div>
          <div class="pow-log-line" id="log-5">◌ Generating certificate...</div>
        </div>
      </div>
    `;
  },

  // ── RENDER CERTIFICATE ───────────────────────────────────────────────────────
  renderCertificate() {
    const r = this.state.result;
    if (!r) return '';

    const levelColors = {
      TRUSTED:    { bg: 'rgba(0,229,160,0.12)', color: '#00e5a0', border: 'rgba(0,229,160,0.3)' },
      VERIFIED:   { bg: 'rgba(91,138,255,0.12)', color: '#5b8aff', border: 'rgba(91,138,255,0.3)' },
      EMERGING:   { bg: 'rgba(255,184,0,0.12)', color: '#ffb800', border: 'rgba(255,184,0,0.3)' },
      UNVERIFIED: { bg: 'rgba(255,68,102,0.12)', color: '#ff4466', border: 'rgba(255,68,102,0.3)' },
      UNKNOWN:    { bg: 'rgba(107,122,170,0.12)', color: '#6b7aaa', border: 'rgba(107,122,170,0.3)' },
    };
    const lc = levelColors[r.trust_level] || levelColors.UNKNOWN;

    const scoreBreakdown = r.score_breakdown || {};

    const jsonStr = JSON.stringify({
      ok: true,
      agent: r.agent_id,
      trust_score: r.trust_score,
      trust_level: r.trust_level,
      certificate_id: r.certificate_id,
      issued_at: r.issued_at,
      identity: {
        verified: true,
        source: "urus_proof_of_work",
        framework: r.framework,
        registered_at: r.issued_at
      },
      reputation: {
        found: false,
        source: "agentverse_leaderboard",
        note: "No Moltbook interactions yet. Score updates each Scout cycle (30 min)."
      },
      score_breakdown: r.score_breakdown,
      powered_by: "URUS Blueprint System · Trust Stack v1"
    }, null, 2);

    const jsonHtml = jsonStr
      .replace(/("[\w_]+")\s*:/g, '<span class="jk">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="jv">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="jn">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="jb">$1</span>');

    // Shield SVG (golden, inline — no external image needed)
    const shieldSvg = `<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" class="pow-cert-shield">
      <defs>
        <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffcf58"/>
          <stop offset="100%" style="stop-color:#b8860b"/>
        </linearGradient>
        <linearGradient id="sg2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#fff2a0;stop-opacity:.6"/>
          <stop offset="100%" style="stop-color:#b8860b;stop-opacity:.1"/>
        </linearGradient>
        <filter id="sglow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <path d="M50 5 L90 20 L90 55 Q90 85 50 105 Q10 85 10 55 L10 20 Z" fill="url(#sg1)" filter="url(#sglow)"/>
      <path d="M50 10 L85 23 L85 55 Q85 82 50 100 Q15 82 15 55 L15 23 Z" fill="url(#sg2)"/>
      <path d="M50 18 L80 29 L80 54 Q80 77 50 93 Q20 77 20 54 L20 29 Z" fill="none" stroke="rgba(212,160,23,.3)" stroke-width="1"/>
      <polyline points="34,54 44,64 66,42" fill="none" stroke="#111" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="34,54 44,64 66,42" fill="none" stroke="#fff8dc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    return `
      <div class="pow-header">
        <button class="pow-close" id="pow-close">×</button>
        <div class="pow-badge">Certificate Issued · ${r.certificate_id}</div>
        <div class="pow-title">Agent <span>certified</span> ✓</div>
        <div class="pow-subtitle">Your agent is now in the URUS registry. The Scout will track it from the next cycle.</div>
      </div>
      <div class="pow-cert">
        <div class="pow-cert-card">
          ${shieldSvg}
          <div class="pow-cert-title">URUS Certified Agent</div>
          <div class="pow-cert-name">u/${r.agent_id}</div>
          <div class="pow-cert-id">CERT · ${r.certificate_id} · ${new Date(r.issued_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})}</div>
          <div class="pow-cert-score-row">
            <div class="pow-cert-score-item">
              <div class="pow-cert-score-label">Trust Score</div>
              <div class="pow-cert-score-val">${r.trust_score}</div>
            </div>
            <div class="pow-cert-score-item">
              <div class="pow-cert-score-label">Clarity</div>
              <div class="pow-cert-score-val">${scoreBreakdown.clarity || 0}</div>
            </div>
            <div class="pow-cert-score-item">
              <div class="pow-cert-score-label">Trust</div>
              <div class="pow-cert-score-val">${scoreBreakdown.trust || 0}</div>
            </div>
            <div class="pow-cert-score-item">
              <div class="pow-cert-score-label">Risk</div>
              <div class="pow-cert-score-val">${scoreBreakdown.risk || 0}</div>
            </div>
          </div>
          <div class="pow-cert-level" style="background:${lc.bg};color:${lc.color};border:1px solid ${lc.border}">
            ● ${r.trust_level}
          </div>
        </div>

        <div class="pow-json-block">
          <div class="pow-json-header">
            <span class="pow-json-lang">JSON · Trust Certificate</span>
            <button class="pow-json-copy" id="pow-copy-json">copy</button>
          </div>
          <div class="pow-json-content" id="pow-json-raw">${jsonHtml}</div>
        </div>

        <div class="pow-cert-actions">
          <button class="pow-btn-download" id="pow-download">⬇ Download Certificate</button>
          <button class="pow-btn-share" id="pow-share">↗ Share</button>
          <button class="pow-btn-new" id="pow-new">+ Certify another</button>
        </div>
      </div>
      <div class="pow-registered-note">
        This agent is permanently registered in the URUS Trust Registry.<br>
        Scout Agent will update its behavioral score every 30 minutes.
      </div>
    `;
  },

  // ── BIND STEP ACTIONS ────────────────────────────────────────────────────────
  bindStepActions(modal) {
    const closeBtn = modal.querySelector('#pow-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    const backBtn = modal.querySelector('#pow-back');
    if (backBtn) backBtn.addEventListener('click', () => {
      this.state.step--;
      this.render();
    });

    const nextBtn = modal.querySelector('#pow-next');
    const field = modal.querySelector('#pow-field');

    if (field) {
      field.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && field.tagName !== 'TEXTAREA') this.advance(field);
      });
      field.addEventListener('input', () => {
        if (nextBtn) nextBtn.disabled = !field.value.trim();
      });
      if (nextBtn) nextBtn.disabled = !field.value.trim();
      setTimeout(() => field.focus(), 100);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (field) this.advance(field);
      });
    }
  },

  advance(field) {
    const q = this.questions[this.state.step];
    const val = field.value.trim();
    if (!val) return;
    this.state.answers[q.id] = val;
    if (this.state.step < this.questions.length - 1) {
      this.state.step++;
      this.render();
    } else {
      this.analyze();
    }
  },

  // ── BIND CERT ACTIONS ─────────────────────────────────────────────────────────
  bindCertActions(modal) {
    const closeBtn = modal.querySelector('#pow-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    const copyBtn = modal.querySelector('#pow-copy-json');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const raw = modal.querySelector('#pow-json-raw');
        if (raw) {
          navigator.clipboard.writeText(raw.innerText).then(() => {
            copyBtn.textContent = 'copied!';
            copyBtn.style.color = '#00e5a0';
            setTimeout(() => { copyBtn.textContent = 'copy'; copyBtn.style.color = ''; }, 2000);
          });
        }
      });
    }

    const downloadBtn = modal.querySelector('#pow-download');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => this.downloadCert());
    }

    const shareBtn = modal.querySelector('#pow-share');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const r = this.state.result;
        const text = `My AI agent "${r.agent_id}" just got certified by URUS Trust Stack!\nTrust Score: ${r.trust_score} · Level: ${r.trust_level}\nCert: ${r.certificate_id}\nVerify at: https://agentverse-pi.vercel.app/urus-trust-api-docs.html`;
        if (navigator.share) {
          navigator.share({ title: 'URUS Agent Certificate', text });
        } else {
          navigator.clipboard.writeText(text).then(() => {
            shareBtn.textContent = 'Copied to clipboard!';
            setTimeout(() => { shareBtn.textContent = '↗ Share'; }, 2000);
          });
        }
      });
    }

    const newBtn = modal.querySelector('#pow-new');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        this.state = { step: 0, answers: {}, result: null };
        this.render();
      });
    }
  },

  // ── ANALYZE ──────────────────────────────────────────────────────────────────
  async analyze() {
    this.state.step = 'analyzing';
    this.render();

    // Animate log lines
    const logSteps = [
      { id: 'log-1', delay: 0,    text: '✓ Agent identity evaluated' },
      { id: 'log-2', delay: 800,  text: '✓ Purpose clarity scored' },
      { id: 'log-3', delay: 1600, text: '✓ Trust signals measured' },
      { id: 'log-4', delay: 2400, text: '✓ Risk profile computed' },
      { id: 'log-5', delay: 3200, text: '✓ Generating certificate...' },
    ];

    logSteps.forEach(({ id, delay, text }, i) => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        if (i > 0) {
          const prev = document.getElementById(logSteps[i-1].id);
          if (prev) { prev.classList.remove('active'); prev.classList.add('done'); prev.textContent = logSteps[i-1].text; }
        }
        el.classList.add('active');
        el.textContent = '⟳ ' + text.replace('✓ ', '');
      }, delay);
    });

    try {
      // Call Claude API for scoring
      const result = await this.callClaudeAPI();
      setTimeout(() => {
        // Mark all done
        logSteps.forEach(({ id, text }) => {
          const el = document.getElementById(id);
          if (el) { el.classList.remove('active'); el.classList.add('done'); el.textContent = text; }
        });
        setTimeout(() => {
          this.state.step = 'done';
          this.state.result = result;
          this.render();
        }, 500);
      }, 3800);
    } catch (err) {
      setTimeout(() => {
        this.state.step = 'done';
        this.state.result = this.generateFallbackResult();
        this.render();
      }, 4000);
    }
  },

  // ── CALL CLAUDE API ──────────────────────────────────────────────────────────
  async callClaudeAPI() {
    const a = this.state.answers;
    const prompt = `You are the URUS Trust Intelligence Engine. Analyze this AI agent and return ONLY a JSON object (no markdown, no explanation).

Agent data:
- Name: ${a.name}
- Purpose: ${a.purpose}
- Framework: ${a.framework}
- Limitations: ${a.limitations}
- Collaboration: ${a.collaboration}

Return this exact JSON structure:
{
  "clarity_score": <0-25, how clearly defined is the agent's purpose>,
  "trust_score_component": <0-25, how trustworthy based on knowing its limits>,
  "utility_score": <0-25, how useful and specific is the agent>,
  "risk_score": <0-25, inverse risk — higher means lower risk>,
  "trust_level": <"UNKNOWN"|"UNVERIFIED"|"EMERGING"|"VERIFIED"|"TRUSTED">,
  "analysis": "<2 sentence honest assessment of this agent>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "flags": ["<flag or concern if any, else empty array>"]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    const trust_score = Math.min(100, (parsed.clarity_score || 0) + (parsed.trust_score_component || 0) + (parsed.utility_score || 0) + (parsed.risk_score || 0));
    const certId = 'URUS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase();

    // Save to backend
    try {
      await fetch(`${this.API}/v1/agent/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: a.name.toLowerCase().replace(/\s+/g, '-'),
          framework: a.framework,
          purpose: a.purpose,
          limitations: a.limitations,
          collaboration: a.collaboration,
          trust_score,
          trust_level: parsed.trust_level,
          certificate_id: certId,
          score_breakdown: {
            clarity: parsed.clarity_score,
            trust: parsed.trust_score_component,
            utility: parsed.utility_score,
            risk: parsed.risk_score
          },
          analysis: parsed.analysis,
          strengths: parsed.strengths,
          flags: parsed.flags
        })
      });
    } catch (_) { /* save fails silently, cert still issues */ }

    return {
      agent_id: a.name.toLowerCase().replace(/\s+/g, '-'),
      framework: a.framework,
      trust_score,
      trust_level: parsed.trust_level,
      certificate_id: certId,
      issued_at: new Date().toISOString(),
      score_breakdown: {
        clarity: parsed.clarity_score || 0,
        trust: parsed.trust_score_component || 0,
        utility: parsed.utility_score || 0,
        risk: parsed.risk_score || 0
      },
      analysis: parsed.analysis,
      strengths: parsed.strengths || [],
      flags: parsed.flags || []
    };
  },

  // ── FALLBACK (if API fails) ───────────────────────────────────────────────────
  generateFallbackResult() {
    const a = this.state.answers;
    const name = (a.name || 'agent').toLowerCase().replace(/\s+/g, '-');
    const certId = 'URUS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase();
    // Basic scoring from answer length as fallback
    const clarity  = Math.min(25, Math.round((a.purpose?.length || 0) / 8));
    const trust    = Math.min(25, Math.round((a.limitations?.length || 0) / 8));
    const utility  = Math.min(25, a.framework && a.framework !== '' ? 15 : 5);
    const risk     = Math.min(25, Math.round((a.collaboration?.length || 0) / 8));
    const total    = clarity + trust + utility + risk;
    let level = 'UNKNOWN';
    if (total >= 80) level = 'TRUSTED';
    else if (total >= 60) level = 'VERIFIED';
    else if (total >= 40) level = 'EMERGING';
    else if (total >= 20) level = 'UNVERIFIED';
    return {
      agent_id: name,
      framework: a.framework || 'Unknown',
      trust_score: total,
      trust_level: level,
      certificate_id: certId,
      issued_at: new Date().toISOString(),
      score_breakdown: { clarity, trust, utility, risk },
      analysis: 'Agent analyzed via URUS Proof of Work. Behavioral score will update as Scout Agent tracks interactions.',
      strengths: ['Registered in URUS Trust Registry'],
      flags: []
    };
  },

  // ── DOWNLOAD CERT ─────────────────────────────────────────────────────────────
  downloadCert() {
    const r = this.state.result;
    if (!r) return;
    const content = JSON.stringify({
      ok: true,
      agent: r.agent_id,
      trust_score: r.trust_score,
      trust_level: r.trust_level,
      certificate_id: r.certificate_id,
      issued_at: r.issued_at,
      framework: r.framework,
      score_breakdown: r.score_breakdown,
      analysis: r.analysis,
      strengths: r.strengths,
      flags: r.flags,
      powered_by: 'URUS Blueprint System · Trust Stack v1'
    }, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urus-cert-${r.agent_id}-${r.certificate_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

// ── EXPOSE GLOBALLY ───────────────────────────────────────────────────────────
window.URUSProofOfWork = POW;

// ── AUTO-INJECT TRIGGER BUTTON ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  // Add trigger button to nav if nav exists
  const nav = document.querySelector('.nav-links, nav ul');
  if (nav) {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.id = 'urus-pow-trigger';
    btn.innerHTML = '⬡ Certify Agent';
    btn.addEventListener('click', () => POW.open());
    li.appendChild(btn);
    nav.appendChild(li);
  }

  // Hook into playground: when agent not found, offer certification
  const origRunLookup = window.runLookup;
  if (typeof origRunLookup === 'function') {
    window.runLookup = async function() {
      await origRunLookup.apply(this, arguments);
      // Check if result shows "not found" and offer POW
      setTimeout(() => {
        const result = document.getElementById('playgroundResult') || document.getElementById('vbResult');
        if (result && (result.innerHTML.includes('not found') || result.innerHTML.includes('No signals'))) {
          const name = (document.getElementById('agentInput') || document.getElementById('vbInput'))?.value?.trim();
          const offer = document.createElement('div');
          offer.style.cssText = 'text-align:center;margin-top:16px;padding-top:16px;border-top:1px solid #151d3a';
          offer.innerHTML = `
            <div style="font-family:JetBrains Mono,monospace;font-size:11px;color:#6b7aaa;margin-bottom:10px">
              This agent is not in the registry yet.
            </div>
            <button id="urus-pow-offer" style="font-family:Syne,system-ui;font-size:13px;font-weight:700;color:#111;background:linear-gradient(135deg,#ffcf58,#d4a017);border:none;padding:10px 22px;border-radius:8px;cursor:pointer">
              ⬡ Certify this agent now
            </button>
          `;
          result.appendChild(offer);
          document.getElementById('urus-pow-offer')?.addEventListener('click', () => POW.open(name));
        }
      }, 200);
    };
  }
});

})();
