// ===== Animation 6: Electric Field of Point Charges =====
// Field vectors around a point charge, adjustable magnitude

export class ElectricField {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.Q = 5;
        this.showTestCharge = false;
        this.testPos = { x: 0.65, y: 0.4 };
        this.dragging = false;

        controlsEl.innerHTML = `
            <label>Q: <input type="range" id="efQ" min="-10" max="10" value="5" step="1">
                <span id="efQVal">+5</span>
            </label>
            <label><input type="checkbox" id="efTest"> Show Test Charge</label>
            <button class="btn btn-secondary" id="resetEF">↻ Reset</button>
        `;

        document.getElementById('efQ').addEventListener('input', (e) => {
            this.Q = parseInt(e.target.value);
            document.getElementById('efQVal').textContent = (this.Q >= 0 ? '+' : '') + this.Q;
        });
        document.getElementById('efTest').addEventListener('change', (e) => {
            this.showTestCharge = e.target.checked;
        });
        document.getElementById('resetEF').addEventListener('click', () => {
            this.Q = 5;
            document.getElementById('efQ').value = 5;
            document.getElementById('efQVal').textContent = '+5';
        });

        canvas.addEventListener('mousedown', (e) => {
            if (!this.showTestCharge) return;
            const rect = canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / canvas.width;
            const my = (e.clientY - rect.top) / canvas.height;
            if (Math.hypot(mx - this.testPos.x, my - this.testPos.y) < 0.05) this.dragging = true;
        });
        canvas.addEventListener('mousemove', (e) => {
            if (!this.dragging) return;
            const rect = canvas.getBoundingClientRect();
            this.testPos.x = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / canvas.width));
            this.testPos.y = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / canvas.height));
        });
        canvas.addEventListener('mouseup', () => this.dragging = false);
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
            ctx.fillText('Set Q ≠ 0 to see the electric field', cx, cy);
            return;
        }

        // Draw field arrows on a grid around the source charge
        const gridSpacing = 60;
        for (let gx = gridSpacing; gx < W; gx += gridSpacing) {
            for (let gy = gridSpacing; gy < H; gy += gridSpacing) {
                const dx = gx - cx;
                const dy = gy - cy;
                const dist = Math.hypot(dx, dy);

                if (dist < 40) continue; // Skip inside charge

                const k = 8000;
                const eMag = k * Math.abs(this.Q) / (dist * dist);
                const eLen = Math.min(eMag, gridSpacing * 0.4);
                const dir = this.Q >= 0 ? 1 : -1;
                const angle = Math.atan2(dy, dx);

                const ax = gx;
                const ay = gy;
                const bx = gx + dir * eLen * Math.cos(angle);
                const by = gy + dir * eLen * Math.sin(angle);

                // Color based on strength
                const intensity = Math.min(eMag / 3, 1);
                const r = Math.round(99 + intensity * 156);
                const g = Math.round(102 + intensity * 50);
                const b = Math.round(241);
                const alpha = 0.3 + intensity * 0.5;

                this.drawArrow(ctx, ax, ay, bx, by, `rgba(${r},${g},${b},${alpha})`, 1.5);
            }
        }

        // Source charge
        this.drawCharge(ctx, cx, cy, this.Q, 'Q');

        // Test charge
        if (this.showTestCharge) {
            const tx = this.testPos.x * W;
            const ty = this.testPos.y * H;

            // Calculate E at test charge position
            const dx = tx - cx;
            const dy = ty - cy;
            const dist = Math.hypot(dx, dy);

            if (dist > 40) {
                const k = 8000;
                const eMag = k * Math.abs(this.Q) / (dist * dist);
                const dir = this.Q >= 0 ? 1 : -1;
                const angle = Math.atan2(dy, dx);
                const eLen = Math.min(eMag * 40, 100);

                // E arrow
                this.drawArrow(ctx, tx, ty,
                    tx + dir * eLen * Math.cos(angle),
                    ty + dir * eLen * Math.sin(angle),
                    '#22c55e', 3);

                // Force arrow
                this.drawArrow(ctx, tx, ty,
                    tx + dir * eLen * 0.8 * Math.cos(angle),
                    ty + dir * eLen * 0.8 * Math.sin(angle),
                    '#f59e0b', 2);

                // Labels
                ctx.fillStyle = '#22c55e';
                ctx.font = 'bold 12px Space Grotesk';
                ctx.textAlign = 'left';
                ctx.fillText('E⃗', tx + dir * eLen * Math.cos(angle) + 10,
                    ty + dir * eLen * Math.sin(angle));

                ctx.fillStyle = '#f59e0b';
                ctx.fillText('F⃗ = q₀E⃗', tx + dir * eLen * 0.8 * Math.cos(angle) + 10,
                    ty + dir * eLen * 0.8 * Math.sin(angle) + 15);

                // E magnitude
                ctx.fillStyle = '#22c55e';
                ctx.font = '12px JetBrains Mono';
                ctx.textAlign = 'center';
                ctx.fillText(`|E| = ${eMag.toFixed(1)} N/C`, tx, ty + 35);
            }

            // Test charge circle
            ctx.beginPath();
            ctx.arc(tx, ty, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#22c55e';
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 8px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('q₀', tx, ty);
            ctx.textBaseline = 'alphabetic';

            ctx.fillStyle = '#aaa';
            ctx.font = '10px Space Grotesk';
            ctx.fillText('Drag test charge', tx, ty - 18);
        }

        // Formula
        ctx.fillStyle = '#818cf8';
        ctx.font = '14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('E⃗ = (1/4πε₀) · Q/r²  r̂', cx, H - 30);
    }

    drawCharge(ctx, x, y, q, label) {
        const r = 24;
        const color = q >= 0 ? '#ef4444' : '#3b82f6';

        ctx.beginPath();
        ctx.arc(x, y, r + 10, 0, Math.PI * 2);
        ctx.fillStyle = q >= 0 ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)';
        ctx.fill();

        const grad = ctx.createRadialGradient(x - 5, y - 5, 3, x, y, r);
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

        ctx.fillStyle = '#aaa';
        ctx.font = '12px Space Grotesk';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(label, x, y - r - 10);
    }

    drawArrow(ctx, x1, y1, x2, y2, color, width) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const len = Math.hypot(x2 - x1, y2 - y1);
        const headLen = Math.min(8, len * 0.4);

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
    }

    destroy() { }
}
