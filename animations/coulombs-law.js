// ===== Animation 4: Coulomb's Law =====
// Two charges with adjustable magnitude & distance, force arrows scale with 1/r²

export class CoulombsLaw {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.q1 = 5;
        this.q2 = 3;
        this.separation = 200;
        this.dragging = null;
        this.charges = [
            { x: 0, y: 0, q: 5, sign: '+' },
            { x: 200, y: 0, q: 3, sign: '+' }
        ];

        controlsEl.innerHTML = `
            <label>q₁: <input type="range" id="q1Slider" min="-10" max="10" value="5" step="1">
                <span id="q1Val">+5</span>
            </label>
            <label>q₂: <input type="range" id="q2Slider" min="-10" max="10" value="3" step="1">
                <span id="q2Val">+3</span>
            </label>
            <button class="btn btn-secondary" id="resetCBtn">↻ Reset</button>
        `;

        const updateCharges = () => {
            this.q1 = parseInt(document.getElementById('q1Slider').value);
            this.q2 = parseInt(document.getElementById('q2Slider').value);
            document.getElementById('q1Val').textContent = (this.q1 >= 0 ? '+' : '') + this.q1;
            document.getElementById('q2Val').textContent = (this.q2 >= 0 ? '+' : '') + this.q2;
        };

        document.getElementById('q1Slider').addEventListener('input', updateCharges);
        document.getElementById('q2Slider').addEventListener('input', updateCharges);
        document.getElementById('resetCBtn').addEventListener('click', () => {
            this.q1 = 5; this.q2 = 3;
            document.getElementById('q1Slider').value = 5;
            document.getElementById('q2Slider').value = 3;
            updateCharges();
        });

        // Drag interaction
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', () => this.dragging = null);
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        const c1x = cx - this.separation / 2;
        const c2x = cx + this.separation / 2;

        if (Math.hypot(mx - c1x, my - cy) < 30) this.dragging = 0;
        else if (Math.hypot(mx - c2x, my - cy) < 30) this.dragging = 1;
    }

    onMouseMove(e) {
        if (this.dragging === null) return;
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const cx = this.canvas.width / 2;

        if (this.dragging === 0) {
            this.separation = Math.max(80, Math.min(500, 2 * (cx - mx)));
        } else {
            this.separation = Math.max(80, Math.min(500, 2 * (mx - cx)));
        }
    }

    resize() { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;
        ctx.clearRect(0, 0, W, H);
        this.t += 0.016;

        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        const r = this.separation;
        const c1x = cx - r / 2;
        const c2x = cx + r / 2;

        // Distance line
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c1x, cy);
        ctx.lineTo(c2x, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Distance label
        ctx.fillStyle = '#999';
        ctx.font = '12px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText(`r = ${(r / 40).toFixed(1)} units`, cx, cy - 50);

        // Drag hint
        ctx.fillStyle = '#aaa';
        ctx.font = '10px Space Grotesk';
        ctx.fillText('← Drag charges to change distance →', cx, cy - 65);

        // Calculate force
        const k = 9;
        const forceMag = k * Math.abs(this.q1) * Math.abs(this.q2) / Math.pow(r / 40, 2);
        const isRepulsive = (this.q1 * this.q2 > 0);
        const forceLen = Math.min(forceMag * 3, 120);

        // Draw charges
        this.drawPointCharge(ctx, c1x, cy, this.q1, 'q₁');
        this.drawPointCharge(ctx, c2x, cy, this.q2, 'q₂');

        // Force arrows
        const pulseScale = 1 + 0.05 * Math.sin(this.t * 4);
        const adjustedLen = forceLen * pulseScale;

        if (this.q1 !== 0 && this.q2 !== 0) {
            if (isRepulsive) {
                // Forces pointing away
                this.drawForceArrow(ctx, c1x, cy, c1x - adjustedLen, cy, '#ef4444');
                this.drawForceArrow(ctx, c2x, cy, c2x + adjustedLen, cy, '#ef4444');

                ctx.fillStyle = '#ef4444';
                ctx.font = '11px Space Grotesk';
                ctx.textAlign = 'center';
                ctx.fillText('F₁₂', c1x - adjustedLen - 15, cy - 5);
                ctx.fillText('F₂₁', c2x + adjustedLen + 15, cy - 5);
            } else {
                // Forces pointing toward each other
                this.drawForceArrow(ctx, c1x, cy, c1x + adjustedLen, cy, '#22c55e');
                this.drawForceArrow(ctx, c2x, cy, c2x - adjustedLen, cy, '#22c55e');

                ctx.fillStyle = '#22c55e';
                ctx.font = '11px Space Grotesk';
                ctx.textAlign = 'center';
                ctx.fillText('F₁₂', c1x + adjustedLen + 15, cy - 5);
                ctx.fillText('F₂₁', c2x - adjustedLen - 15, cy - 5);
            }
        }

        // Formula display
        ctx.fillStyle = '#818cf8';
        ctx.font = '16px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`F = k · |q₁·q₂| / r²`, cx, H - 80);

        const forceVal = forceMag.toFixed(2);
        ctx.fillStyle = isRepulsive ? '#ef4444' : '#22c55e';
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.fillText(`F = ${forceVal} N  (${isRepulsive ? 'Repulsive' : 'Attractive'})`, cx, H - 55);

        // Charge values
        ctx.fillStyle = '#666';
        ctx.font = '12px Space Grotesk';
        ctx.fillText(`q₁ = ${this.q1 >= 0 ? '+' : ''}${this.q1} μC    q₂ = ${this.q2 >= 0 ? '+' : ''}${this.q2} μC`, cx, H - 35);
    }

    drawPointCharge(ctx, x, y, q, label) {
        const r = 22 + Math.abs(q) * 1.5;
        const color = q >= 0 ? '#ef4444' : '#3b82f6';
        const sign = q >= 0 ? '+' : '−';

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = q >= 0 ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)';
        ctx.fill();

        // Main circle
        const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
        grad.addColorStop(0, color);
        grad.addColorStop(1, q >= 0 ? '#b91c1c' : '#1d4ed8');
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Sign
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${r * 0.8}px Space Grotesk`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sign, x, y);

        // Label
        ctx.fillStyle = '#aaa';
        ctx.font = '13px Space Grotesk';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(label, x, y + r + 20);
    }

    drawForceArrow(ctx, x1, y1, x2, y2, color) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 12;

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
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

    destroy() {
        // Clean up event listeners would go here in a full implementation
    }
}
