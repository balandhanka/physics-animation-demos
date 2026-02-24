// ===== Animation 8: Protozoans =====

export class Protozoans {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.group = 'amoeboid'; // amoeboid, flagellated, ciliated, sporozoans

        this.amoeba = { x: 0, y: 0, points: [], targetX: 0, targetY: 0 };
        this.food = { x: 0, y: 0, active: false };
        this.cilia = [];
        this.paramecium = { x: 0, y: 0, vx: 2, vy: 1, angle: 0 };
        this.trypanosoma = { x: 0, y: 0, vx: 1, vy: 0.5, body: [] };
        this.rbcs = []; // For sporozoan/flagellated background
        this.plasmodium = [];

        controlsEl.innerHTML = `
            <label>Protozoan Group:
                <select id="protozoanGroup" class="control-select">
                    <option value="amoeboid">Amoeboid (Amoeba)</option>
                    <option value="flagellated">Flagellated (Trypanosoma)</option>
                    <option value="ciliated">Ciliated (Paramoecium)</option>
                    <option value="sporozoans">Sporozoans (Plasmodium)</option>
                </select>
            </label>
            <div id="protoDesc" class="control-static mt-2"></div>
        `;
        document.getElementById('protozoanGroup').addEventListener('change', (e) => {
            this.setGroup(e.target.value);
        });
        this.setGroup('amoeboid');
    }

    setGroup(group) {
        this.group = group;
        const descEl = document.getElementById('protoDesc');
        if (group === 'amoeboid') descEl.textContent = 'Amoeboid protozoans move and capture prey by putting out pseudopodia (false feet).';
        else if (group === 'flagellated') descEl.textContent = 'Flagellated protozoans have flagella. Parasitic forms cause diseases like sleeping sickness.';
        else if (group === 'ciliated') descEl.textContent = 'Ciliated protozoans are aquatic, actively moving by thousands of cilia. They have a gullet (cavity).';
        else descEl.textContent = 'Sporozoans have an infectious spore-like stage in their life cycle (e.g., malarial parasite).';
        this.reset();
    }

    reset() {
        this.t = 0;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const cx = W / 2, cy = H / 2;

        if (this.group === 'amoeboid') {
            this.amoeba.x = cx;
            this.amoeba.y = cy;
            // 20 points forming the amoeba perimeter
            this.amoeba.points = [];
            for (let i = 0; i < 20; i++) {
                this.amoeba.points.push({
                    angle: (i / 20) * Math.PI * 2,
                    radius: 60,
                    targetRadius: 60,
                    phase: i * 0.5
                });
            }
            this.spawnFood(cx, cy);
        }
        else if (this.group === 'flagellated' || this.group === 'sporozoans') {
            // Blood stream background
            this.rbcs = [];
            for (let i = 0; i < 30; i++) {
                this.rbcs.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    speed: 0.5 + Math.random(),
                    scale: 0.8 + Math.random() * 0.4
                });
            }
            if (this.group === 'sporozoans') {
                this.plasmodium = [];
                // Spores infecting RBCs
                for (let i = 0; i < 15; i++) {
                    this.plasmodium.push({
                        x: Math.random() * W,
                        y: Math.random() * H,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            } else {
                this.trypanosoma.x = cx;
                this.trypanosoma.y = cy;
                this.trypanosoma.body = Array(15).fill({ x: cx, y: cy });
            }
        }
        else if (this.group === 'ciliated') {
            this.paramecium.x = cx - 200;
            this.paramecium.y = cy;
            this.cilia = [];
            for (let i = 0; i < 60; i++) {
                this.cilia.push({ phase: (i / 60) * Math.PI * 2 });
            }
        }
    }

    spawnFood(cx, cy) {
        this.food.active = true;
        // Spawn near amoeba
        const angle = Math.random() * Math.PI * 2;
        this.amoeba.targetX = cx + Math.cos(angle) * 150;
        this.amoeba.targetY = cy + Math.sin(angle) * 150;

        // Target points stretch towards food
        this.amoeba.points.forEach((p, i) => {
            const pa = Math.atan2(Math.sin(p.angle), Math.cos(p.angle));
            const diff = Math.abs(pa - angle);
            if (diff < 1.0 || diff > Math.PI * 2 - 1.0) {
                p.targetRadius = 100 + Math.random() * 20; // Extend pseudopod
            } else {
                p.targetRadius = 40 + Math.random() * 20; // Retract other sides
            }
        });
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        ctx.clearRect(0, 0, W, H);
        this.t += 0.03;

        // Background
        if (this.group === 'flagellated' || this.group === 'sporozoans') {
            ctx.fillStyle = '#4c0519'; // Deep blood red
            ctx.fillRect(0, 0, W, H);

            // Flowing fluid
            ctx.fillStyle = 'rgba(255,100,100,0.05)';
            ctx.beginPath();
            for (let y = 0; y < H; y += 50) {
                ctx.moveTo(0, y + Math.sin(this.t + y) * 20);
                ctx.lineTo(W, y + Math.sin(this.t + y + 1) * 20);
            }
            ctx.stroke();

            // Draw RBCs
            ctx.fillStyle = '#be123c'; // Red blood cell
            ctx.strokeStyle = '#9f1239';
            ctx.lineWidth = 3;
            this.rbcs.forEach(r => {
                r.x -= r.speed; // Flow left
                if (r.x < -50) r.x = W + 50;

                ctx.save();
                ctx.translate(r.x, r.y);
                ctx.scale(r.scale, r.scale);
                ctx.beginPath();
                ctx.arc(0, 0, 30, 0, Math.PI * 2);
                ctx.fill(); ctx.stroke();
                // Indentation
                ctx.fillStyle = '#9f1239';
                ctx.beginPath();
                ctx.ellipse(0, 0, 15, 10, Math.PI / 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            if (this.group === 'flagellated') {
                this.drawFlagellated(ctx, W, H);
            } else {
                this.drawSporozoans(ctx, W, H);
            }
        }
        else {
            // Water background
            let gradient = ctx.createLinearGradient(0, 0, 0, H);
            gradient.addColorStop(0, '#020617');
            gradient.addColorStop(1, '#0f172a');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, W, H);

            if (this.group === 'amoeboid') this.drawAmoeboid(ctx, cx, cy);
            else if (this.group === 'ciliated') this.drawCiliated(ctx, W, H);
        }
    }

    drawAmoeboid(ctx, cx, cy) {
        let a = this.amoeba;

        // Move towards target
        let dx = a.targetX - a.x;
        let dy = a.targetY - a.y;
        let dist = Math.hypot(dx, dy);

        if (dist > 5) {
            a.x += dx * 0.01;
            a.y += dy * 0.01;
        } else if (dist <= 5 && this.food.active) {
            this.food.active = false;
            // Retract pseudopodia after eating
            a.points.forEach(p => p.targetRadius = 55 + Math.random() * 20);
            setTimeout(() => this.spawnFood(cx, cy), 2000);
        }

        // Draw food
        if (this.food.active) {
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(a.targetX, a.targetY, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.save();
        ctx.translate(a.x, a.y);

        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)'; // Ghostly grey
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#cbd5e1';
        ctx.shadowBlur = 15;

        // Shape interpolation
        a.points.forEach(p => {
            p.radius += (p.targetRadius - p.radius) * 0.05;
            p.angle += Math.sin(this.t + p.phase) * 0.01; // Wiggle
        });

        // Use bezier curves for smooth blob
        ctx.beginPath();
        for (let i = 0; i < a.points.length; i++) {
            let p1 = a.points[i];
            let p2 = a.points[(i + 1) % a.points.length];

            let r1 = p1.radius + Math.sin(this.t * 2 + p1.phase) * 5;
            let r2 = p2.radius + Math.sin(this.t * 2 + p2.phase) * 5;

            let x1 = Math.cos(p1.angle) * r1;
            let y1 = Math.sin(p1.angle) * r1;
            let x2 = Math.cos(p2.angle) * r2;
            let y2 = Math.sin(p2.angle) * r2;

            let mx = (x1 + x2) / 2;
            let my = (y1 + y2) / 2;

            if (i === 0) {
                ctx.moveTo(x1, y1);
            }
            ctx.quadraticCurveTo(x1, y1, mx, my);

            if (i === a.points.length - 1) {
                // Connect back to start
                let p0 = a.points[0];
                let r0 = p0.radius + Math.sin(this.t * 2 + p0.phase) * 5;
                ctx.quadraticCurveTo(x2, y2, Math.cos(p0.angle) * r0, Math.sin(p0.angle) * r0);
            }
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Nucleus
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(10, -10, 15, 0, Math.PI * 2);
        ctx.fill();

        // Food vacuoles (if eaten)
        if (!this.food.active) {
            ctx.fillStyle = 'rgba(74, 222, 128, 0.5)';
            ctx.beginPath();
            ctx.arc(-10, 15, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#94a3b8';
            ctx.stroke();
        }

        ctx.restore();
    }

    drawCiliated(ctx, W, H) {
        let p = this.paramecium;

        // Figure-8 movement
        p.x = W / 2 + Math.sin(this.t * 0.5) * 300;
        p.y = H / 2 + Math.sin(this.t * 1.0) * 100;

        // Calculate tangent angle for rotation
        let dx = Math.cos(this.t * 0.5) * 300 * 0.5;
        let dy = Math.cos(this.t * 1.0) * 100 * 1.0;
        p.angle = Math.atan2(dy, dx);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        ctx.scale(1.5, 1.5);

        // Draw food particles being swept in
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 5; i++) {
            let fx = 100 + Math.random() * 50 - (this.t * 50) % 100;
            let fy = 20 + Math.sin(this.t * 10 + i) * 10;
            if (fx > 30) {
                ctx.beginPath(); ctx.arc(fx, fy, 2, 0, Math.PI * 2); ctx.fill();
            }
        }

        ctx.fillStyle = '#1e293b'; // Slipper shape body
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;

        // Slipper shape
        ctx.beginPath();
        ctx.moveTo(70, 0); // Anterior (front)
        ctx.quadraticCurveTo(50, -30, -20, -25); // Top back
        ctx.quadraticCurveTo(-60, -20, -70, 0); // Posterior curve
        ctx.quadraticCurveTo(-50, 25, 10, 25); // Bottom curve

        // The oral groove (gullet)
        ctx.lineTo(20, 15);
        ctx.quadraticCurveTo(30, -5, 40, 5);
        ctx.quadraticCurveTo(60, 20, 70, 0);
        ctx.fill();
        ctx.stroke();

        let pathLengths = [140, 55, 70, 60]; // Approx lengths of segments
        let pathOffsets = [
            { x: 70, y: 0, ang: Math.PI },
            { x: -20, y: -25, ang: Math.PI / 2 },
            { x: -70, y: 0, ang: 0 },
            { x: 10, y: 25, ang: -Math.PI / 2 }
        ];

        // Draw Cilia (thousands simulated by a few moving lines)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;

        // Top edge cilia
        for (let x = -60; x <= 60; x += 5) {
            ctx.beginPath();
            let y = -25 + (x * x) / 250;
            ctx.moveTo(x, y);
            ctx.lineTo(x - Math.cos(this.t * 15 + x * 0.1) * 5, y - 8 - Math.sin(this.t * 10) * 3);
            ctx.stroke();
        }

        // Bottom edge cilia
        for (let x = -60; x <= 10; x += 5) {
            ctx.beginPath();
            let y = 25 - (x * x) / 250;
            ctx.moveTo(x, y);
            ctx.lineTo(x - Math.cos(this.t * 15 + x * 0.1) * 5, y + 8 + Math.sin(this.t * 10) * 3);
            ctx.stroke();
        }

        // Oral groove cilia (sweeping food)
        ctx.strokeStyle = '#38bdf8'; // Highlighted active cilia
        for (let x = 20; x <= 60; x += 4) {
            ctx.beginPath();
            ctx.moveTo(x, 15 - (x - 40) * (x - 40) / 40);
            let sweep = Math.sin(this.t * 20 - x * 0.5) * 8;
            ctx.lineTo(x - 5 - sweep, 5 - sweep);
            ctx.stroke();
        }

        // Macronucleus
        ctx.fillStyle = '#64748b';
        ctx.beginPath(); ctx.ellipse(-10, 0, 15, 8, 0, 0, Math.PI * 2); ctx.fill();

        // Micronucleus
        ctx.beginPath(); ctx.arc(10, 0, 4, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }

    drawFlagellated(ctx, W, H) {
        let t = this.trypanosoma;

        // Wavy movement tracking a target point
        t.x += Number(t.vx);
        t.y += Number(t.vy) + Math.sin(this.t * 2) * 2;

        if (t.x > W + 100) t.x = -100;
        if (t.x < -100) t.x = W + 100;
        if (t.y > H + 100) t.y = -100;
        if (t.y < -100) t.y = H + 100;

        // Update body segments for snake-like motion
        t.body.unshift({ x: t.x, y: t.y });
        if (t.body.length > 20) t.body.pop();

        // Draw body
        ctx.fillStyle = '#7dd3fc'; // Pale blue Trypanosoma
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(t.body[0].x, t.body[0].y);
        for (let i = 1; i < t.body.length; i++) {
            // Apply a sine wave perpendicular to motion path for wiggle
            let b = t.body[i];
            let wiggle = Math.sin(this.t * 10 - i * 0.5) * 5;
            ctx.lineTo(b.x, b.y + wiggle);
        }
        ctx.stroke();

        // Undulating membrane & flagellum
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < t.body.length; i++) {
            let b = t.body[i];
            let wiggle = Math.sin(this.t * 10 - i * 0.5) * 5;
            let mx = b.x;
            let my = b.y + wiggle - 8; // Attach to edge
            if (i === 0) ctx.moveTo(mx, my);
            else ctx.quadraticCurveTo(b.x, b.y - 12, mx, my); // Membrane arches
        }

        // Free flagellum tip
        let last = t.body[t.body.length - 1];
        let tipX = last.x - 20;
        let tipY = last.y + Math.sin(this.t * 15) * 15;
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
    }

    drawSporozoans(ctx, W, H) {
        this.plasmodium.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;

            // Draw Sporozoite (infectious stage)
            ctx.save();
            ctx.translate(p.x, p.y);
            // Orient towards movement
            ctx.rotate(Math.atan2(p.vy, p.vx));

            ctx.fillStyle = '#a855f7'; // Purple-ish
            ctx.strokeStyle = '#db2777'; // Pink rim
            ctx.lineWidth = 1.5;

            // Crescent / sickle shape
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.quadraticCurveTo(0, -10, -10, -5);
            ctx.quadraticCurveTo(0, 0, 10, 0);
            ctx.fill(); ctx.stroke();

            ctx.restore();
        });
    }

    destroy() { }
}
