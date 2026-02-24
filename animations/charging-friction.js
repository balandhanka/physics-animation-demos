// ===== Animation 1: Charging by Friction =====
// Glass rod + silk / Plastic rod + fur → charge transfer, attract/repel

export class ChargingFriction {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.phase = 0; // 0=rubbing, 1=charged, 2=interact
        this.particles = [];
        this.mode = 'glass-silk';

        // Controls
        controlsEl.innerHTML = `
            <label>Material:
                <select id="frictionMode">
                    <option value="glass-silk">Glass + Silk</option>
                    <option value="plastic-fur">Plastic + Fur</option>
                    <option value="both">Both Rods</option>
                </select>
            </label>
            <button class="btn btn-primary" id="resetBtn">↻ Reset</button>
        `;
        document.getElementById('frictionMode').addEventListener('change', (e) => {
            this.mode = e.target.value;
            this.reset();
        });
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        this.reset();
    }

    reset() {
        this.t = 0;
        this.phase = 0;
        this.particles = [];
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random() * 40 - 20,
                y: Math.random() * 80 - 40,
                vx: 0, vy: 0,
                charge: Math.random() > 0.5 ? 1 : -1,
                transferred: false,
                size: 2 + Math.random() * 2
            });
        }
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas, t } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;
        ctx.clearRect(0, 0, W, H);

        // Background grid
        this.drawGrid(ctx, W, H);

        this.t += 0.016;
        const phase = this.t < 3 ? 0 : this.t < 5 ? 1 : 2;
        this.phase = phase;

        if (this.mode === 'both') {
            this.drawBothRods(ctx, cx, cy, W, H);
        } else {
            this.drawSingleSetup(ctx, cx, cy, W, H);
        }
    }

    drawGrid(ctx, W, H) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
    }

    drawSingleSetup(ctx, cx, cy, W, H) {
        const isGlass = this.mode === 'glass-silk';
        const rodColor = isGlass ? '#8b9dc3' : '#d4a574';
        const clothColor = isGlass ? '#e8d5e0' : '#8b6f47';
        const rodLabel = isGlass ? 'Glass Rod' : 'Plastic Rod';
        const clothLabel = isGlass ? 'Silk' : 'Fur';

        // Phase 0: Rubbing
        if (this.phase === 0) {
            const rubOffset = Math.sin(this.t * 6) * 30;

            // Rod
            this.drawRod(ctx, cx - 80, cy - 20, 200, 30, rodColor, rodLabel);

            // Cloth rubbing
            ctx.fillStyle = clothColor;
            ctx.globalAlpha = 0.8;
            this.roundRect(ctx, cx - 80 + rubOffset, cy + 20, 150, 20, 6);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Cloth label
            ctx.fillStyle = '#999';
            ctx.font = '12px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText(clothLabel, cx - 5 + rubOffset, cy + 55);

            // Sparks
            for (let i = 0; i < 5; i++) {
                const sx = cx - 60 + Math.random() * 160;
                const sy = cy + 15 + Math.random() * 10;
                ctx.beginPath();
                ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 220, 100, ${0.5 + Math.sin(this.t * 10 + i) * 0.5})`;
                ctx.fill();
            }

            // Instruction
            this.drawLabel(ctx, cx, H - 50, '🔄 Rubbing in progress... electrons are transferring', 14);

        } else if (this.phase === 1) {
            // Charged rod
            const chargeSign = isGlass ? '+' : '−';
            const chargeColor = isGlass ? '#ef4444' : '#3b82f6';

            this.drawRod(ctx, cx - 100, cy - 15, 200, 30, rodColor, rodLabel);

            // Show charges on rod
            for (let i = 0; i < 8; i++) {
                const px = cx - 80 + i * 25;
                const py = cy + Math.sin(this.t * 3 + i) * 3;
                ctx.beginPath();
                ctx.arc(px, py, 8, 0, Math.PI * 2);
                ctx.fillStyle = chargeColor;
                ctx.shadowColor = chargeColor;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px Space Grotesk';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(chargeSign, px, py);
            }

            this.drawLabel(ctx, cx, H - 50, `Rod is now ${isGlass ? 'positively' : 'negatively'} charged!`, 14);

        } else {
            // Phase 2: Show attraction/repulsion
            const chargeSign = isGlass ? '+' : '−';
            const chargeColor = isGlass ? '#ef4444' : '#3b82f6';
            const testSign = '+';
            const testColor = '#ef4444';

            // Main rod
            const rodX = cx - 150;
            this.drawRod(ctx, rodX, cy - 60, 180, 28, rodColor, rodLabel);
            for (let i = 0; i < 6; i++) {
                const px = rodX + 20 + i * 25;
                ctx.beginPath();
                ctx.arc(px, cy - 46, 7, 0, Math.PI * 2);
                ctx.fillStyle = chargeColor;
                ctx.shadowColor = chargeColor;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 9px Space Grotesk';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(chargeSign, px, cy - 46);
            }

            // Test charge approaching
            const approach = Math.sin(this.t * 1.5) * 30;
            const testX = cx + 120 + (isGlass ? -approach : approach);
            const testY = cy - 46;

            ctx.beginPath();
            ctx.arc(testX, testY, 14, 0, Math.PI * 2);
            ctx.fillStyle = testColor;
            ctx.shadowColor = testColor;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(testSign, testX, testY);

            // Force arrow
            const forceDir = isGlass ? 1 : -1;
            this.drawArrow(ctx, testX + forceDir * 25, testY, testX + forceDir * 60, testY,
                isGlass ? '#ef4444' : '#22c55e', 2);

            ctx.fillStyle = '#666';
            ctx.font = '12px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText(isGlass ? 'Repulsion (like charges)' : 'Attraction (unlike charges)',
                testX + forceDir * 40, testY + 30);

            // Bottom label
            const label = isGlass ?
                'Positive test charge is REPELLED by positive rod' :
                'Positive test charge is ATTRACTED to negative rod';
            this.drawLabel(ctx, cx, H - 50, label, 14);
        }

        // Phase indicator
        this.drawPhaseIndicator(ctx, W, 30);
    }

    drawBothRods(ctx, cx, cy, W, H) {
        const separation = Math.sin(this.t * 1.2) * 20;

        // Glass rod (positive)
        const r1y = cy - 60 + (this.phase >= 2 ? separation : 0);
        this.drawRod(ctx, cx - 120, r1y - 14, 180, 28, '#8b9dc3', 'Glass (+)');
        for (let i = 0; i < 6; i++) {
            const px = cx - 100 + i * 25;
            ctx.beginPath();
            ctx.arc(px, r1y, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', px, r1y);
        }

        // Plastic rod (negative)
        const r2y = cy + 60 - (this.phase >= 2 ? separation : 0);
        this.drawRod(ctx, cx - 120, r2y - 14, 180, 28, '#d4a574', 'Plastic (−)');
        for (let i = 0; i < 6; i++) {
            const px = cx - 100 + i * 25;
            ctx.beginPath();
            ctx.arc(px, r2y, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#3b82f6';
            ctx.shadowColor = '#3b82f6';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('−', px, r2y);
        }

        // Force arrows between them
        if (this.phase >= 2) {
            this.drawArrow(ctx, cx, r1y + 20, cx, r2y - 20, '#22c55e', 2.5);
            ctx.fillStyle = '#22c55e';
            ctx.font = '13px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText('Attraction', cx + 60, cy);
        }

        this.drawLabel(ctx, cx, H - 50,
            this.phase < 2 ? 'Two rods being charged...' : 'Unlike charges attract each other!', 14);
        this.drawPhaseIndicator(ctx, W, 30);
    }

    drawRod(ctx, x, y, w, h, color, label) {
        ctx.fillStyle = color;
        ctx.beginPath();
        const r = h / 2;
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(x + r, y + h);
        ctx.arc(x + r, y + r, r, Math.PI / 2, -Math.PI / 2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (label) {
            ctx.fillStyle = '#aaa';
            ctx.font = '11px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText(label, x + w / 2, y - 8);
        }
    }

    drawArrow(ctx, x1, y1, x2, y2, color, width) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 10;

        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
        ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();
    }

    drawLabel(ctx, x, y, text, size) {
        ctx.fillStyle = '#ccc';
        ctx.font = `${size}px Space Grotesk`;
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y);
    }

    drawPhaseIndicator(ctx, W, y) {
        const labels = ['Rubbing', 'Charged', 'Interact'];
        const dotX = W / 2 - 60;
        labels.forEach((label, i) => {
            const x = dotX + i * 60;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = i <= this.phase ?
                (i === this.phase ? '#6366f1' : '#22c55e') : 'rgba(255,255,255,0.1)';
            if (i === this.phase) {
                ctx.shadowColor = '#6366f1';
                ctx.shadowBlur = 8;
            }
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = i <= this.phase ? '#ccc' : '#666';
            ctx.font = '10px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, y + 18);
        });
    }

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    destroy() { }
}
