// ===== Animation 3: Eubacteria & Cyanobacteria =====

export class Eubacteria {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.mode = 'cyanobacteria'; // cyanobacteria, decomposers
        this.particles = [];

        controlsEl.innerHTML = `
            <label>Type:
                <select id="eubacteriaType" class="control-select">
                    <option value="cyanobacteria">Cyanobacteria (Nostoc)</option>
                    <option value="decomposers">Heterotrophic Decomposers</option>
                </select>
            </label>
        `;
        document.getElementById('eubacteriaType').addEventListener('change', (e) => {
            this.mode = e.target.value;
            this.reset();
        });
        this.reset();
    }

    reset() {
        this.t = 0;
        this.particles = [];
        const W = this.canvas.width;
        const H = this.canvas.height;

        if (this.mode === 'cyanobacteria') {
            // Create a filament of cells (like Nostoc)
            const numCells = 20;
            for (let i = 0; i < numCells; i++) {
                this.particles.push({
                    baseX: -300 + i * 35,
                    baseY: 0,
                    radius: i % 7 === 3 ? 22 : 16, // Every 7th cell is a larger heterocyst
                    isHeterocyst: i % 7 === 3,
                    phase: i * 0.5
                });
            }
        } else {
            // Decomposers breaking down organic matter
            for (let i = 0; i < 30; i++) {
                this.particles.push({
                    x: Math.random() * W - W / 2,
                    y: Math.random() * H - H / 2,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    phase: Math.random() * Math.PI * 2,
                    isEnzyme: Math.random() > 0.8 // Some are enzymes released
                });
            }
        }
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        ctx.clearRect(0, 0, W, H);
        this.drawGrid(ctx, W, H);

        this.t += 0.02;

        ctx.save();
        ctx.translate(cx, cy);

        if (this.mode === 'cyanobacteria') {
            this.drawCyanobacteria(ctx);
            // Label
            this.drawLabel(ctx, 0, H / 2 - 40, 'Nostoc: Filamentous blue-green algae with heterocysts for N₂ fixation');
        } else {
            this.drawDecomposers(ctx, W, H);
            this.drawLabel(ctx, 0, H / 2 - 40, 'Heterotrophic bacteria decomposing organic matter');
        }

        ctx.restore();
    }

    drawCyanobacteria(ctx) {
        // Draw mucilaginous sheath for the whole filament
        ctx.beginPath();
        this.particles.forEach((p, i) => {
            const wobbleY = Math.sin(this.t * 2 + p.phase) * 20;
            const x = p.baseX;
            const y = p.baseY + wobbleY;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = 'rgba(167, 243, 208, 0.2)'; // Light green sheath
        ctx.lineWidth = 45;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Draw individual cells
        this.particles.forEach(p => {
            const wobbleY = Math.sin(this.t * 2 + p.phase) * 20;
            const x = p.baseX;
            const y = p.baseY + wobbleY;

            ctx.beginPath();
            ctx.arc(x, y, p.radius, 0, Math.PI * 2);

            if (p.isHeterocyst) {
                // Heterocyst
                ctx.fillStyle = '#fef08a'; // Yellowish
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 3;

                // Draw nitrogen fixing animation (N2 coming in)
                if (Math.sin(this.t * 3 + p.phase) > 0) {
                    ctx.fillStyle = '#60a5fa'; // N2 molecule
                    ctx.font = '12px Space Grotesk';
                    ctx.fillText('N₂', x, y - 30 - Math.sin(this.t * 5) * 10);
                    ctx.fillStyle = '#fef08a'; // Reset
                }
            } else {
                // Vegetative cell
                ctx.fillStyle = '#22c55e'; // Green (Chlorophyll a)
                ctx.strokeStyle = '#16a34a';
                ctx.lineWidth = 2;

                // Photosynthesis animation (O2 bubbles)
                if (Math.random() < 0.05) {
                    ctx.fillStyle = '#bae6fd';
                    ctx.beginPath();
                    ctx.arc(x + Math.random() * 20 - 10, y - 20 - Math.random() * 20, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#22c55e'; // Reset
                }
            }

            ctx.fill();
            ctx.stroke();

            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(x - 4, y - 4, p.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawDecomposers(ctx, W, H) {
        // Draw organic matter (large blob)
        const blobWobble = Math.sin(this.t) * 10;
        ctx.fillStyle = '#78350f'; // Dark brown
        ctx.beginPath();
        for (let i = 0; i < Math.PI * 2; i += Math.PI / 6) {
            const r = 100 + Math.sin(i * 3 + this.t) * 15 + blobWobble;
            const x = Math.cos(i) * r;
            const y = Math.sin(i) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#fcd34d';
        ctx.font = '16px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Dead Organic Matter', 0, 0);

        // Draw bacteria and enzymes
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Attraction to center (the organic matter)
            const dist = Math.sqrt(p.x * p.x + p.y * p.y);
            if (dist > 150) {
                p.vx -= p.x * 0.001;
                p.vy -= p.y * 0.001;
            } else {
                // Random walk near center
                p.vx += (Math.random() - 0.5) * 0.5;
                p.vy += (Math.random() - 0.5) * 0.5;

                // Max speed limit
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 2) {
                    p.vx = (p.vx / speed) * 2;
                    p.vy = (p.vy / speed) * 2;
                }
            }

            if (p.isEnzyme) {
                // Enzyme particles breaking down matter
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3 + Math.sin(this.t * 5 + p.phase) * 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Bacilli breaking down matter
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(Math.atan2(p.vy, p.vx));
                ctx.fillStyle = '#f87171'; // Reddish bacilli
                ctx.beginPath();
                ctx.roundRect(-8, -4, 16, 8, 4);
                ctx.fill();
                ctx.restore();
            }
        });
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

    drawLabel(ctx, x, y, text) {
        ctx.fillStyle = '#ccc';
        ctx.font = '16px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y);
    }

    destroy() { }
}
