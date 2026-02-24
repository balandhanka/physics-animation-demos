// ===== Animation 12: Kingdom Animalia =====

export class KingdomAnimalia {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.foodPos = { x: 50, y: 150 };
        this.animalPos = { x: 400, y: 150 };
        this.ingested = false;
        this.digesting = false;
        this.digestionProgress = 0;

        controlsEl.innerHTML = `
            <div class="control-btn" id="btnAnimaliaFeed">Feed Organism</div>
            <div class="control-static mt-2" id="animaliaStatus">Mode of nutrition: Holozoic (by ingestion of food)</div>
        `;
        document.getElementById('btnAnimaliaFeed').addEventListener('click', () => {
            if (!this.ingested && !this.digesting) {
                // Start feeding animation
                this.foodPos = { x: 50, y: 150 };
                this.animalPos = { x: 400, y: 150 };
            }
        });
        this.reset();
    }

    reset() {
        this.t = 0;
        this.foodPos = { x: 50, y: 150 };
        this.animalPos = { x: 400, y: 150 };
        this.ingested = false;
        this.digesting = false;
        this.digestionProgress = 0;
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        ctx.clearRect(0, 0, W, H);
        this.t += 0.03;

        // Background
        let gradient = ctx.createLinearGradient(0, 0, 0, H);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.translate(cx - 200, cy - 100); // Center the scene

        // --- Animalia characteristics diagram (Left side) ---
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 18px Space Grotesk';
        ctx.textAlign = 'left';
        ctx.fillText('Key Features of Kingdom Animalia:', -200, -80);

        ctx.font = '14px Space Grotesk';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('1. Multicellular Eukaryotes', -200, -50);
        ctx.fillText('2. Lack cell walls (plasma membrane only)', -200, -25);
        ctx.fillText('3. Heterotrophic (Holozoic nutrition)', -200, 0);
        ctx.fillText('4. Internal digestion cavity', -200, 25);
        ctx.fillText('5. Store reserves as Glycogen or Fat', -200, 50);
        ctx.fillText('6. Elaborate sensory & neuromotor mechanism', -200, 75);

        // --- Holozoic Nutrition Animation (Right side) ---

        // Update positions based on state
        if (!this.ingested && !this.digesting) {
            // Food moves towards animal
            if (this.foodPos.x < this.animalPos.x - 40) {
                this.foodPos.x += 2;
                document.getElementById('animaliaStatus').textContent = 'Ingestion (Taking in food)...';
            } else {
                this.ingested = true;
                this.digesting = true;
                document.getElementById('animaliaStatus').textContent = 'Digestion in internal cavity...';
            }
        } else if (this.digesting) {
            this.digestionProgress += 0.01;
            if (this.digestionProgress >= 1) {
                this.digesting = false;
                document.getElementById('animaliaStatus').textContent = 'Absorption and Storage (as Glycogen/Fat). Ready for next meal.';
                setTimeout(() => this.reset(), 3000); // Auto-reset after a while
            }
        }

        // Draw Animal (simple multicellular organism representation)
        let ax = this.animalPos.x;
        let ay = this.animalPos.y;

        // Body (multicellular grid)
        ctx.fillStyle = '#f43f5e'; // Fleshy pink/red
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 2;

        // Main body shape (oval)
        ctx.beginPath();
        let wobble = Math.sin(this.t) * 2;
        ctx.ellipse(ax, ay + wobble, 60, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cells (no cell walls, just membranes)
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = -40; i <= 40; i += 20) {
            ctx.moveTo(ax + i, ay - 30 + wobble);
            ctx.lineTo(ax + i, ay + 30 + wobble);
        }
        for (let j = -20; j <= 20; j += 20) {
            ctx.moveTo(ax - 50, ay + j + wobble);
            ctx.lineTo(ax + 50, ay + j + wobble);
        }
        ctx.stroke();

        // Mouth / Ingestion opening (left side)
        ctx.fillStyle = '#0f172a'; // Dark inside
        ctx.beginPath();
        let mouthOpen = (!this.ingested) ? Math.max(0, 20 - (this.animalPos.x - this.foodPos.x) * 0.2) : 0;
        if (mouthOpen < 0) mouthOpen = 0;
        if (mouthOpen > 20) mouthOpen = 20;

        ctx.ellipse(ax - 55, ay + wobble, 5, mouthOpen, 0, 0, Math.PI * 2);
        ctx.fill();

        // Internal digestive cavity (Gut)
        ctx.fillStyle = '#be123c';
        ctx.beginPath();
        ctx.ellipse(ax + 10, ay + wobble, 25, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#9f1239';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw Food
        if (!this.ingested) {
            ctx.fillStyle = '#34d399'; // Green leaf/food
            ctx.beginPath();
            ctx.arc(this.foodPos.x, this.foodPos.y, 10, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.digesting) {
            // Food inside gut breaking down
            let foodRadius = 10 * (1 - this.digestionProgress);
            ctx.fillStyle = '#34d399';
            if (foodRadius > 0) {
                ctx.beginPath();
                ctx.arc(ax + 10, ay + wobble, foodRadius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Nutrients absorbing into body (Glycogen particles)
            if (this.digestionProgress > 0.3) {
                let numParticles = Math.floor(this.digestionProgress * 50);
                ctx.fillStyle = '#fde047'; // Yellow glycogen
                for (let i = 0; i < numParticles; i++) {
                    let angle = (i / 50) * Math.PI * 2 * 5; // Spiral out
                    let dist = 15 + (i / 50) * 35;
                    let px = ax + 10 + Math.cos(angle + this.t * 2) * dist;
                    let py = ay + Math.sin(angle + this.t * 2) * dist + wobble;
                    // Keep inside body bounds loosely
                    if (Math.hypot(px - ax, py - ay) < 55) {
                        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
                    }
                }
            }
        } else {
            // Fully digested, store glycogen showing
            ctx.fillStyle = '#fde047';
            for (let i = 0; i < 30; i++) {
                let px = ax + (Math.random() - 0.5) * 90;
                let py = ay + (Math.random() - 0.5) * 50 + wobble;
                if (Math.pow(px - ax, 2) / (60 * 60) + Math.pow(py - ay - wobble, 2) / (40 * 40) < 0.8) {
                    ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
                }
            }
        }

        ctx.restore();
    }

    destroy() { }
}
