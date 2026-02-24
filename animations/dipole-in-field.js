// ===== Animation 10: Dipole in Uniform External Field =====
// Torque animation with rotation

export class DipoleInField {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.theta = 45; // degrees
        this.fieldE = 5;
        this.animating = false;
        this.angularVel = 0;

        controlsEl.innerHTML = `
            <label>θ: <input type="range" id="dfAngle" min="0" max="180" value="45" step="1">
                <span id="dfAngleVal">45°</span>
            </label>
            <label>E: <input type="range" id="dfE" min="1" max="10" value="5">
            </label>
            <button class="btn btn-primary" id="dfRelease">Release Dipole</button>
            <button class="btn btn-secondary" id="dfReset">↻ Reset</button>
        `;

        document.getElementById('dfAngle').addEventListener('input', (e) => {
            if (!this.animating) {
                this.theta = parseInt(e.target.value);
                document.getElementById('dfAngleVal').textContent = this.theta + '°';
            }
        });
        document.getElementById('dfE').addEventListener('input', (e) => {
            this.fieldE = parseInt(e.target.value);
        });
        document.getElementById('dfRelease').addEventListener('click', () => {
            this.animating = true;
            this.angularVel = 0;
        });
        document.getElementById('dfReset').addEventListener('click', () => {
            this.animating = false;
            this.theta = 45;
            this.angularVel = 0;
            document.getElementById('dfAngle').value = 45;
            document.getElementById('dfAngleVal').textContent = '45°';
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

        // Physics simulation
        if (this.animating) {
            const thetaRad = this.theta * Math.PI / 180;
            const torque = -this.fieldE * 2 * Math.sin(thetaRad);
            this.angularVel += torque * 0.016;
            this.angularVel *= 0.97; // damping
            this.theta += this.angularVel * 0.016 * 180 / Math.PI;

            if (this.theta < 0) { this.theta = 0; this.angularVel *= -0.3; }
            if (this.theta > 180) { this.theta = 180; this.angularVel *= -0.3; }

            const slider = document.getElementById('dfAngle');
            if (slider) slider.value = Math.round(this.theta);
            const label = document.getElementById('dfAngleVal');
            if (label) label.textContent = Math.round(this.theta) + '°';
        }

        const thetaRad = this.theta * Math.PI / 180;

        // Uniform field arrows (horizontal)
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.2)';
        ctx.lineWidth = 1;
        for (let y = cy - 180; y <= cy + 180; y += 40) {
            ctx.beginPath();
            ctx.moveTo(80, y);
            ctx.lineTo(W - 80, y);
            ctx.stroke();
            this.drawSmallArrow(ctx, W - 120, y, '#818cf8');
        }

        ctx.fillStyle = '#818cf8';
        ctx.font = 'bold 16px Space Grotesk';
        ctx.textAlign = 'right';
        ctx.fillText('E⃗ →', W - 40, cy - 180);

        // Dipole
        const dipoleLen = 70;
        const qPlusX = cx + dipoleLen * Math.cos(thetaRad);
        const qPlusY = cy - dipoleLen * Math.sin(thetaRad);
        const qMinusX = cx - dipoleLen * Math.cos(thetaRad);
        const qMinusY = cy + dipoleLen * Math.sin(thetaRad);

        // Dipole bar
        ctx.strokeStyle = 'rgba(200,200,220,0.4)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(qMinusX, qMinusY);
        ctx.lineTo(qPlusX, qPlusY);
        ctx.stroke();

        // Charges
        this.drawCharge(ctx, qPlusX, qPlusY, 1);
        this.drawCharge(ctx, qMinusX, qMinusY, -1);

        // Force arrows on charges
        const forceLen = this.fieldE * 5;
        // F on +q (along E)
        this.drawForceArrow(ctx, qPlusX, qPlusY, qPlusX + forceLen, qPlusY, '#ef4444', 'F₊');
        // F on -q (opposite to E)
        this.drawForceArrow(ctx, qMinusX, qMinusY, qMinusX - forceLen, qMinusY, '#3b82f6', 'F₋');

        // Torque arc
        if (this.theta > 5 && this.theta < 175) {
            const torqueR = 50;
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const startA = 0;
            const endA = -thetaRad;
            ctx.arc(cx, cy, torqueR, startA, endA, true);
            ctx.stroke();

            // Torque arrow
            const tAngle = endA;
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            const tx = cx + torqueR * Math.cos(tAngle);
            const ty = cy + torqueR * Math.sin(tAngle);
            ctx.arc(tx, ty, 4, 0, Math.PI * 2);
            ctx.fill();

            // θ label
            const midA = thetaRad / 2;
            ctx.fillStyle = '#22c55e';
            ctx.font = '14px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText('θ', cx + (torqueR + 15) * Math.cos(-midA), cy + (torqueR + 15) * Math.sin(-midA));

            // τ label
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 13px Space Grotesk';
            ctx.fillText('τ⃗ ⊙', cx, cy - torqueR - 15);
        }

        // Dipole moment p arrow
        this.drawPArrow(ctx, cx, cy, thetaRad, 40);

        // Torque value
        const torqueVal = (this.fieldE * Math.sin(thetaRad)).toFixed(2);
        ctx.fillStyle = '#22c55e';
        ctx.font = '15px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`τ = pE sin θ = ${torqueVal}`, cx, H - 55);

        // Status
        ctx.fillStyle = '#818cf8';
        ctx.font = '13px JetBrains Mono';
        ctx.fillText(`θ = ${Math.round(this.theta)}°   |   sin θ = ${Math.sin(thetaRad).toFixed(3)}`, cx, H - 30);

        // Equilibrium indicator
        if (Math.abs(this.theta) < 3 || Math.abs(this.theta - 180) < 3) {
            const isStable = Math.abs(this.theta) < 3;
            ctx.fillStyle = isStable ? '#22c55e' : '#ef4444';
            ctx.font = '12px Space Grotesk';
            ctx.fillText(isStable ? '✓ Stable Equilibrium' : '✗ Unstable Equilibrium', cx, H - 80);
        }
    }

    drawPArrow(ctx, x, y, theta, len) {
        const px = x + len * Math.cos(theta);
        const py = y - len * Math.sin(theta);
        const mx = x - len * Math.cos(theta);
        const my = y + len * Math.sin(theta);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.setLineDash([]);

        const angle = Math.atan2(py - my, px - mx);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - 8 * Math.cos(angle - 0.4), py - 8 * Math.sin(angle - 0.4));
        ctx.lineTo(px - 8 * Math.cos(angle + 0.4), py - 8 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();

        ctx.font = 'bold 12px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('p⃗', px + 15 * Math.cos(angle + 0.5), py + 15 * Math.sin(angle + 0.5));
    }

    drawCharge(ctx, x, y, q) {
        const r = 16;
        const color = q >= 0 ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(q >= 0 ? '+' : '−', x, y);
        ctx.textBaseline = 'alphabetic';
    }

    drawForceArrow(ctx, x1, y1, x2, y2, color, label) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - 9 * Math.cos(angle - 0.4), y2 - 9 * Math.sin(angle - 0.4));
        ctx.lineTo(x2 - 9 * Math.cos(angle + 0.4), y2 - 9 * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();

        ctx.font = '10px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText(label, x2 + 5 * Math.cos(angle + Math.PI / 2), y2 + 5 * Math.sin(angle + Math.PI / 2) - 10);
    }

    drawSmallArrow(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(x + 8, y);
        ctx.lineTo(x, y - 4);
        ctx.lineTo(x, y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    destroy() { }
}
