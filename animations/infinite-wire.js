// ===== Animation 12: Field of Infinite Wire =====
// Cylindrical Gaussian surface with radial field arrows

export class InfiniteWire {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.lambda = 5;
        this.gaussR = 100;

        controlsEl.innerHTML = `
            <label>λ: <input type="range" id="iwL" min="1" max="10" value="5">
                <span id="iwLVal">5</span>
            </label>
            <label>Radius r: <input type="range" id="iwR" min="40" max="180" value="100">
            </label>
        `;

        document.getElementById('iwL').addEventListener('input', (e) => {
            this.lambda = parseInt(e.target.value);
            document.getElementById('iwLVal').textContent = this.lambda;
        });
        document.getElementById('iwR').addEventListener('input', (e) => {
            this.gaussR = parseInt(e.target.value);
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

        const R = this.gaussR;

        // Wire (vertical line through center)
        ctx.strokeStyle = '#a0a0c0';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, 20);
        ctx.lineTo(cx, H - 20);
        ctx.stroke();

        // Glow on wire
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(cx, 20);
        ctx.lineTo(cx, H - 20);
        ctx.stroke();

        // Charges on wire
        const chargeSpacing = 30;
        const chargeOffset = (this.t * 20) % chargeSpacing;
        for (let y = 20 - chargeOffset; y < H; y += chargeSpacing) {
            ctx.beginPath();
            ctx.arc(cx, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 6px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('+', cx, y);
        }
        ctx.textBaseline = 'alphabetic';

        // Wire labels
        ctx.fillStyle = '#aaa';
        ctx.font = '12px Space Grotesk';
        ctx.textAlign = 'left';
        ctx.fillText('∞ wire', cx + 10, 35);
        ctx.fillText(`λ = ${this.lambda} C/m`, cx + 10, 55);

        // Cylindrical Gaussian surface (shown as ellipse)
        const ellipseH = 200;

        // Top ellipse
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy - ellipseH / 2, R, R * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Bottom ellipse
        ctx.beginPath();
        ctx.ellipse(cx, cy + ellipseH / 2, R, R * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Sides
        ctx.beginPath();
        ctx.moveTo(cx - R, cy - ellipseH / 2);
        ctx.lineTo(cx - R, cy + ellipseH / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + R, cy - ellipseH / 2);
        ctx.lineTo(cx + R, cy + ellipseH / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Fill cylinder lightly
        ctx.fillStyle = 'rgba(34, 197, 94, 0.03)';
        ctx.fillRect(cx - R, cy - ellipseH / 2, R * 2, ellipseH);

        // Gaussian surface label
        ctx.fillStyle = '#22c55e';
        ctx.font = '11px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Gaussian Cylinder', cx, cy - ellipseH / 2 - 20);

        // Radial E arrows
        const numArrows = 12;
        for (let i = 0; i < numArrows; i++) {
            const fy = cy - ellipseH / 2 + 15 + (i / (numArrows - 1)) * (ellipseH - 30);
            const arrowLen = 30 + (this.lambda / R) * 1500;
            const pulse = 1 + 0.08 * Math.sin(this.t * 3 + i * 0.5);

            // Right arrow
            this.drawArrow(ctx, cx + R, fy, cx + R + arrowLen * pulse, fy, '#818cf8', 1.5);
            // Left arrow
            this.drawArrow(ctx, cx - R, fy, cx - R - arrowLen * pulse, fy, '#818cf8', 1.5);
        }

        // E label
        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 14px Space Grotesk';
        ctx.textAlign = 'left';
        ctx.fillText('E⃗', cx + R + 45, cy);

        // r radius line
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + R, cy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#999';
        ctx.font = '12px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('r', cx + R / 2, cy - 10);

        // L label (height)
        ctx.fillStyle = '#22c55e';
        ctx.font = '12px Space Grotesk';
        ctx.textAlign = 'right';
        ctx.fillText('L', cx - R - 20, cy);

        // Flux through surfaces
        ctx.fillStyle = '#f59e0b';
        ctx.font = '11px Space Grotesk';
        ctx.textAlign = 'left';
        const infoX = 30;
        ctx.fillText('Flux through curved surface: Φ = E × 2πrL', infoX, H - 80);
        ctx.fillText('Flux through flat caps: 0 (E ⊥ dA)', infoX, H - 60);

        // Formula
        ctx.fillStyle = '#818cf8';
        ctx.font = '16px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('E = λ / (2πε₀r)', cx, H - 30);

        // E value
        const eVal = (this.lambda / (2 * Math.PI * this.gaussR / 40)).toFixed(2);
        ctx.fillStyle = '#22c55e';
        ctx.font = '13px JetBrains Mono';
        ctx.fillText(`E = ${eVal} N/C   (r = ${(this.gaussR / 40).toFixed(1)})`, cx, H - 10);
    }

    drawArrow(ctx, x1, y1, x2, y2, color, width) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 8;
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
