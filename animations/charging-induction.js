// ===== Animation 3: Charging by Induction =====
// 5-step process: neutral spheres → rod near → separate → ground → charged

export class ChargingInduction {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.step = 0; // 0-4

        controlsEl.innerHTML = `
            <div class="step-indicators" id="stepDots"></div>
            <button class="btn btn-secondary" id="prevStep">◀ Prev</button>
            <button class="btn btn-primary" id="nextStep">Next ▶</button>
            <button class="btn btn-secondary" id="autoPlay">▶ Auto Play</button>
        `;
        this.autoPlaying = false;
        this.autoTimer = 0;

        document.getElementById('prevStep').addEventListener('click', () => {
            this.step = Math.max(0, this.step - 1);
            this.updateDots();
        });
        document.getElementById('nextStep').addEventListener('click', () => {
            this.step = Math.min(4, this.step + 1);
            this.updateDots();
        });
        document.getElementById('autoPlay').addEventListener('click', () => {
            this.autoPlaying = !this.autoPlaying;
            document.getElementById('autoPlay').textContent = this.autoPlaying ? '⏸ Pause' : '▶ Auto Play';
            if (this.autoPlaying) this.step = 0;
        });
        this.updateDots();
    }

    updateDots() {
        const dotsEl = document.getElementById('stepDots');
        if (!dotsEl) return;
        dotsEl.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            const dot = document.createElement('div');
            dot.className = 'step-dot' + (i === this.step ? ' active' : i < this.step ? ' done' : '');
            dotsEl.appendChild(dot);
        }
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

        // Auto play logic
        if (this.autoPlaying) {
            this.autoTimer += 0.016;
            if (this.autoTimer > 3) {
                this.autoTimer = 0;
                this.step = (this.step + 1) % 5;
                this.updateDots();
            }
        }

        const stepDescs = [
            'Step 1: Two neutral metal spheres touching each other',
            'Step 2: Bring positively charged rod near sphere A',
            'Step 3: Separate the two spheres while rod is nearby',
            'Step 4: Remove the charged rod',
            'Step 5: Spheres are now charged by induction!'
        ];

        // Draw based on step
        const sphereR = 40;
        const sep = this.step >= 2 ? 80 : 0;
        const sphereAx = cx - 60 - sep / 2;
        const sphereBx = cx + 60 + sep / 2;
        const sphereY = cy + 20;

        // Sphere A
        this.drawSphere(ctx, sphereAx, sphereY, sphereR, 'A');
        // Sphere B
        this.drawSphere(ctx, sphereBx, sphereY, sphereR, 'B');

        // Contact line when touching
        if (this.step < 2) {
            ctx.strokeStyle = 'rgba(160, 160, 176, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sphereAx + sphereR, sphereY);
            ctx.lineTo(sphereBx - sphereR, sphereY);
            ctx.stroke();
        }

        // Charged rod
        if (this.step >= 1 && this.step <= 2) {
            const rodX = sphereAx - 100 - 20 * Math.sin(this.t * 2);
            ctx.fillStyle = '#8b9dc3';
            this.roundRect(ctx, rodX - 60, sphereY - 60, 20, 120, 6);
            ctx.fill();

            // Charges on rod
            for (let i = 0; i < 5; i++) {
                const py = sphereY - 40 + i * 20;
                this.drawCharge(ctx, rodX - 50, py, '+', 6);
            }

            ctx.fillStyle = '#999';
            ctx.font = '11px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText('Charged Rod (+)', rodX - 50, sphereY - 75);
        }

        // Charge distribution on spheres
        if (this.step === 0) {
            // Neutral - show mixed charges
            this.drawNeutralCharges(ctx, sphereAx, sphereY, sphereR);
            this.drawNeutralCharges(ctx, sphereBx, sphereY, sphereR);
        } else if (this.step === 1 || this.step === 2) {
            // Induction: negative attracted to A (near rod), positive pushed to B
            this.drawInducedCharges(ctx, sphereAx, sphereY, sphereR, 'negative');
            this.drawInducedCharges(ctx, sphereBx, sphereY, sphereR, 'positive');
        } else if (this.step === 3) {
            // Separated, charges remain
            this.drawInducedCharges(ctx, sphereAx, sphereY, sphereR, 'negative');
            this.drawInducedCharges(ctx, sphereBx, sphereY, sphereR, 'positive');
        } else {
            // Final: A is negative, B is positive
            this.drawFinalCharges(ctx, sphereAx, sphereY, sphereR, 'negative');
            this.drawFinalCharges(ctx, sphereBx, sphereY, sphereR, 'positive');

            // Glow effect
            ctx.beginPath();
            ctx.arc(sphereAx, sphereY, sphereR + 8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 + 0.1 * Math.sin(this.t * 3)})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(sphereBx, sphereY, sphereR + 8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + 0.1 * Math.sin(this.t * 3)})`;
            ctx.stroke();
        }

        // Ground symbol (step 2)
        if (this.step === 2) {
            const gx = sphereBx;
            const gy = sphereY + sphereR + 30;
            ctx.strokeStyle = '#22c55e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(gx, sphereY + sphereR);
            ctx.lineTo(gx, gy);
            ctx.stroke();
            // Ground lines
            for (let i = 0; i < 3; i++) {
                const w = 20 - i * 6;
                ctx.beginPath();
                ctx.moveTo(gx - w, gy + i * 6);
                ctx.lineTo(gx + w, gy + i * 6);
                ctx.stroke();
            }
            ctx.fillStyle = '#22c55e';
            ctx.font = '11px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText('Ground', gx, gy + 28);
        }

        // Step description
        ctx.fillStyle = '#ccc';
        ctx.font = '14px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText(stepDescs[this.step], cx, H - 40);

        // Step number
        ctx.fillStyle = '#6366f1';
        ctx.font = 'bold 16px Space Grotesk';
        ctx.fillText(`Step ${this.step + 1} of 5`, cx, 35);
    }

    drawSphere(ctx, x, y, r, label) {
        const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
        grad.addColorStop(0, 'rgba(210, 215, 235, 0.9)');
        grad.addColorStop(1, 'rgba(170, 175, 200, 0.7)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(130, 140, 170, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#aaa';
        ctx.font = 'bold 16px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);
    }

    drawNeutralCharges(ctx, x, y, r) {
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + this.t * 0.3;
            const cr = r * 0.6;
            const cx = x + Math.cos(angle) * cr;
            const cy = y + Math.sin(angle) * cr;
            this.drawCharge(ctx, cx, cy, i % 2 === 0 ? '+' : '−', 4);
        }
    }

    drawInducedCharges(ctx, x, y, r, type) {
        const sign = type === 'negative' ? '−' : '+';
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 + this.t * 0.5;
            const cr = r * 0.55;
            const cx = x + Math.cos(angle) * cr;
            const cy = y + Math.sin(angle) * cr;
            this.drawCharge(ctx, cx, cy, sign, 5);
        }
    }

    drawFinalCharges(ctx, x, y, r, type) {
        const sign = type === 'negative' ? '−' : '+';
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2;
            const cr = r * 0.6;
            const cx = x + Math.cos(angle) * cr;
            const cy = y + Math.sin(angle) * cr;
            this.drawCharge(ctx, cx, cy, sign, 5);
        }
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
        ctx.font = `bold ${r + 1}px Space Grotesk`;
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

    destroy() {
        this.autoPlaying = false;
    }
}
