// ===== Animation 7: Electric Field Lines =====
// Flowing animated lines for single charge, dipole, and like charges

export class FieldLines {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.config = 'positive';

        controlsEl.innerHTML = `
            <label>Configuration:
                <select id="flConfig">
                    <option value="positive">Single +</option>
                    <option value="negative">Single −</option>
                    <option value="dipole">Dipole (+/−)</option>
                    <option value="like-positive">Two + Charges</option>
                    <option value="like-negative">Two − Charges</option>
                </select>
            </label>
        `;

        document.getElementById('flConfig').addEventListener('change', (e) => {
            this.config = e.target.value;
        });
    }

    resize() { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;
        ctx.clearRect(0, 0, W, H);
        this.t += 0.008;

        // Grid
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        const charges = this.getCharges(cx, cy, W);

        // Draw field lines
        const numLines = 16;
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * Math.PI * 2;
            // Start from each positive charge (or toward each negative)
            for (const c of charges) {
                if (c.q > 0) {
                    const startX = c.x + 25 * Math.cos(angle);
                    const startY = c.y + 25 * Math.sin(angle);
                    this.traceFieldLine(ctx, startX, startY, charges, 1, W, H);
                }
            }

            // If all negative, draw lines coming in
            if (charges.every(c => c.q < 0)) {
                for (const c of charges) {
                    const edgeDist = 250;
                    const startX = c.x + edgeDist * Math.cos(angle);
                    const startY = c.y + edgeDist * Math.sin(angle);
                    this.traceFieldLine(ctx, startX, startY, charges, 1, W, H);
                }
            }
        }

        // Draw charges on top
        for (const c of charges) {
            this.drawCharge(ctx, c.x, c.y, c.q);
        }

        // Config label
        const labels = {
            'positive': 'Single Positive Charge – Lines radiate outward',
            'negative': 'Single Negative Charge – Lines point inward',
            'dipole': 'Electric Dipole – Lines from + to −',
            'like-positive': 'Two Positive Charges – Lines repel at midpoint',
            'like-negative': 'Two Negative Charges – Lines converge from infinity'
        };
        ctx.fillStyle = '#ccc';
        ctx.font = '13px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText(labels[this.config] || '', cx, H - 25);
    }

    getCharges(cx, cy, W) {
        const sep = Math.min(W * 0.2, 120);
        switch (this.config) {
            case 'positive': return [{ x: cx, y: cy, q: 5 }];
            case 'negative': return [{ x: cx, y: cy, q: -5 }];
            case 'dipole': return [{ x: cx - sep, y: cy, q: 5 }, { x: cx + sep, y: cy, q: -5 }];
            case 'like-positive': return [{ x: cx - sep, y: cy, q: 5 }, { x: cx + sep, y: cy, q: 5 }];
            case 'like-negative': return [{ x: cx - sep, y: cy, q: -5 }, { x: cx + sep, y: cy, q: -5 }];
            default: return [{ x: cx, y: cy, q: 5 }];
        }
    }

    traceFieldLine(ctx, startX, startY, charges, dir, W, H) {
        const dt = 3;
        const maxSteps = 300;
        const points = [{ x: startX, y: startY }];

        let x = startX, y = startY;

        for (let step = 0; step < maxSteps; step++) {
            let ex = 0, ey = 0;
            for (const c of charges) {
                const dx = x - c.x;
                const dy = y - c.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 20) return this.renderLine(ctx, points, charges); // Hit a charge
                const e = c.q / (dist * dist);
                ex += e * dx / dist;
                ey += e * dy / dist;
            }

            const eMag = Math.hypot(ex, ey);
            if (eMag < 0.00001) break;

            x += dir * dt * ex / eMag;
            y += dir * dt * ey / eMag;

            if (x < -20 || x > W + 20 || y < -20 || y > H + 20) break;

            points.push({ x, y });
        }

        this.renderLine(ctx, points, charges);
    }

    renderLine(ctx, points, charges) {
        if (points.length < 3) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        // Gradient along line
        const grad = ctx.createLinearGradient(
            points[0].x, points[0].y,
            points[points.length - 1].x, points[points.length - 1].y
        );
        grad.addColorStop(0, 'rgba(129, 140, 248, 0.6)');
        grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
        grad.addColorStop(1, 'rgba(79, 70, 229, 0.15)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Animated flow dots
        const dotSpacing = 30;
        const offset = (this.t * 100) % dotSpacing;
        for (let d = offset; d < points.length; d += dotSpacing) {
            const idx = Math.floor(d);
            if (idx >= points.length) break;
            const p = points[idx];
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(129, 140, 248, 0.8)';
            ctx.fill();
        }

        // Arrowheads every N points
        const arrowInterval = Math.floor(points.length / 3);
        for (let i = arrowInterval; i < points.length - 5; i += arrowInterval) {
            this.drawSmallArrow(ctx, points[i], points[i + 3]);
        }
    }

    drawSmallArrow(ctx, p1, p2) {
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const len = 6;
        ctx.fillStyle = 'rgba(129, 140, 248, 0.7)';
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p2.x - len * Math.cos(angle - 0.5), p2.y - len * Math.sin(angle - 0.5));
        ctx.lineTo(p2.x - len * Math.cos(angle + 0.5), p2.y - len * Math.sin(angle + 0.5));
        ctx.closePath();
        ctx.fill();
    }

    drawCharge(ctx, x, y, q) {
        const r = 20;
        const color = q >= 0 ? '#ef4444' : '#3b82f6';

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, r);
        grad.addColorStop(0, color);
        grad.addColorStop(1, q >= 0 ? '#991b1b' : '#1e3a8a');
        ctx.fillStyle = grad;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(q >= 0 ? '+' : '−', x, y);
        ctx.textBaseline = 'alphabetic';
    }

    destroy() { }
}
