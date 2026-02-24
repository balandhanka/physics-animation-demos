// ===== Animation 4: Chrysophytes & Diatoms =====

export class Chrysophytes {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.diatoms = [];
        this.earthParticles = [];

        controlsEl.innerHTML = `
            <div class="control-static">Observe the overlapping silica shells (epitheca and hypotheca) of diatoms.</div>
        `;
        this.reset();
    }

    reset() {
        this.t = 0;
        this.diatoms = [];
        this.earthParticles = [];
        const W = this.canvas.width;
        const H = this.canvas.height;

        // Create main central diatom (detailed)
        this.mainDiatom = {
            openAmount: 0 // Will oscillate to show the soap-box structure
        };

        // Background floating diatoms
        for (let i = 0; i < 8; i++) {
            this.diatoms.push({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                rot: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.01,
                scale: 0.3 + Math.random() * 0.4,
                type: Math.floor(Math.random() * 3) // 0: pennate, 1: centric, 2: triangular
            });
        }
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        this.t += 0.016;

        // Underwater background
        let gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, '#0f172a'); // Very dark blue at top
        gradient.addColorStop(1, '#020617'); // Blackish at bottom
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        // Diatomaceous earth accumulation at bottom
        ctx.fillStyle = 'rgba(202, 138, 4, 0.15)'; // Golden brown tinge
        ctx.beginPath();
        ctx.moveTo(0, H - 100);
        for (let x = 0; x <= W; x += 50) {
            ctx.lineTo(x, H - 100 + Math.sin(x * 0.01 + this.t) * 10 + Math.cos(x * 0.02) * 15);
        }
        ctx.lineTo(W, H);
        ctx.lineTo(0, H);
        ctx.fill();

        ctx.fillStyle = 'rgba(253, 224, 71, 0.4)';
        ctx.font = '14px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Diatomaceous Earth Accumulation', cx, H - 40);

        // Falling silica particles
        if (Math.random() < 0.2) {
            this.earthParticles.push({
                x: Math.random() * W,
                y: 0,
                vx: Math.sin(this.t) * 0.5,
                vy: 1 + Math.random(),
                rot: 0
            });
        }

        for (let i = this.earthParticles.length - 1; i >= 0; i--) {
            let p = this.earthParticles[i];
            p.y += p.vy;
            p.x += Math.sin(this.t + p.y * 0.01) * 0.5;
            p.rot += 0.05;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillRect(-2, -2, 4, 4);
            ctx.restore();

            if (p.y > H - 80) this.earthParticles.splice(i, 1);
        }

        // Draw background floating diatoms
        this.diatoms.forEach(d => {
            d.x += d.vx;
            d.y += d.vy;
            d.rot += d.rotSpeed;

            if (d.x > W + 50) d.x = -50;
            if (d.x < -50) d.x = W + 50;
            if (d.y > H + 50) d.y = -50;
            if (d.y < -50) d.y = H + 50;

            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rot);
            ctx.scale(d.scale, d.scale);

            if (d.type === 0) this.drawPennateDiatom(ctx, 0); // Pennate
            else if (d.type === 1) this.drawCentricDiatom(ctx); // Centric
            else this.drawTriangularDiatom(ctx);

            ctx.restore();
        });

        // Draw Main Diatom in center
        ctx.save();
        ctx.translate(cx, cy - 50);
        // Slowly rotate whole diatom
        ctx.rotate(Math.sin(this.t * 0.5) * 0.1);

        // Calculate opening of the soap box
        // Oscillates between 0 (closed) and 20 (open)
        this.mainDiatom.openAmount = (Math.sin(this.t) + 1) * 15;

        this.drawSoapBoxDiatom(ctx, this.mainDiatom.openAmount);

        ctx.restore();

        // Diagram labels for main diatom
        ctx.fillStyle = '#fde047'; // Yellow
        ctx.font = '14px Space Grotesk';

        const open = this.mainDiatom.openAmount;

        // Epitheca line
        ctx.beginPath();
        ctx.moveTo(cx - 150, cy - 80 - open);
        ctx.lineTo(cx - 200, cy - 100);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText('Epitheca (Outer shell)', cx - 210, cy - 100);

        // Hypotheca line
        ctx.beginPath();
        ctx.moveTo(cx - 150, cy - 20 + open);
        ctx.lineTo(cx - 200, cy + 20);
        ctx.stroke();
        ctx.fillText('Hypotheca (Inner shell)', cx - 210, cy + 20);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ccc';
        ctx.fillText('Silica cell walls fit together like a soap box', cx, cy + 120);
    }

    drawSoapBoxDiatom(ctx, openAmount) {
        ctx.scale(1.5, 1.5);
        const w = 180, h = 40;

        // Shadow/glow
        ctx.shadowColor = '#ca8a04'; // Golden
        ctx.shadowBlur = 30;

        // Common styles
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;

        // Hypotheca (Bottom/Inner shell)
        ctx.save();
        ctx.translate(0, openAmount);

        ctx.fillStyle = 'rgba(202, 138, 4, 0.4)';
        ctx.beginPath();
        ctx.roundRect(-w / 2 + 2, -h / 2, w - 4, h, 10);
        ctx.fill();
        ctx.stroke();

        // Ornamentation on inner shell
        ctx.beginPath();
        for (let x = -w / 2 + 10; x < w / 2 - 10; x += 8) {
            ctx.moveTo(x, -h / 2);
            ctx.lineTo(x, h / 2);
        }
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.3)';
        ctx.stroke();

        // Golden plastids inside
        ctx.fillStyle = '#ca8a04';
        ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(-40, 0, 12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(40, 0, 12, 0, Math.PI * 2); ctx.fill();

        ctx.restore();

        // Epitheca (Top/Outer shell)
        ctx.save();
        ctx.translate(0, -openAmount);

        ctx.fillStyle = 'rgba(234, 179, 8, 0.6)'; // Slightly more opaque
        ctx.beginPath();
        // Slightly larger to overlap
        ctx.roundRect(-w / 2, -h / 2, w, h + 5, 12);
        ctx.fill();
        ctx.stroke();

        // Ornamentation
        ctx.beginPath();
        for (let x = -w / 2 + 5; x < w / 2 - 5; x += 15) {
            for (let y = -h / 2 + 5; y < h / 2 + 5; y += 8) {
                ctx.moveTo(x, y);
                ctx.arc(x, y, 1, 0, Math.PI * 2);
            }
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.stroke();

        ctx.restore();
    }

    drawPennateDiatom(ctx) {
        ctx.fillStyle = 'rgba(202, 138, 4, 0.5)';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.ellipse(0, 0, 60, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-60, 0); ctx.lineTo(60, 0);
        for (let i = -50; i <= 50; i += 6) {
            ctx.moveTo(i, 0); ctx.lineTo(i, -15);
            ctx.moveTo(i, 0); ctx.lineTo(i, 15);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.stroke();
    }

    drawCentricDiatom(ctx) {
        ctx.fillStyle = 'rgba(202, 138, 4, 0.5)';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        for (let i = 0; i < Math.PI * 2; i += Math.PI / 12) {
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(i) * 30, Math.sin(i) * 30);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawTriangularDiatom(ctx) {
        ctx.fillStyle = 'rgba(202, 138, 4, 0.5)';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;

        const r = 35;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = i * Math.PI * 2 / 3 - Math.PI / 2;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.stroke();
    }

    destroy() { }
}
