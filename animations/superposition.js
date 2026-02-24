// ===== Animation 5: Superposition Principle =====
// Vector addition of forces from multiple charges

export class Superposition {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.numCharges = 3;

        this.charges = [
            { x: 0.3, y: 0.5, q: 4 },
            { x: 0.7, y: 0.3, q: -3 },
            { x: 0.7, y: 0.7, q: 5 }
        ];
        this.testCharge = { x: 0.5, y: 0.5, q: 1 };
        this.dragging = null;

        controlsEl.innerHTML = `
            <label>Charges:
                <select id="numCharges">
                    <option value="2">2 Charges</option>
                    <option value="3" selected>3 Charges</option>
                    <option value="4">4 Charges</option>
                </select>
            </label>
            <button class="btn btn-secondary" id="resetSBtn">↻ Reset</button>
        `;

        document.getElementById('numCharges').addEventListener('change', (e) => {
            this.numCharges = parseInt(e.target.value);
            if (this.numCharges >= 4 && this.charges.length < 4) {
                this.charges.push({ x: 0.3, y: 0.3, q: -2 });
            }
        });
        document.getElementById('resetSBtn').addEventListener('click', () => {
            this.charges = [
                { x: 0.3, y: 0.5, q: 4 },
                { x: 0.7, y: 0.3, q: -3 },
                { x: 0.7, y: 0.7, q: 5 },
                { x: 0.3, y: 0.3, q: -2 }
            ];
            this.testCharge = { x: 0.5, y: 0.5, q: 1 };
        });

        canvas.addEventListener('mousedown', (e) => this.onDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMove(e));
        canvas.addEventListener('mouseup', () => this.dragging = null);
    }

    onDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / this.canvas.width;
        const my = (e.clientY - rect.top) / this.canvas.height;

        if (Math.hypot(mx - this.testCharge.x, my - this.testCharge.y) < 0.04) {
            this.dragging = 'test';
            return;
        }
        for (let i = 0; i < this.numCharges; i++) {
            if (Math.hypot(mx - this.charges[i].x, my - this.charges[i].y) < 0.04) {
                this.dragging = i;
                return;
            }
        }
    }

    onMove(e) {
        if (this.dragging === null) return;
        const rect = this.canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / this.canvas.width;
        const my = (e.clientY - rect.top) / this.canvas.height;
        const target = this.dragging === 'test' ? this.testCharge : this.charges[this.dragging];
        target.x = Math.max(0.05, Math.min(0.95, mx));
        target.y = Math.max(0.05, Math.min(0.95, my));
    }

    resize() { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        this.t += 0.016;

        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        const tx = this.testCharge.x * W;
        const ty = this.testCharge.y * H;

        let totalFx = 0, totalFy = 0;
        const forces = [];

        // Calculate and draw individual forces
        const colors = ['#f59e0b', '#a855f7', '#06b6d4', '#ec4899'];
        for (let i = 0; i < this.numCharges; i++) {
            const c = this.charges[i];
            const cx = c.x * W;
            const cy = c.y * H;

            // Draw charge
            this.drawCharge(ctx, cx, cy, c.q, `q${i + 1}`);

            // Dashed line to test charge
            ctx.setLineDash([3, 5]);
            ctx.strokeStyle = 'rgba(255,255,255,0.18)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(cx, cy);
            ctx.stroke();
            ctx.setLineDash([]);

            // Force calculation
            const dx = tx - cx;
            const dy = ty - cy;
            const dist = Math.hypot(dx, dy);
            if (dist < 30) continue;

            const k = 5000;
            const fMag = k * Math.abs(c.q) * this.testCharge.q / (dist * dist);
            const dir = c.q * this.testCharge.q > 0 ? 1 : -1;
            const fx = dir * fMag * (dx / dist);
            const fy = dir * fMag * (dy / dist);

            totalFx += fx;
            totalFy += fy;
            forces.push({ fx, fy, color: colors[i], label: `F${i + 1}` });

            // Draw individual force arrow
            const arrowLen = Math.min(Math.hypot(fx, fy) * 50, 100);
            const fAngle = Math.atan2(fy, fx);
            this.drawArrow(ctx, tx, ty,
                tx + arrowLen * Math.cos(fAngle),
                ty + arrowLen * Math.sin(fAngle),
                colors[i], 2, `F${i + 1}`);
        }

        // Draw resultant force
        const resultLen = Math.min(Math.hypot(totalFx, totalFy) * 50, 150);
        const resultAngle = Math.atan2(totalFy, totalFx);
        if (resultLen > 5) {
            this.drawArrow(ctx, tx, ty,
                tx + resultLen * Math.cos(resultAngle),
                ty + resultLen * Math.sin(resultAngle),
                '#22c55e', 3.5, 'F_net');
        }

        // Draw test charge last (on top)
        this.drawCharge(ctx, tx, ty, this.testCharge.q, 'q₀', true);

        // Legend
        ctx.fillStyle = '#ccc';
        ctx.font = '13px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('F_net = F₁ + F₂ + F₃ + ...  (vector sum)', W / 2, H - 35);

        ctx.fillStyle = '#aaa';
        ctx.font = '10px Space Grotesk';
        ctx.fillText('Drag any charge to reposition', W / 2, H - 15);
    }

    drawCharge(ctx, x, y, q, label, isTest) {
        const r = isTest ? 18 : 16 + Math.abs(q) * 1.2;
        const color = q >= 0 ? '#ef4444' : '#3b82f6';

        // Glow
        if (isTest) {
            ctx.beginPath();
            ctx.arc(x, y, r + 12, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = isTest ? '#22c55e' : color;
        ctx.shadowColor = isTest ? '#22c55e' : color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = `bold ${r * 0.7}px Space Grotesk`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(q >= 0 ? '+' : '−', x, y);

        ctx.fillStyle = '#aaa';
        ctx.font = '11px Space Grotesk';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(label, x, y - r - 8);
    }

    drawArrow(ctx, x1, y1, x2, y2, color, width, label) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 10;

        ctx.strokeStyle = color;
        ctx.lineWidth = width;
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

        if (label) {
            ctx.fillStyle = color;
            ctx.font = 'bold 10px Space Grotesk';
            ctx.textAlign = 'center';
            const lx = x2 + 12 * Math.cos(angle + Math.PI / 2);
            const ly = y2 + 12 * Math.sin(angle + Math.PI / 2);
            ctx.fillText(label, lx, ly);
        }
    }

    destroy() { }
}
