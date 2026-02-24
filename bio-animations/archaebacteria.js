// ===== Animation 2: Archaebacteria =====

export class Archaebacteria {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.habitat = 'halophiles'; // halophiles, thermoacidophiles, methanogens

        // Environment particles (salt, bubbles, methane)
        this.envParticles = [];
        // Bacteria particles
        this.bacteria = [];

        controlsEl.innerHTML = `
            <label>Extreme Habitat:
                <select id="archaeaHabitat" class="control-select">
                    <option value="halophiles">Extreme Salty Areas (Halophiles)</option>
                    <option value="thermoacidophiles">Hot Springs (Thermoacidophiles)</option>
                    <option value="methanogens">Marshy Areas (Methanogens)</option>
                </select>
            </label>
        `;
        document.getElementById('archaeaHabitat').addEventListener('change', (e) => {
            this.habitat = e.target.value;
            this.reset();
        });
        this.reset();
    }

    reset() {
        this.t = 0;
        this.envParticles = [];
        this.bacteria = [];

        // Init bacteria
        for (let i = 0; i < 8; i++) {
            this.bacteria.push({
                x: this.canvas.width * 0.2 + Math.random() * (this.canvas.width * 0.6),
                y: this.canvas.height * 0.3 + Math.random() * (this.canvas.height * 0.4),
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                radius: 15 + Math.random() * 10,
                phase: Math.random() * Math.PI * 2
            });
        }

        // Init environment
        for (let i = 0; i < 50; i++) {
            this.envParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 4 + 1,
                speed: Math.random() * 2 + 1,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        this.t += 0.016;

        // Draw background based on habitat
        this.drawBackground(ctx, W, H);

        // Draw environment particles
        this.drawEnvironment(ctx, W, H);

        // Draw bacteria
        this.drawBacteria(ctx, W, H);

        // Draw habitat label
        const labels = {
            'halophiles': 'Halophiles thrive in extreme salt concentrations.',
            'thermoacidophiles': 'Thermoacidophiles survive in boiling, acidic hot springs.',
            'methanogens': 'Methanogens live in marshes/gut and produce methane gas (biogas).'
        };

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText(labels[this.habitat], cx, 50);

        ctx.font = '14px Space Grotesk';
        ctx.fillStyle = '#ccc';
        ctx.fillText('Special cell wall structure enables survival in harsh conditions', cx, 80);
    }

    drawBackground(ctx, W, H) {
        let gradient = ctx.createLinearGradient(0, 0, 0, H);
        if (this.habitat === 'halophiles') {
            gradient.addColorStop(0, '#1e1b4b');   // Deep purple
            gradient.addColorStop(1, '#831843');   // Pinkish/salt lake color
        } else if (this.habitat === 'thermoacidophiles') {
            gradient.addColorStop(0, '#451a03');   // Dark brown
            gradient.addColorStop(1, '#991b1b');   // Fiery red/orange
        } else {
            gradient.addColorStop(0, '#022c22');   // Dark green
            gradient.addColorStop(1, '#064e3b');   // Marsh green
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        // Grid overlay
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
    }

    drawEnvironment(ctx, W, H) {
        this.envParticles.forEach(p => {
            ctx.beginPath();

            if (this.habitat === 'halophiles') {
                // Salt crystals (squares)
                p.y += p.speed * 0.5;
                if (p.y > H) p.y = 0;

                ctx.rect(p.x, p.y, p.size, p.size);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.2 + Math.sin(this.t * 2 + p.phase) * 0.2})`;

            } else if (this.habitat === 'thermoacidophiles') {
                // Boiling bubbles
                p.y -= p.speed * 1.5;
                p.x += Math.sin(this.t * 3 + p.phase) * 2;
                if (p.y < 0) {
                    p.y = H;
                    p.x = Math.random() * W;
                }

                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 100, 50, ${0.4 + Math.sin(this.t * 5 + p.phase) * 0.2})`;
                // Heat distortion waves
                if (Math.random() < 0.05) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                    ctx.moveTo(p.x - 20, p.y);
                    ctx.quadraticCurveTo(p.x, p.y - 10, p.x + 20, p.y);
                    ctx.stroke();
                }

            } else if (this.habitat === 'methanogens') {
                // Methane gas ascending
                p.y -= p.speed;
                p.x += Math.cos(this.t * 2 + p.phase) * 1;
                if (p.y < 0) {
                    p.y = H;
                    p.x = Math.random() * W;
                }

                ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(134, 239, 172, ${0.3 + Math.sin(this.t * 4 + p.phase) * 0.3})`;
                ctx.shadowColor = '#86efac';
                ctx.shadowBlur = 10;
            }

            ctx.fill();
            ctx.shadowBlur = 0;
        });
    }

    drawBacteria(ctx, W, H) {
        this.bacteria.forEach(b => {
            // Move
            b.x += b.vx;
            b.y += b.vy;

            // Bounce
            if (b.x < 100 || b.x > W - 100) b.vx *= -1;
            if (b.y < 100 || b.y > H - 100) b.vy *= -1;

            ctx.save();
            ctx.translate(b.x, b.y);

            // Give them a "special" thick cell wall to represent Archaea structure
            ctx.beginPath();
            if (this.habitat === 'halophiles') {
                // Square-ish / irregular shapes
                const wobble = Math.sin(this.t * 3 + b.phase) * 3;
                ctx.roundRect(-b.radius - wobble, -b.radius + wobble,
                    b.radius * 2 + wobble * 2, b.radius * 2 - wobble * 2, 8);
                ctx.fillStyle = '#f472b6'; // Pink
                ctx.strokeStyle = '#fce7f3';

            } else if (this.habitat === 'thermoacidophiles') {
                // Irregular lobed shape
                ctx.moveTo(0, -b.radius);
                for (let i = 0; i < Math.PI * 2; i += Math.PI / 4) {
                    const r = b.radius + Math.sin(this.t * 8 + b.phase + i) * 4;
                    ctx.lineTo(Math.cos(i) * r, Math.sin(i) * r);
                }
                ctx.closePath();
                ctx.fillStyle = '#fb923c'; // Orange
                ctx.strokeStyle = '#fffedd';

            } else if (this.habitat === 'methanogens') {
                // Cocci or bacilli
                const wobble = Math.sin(this.t * 2 + b.phase) * 2;
                ctx.arc(0, 0, b.radius + wobble, 0, Math.PI * 2);
                ctx.fillStyle = '#4ade80'; // Green
                ctx.strokeStyle = '#dcfce7';

                // Draw methane emission
                if (Math.random() < 0.1) {
                    ctx.fillStyle = '#bbf7d0';
                    ctx.beginPath();
                    ctx.arc(Math.random() * 40 - 20, -b.radius - Math.random() * 20, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Thick cell wall indicator
            ctx.lineWidth = 4;
            ctx.stroke();

            // Inner details
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.arc(b.radius * 0.2, b.radius * 0.2, b.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    destroy() { }
}
