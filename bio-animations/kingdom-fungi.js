// ===== Animation 9: Kingdom Fungi =====

export class KingdomFungi {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.showSeptate = true;
        this.hyphae = [];

        controlsEl.innerHTML = `
            <label>Hyphae Type:
                <select id="hyphaeType" class="control-select">
                    <option value="septate">Septate Mycelium (with cross walls)</option>
                    <option value="coenocytic">Coenocytic Mycelium (multinucleated)</option>
                </select>
            </label>
            <div class="control-static mt-2">Fungi consist of long, slender thread-like structures called hyphae.</div>
        `;
        document.getElementById('hyphaeType').addEventListener('change', (e) => {
            this.showSeptate = e.target.value === 'septate';
            this.reset();
        });
        this.reset();
    }

    reset() {
        this.t = 0;
        this.hyphae = [];

        // Start with a single spore that germinates
        this.spore = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 15,
            germinated: false
        };

        // Root hypha
        this.hyphae.push({
            startX: this.spore.x,
            startY: this.spore.y,
            endX: this.spore.x,
            endY: this.spore.y,
            angle: Math.random() * Math.PI * 2,
            length: 0,
            maxLength: 100 + Math.random() * 100,
            active: true,
            generation: 0,
            parentLength: 0
        });
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        // Accumulate drawing over time (don't clear entirely)
        if (this.t === 0) {
            ctx.fillStyle = '#1e1b4b'; // Deep purple/brown soil
            ctx.fillRect(0, 0, W, H);

            // Draw initial spore
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(this.spore.x, this.spore.y, this.spore.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Add a slight fade effect to make tips glow
        ctx.fillStyle = 'rgba(30, 27, 75, 0.05)';
        ctx.fillRect(0, 0, W, H);

        this.t += 0.05;

        let activeCount = 0;

        // Grow hyphae network
        this.hyphae.forEach(h => {
            if (h.active) {
                activeCount++;

                // Grow
                h.length += 2;
                let progress = h.length / h.maxLength;

                // Slight curve during growth
                h.angle += (Math.random() - 0.5) * 0.2;

                h.endX = h.startX + Math.cos(h.angle) * h.length;
                h.endY = h.startY + Math.sin(h.angle) * h.length;

                // Branching logic
                if (progress > 0.5 && Math.random() < 0.05 && this.hyphae.length < 150 && h.generation < 5) {
                    this.hyphae.push({
                        startX: h.endX,
                        startY: h.endY,
                        endX: h.endX,
                        endY: h.endY,
                        angle: h.angle + (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.8),
                        length: 0,
                        maxLength: h.maxLength * 0.8,
                        active: true,
                        generation: h.generation + 1,
                        parentLength: 0
                    });
                }

                if (h.length >= h.maxLength) {
                    h.active = false;
                }
            }
        });

        // Redraw full network every frame
        this.drawMycelium(ctx);

        // Draw spore on top
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(this.spore.x, this.spore.y, this.spore.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#fef08a';
        ctx.font = '16px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Mycelium Network', cx, cy + 120);

        ctx.fillStyle = '#ccc';
        ctx.font = '14px Space Grotesk';
        if (this.showSeptate) {
            ctx.fillText('Septate hyphae have cross walls (septa) with pores dividing cells.', cx, H - 40);
        } else {
            ctx.fillText('Coenocytic hyphae are continuous tubes filled with multinucleated cytoplasm.', cx, H - 40);
        }
    }

    drawMycelium(ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Cell wall (chitin) glow
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.4)'; // Yellowish
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;

        // Draw all hyphae segments
        this.hyphae.forEach(h => {
            // Thickness decreases with generation
            let thickness = Math.max(2, 12 - h.generation * 2);
            ctx.lineWidth = thickness + 4;

            ctx.beginPath();
            ctx.moveTo(h.startX, h.startY);
            ctx.lineTo(h.endX, h.endY);
            ctx.stroke();

            // Core
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = thickness;
            ctx.stroke();

            // Draw internal structure (Septa or pure cytoplasm)
            ctx.strokeStyle = '#854d0e'; // Dark brown
            ctx.fillStyle = '#451a03'; // Nucleus color

            let dist = 0;
            let currentX = h.startX;
            let currentY = h.startY;
            let dx = Math.cos(h.angle);
            let dy = Math.sin(h.angle);

            while (dist < h.length - 10) {
                dist += 20;
                let nx = h.startX + dx * dist;
                let ny = h.startY + dy * dist;

                if (this.showSeptate) {
                    // Draw cross walls (septa)
                    ctx.beginPath();
                    // Normal vector to the hypha direction
                    let px = -dy * (thickness / 2);
                    let py = dx * (thickness / 2);
                    ctx.moveTo(nx + px, ny + py);
                    ctx.lineTo(nx - px, ny - py);
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Draw single nucleus per compartment (approximated location)
                    ctx.beginPath();
                    ctx.arc(nx - dx * 10, ny - dy * 10, thickness * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    // Coenocytic: continuous tube, many nuclei sprinkled
                    if (Math.random() < 0.5) {
                        let offset = (Math.random() - 0.5) * (thickness * 0.6);
                        ctx.beginPath();
                        ctx.arc(nx - dy * offset, ny + dx * offset, Math.max(1, thickness * 0.2), 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        });
    }

    destroy() { }
}
