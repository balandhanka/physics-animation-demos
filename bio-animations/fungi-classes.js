// ===== Animation 10: Fungi Classes =====

export class FungiClasses {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.classType = 'phycomycetes';

        controlsEl.innerHTML = `
            <label>Class:
                <select id="fungiClass" class="control-select">
                    <option value="phycomycetes">Phycomycetes (Algal Fungi - e.g. Mucor)</option>
                    <option value="ascomycetes">Ascomycetes (Sac Fungi - e.g. Yeast, Aspergillus)</option>
                    <option value="basidiomycetes">Basidiomycetes (Club Fungi - e.g. Mushrooms)</option>
                    <option value="deuteromycetes">Deuteromycetes (Imperfect Fungi)</option>
                </select>
            </label>
        `;
        document.getElementById('fungiClass').addEventListener('change', (e) => {
            this.classType = e.target.value;
            this.reset();
        });
        this.reset();
    }

    reset() {
        this.t = 0;
        this.particles = []; // Spores
        const W = this.canvas.width;
        // Init spores based on class
        if (this.classType === 'phycomycetes') {
            for (let i = 0; i < 30; i++) this.particles.push({ x: W / 2 + (Math.random() - 0.5) * 80, y: 150 + (Math.random() - 0.5) * 80, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, active: false });
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
        ctx.translate(cx, H - 150); // Base at bottom middle

        if (this.classType === 'phycomycetes') this.drawPhycomycetes(ctx, W, H);
        else if (this.classType === 'ascomycetes') this.drawAscomycetes(ctx, W, H);
        else if (this.classType === 'basidiomycetes') this.drawBasidiomycetes(ctx, W, H);
        else this.drawDeuteromycetes(ctx, W, H);

        ctx.restore();

        // Common text info
        ctx.fillStyle = '#ccc';
        ctx.font = '14px Space Grotesk';
        ctx.textAlign = 'center';
        let desc = '';
        if (this.classType === 'phycomycetes') desc = 'Mycelium is coenocytic. Asexual reproduction by zoospores(motile) or aplanospores(non-motile) produced in sporangium.';
        else if (this.classType === 'ascomycetes') desc = 'Mycelium is branched/septate. Asexual spores (conidia) produced exogenously on conidiophores. Sexual spores (ascospores) in sac-like asci.';
        else if (this.classType === 'basidiomycetes') desc = 'Mycelium is branched/septate. Asexual spores are generally not found. Sexual spores (basidiospores) produced exogenously on basidium.';
        else desc = 'The "imperfect fungi" because only the asexual or vegetative phases are known. Reproduce only by asexual spores (conidia).';

        ctx.fillText(desc, cx, H - 30);
    }

    drawPhycomycetes(ctx, W, H) {
        // e.g. Mucor (Bread mould)
        ctx.fillStyle = '#64748b'; // Bread substrate
        ctx.beginPath(); ctx.ellipse(0, 50, 200, 50, 0, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = '#fef08a'; // Hyphae
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        // Coenocytic mycelium on bread
        for (let i = -150; i <= 150; i += 20) {
            ctx.beginPath(); ctx.moveTo(i, 50); ctx.lineTo(i + Math.sin(i) * 10, 50 + Math.cos(i) * 10); ctx.stroke();
        }

        // Sporangiophore
        ctx.beginPath();
        ctx.moveTo(0, 50);
        ctx.quadraticCurveTo(-10, -50, 0, -150);
        ctx.stroke();

        let burst = this.t % 4 > 2;

        // Sporangium
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath(); ctx.arc(0, -150, 40, 0, Math.PI * 2);
        if (!burst) ctx.fill();
        ctx.stroke();

        // Spores (inside or bursting)
        ctx.fillStyle = '#422006';
        this.particles.forEach(p => {
            if (burst) {
                p.active = true;
                p.x += p.vx; p.y += p.vy; p.vy += 0.05; // Gravity
            } else {
                if (p.active) { p.x = W / 2 + (Math.random() - 0.5) * 60; p.y = 150 + (Math.random() - 0.5) * 60; p.active = false; }
                // Wiggle inside
                p.x += Math.sin(this.t * 10 + p.vx) * 0.5;
                p.y += Math.cos(this.t * 10 + p.vy) * 0.5;
            }
            ctx.beginPath(); ctx.arc(p.x - W / 2, p.y - H + 150, 3, 0, Math.PI * 2); ctx.fill();
        });

        ctx.fillStyle = '#fef08a';
        ctx.font = '16px Space Grotesk';
        ctx.fillText('Mucor: Sporangium produces endogenous spores', 0, -220);
    }

    drawAscomycetes(ctx, W, H) {
        // Conidiophore (Aspergillus like)
        ctx.strokeStyle = '#93c5fd'; // Light blue hyphae
        ctx.lineWidth = 6;

        // Stalk
        ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(0, -100); ctx.stroke();

        // Septa (cross walls)
        ctx.lineWidth = 2; ctx.strokeStyle = '#1e3a8a';
        for (let y = 20; y >= -80; y -= 30) { ctx.beginPath(); ctx.moveTo(-3, y); ctx.lineTo(3, y); ctx.stroke(); }

        // Vesicle at top
        ctx.fillStyle = '#93c5fd';
        ctx.beginPath(); ctx.arc(0, -120, 20, 0, Math.PI * 2); ctx.fill();

        // Conidia chains (exogenous spores)
        ctx.fillStyle = '#3b82f6';
        for (let a = Math.PI; a <= Math.PI * 2; a += Math.PI / 6) {
            let numSpores = 3 + Math.floor(Math.sin(this.t + a) * 2);
            for (let i = 0; i < numSpores; i++) {
                let px = Math.cos(a) * (25 + i * 15);
                let py = -120 + Math.sin(a) * (25 + i * 15);
                ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
            }
        }

        // Draw an Ascus (sac) off to the side to show sexual reproduction
        ctx.translate(150, -50);
        ctx.strokeStyle = '#f472b6'; // Pinkish sac
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-15, 50);
        ctx.quadraticCurveTo(-20, -50, 0, -50);
        ctx.quadraticCurveTo(20, -50, 15, 50);
        ctx.stroke();
        ctx.fillStyle = 'rgba(244, 114, 182, 0.2)';
        ctx.fill();

        // Ascospores inside (usually 8)
        ctx.fillStyle = '#be185d';
        for (let i = 0; i < 8; i++) {
            ctx.beginPath(); ctx.ellipse((i % 2 === 0 ? -5 : 5), -40 + Math.floor(i / 2) * 20, 4, 6, 0, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = '#bfdbfe';
        ctx.fillText('Aspergillus: Conidia (asexual)', -150, -200);
        ctx.fillStyle = '#fbcfe8';
        ctx.fillText('Ascus with 8 ascospores (sexual)', 0, -70);
    }

    drawBasidiomycetes(ctx, W, H) {
        // Mushroom (Agaricus)
        ctx.translate(0, 50);
        let sway = Math.sin(this.t) * 5;

        // Stipe (Stalk)
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.quadraticCurveTo(-10, -100, -10 + sway, -150);
        ctx.lineTo(10 + sway, -150);
        ctx.quadraticCurveTo(10, -100, 15, 0);
        ctx.fill();

        // Annulus (Ring)
        ctx.beginPath();
        ctx.ellipse(sway * 0.5, -80, 25, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gills & Basidia
        ctx.translate(sway, -150);

        // Show zoomed basidium
        ctx.save();
        ctx.translate(-150, 50);
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(0, 0);
        ctx.quadraticCurveTo(-20, -30, -30, -40); ctx.stroke(); // Sterigmata
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(20, -30, 30, -40); ctx.stroke();
        ctx.fillStyle = '#475569';
        // Basidiospores (4) exogenous
        let yo = Math.sin(this.t * 5) * 2;
        ctx.beginPath(); ctx.arc(-30, -45 - yo, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-10, -50 + yo, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(10, -50 - yo, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(30, -45 + yo, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillText('Basidium (Club shape) with 4 Basidiospores', 0, 80);
        ctx.restore();

        // Pileus (Cap)
        ctx.fillStyle = '#8b5cf6'; // Purpleish cap
        ctx.beginPath();
        ctx.arc(0, 0, 80, Math.PI, 0);
        ctx.lineTo(80, 0);
        ctx.quadraticCurveTo(0, 20, -80, 0);
        ctx.fill();

        // Gills texture
        ctx.strokeStyle = '#4c1d95';
        ctx.lineWidth = 1;
        for (let i = -75; i <= 75; i += 5) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.quadraticCurveTo(i * 0.5, 10, i * 0.8, Math.sin(Math.acos(i / 80)) * 3 - 2); ctx.stroke();
        }

        ctx.fillStyle = '#c4b5fd';
        ctx.fillText('Agaricus (Mushroom)', 0, -100);
    }

    drawDeuteromycetes(ctx, W, H) {
        // Similar to Ascomycetes conidia but simpler, no sexual stage shown
        ctx.strokeStyle = '#10b981'; // Greenish hyphae (e.g. Trichoderma)
        ctx.lineWidth = 5;

        // Branching septate mycelium
        ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(0, -50); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -20); ctx.quadraticCurveTo(50, -40, 80, -100); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-50, -20, -60, -80); ctx.stroke();

        // Septa
        ctx.lineWidth = 2; ctx.strokeStyle = '#065f46';
        ctx.beginPath(); ctx.moveTo(-3, 20); ctx.lineTo(3, 20); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(25, -35); ctx.lineTo(15, -25); ctx.stroke();

        // Conidia formation at tips
        ctx.fillStyle = '#34d399';
        const tips = [{ x: 0, y: -50 }, { x: 80, y: -100 }, { x: -60, y: -80 }];

        tips.forEach((tip, idx) => {
            let num = 3 + Math.floor(Math.sin(this.t * 2 + idx) * 2);
            for (let i = 0; i < num; i++) {
                ctx.beginPath(); ctx.arc(tip.x + (i % 2 === 0 ? -5 : 5), tip.y - 12 - i * 8, 5, 0, Math.PI * 2); ctx.fill();
            }
        });

        ctx.fillStyle = '#a7f3d0';
        ctx.fillText('Imperfect Fungi: Only reproduce via asexual conidia', 0, -150);
    }

    drawGrid(ctx, W, H) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }

    destroy() { }
}
