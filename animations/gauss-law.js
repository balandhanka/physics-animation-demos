// ===== Animation 11: Gauss's Law =====
// Gaussian surface around charge, flux arrows, formula overlay

export class GaussLaw {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.Q = 5;
        this.gaussR = 120;
        this.showFieldLines = true;

        controlsEl.innerHTML = `
            <label>Q: <input type="range" id="glQ" min="-10" max="10" value="5" step="1">
                <span id="glQVal">+5</span>
            </label>
            <label>Radius: <input type="range" id="glR" min="60" max="200" value="120">
            </label>
            <label><input type="checkbox" id="glFL" checked> Field Lines</label>
        `;

        document.getElementById('glQ').addEventListener('input', (e) => {
            this.Q = parseInt(e.target.value);
            document.getElementById('glQVal').textContent = (this.Q >= 0 ? '+' : '') + this.Q;
        });
        document.getElementById('glR').addEventListener('input', (e) => {
            this.gaussR = parseInt(e.target.value);
        });
        document.getElementById('glFL').addEventListener('change', (e) => {
            this.showFieldLines = e.target.checked;
        });
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
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        if (this.Q === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '16px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText('Q = 0 → No net flux through any closed surface', cx, cy);
            return;
        }

        const R = this.gaussR;

        // Field lines
        if (this.showFieldLines) {
            const numLines = 16;
            for (let i = 0; i < numLines; i++) {
                const angle = (i / numLines) * Math.PI * 2;
                const len = Math.max(W, H) * 0.6;
                const dir = this.Q >= 0 ? 1 : -1;

                // Animated flow
                const flowOffset = (this.t * 40) % 20;

                ctx.strokeStyle = 'rgba(129, 140, 248, 0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cx + 20 * Math.cos(angle), cy + 20 * Math.sin(angle));
                ctx.lineTo(cx + dir * len * Math.cos(angle), cy + dir * len * Math.sin(angle));
                ctx.stroke();

                // Flow dots
                for (let d = flowOffset; d < len; d += 20) {
                    const px = cx + (20 + d * dir) * Math.cos(angle);
                    const py = cy + (20 + d * dir) * Math.sin(angle);
                    const distFromCenter = Math.hypot(px - cx, py - cy);
                    if (distFromCenter > len) continue;
                    ctx.beginPath();
                    ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(129, 140, 248, 0.5)';
                    ctx.fill();
                }
            }
        }

        // Gaussian surface (dashed circle)
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = `rgba(34, 197, 94, ${0.4 + 0.15 * Math.sin(this.t * 2)})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Fill Gaussian surface lightly
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.03)';
        ctx.fill();

        // Label Gaussian surface
        ctx.fillStyle = '#22c55e';
        ctx.font = '12px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Gaussian Surface (S)', cx, cy - R - 12);

        // dA arrows (outward normals on surface)
        const numDA = 12;
        for (let i = 0; i < numDA; i++) {
            const angle = (i / numDA) * Math.PI * 2 + this.t * 0.3;
            const sx = cx + R * Math.cos(angle);
            const sy = cy + R * Math.sin(angle);
            const arrowLen = 20;
            const ex = sx + arrowLen * Math.cos(angle);
            const ey = sy + arrowLen * Math.sin(angle);

            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            // Arrowhead
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - 5 * Math.cos(angle - 0.5), ey - 5 * Math.sin(angle - 0.5));
            ctx.lineTo(ex - 5 * Math.cos(angle + 0.5), ey - 5 * Math.sin(angle + 0.5));
            ctx.closePath();
            ctx.fill();
        }

        // dA label
        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px Space Grotesk';
        ctx.textAlign = 'left';
        ctx.fillText('dA⃗', cx + R + 25, cy - 5);

        // Source charge
        this.drawCharge(ctx, cx, cy, this.Q);

        // q_enclosed label
        ctx.fillStyle = '#aaa';
        ctx.font = '13px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText(`q_enclosed = ${this.Q >= 0 ? '+' : ''}${this.Q} μC`, cx, cy + R + 30);

        // Radius label
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + R, cy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#999';
        ctx.font = '11px Space Grotesk';
        ctx.fillText('r', cx + R / 2, cy + 15);

        // Formula
        ctx.fillStyle = '#818cf8';
        ctx.font = '16px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('∮ E⃗ · dA⃗ = q_enclosed / ε₀', cx, H - 55);

        // Flux value
        const flux = this.Q; // proportional
        ctx.fillStyle = flux >= 0 ? '#22c55e' : '#ef4444';
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.fillText(`Φ = ${flux >= 0 ? '+' : ''}${flux} / ε₀`, cx, H - 30);
    }

    drawCharge(ctx, x, y, q) {
        const r = 22;
        const color = q >= 0 ? '#ef4444' : '#3b82f6';
        const grad = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, r);
        grad.addColorStop(0, color);
        grad.addColorStop(1, q >= 0 ? '#991b1b' : '#1e3a8a');

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(q >= 0 ? '+' : '−', x, y);
        ctx.textBaseline = 'alphabetic';

        ctx.fillStyle = '#aaa';
        ctx.font = '12px Space Grotesk';
        ctx.fillText('Q', x, y - r - 10);
    }

    destroy() { }
}
