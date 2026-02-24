// ===== Animation 8: Electric Flux =====
// Tilting surface through uniform field, flux value updates

export class ElectricFlux {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.angle = 0; // angle in degrees
        this.fieldStrength = 5;
        this.autoRotate = false;

        controlsEl.innerHTML = `
            <label>Angle θ: <input type="range" id="fluxAngle" min="0" max="90" value="0" step="1">
                <span id="fluxAngleVal">0°</span>
            </label>
            <label>Field E: <input type="range" id="fluxE" min="1" max="10" value="5">
                <span id="fluxEVal">5</span>
            </label>
            <button class="btn btn-primary" id="autoRotateBtn">⟳ Auto Rotate</button>
        `;

        document.getElementById('fluxAngle').addEventListener('input', (e) => {
            this.angle = parseInt(e.target.value);
            document.getElementById('fluxAngleVal').textContent = this.angle + '°';
        });
        document.getElementById('fluxE').addEventListener('input', (e) => {
            this.fieldStrength = parseInt(e.target.value);
            document.getElementById('fluxEVal').textContent = this.fieldStrength;
        });
        document.getElementById('autoRotateBtn').addEventListener('click', () => {
            this.autoRotate = !this.autoRotate;
            document.getElementById('autoRotateBtn').textContent = this.autoRotate ? '⏸ Stop' : '⟳ Auto Rotate';
        });
    }

    resize() { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;
        ctx.clearRect(0, 0, W, H);
        this.t += 0.016;

        // Auto rotate
        if (this.autoRotate) {
            this.angle = (this.angle + 0.3) % 91;
            const slider = document.getElementById('fluxAngle');
            if (slider) slider.value = Math.round(this.angle);
            const label = document.getElementById('fluxAngleVal');
            if (label) label.textContent = Math.round(this.angle) + '°';
        }

        // Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

        const thetaRad = this.angle * Math.PI / 180;
        const E = this.fieldStrength;
        const A = 1;
        const flux = E * A * Math.cos(thetaRad);

        // Draw uniform field lines (horizontal)
        const numLines = 12;
        const fieldColor = `rgba(129, 140, 248, ${0.3 + 0.2 * (E / 10)})`;
        for (let i = 0; i < numLines; i++) {
            const y = cy - 150 + (i / (numLines - 1)) * 300;
            const flowOffset = (this.t * 80) % 40;

            ctx.strokeStyle = fieldColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(W - 50, y);
            ctx.stroke();

            // Flow dots
            for (let dx = flowOffset; dx < W - 100; dx += 40) {
                ctx.beginPath();
                ctx.arc(50 + dx, y, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(129, 140, 248, 0.7)';
                ctx.fill();
            }

            // Arrowheads along lines
            for (let ax = 200; ax < W - 100; ax += 200) {
                this.drawSmallArrow(ctx, ax, y, 0, fieldColor);
            }
        }

        // Draw tilted surface
        ctx.save();
        ctx.translate(cx, cy);

        const surfaceW = 160;
        const surfaceH = 120;

        // Surface (tilted rectangle in pseudo-3D)
        const cosT = Math.cos(thetaRad);
        const sinT = Math.sin(thetaRad);

        // Draw surface as a trapezoid for perspective
        const perspFactor = cosT;
        const topW = surfaceW;
        const depth = surfaceH * sinT * 0.6;

        ctx.fillStyle = 'rgba(34, 197, 94, 0.12)';
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(-topW / 2, -surfaceH / 2 * cosT);
        ctx.lineTo(topW / 2, -surfaceH / 2 * cosT);
        ctx.lineTo(topW / 2, surfaceH / 2 * cosT);
        ctx.lineTo(-topW / 2, surfaceH / 2 * cosT);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Surface label
        ctx.fillStyle = '#22c55e';
        ctx.font = '12px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Surface A', 0, surfaceH / 2 * cosT + 25);

        // Normal vector (area vector)
        const normalLen = 80;
        const normalX = normalLen * sinT;
        const normalY = -normalLen * cosT;

        // Draw area vector dA
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(normalX, normalY);
        ctx.stroke();

        // Arrowhead for normal
        const nAngle = Math.atan2(normalY, normalX);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(normalX, normalY);
        ctx.lineTo(normalX - 10 * Math.cos(nAngle - 0.4), normalY - 10 * Math.sin(nAngle - 0.4));
        ctx.lineTo(normalX - 10 * Math.cos(nAngle + 0.4), normalY - 10 * Math.sin(nAngle + 0.4));
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 14px Space Grotesk';
        ctx.fillText('n̂', normalX + 15, normalY - 5);

        // Angle arc
        if (this.angle > 0) {
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            const arcR = 35;
            const startAngle = -Math.PI / 2;
            const endAngle = -Math.PI / 2 + thetaRad;
            ctx.arc(0, 0, arcR, startAngle, endAngle);
            ctx.stroke();

            const midAngle = (startAngle + endAngle) / 2;
            ctx.fillStyle = '#22c55e';
            ctx.font = '13px Space Grotesk';
            ctx.fillText('θ', arcR * 1.3 * Math.cos(midAngle), arcR * 1.3 * Math.sin(midAngle));
        }

        ctx.restore();

        // E vector label
        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 14px Space Grotesk';
        ctx.textAlign = 'left';
        ctx.fillText('E⃗ →', W - 100, cy - 160);

        // Flux formula and value
        ctx.fillStyle = '#818cf8';
        ctx.font = '15px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('Φ = E · A · cos θ', cx, H - 65);

        const fluxColor = flux > 0 ? '#22c55e' : flux < 0 ? '#ef4444' : '#888';
        ctx.fillStyle = fluxColor;
        ctx.font = 'bold 18px JetBrains Mono';
        ctx.fillText(`Φ = ${flux.toFixed(2)}`, cx, H - 35);

        // Side info
        ctx.fillStyle = '#999';
        ctx.font = '11px Space Grotesk';
        ctx.textAlign = 'right';
        ctx.fillText(`θ = ${Math.round(this.angle)}°`, W - 30, 30);
        ctx.fillText(`cos θ = ${Math.cos(thetaRad).toFixed(3)}`, W - 30, 48);
    }

    drawSmallArrow(ctx, x, y, angle, color) {
        const len = 8;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x + len, y);
        ctx.lineTo(x, y - 4);
        ctx.lineTo(x, y + 4);
        ctx.closePath();
        ctx.fill();
    }

    destroy() { }
}
