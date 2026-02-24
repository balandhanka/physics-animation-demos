// ===== Animation 14: Viroids, Prions & Lichens =====

export class ViroidsPrionsLichens {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.view = 'viroid'; // viroid, prion, lichen
        this.particles = [];

        controlsEl.innerHTML = `
            <label>Sub-cellular/Symbiotic Entity:
                <select id="entityView" class="control-select">
                    <option value="viroid">Viroid (Free RNA)</option>
                    <option value="prion">Prion (Misfolded Protein)</option>
                    <option value="lichen">Lichen (Symbiotic Association)</option>
                </select>
            </label>
            <div id="vplDesc" class="control-static mt-2"></div>
        `;
        document.getElementById('entityView').addEventListener('change', (e) => {
            this.view = e.target.value;
            this.reset();
        });
        this.reset();
    }

    reset() {
        this.t = 0;
        this.particles = [];

        const descEl = document.getElementById('vplDesc');
        if (this.view === 'viroid') {
            descEl.textContent = 'Viroids: Discovered by T.O. Diener (1971). Smaller than viruses, cause potato spindle tuber disease. Free RNA without a protein coat. Low molecular weight RNA.';
            for (let i = 0; i < 3; i++) this.particles.push({ phase: Math.random() * Math.PI * 2 });
        } else if (this.view === 'prion') {
            descEl.textContent = 'Prions: Abnormally folded proteins that cause neurological diseases like Bovine Spongiform Encephalopathy (BSE/Mad Cow) and Cr-Jacob disease in humans.';
            for (let i = 0; i < 15; i++) {
                this.particles.push({
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200,
                    rot: Math.random() * Math.PI * 2,
                    isMisfolded: Math.random() > 0.7 // Some are healthy, some are prions
                });
            }
        } else {
            descEl.textContent = 'Lichens: Mutually useful symbiotic associations between algae (phycobiont - autotrophic) and fungi (mycobiont - heterotrophic). Excellent pollution indicators.';
            // Fungal hyphae points
            this.fungus = [];
            for (let i = 0; i < 20; i++) this.fungus.push({ angle: i / 20 * Math.PI * 2, r: 80 + Math.random() * 20 });
            // Algal cells
            this.algae = [];
            for (let i = 0; i < 30; i++) {
                let a = Math.random() * Math.PI * 2;
                let r = Math.random() * 70; // Inside fungal net
                this.algae.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, phase: Math.random() * Math.PI * 2 });
            }
        }
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        ctx.clearRect(0, 0, W, H);
        this.t += 0.02;

        let gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, '#020617');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        this.drawGrid(ctx, W, H);

        ctx.save();
        ctx.translate(cx, cy - 30);

        if (this.view === 'viroid') this.drawViroid(ctx, W, H);
        else if (this.view === 'prion') this.drawPrion(ctx, W, H);
        else this.drawLichen(ctx, W, H);

        ctx.restore();
    }

    drawViroid(ctx, W, H) {
        // Just free RNA, no capsid
        ctx.strokeStyle = '#ef4444'; // Red RNA
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 20;

        this.particles.forEach((v, idx) => {
            ctx.save();
            // Spread them out
            ctx.translate((idx - 1) * 150, Math.sin(this.t * 2 + v.phase) * 20);
            ctx.rotate(this.t * 0.5 + v.phase);

            // Draw a tangled, closed loop (Viroid RNA is circular but highly base-paired so it looks rod-like)
            ctx.beginPath();
            let numSegments = 100;
            for (let i = 0; i <= numSegments; i++) {
                let a = (i / numSegments) * Math.PI * 2;
                // Base rod shape
                let r = 80 + Math.cos(a * 2) * 60;
                // Add tangles/wiggles
                r += Math.sin(a * 15 + this.t * 5) * 5;

                let px = Math.cos(a) * r * 0.3; // Squeeze into rod
                let py = Math.sin(a) * r;

                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
        });

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 20px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Naked, closed-circular, single-stranded RNA', 0, 160);
        ctx.font = '16px Space Grotesk';
        ctx.fillText('Lacks a protein coat (capsid) found in viruses', 0, 190);
    }

    drawPrion(ctx, W, H) {
        // Protein folding

        this.particles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y + Math.sin(this.t * 3 + p.x) * 10);
            p.rot += 0.01;
            ctx.rotate(p.rot);

            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // If a misfolded prion collides/touches a healthy one, it converts it
            if (!p.isMisfolded && Math.random() < 0.01) {
                // Simplified infection logic for visual effect based on random chance over time
                if (Math.sin(this.t * 5 + p.x) > 0.95) {
                    p.isMisfolded = true;
                    // Flash effect
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
                }
            }

            if (p.isMisfolded) {
                // Prion (Beta-sheet rich, abnormal, aggregated)
                ctx.strokeStyle = '#f59e0b'; // Warning Orange/Yellow
                ctx.shadowColor = '#d97706';
                ctx.shadowBlur = 15;

                ctx.beginPath();
                // Sharp, zig-zag beta sheet representation
                ctx.moveTo(-20, -10); ctx.lineTo(-10, 15); ctx.lineTo(0, -15);
                ctx.lineTo(10, 15); ctx.lineTo(20, -10);

                // Draw arrow heads to show beta strands
                ctx.moveTo(15, -5); ctx.lineTo(20, -10); ctx.lineTo(25, -5);
                ctx.moveTo(-25, -5); ctx.lineTo(-20, -10); ctx.lineTo(-15, -5);

                ctx.stroke();

            } else {
                // Normal protein (Alpha-helix rich)
                ctx.strokeStyle = '#38bdf8'; // Healthy blue
                ctx.shadowColor = '#0284c7';
                ctx.shadowBlur = 10;

                ctx.beginPath();
                // Looping alpha helix representation
                for (let i = -20; i <= 20; i += 2) {
                    let y = Math.sin(i * 0.5) * 10;
                    if (i === -20) ctx.moveTo(i, y);
                    else ctx.lineTo(i, Math.sin(i * 0.5) * 10 + (Math.cos(i * 0.5) > 0 ? -2 : 2)); // Add depth
                }
                ctx.stroke();
            }

            ctx.restore();
        });

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fcd34d';
        ctx.font = 'bold 20px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('PrP^Sc (Prion) converts normal PrP^C protein', 0, 160);
        ctx.font = '16px Space Grotesk';
        ctx.fillStyle = '#ccc';
        ctx.fillText('Blue: Normal Protein (Helical) | Orange: Misfolded Prion (Beta-sheets)', 0, 190);
    }

    drawLichen(ctx, W, H) {
        ctx.scale(1.5, 1.5);

        // Fungal Mycobiont (Network)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; // Whiteish/grey fungal threads
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';

        ctx.beginPath();
        for (let i = 0; i < this.fungus.length; i++) {
            let f = this.fungus[i];
            let r = f.r + Math.sin(this.t + i) * 5;
            let px = Math.cos(f.angle) * r;
            let py = Math.sin(f.angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);

            // Draw internal web
            for (let j = 0; j < this.fungus.length; j += 4) {
                if (i !== j && Math.random() < 0.1) {
                    ctx.moveTo(px, py);
                    let f2 = this.fungus[j];
                    let r2 = f2.r + Math.sin(this.t + j) * 5;
                    ctx.lineTo(Math.cos(f2.angle) * r2, Math.sin(f2.angle) * r2);
                }
            }
        }
        ctx.closePath();
        ctx.stroke();

        // Algal Phycobiont (Cells embedded within)
        this.algae.forEach(a => {
            let px = a.x + Math.sin(this.t * 2 + a.phase) * 3;
            let py = a.y + Math.cos(this.t * 2 + a.phase) * 3;

            ctx.fillStyle = '#22c55e'; // Green algae
            ctx.strokeStyle = '#16a34a';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(px, py, 6 + Math.sin(this.t * 3 + a.phase), 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();

            // Nutrient exchange animation (small particles flowing)
            if (Math.sin(this.t * 5 + a.phase) > 0.8) {
                // Algae giving food to fungi (sugar)
                ctx.fillStyle = '#fde047';
                ctx.beginPath(); ctx.arc(px + 10, py - 10, 2, 0, Math.PI * 2); ctx.fill();
            } else if (Math.cos(this.t * 4 + a.phase) > 0.8) {
                // Fungi giving water/minerals to algae
                ctx.fillStyle = '#60a5fa';
                ctx.beginPath(); ctx.arc(px - 10, py + 10, 2, 0, Math.PI * 2); ctx.fill();
            }
        });

        ctx.scale(1 / 1.5, 1 / 1.5);

        ctx.fillStyle = '#ccc';
        ctx.font = '16px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Yellow: Sugars (from Algae)', -120, 160);
        ctx.fillText('Blue: Water/Minerals (from Fungi)', 120, 160);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 18px Space Grotesk';
        ctx.fillText('Mutualistic Symbiosis: Mycobiont (Fungus) + Phycobiont (Algae)', 0, 190);
    }

    drawGrid(ctx, W, H) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }

    destroy() { }
}
