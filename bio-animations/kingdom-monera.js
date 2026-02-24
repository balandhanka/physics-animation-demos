// ===== Animation 1: Bacteria Shapes (Kingdom Monera) =====

export class KingdomMonera {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.shape = 'coccus'; // coccus, bacillus, vibrio, spirillum
        this.particles = [];

        controlsEl.innerHTML = `
            <label>Shape:
                <select id="bacteriaShape" class="control-select">
                    <option value="coccus">Cocci (Spherical)</option>
                    <option value="bacillus">Bacilli (Rod-shaped)</option>
                    <option value="vibrio">Vibrio (Comma-shaped)</option>
                    <option value="spirillum">Spirilla (Spiral)</option>
                </select>
            </label>
        `;
        document.getElementById('bacteriaShape').addEventListener('change', (e) => {
            this.shape = e.target.value;
            this.reset();
        });
        this.reset();
    }

    reset() {
        this.t = 0;
        this.particles = [];
        const num = this.shape === 'spirillum' ? 8 : 15;
        for (let i = 0; i < num; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width / 2 - this.canvas.width / 4,
                y: Math.random() * this.canvas.height / 2 - this.canvas.height / 4,
                phase: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 1.5,
                angle: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.05,
                color: this.getColor(),
                scale: 0.8 + Math.random() * 0.4
            });
        }
    }

    getColor() {
        const colors = {
            'coccus': ['#ef4444', '#f87171'],
            'bacillus': ['#3b82f6', '#60a5fa'],
            'vibrio': ['#eab308', '#facc15'],
            'spirillum': ['#22c55e', '#4ade80']
        };
        const palette = colors[this.shape];
        return palette[Math.floor(Math.random() * palette.length)];
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas, t } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        ctx.clearRect(0, 0, W, H);
        this.drawGrid(ctx, W, H);

        this.t += 0.02;

        ctx.save();
        ctx.translate(cx, cy);

        this.particles.forEach(p => {
            p.x += Math.cos(p.angle) * p.speed * 0.5;
            p.y += Math.sin(p.angle) * p.speed * 0.5;
            p.angle += p.rotSpeed;
            p.phase += 0.05 * p.speed;

            // wrap around
            if (p.x > W / 2 + 80) p.x = -W / 2 - 80;
            if (p.x < -W / 2 - 80) p.x = W / 2 + 80;
            if (p.y > H / 2 + 80) p.y = -H / 2 - 80;
            if (p.y < -H / 2 - 80) p.y = H / 2 + 80;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.scale(p.scale, p.scale);

            this.drawBacteria(ctx, p);

            ctx.restore();
        });

        ctx.restore();

        const labelText = {
            'coccus': 'Coccus (pl.: cocci): Spherical bacteria',
            'bacillus': 'Bacillus (pl.: bacilli): Rod-shaped bacteria',
            'vibrio': 'Vibrio (pl.: vibrio): Comma-shaped bacteria',
            'spirillum': 'Spirillum (pl.: spirilla): Spiral-shaped bacteria'
        };
        this.drawLabel(ctx, cx, H - 40, labelText[this.shape]);
    }

    drawBacteria(ctx, p) {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;

        ctx.beginPath();

        if (this.shape === 'coccus') {
            // Can be single, diplo, strepto, or staphylo
            if (p.speed < 1) { // Diplococcus
                ctx.arc(-12, 0, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(12, 0, 15, 0, Math.PI * 2);
            } else { // Single
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
            }
            ctx.fill();
        }
        else if (this.shape === 'bacillus') {
            const rx = -30, ry = -12, rw = 60, rh = 24, rr = 12;
            ctx.moveTo(rx + rr, ry);
            ctx.lineTo(rx + rw - rr, ry);
            ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
            ctx.lineTo(rx + rw, ry + rh - rr);
            ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
            ctx.lineTo(rx + rr, ry + rh);
            ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
            ctx.lineTo(rx, ry + rr);
            ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
            ctx.closePath();
            ctx.fill();

            // Flagella for some
            if (p.scale > 1) {
                this.drawFlagellum(ctx, 30, 0, p.phase, 1);
            }
        }
        else if (this.shape === 'vibrio') {
            // Comma shape
            ctx.moveTo(15, -10);
            ctx.quadraticCurveTo(20, 15, -15, 10);
            ctx.quadraticCurveTo(0, -5, 15, -10);
            ctx.fill();
            // Single polar flagellum
            this.drawFlagellum(ctx, -15, 10, p.phase, -1);
        }
        else if (this.shape === 'spirillum') {
            // Spiral shape using sine wave
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            for (let i = -40; i <= 40; i += 5) {
                const y = Math.sin(i * 0.15 + p.phase) * 15;
                if (i === -40) ctx.moveTo(i, y);
                else ctx.lineTo(i, y);
            }
            ctx.stroke();

            // Tufts of flagella at ends
            const y1 = Math.sin(-40 * 0.15 + p.phase) * 15;
            const y2 = Math.sin(40 * 0.15 + p.phase) * 15;
            this.drawFlagellum(ctx, -40, y1, p.phase, -1);
            this.drawFlagellum(ctx, -40, y1, p.phase + 1, -1);
            this.drawFlagellum(ctx, 40, y2, p.phase, 1);
            this.drawFlagellum(ctx, 40, y2, p.phase + 1, 1);
        }

        ctx.shadowBlur = 0;
    }

    drawFlagellum(ctx, x, y, phase, dir) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        let fx = x;
        let fy = y;
        for (let i = 0; i < 40; i += 4) {
            fx += 4 * dir;
            fy = y + Math.sin(phase + i * 0.2) * 5;
            ctx.lineTo(fx, fy);
        }
        ctx.stroke();
    }

    drawGrid(ctx, W, H) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
    }

    drawLabel(ctx, cx, y, text) {
        ctx.fillStyle = '#ccc';
        ctx.font = '16px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText(text, cx, y);
    }

    destroy() { }
}
