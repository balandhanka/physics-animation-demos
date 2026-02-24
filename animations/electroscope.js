// ===== Animation 2: Gold-Leaf Electroscope =====

export class Electroscope {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.chargeLevel = 0;
        this.rodX = 0;
        this.approaching = false;

        controlsEl.innerHTML = `
            <label>Charge:
                <input type="range" id="chargeSlider" min="0" max="100" value="0">
            </label>
            <button class="btn btn-primary" id="approachBtn">Bring Rod Near</button>
            <button class="btn btn-secondary" id="resetEBtn">↻ Reset</button>
        `;

        document.getElementById('chargeSlider').addEventListener('input', (e) => {
            this.chargeLevel = parseInt(e.target.value) / 100;
        });
        document.getElementById('approachBtn').addEventListener('click', () => {
            this.approaching = !this.approaching;
            document.getElementById('approachBtn').textContent =
                this.approaching ? 'Remove Rod' : 'Bring Rod Near';
        });
        document.getElementById('resetEBtn').addEventListener('click', () => {
            this.chargeLevel = 0;
            this.approaching = false;
            document.getElementById('chargeSlider').value = 0;
            document.getElementById('approachBtn').textContent = 'Bring Rod Near';
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
        for (let x = 0; x < W; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        const eqLevel = this.approaching ? Math.min(this.chargeLevel + 0.5, 1) : this.chargeLevel;

        // Glass jar
        const jarX = cx - 80, jarY = cy - 40, jarW = 160, jarH = 200;
        ctx.fillStyle = 'rgba(200, 220, 240, 0.35)';
        ctx.strokeStyle = 'rgba(100, 130, 180, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(jarX, jarY, jarW, jarH, 10);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = '#aaa';
        ctx.font = '11px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Glass Jar', cx, jarY + jarH + 20);

        // Metal rod (vertical)
        ctx.fillStyle = '#a0a0b0';
        ctx.fillRect(cx - 3, jarY - 60, 6, jarH - 40);

        // Metal knob on top
        ctx.beginPath();
        ctx.arc(cx, jarY - 60, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#b0b0c0';
        const grad = ctx.createRadialGradient(cx - 4, jarY - 64, 2, cx, jarY - 60, 14);
        grad.addColorStop(0, '#d0d0e0');
        grad.addColorStop(1, '#808098');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#777';
        ctx.font = '10px Space Grotesk';
        ctx.fillText('Metal Knob', cx, jarY - 82);

        // Gold leaves
        const leafLen = 60;
        const divergeAngle = eqLevel * 0.7; // max ~40°
        const leafBaseY = jarY + jarH - 80;

        // Left leaf
        const l1Angle = Math.PI / 2 + divergeAngle + Math.sin(this.t * 2) * 0.02;
        const l1x = cx + Math.cos(l1Angle) * leafLen;
        const l1y = leafBaseY + Math.sin(l1Angle) * leafLen;

        // Right leaf
        const l2Angle = Math.PI / 2 - divergeAngle - Math.sin(this.t * 2) * 0.02;
        const l2x = cx + Math.cos(l2Angle) * leafLen;
        const l2y = leafBaseY + Math.sin(l2Angle) * leafLen;

        // Draw leaves with gold gradient
        const leafGrad = ctx.createLinearGradient(cx, leafBaseY, cx, leafBaseY + leafLen);
        leafGrad.addColorStop(0, '#daa520');
        leafGrad.addColorStop(1, '#ffd700');

        ctx.strokeStyle = leafGrad;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        // Left leaf
        ctx.beginPath();
        ctx.moveTo(cx, leafBaseY);
        ctx.lineTo(l1x, l1y);
        ctx.stroke();

        // Right leaf
        ctx.beginPath();
        ctx.moveTo(cx, leafBaseY);
        ctx.lineTo(l2x, l2y);
        ctx.stroke();

        // Leaf shapes (thin trapezoids)
        this.drawLeafShape(ctx, cx, leafBaseY, l1x, l1y, l1Angle, '#daa520');
        this.drawLeafShape(ctx, cx, leafBaseY, l2x, l2y, l2Angle, '#daa520');

        // Charges on leaves
        if (eqLevel > 0.1) {
            const numCharges = Math.floor(eqLevel * 5);
            for (let i = 0; i < numCharges; i++) {
                const frac = (i + 1) / (numCharges + 1);
                // Left leaf charges
                const clx = cx + (l1x - cx) * frac;
                const cly = leafBaseY + (l1y - leafBaseY) * frac;
                this.drawCharge(ctx, clx - 8, cly, '+', 5);

                // Right leaf charges
                const crx = cx + (l2x - cx) * frac;
                const cry = leafBaseY + (l2y - leafBaseY) * frac;
                this.drawCharge(ctx, crx + 8, cry, '+', 5);
            }
        }

        // Charged rod approaching
        if (this.approaching) {
            const rodTargetX = cx + 60;
            this.rodX += (rodTargetX - this.rodX) * 0.05;

            // Rod
            ctx.fillStyle = '#8b9dc3';
            this.roundRect(ctx, this.rodX, jarY - 80, 120, 22, 8);
            ctx.fill();

            // Charges on rod
            for (let i = 0; i < 5; i++) {
                this.drawCharge(ctx, this.rodX + 15 + i * 22, jarY - 69, '+', 6);
            }

            ctx.fillStyle = '#999';
            ctx.font = '11px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText('Charged Rod', this.rodX + 60, jarY - 90);
        } else {
            this.rodX = cx + 200;
        }

        // Divergence indicator
        const angleDeg = Math.round(divergeAngle * 180 / Math.PI);
        ctx.fillStyle = '#ccc';
        ctx.font = '13px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText(`Leaf Divergence: ${angleDeg}°`, cx, H - 40);

        if (eqLevel > 0.5) {
            ctx.fillStyle = '#22c55e';
            ctx.fillText('✦ Charge Detected!', cx, H - 60);
        }
    }

    drawLeafShape(ctx, x1, y1, x2, y2, angle, color) {
        const perpAngle = angle + Math.PI / 2;
        const halfW = 6;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(x1 + Math.cos(perpAngle) * 2, y1 + Math.sin(perpAngle) * 2);
        ctx.lineTo(x2 + Math.cos(perpAngle) * halfW, y2 + Math.sin(perpAngle) * halfW);
        ctx.lineTo(x2 - Math.cos(perpAngle) * halfW, y2 - Math.sin(perpAngle) * halfW);
        ctx.lineTo(x1 - Math.cos(perpAngle) * 2, y1 - Math.sin(perpAngle) * 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    drawCharge(ctx, x, y, sign, r) {
        const color = sign === '+' ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${r}px Space Grotesk`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sign, x, y);
    }

    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    destroy() { }
}
