// ===== Animation 14: Spherical Shell =====
// Field inside (E=0) and outside with switchable Gaussian surface

export class SphericalShell {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.Q = 5;
        this.gaussR = 0.6; // fraction: <1 inside, >=1 outside
        this.showInside = false;

        controlsEl.innerHTML = `
            <label>Q: <input type="range" id="ssQ" min="1" max="10" value="5">
                <span id="ssQVal">5</span></label>
            <label>Gaussian r/R: <input type="range" id="ssGR" min="30" max="200" value="60">
                <span id="ssGRVal">0.6</span></label>
            <button class="btn btn-primary" id="ssToggle">Switch Inside/Outside</button>`;

        document.getElementById('ssQ').addEventListener('input', (e) => {
            this.Q = parseInt(e.target.value);
            document.getElementById('ssQVal').textContent = this.Q;
        });
        document.getElementById('ssGR').addEventListener('input', (e) => {
            this.gaussR = parseInt(e.target.value) / 100;
            document.getElementById('ssGRVal').textContent = this.gaussR.toFixed(2);
        });
        document.getElementById('ssToggle').addEventListener('click', () => {
            this.showInside = !this.showInside;
            this.gaussR = this.showInside ? 0.5 : 1.5;
            document.getElementById('ssGR').value = this.gaussR * 100;
            document.getElementById('ssGRVal').textContent = this.gaussR.toFixed(2);
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
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        const R = 110; // shell radius in pixels
        const gR = this.gaussR * R; // Gaussian surface radius
        const isInside = this.gaussR < 1;

        // Radial field lines (outside only)
        if (!isInside) {
            const nLines = 20;
            for (let i = 0; i < nLines; i++) {
                const angle = (i / nLines) * Math.PI * 2;
                const startR = R + 5;
                const endR = Math.max(W, H) * 0.5;
                ctx.strokeStyle = 'rgba(129,140,248,0.15)'; ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(cx + startR * Math.cos(angle), cy + startR * Math.sin(angle));
                ctx.lineTo(cx + endR * Math.cos(angle), cy + endR * Math.sin(angle));
                ctx.stroke();
                // Flow dots
                const offset = (this.t * 30) % 15;
                for (let d = offset; d < endR - startR; d += 15) {
                    const pr = startR + d;
                    ctx.beginPath();
                    ctx.arc(cx + pr * Math.cos(angle), cy + pr * Math.sin(angle), 1.2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(129,140,248,0.4)'; ctx.fill();
                }
            }
        }

        // Shell circle
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = 'rgba(239,68,68,0.03)'; ctx.fill();

        // Charges on shell
        const nCharges = 20;
        for (let i = 0; i < nCharges; i++) {
            const a = (i / nCharges) * Math.PI * 2 + this.t * 0.2;
            const sx = cx + R * Math.cos(a), sy = cy + R * Math.sin(a);
            ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444'; ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 5px Space Grotesk';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('+', sx, sy);
        }
        ctx.textBaseline = 'alphabetic';

        // Shell label
        ctx.fillStyle = '#ef4444'; ctx.font = '12px Space Grotesk'; ctx.textAlign = 'center';
        ctx.fillText('Charged Shell (R, Q)', cx, cy - R - 20);

        // Gaussian surface (dashed)
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = `rgba(34,197,94,${0.4 + 0.15 * Math.sin(this.t * 2)})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(cx, cy, gR, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(34,197,94,0.03)';
        ctx.beginPath(); ctx.arc(cx, cy, gR, 0, Math.PI * 2); ctx.fill();

        // Gaussian surface label
        ctx.fillStyle = '#22c55e'; ctx.font = '11px Space Grotesk';
        ctx.fillText(`Gaussian Surface (r = ${this.gaussR.toFixed(1)}R)`, cx, cy + gR + 20);

        // E arrows on Gaussian surface
        if (!isInside) {
            const nArrows = 12;
            const aLen = 15 + this.Q * 3;
            for (let i = 0; i < nArrows; i++) {
                const a = (i / nArrows) * Math.PI * 2 + this.t * 0.5;
                const sx = cx + gR * Math.cos(a), sy = cy + gR * Math.sin(a);
                const ex = sx + aLen * Math.cos(a), ey = sy + aLen * Math.sin(a);
                this.drawArrow(ctx, sx, sy, ex, ey, '#818cf8', 1.5);
            }
        }

        // Radius lines
        ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
        if (gR !== R) {
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + gR); ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.fillStyle = '#999'; ctx.font = '11px Space Grotesk';
        ctx.fillText('R', cx + R / 2, cy - 8);
        if (gR !== R) ctx.fillText('r', cx + 12, cy + gR / 2);

        // Result box
        const boxY = H - 100;
        if (isInside) {
            // Inside: E = 0
            ctx.fillStyle = 'rgba(59,130,246,0.1)';
            ctx.beginPath(); ctx.roundRect(cx - 150, boxY, 300, 60, 8); ctx.fill();
            ctx.strokeStyle = 'rgba(59,130,246,0.3)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(cx - 150, boxY, 300, 60, 8); ctx.stroke();

            ctx.fillStyle = '#3b82f6'; ctx.font = 'bold 18px JetBrains Mono'; ctx.textAlign = 'center';
            ctx.fillText('E = 0 (inside shell)', cx, boxY + 25);
            ctx.fillStyle = '#999'; ctx.font = '12px Space Grotesk';
            ctx.fillText('q_enclosed = 0 → Gauss gives E = 0', cx, boxY + 48);

            // Big zero in center
            ctx.fillStyle = `rgba(59,130,246,${0.15 + 0.1 * Math.sin(this.t * 2)})`;
            ctx.font = 'bold 80px Space Grotesk'; ctx.fillText('0', cx, cy + 25);
        } else {
            // Outside: E = kQ/r²
            ctx.fillStyle = 'rgba(34,197,94,0.1)';
            ctx.beginPath(); ctx.roundRect(cx - 180, boxY, 360, 60, 8); ctx.fill();
            ctx.strokeStyle = 'rgba(34,197,94,0.3)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(cx - 180, boxY, 360, 60, 8); ctx.stroke();

            ctx.fillStyle = '#22c55e'; ctx.font = 'bold 16px JetBrains Mono'; ctx.textAlign = 'center';
            ctx.fillText('E = kQ/r²  (like a point charge!)', cx, boxY + 25);
            const eVal = (this.Q / (this.gaussR * this.gaussR)).toFixed(2);
            ctx.fillStyle = '#999'; ctx.font = '12px Space Grotesk';
            ctx.fillText(`q_enclosed = Q → E = ${eVal} (proportional)`, cx, boxY + 48);
        }

        // Center dot
        ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#666'; ctx.fill();
    }
    drawArrow(ctx, x1, y1, x2, y2, color, w) {
        const a = Math.atan2(y2 - y1, x2 - x1), h = 7;
        ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4));
        ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4));
        ctx.closePath(); ctx.fill();
    }
    destroy() { }
}
