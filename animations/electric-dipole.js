// ===== Animation 9: Electric Dipole =====
// Field on axial and equatorial points with vector decomposition

export class ElectricDipole {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.view = 'both';
        this.separation = 80;

        controlsEl.innerHTML = `
            <label>View:
                <select id="dipView">
                    <option value="both">Both Fields</option>
                    <option value="axial">Axial Point</option>
                    <option value="equatorial">Equatorial Point</option>
                    <option value="fieldmap">Full Field Map</option>
                </select>
            </label>
            <label>2a: <input type="range" id="dipSep" min="40" max="160" value="80">
            </label>
        `;

        document.getElementById('dipView').addEventListener('change', (e) => {
            this.view = e.target.value;
        });
        document.getElementById('dipSep').addEventListener('input', (e) => {
            this.separation = parseInt(e.target.value);
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

        const a = this.separation / 2;
        const qx1 = cx - a; // -q
        const qx2 = cx + a; // +q

        // Dipole moment arrow
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(qx1, cy);
        ctx.lineTo(qx2, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // p arrow (from -q to +q)
        this.drawArrow(ctx, qx1, cy - 35, qx2, cy - 35, '#f59e0b', 2);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 14px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('p⃗', cx, cy - 45);

        // 2a label
        ctx.fillStyle = '#999';
        ctx.font = '11px Space Grotesk';
        ctx.fillText(`2a = ${this.separation}`, cx, cy + 40);

        // Draw charges
        this.drawCharge(ctx, qx1, cy, -1, '−q');
        this.drawCharge(ctx, qx2, cy, 1, '+q');

        if (this.view === 'axial' || this.view === 'both') {
            this.drawAxialPoint(ctx, cx, cy, qx1, qx2, a, W, H);
        }
        if (this.view === 'equatorial' || this.view === 'both') {
            this.drawEquatorialPoint(ctx, cx, cy, qx1, qx2, a, W, H);
        }
        if (this.view === 'fieldmap') {
            this.drawFieldMap(ctx, cx, cy, a, W, H);
        }

        // Formula
        ctx.fillStyle = '#818cf8';
        ctx.font = '13px JetBrains Mono';
        ctx.textAlign = 'center';
        if (this.view === 'axial') {
            ctx.fillText('E_axial = 2kp/r³  (along p⃗)', cx, H - 25);
        } else if (this.view === 'equatorial') {
            ctx.fillText('E_equatorial = kp/r³  (opposite to p⃗)', cx, H - 25);
        } else {
            ctx.fillText('p⃗ = q × 2a     |     E_axial ≈ 2kp/r³     |     E_eq ≈ kp/r³', cx, H - 25);
        }
    }

    drawAxialPoint(ctx, cx, cy, qx1, qx2, a, W, H) {
        const axialDist = 160;
        const px = qx2 + axialDist;
        const py = cy;

        // Point P on axis
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#22c55e';
        ctx.font = '12px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('P (axial)', px, py - 14);

        // E+ and E- arrows
        const pulse = 1 + Math.sin(this.t * 3) * 0.1;
        const e1Len = 60 * pulse;
        const e2Len = 35 * pulse;

        // E+ (larger, pointing right)
        this.drawArrow(ctx, px, py - 8, px + e1Len, py - 8, '#ef4444', 2);
        ctx.fillStyle = '#ef4444';
        ctx.font = '10px Space Grotesk';
        ctx.fillText('E₊', px + e1Len / 2, py - 20);

        // E- (smaller, pointing left)
        this.drawArrow(ctx, px, py + 8, px - e2Len, py + 8, '#3b82f6', 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('E₋', px - e2Len / 2, py + 22);

        // Resultant
        const netLen = (e1Len - e2Len);
        this.drawArrow(ctx, px + 5, py, px + 5 + netLen, py, '#22c55e', 3);
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 11px Space Grotesk';
        ctx.fillText('E_net', px + 5 + netLen / 2, py - 12);

        // r label
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.moveTo(cx, cy + 55);
        ctx.lineTo(px, cy + 55);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#999';
        ctx.font = '11px Space Grotesk';
        ctx.fillText('r', (cx + px) / 2, cy + 50);
    }

    drawEquatorialPoint(ctx, cx, cy, qx1, qx2, a, W, H) {
        const eqDist = 130;
        const px = cx;
        const py = cy - eqDist;

        // Point P on equatorial
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7';
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#a855f7';
        ctx.font = '12px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('P (equatorial)', px + 70, py);

        // E vectors from each charge
        const pulse = 1 + Math.sin(this.t * 3 + 1) * 0.1;

        // Lines from charges to P
        ctx.setLineDash([3, 5]);
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(qx1, cy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(qx2, cy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.setLineDash([]);

        // E+ and E- at P
        const angle1 = Math.atan2(py - cy, px - qx2);
        const angle2 = Math.atan2(py - cy, px - qx1);
        const eLen = 45 * pulse;

        // E from +q (pointing away)
        this.drawArrow(ctx, px, py,
            px + eLen * Math.cos(angle1),
            py + eLen * Math.sin(angle1),
            '#ef4444', 2);

        // E from -q (pointing toward -q)
        this.drawArrow(ctx, px, py,
            px - eLen * Math.cos(angle2),
            py - eLen * Math.sin(angle2),
            '#3b82f6', 2);

        // Net E (points opposite to p, i.e., leftward)
        this.drawArrow(ctx, px, py, px - 30, py, '#a855f7', 3);
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 11px Space Grotesk';
        ctx.fillText('E_net', px - 45, py - 8);
    }

    drawFieldMap(ctx, cx, cy, a, W, H) {
        // Draw field lines for dipole
        const numLines = 12;
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            const startX = (cx + a) + 22 * Math.cos(angle);
            const startY = cy + 22 * Math.sin(angle);
            this.traceFieldLine(ctx, startX, startY, cx, cy, a, W, H);
        }
    }

    traceFieldLine(ctx, startX, startY, cx, cy, a, W, H) {
        const dt = 2.5;
        const maxSteps = 400;
        const points = [{ x: startX, y: startY }];
        let x = startX, y = startY;

        for (let i = 0; i < maxSteps; i++) {
            // Field from +q
            let dx = x - (cx + a), dy = y - cy;
            let d1 = Math.hypot(dx, dy);
            if (d1 < 18) break;
            let ex = dx / (d1 * d1 * d1), ey = dy / (d1 * d1 * d1);

            // Field from -q
            dx = x - (cx - a); dy = y - cy;
            let d2 = Math.hypot(dx, dy);
            if (d2 < 18) { points.push({ x, y }); break; }
            ex -= dx / (d2 * d2 * d2);
            ey -= dy / (d2 * d2 * d2);

            const eMag = Math.hypot(ex, ey);
            if (eMag < 1e-8) break;
            x += dt * ex / eMag;
            y += dt * ey / eMag;

            if (x < -20 || x > W + 20 || y < -20 || y > H + 20) break;
            points.push({ x, y });
        }

        if (points.length < 3) return;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (const p of points) ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Flow dots
        const offset = (this.t * 60) % 25;
        for (let d = offset; d < points.length; d += 25) {
            const idx = Math.floor(d);
            if (idx >= points.length) break;
            ctx.beginPath();
            ctx.arc(points[idx].x, points[idx].y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(129, 140, 248, 0.7)';
            ctx.fill();
        }
    }

    drawCharge(ctx, x, y, q, label) {
        const r = 18;
        const color = q >= 0 ? '#ef4444' : '#3b82f6';
        const grad = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, r);
        grad.addColorStop(0, color);
        grad.addColorStop(1, q >= 0 ? '#991b1b' : '#1e3a8a');

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(q >= 0 ? '+' : '−', x, y);
        ctx.textBaseline = 'alphabetic';

        ctx.fillStyle = '#bbb';
        ctx.font = '11px Space Grotesk';
        ctx.fillText(label, x, y + r + 15);
    }

    drawArrow(ctx, x1, y1, x2, y2, color, width) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 9;
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
