// ===== BIO-APP.JS – Navigation & Animation Lifecycle Controller =====
// Enhanced with anime.js powered UI transitions

import { KingdomMonera } from './bio-animations/kingdom-monera.js';
import { Archaebacteria } from './bio-animations/archaebacteria.js';
import { Eubacteria } from './bio-animations/eubacteria.js';
import { Chrysophytes } from './bio-animations/chrysophytes.js';
import { Dinoflagellates } from './bio-animations/dinoflagellates.js';
import { Euglenoids } from './bio-animations/euglenoids.js';
import { SlimeMoulds } from './bio-animations/slime-moulds.js';
import { Protozoans } from './bio-animations/protozoans.js';
import { KingdomFungi } from './bio-animations/kingdom-fungi.js';
import { FungiClasses } from './bio-animations/fungi-classes.js';
import { KingdomPlantae } from './bio-animations/kingdom-plantae.js';
import { KingdomAnimalia } from './bio-animations/kingdom-animalia.js';
import { Viruses } from './bio-animations/viruses.js';
import { ViroidsPrionsLichens } from './bio-animations/viroids-prions-lichens.js';

// Registry of all animation modules
const ANIMATIONS = {
    'kingdom-monera': {
        module: KingdomMonera,
        title: 'Bacteria Shapes',
        description: 'Bacteria are grouped under four categories based on their shape: coccus, bacillus, vibrio, and spirillum.',
        formula: 'Four basic shapes: Spherical, Rod, Comma, Spiral',
        concept: 'Bacteria are the sole members of Kingdom Monera. They are the most abundant micro-organisms and occur almost everywhere. Though their structure is simple, they are very complex in behaviour.'
    },
    'archaebacteria': {
        module: Archaebacteria,
        title: 'Archaebacteria',
        description: 'Special bacteria that live in extreme habitats like salty areas, hot springs, and marshes.',
        formula: 'Extreme survivors: Halophiles, Thermoacidophiles, Methanogens',
        concept: 'Archaebacteria differ from other bacteria in having a different cell wall structure. Methanogens are present in the gut of ruminant animals and produce methane (biogas).'
    },
    'eubacteria': {
        module: Eubacteria,
        title: 'Eubacteria & Cyanobacteria',
        description: 'True bacteria characterized by a rigid cell wall. Includes photosynthetic blue-green algae.',
        formula: 'Nitrogen fixation in specialized cells called heterocysts',
        concept: 'Cyanobacteria have chlorophyll a similar to green plants. They often form blooms in polluted water bodies. Heterotrophic bacteria are abundant decomposers.'
    },
    'chrysophytes': {
        module: Chrysophytes,
        title: 'Chrysophytes & Diatoms',
        description: 'Photosynthetic plankton found in fresh and marine environments. Diatoms have indestructible silica cell walls.',
        formula: 'Silica cell walls fit together like a soap box',
        concept: 'Diatoms have left behind large amounts of cell wall deposits accumulating over billions of years referred to as diatomaceous earth. They are chief producers in oceans.'
    },
    'dinoflagellates': {
        module: Dinoflagellates,
        title: 'Dinoflagellates',
        description: 'Marine, photosynthetic protists with stiff cellulose plates and two flagella.',
        formula: 'Rapid multiplication causes red tides (e.g., Gonyaulax)',
        concept: 'Most have two flagella; one lies longitudinally and the other transversely in a furrow between the wall plates. Toxins released during red tides can kill marine animals.'
    },
    'euglenoids': {
        module: Euglenoids,
        title: 'Euglenoids',
        description: 'Fresh water organisms with a flexible pellicle instead of a cell wall. They are mixotrophic.',
        formula: 'Photosynthetic in sunlight, heterotrophic without it',
        concept: 'Though photosynthetic in sunlight, when deprived of it they behave like heterotrophs by predating on smaller organisms. Their pigments are identical to higher plants.'
    },
    'slime-moulds': {
        module: SlimeMoulds,
        title: 'Slime Moulds',
        description: 'Saprophytic protists that form an aggregation called plasmodium under suitable conditions.',
        formula: 'Adverse conditions → Plasmodium differentiates → Fruiting bodies with spores',
        concept: 'The body moves along decaying twigs and leaves engulfing organic material. Their spores possess true walls and are extremely resistant, surviving for many years.'
    },
    'protozoans': {
        module: Protozoans,
        title: 'Protozoans',
        description: 'Primitive relatives of animals. All are heterotrophs living as predators or parasites.',
        formula: 'Four groups: Amoeboid, Flagellated, Ciliated, Sporozoans',
        concept: 'Amoeboid use pseudopodia (Amoeba), Flagellated have flagella (Trypanosoma), Ciliated have thousands of cilia (Paramoecium), and Sporozoans have an infectious spore-like stage (Plasmodium).'
    },
    'kingdom-fungi': {
        module: KingdomFungi,
        title: 'Fungi Structure',
        description: 'Heterotrophic organisms showing great diversity in morphology and habitat.',
        formula: 'Cell walls made of chitin and polysaccharides',
        concept: 'Except for yeast, fungi are filamentous. Their bodies consist of long, slender thread-like structures called hyphae. The network of hyphae is known as mycelium.'
    },
    'fungi-classes': {
        module: FungiClasses,
        title: 'Classes of Fungi',
        description: 'Fungi are classified based on mycelium morphology, mode of spore formation and fruiting bodies.',
        formula: 'Phycomycetes, Ascomycetes, Basidiomycetes, Deuteromycetes',
        concept: 'Phycomycetes (algal fungi), Ascomycetes (sac fungi), Basidiomycetes (club fungi/mushrooms), and Deuteromycetes (imperfect fungi which only reproduce asexually).'
    },
    'kingdom-plantae': {
        module: KingdomPlantae,
        title: 'Kingdom Plantae',
        description: 'Eukaryotic chlorophyll-containing organisms with prominent chloroplasts and cellulose cell walls.',
        formula: 'Alternation of generations: diploid sporophyte ↔ haploid gametophyte',
        concept: 'Life cycle has two distinct phases that alternate. The lengths of these phases, and whether they are free-living or dependent, vary among different plant groups.'
    },
    'kingdom-animalia': {
        module: KingdomAnimalia,
        title: 'Kingdom Animalia',
        description: 'Heterotrophic, multicellular eukaryotes whose cells lack cell walls.',
        formula: 'Mode of nutrition is holozoic (by ingestion of food)',
        concept: 'They digest food in an internal cavity and store reserves as glycogen or fat. Higher forms show elaborate sensory and neuromotor mechanism.'
    },
    'viruses': {
        module: Viruses,
        title: 'Viruses',
        description: 'Non-cellular, inert crystalline structures outside the living cell. Obligate parasites.',
        formula: 'Nucleoprotein structure: genetic material enclosed in a protein coat (capsid)',
        concept: 'Once they infect a cell, they take over the host machinery to replicate themselves, killing the host. They contain either RNA or DNA, never both.'
    },
    'viroids-prions-lichens': {
        module: ViroidsPrionsLichens,
        title: 'Viroids, Prions & Lichens',
        description: 'Acellular infectious agents and symbiotic associations.',
        formula: 'Viroid = free RNA | Prion = misfolded protein | Lichen = Algae + Fungi',
        concept: 'Viroids lack a protein coat. Prions cause neurological diseases (e.g., mad cow disease). Lichens are mutually useful symbiotic associations between algae (phycobiont) and fungi (mycobiont).'
    }
};

// DOM elements
const canvas = document.getElementById('animCanvas');
const ctx = canvas.getContext('2d');
const titleEl = document.getElementById('animTitle');
const descEl = document.getElementById('animDescription');
const controlsEl = document.getElementById('animControls');
const formulaEl = document.getElementById('formulaCard');
const conceptEl = document.getElementById('conceptCard');
const navItems = document.querySelectorAll('.nav-item');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

let currentAnim = null;
let animFrameId = null;
let isFirstLoad = true;

// ===== ANIME.JS UI ANIMATIONS =====

// Stagger-reveal sidebar nav items on page load
function animateSidebarEntrance() {
    const items = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.nav-section-title');

    if (typeof anime !== 'undefined') {
        anime({
            targets: Array.from(sections),
            opacity: [0, 1],
            translateX: [-10, 0],
            duration: 400,
            delay: function (el, i) { return 80 + i * 60; },
            easing: 'easeOutCubic'
        });

        anime({
            targets: Array.from(items),
            opacity: [0, 1],
            translateX: [-12, 0],
            duration: 500,
            delay: function (el, i) { return 150 + i * 40; },
            easing: 'easeOutCubic'
        });

        anime({
            targets: '.logo-icon',
            scale: [0.5, 1],
            opacity: [0, 1],
            rotate: ['-15deg', '0deg'],
            duration: 600,
            easing: 'easeOutBack'
        });

        anime({
            targets: '.logo h1, .subtitle',
            opacity: [0, 1],
            translateX: [-8, 0],
            duration: 500,
            delay: function (el, i) { return 200 + i * 100; },
            easing: 'easeOutCubic'
        });
    } else {
        items.forEach(item => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        });
    }
}

// Animate header content on animation switch
function animateHeaderTransition() {
    if (typeof anime === 'undefined') return;

    anime({
        targets: '#animTitle',
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 400,
        easing: 'easeOutCubic'
    });

    anime({
        targets: '#animDescription',
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 450,
        delay: 80,
        easing: 'easeOutCubic'
    });

    anime({
        targets: '.anim-controls',
        opacity: [0, 1],
        translateX: [12, 0],
        duration: 400,
        delay: 120,
        easing: 'easeOutCubic'
    });
}

// Animate info panel cards
function animateInfoPanel() {
    if (typeof anime === 'undefined') return;

    anime({
        targets: '#formulaCard',
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 450,
        delay: 100,
        easing: 'easeOutCubic'
    });

    anime({
        targets: '#conceptCard',
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 450,
        delay: 200,
        easing: 'easeOutCubic'
    });
}

// Animate canvas entrance
function animateCanvasEntrance() {
    if (typeof anime === 'undefined') return;

    anime({
        targets: '#animCanvas',
        opacity: [0, 1],
        scale: [0.97, 1],
        duration: 500,
        delay: 50,
        easing: 'easeOutCubic'
    });
}

// Resize canvas to fill container
function resizeCanvas() {
    const wrapper = document.getElementById('canvasWrapper');
    const w = wrapper.clientWidth - 64;
    const h = wrapper.clientHeight - 40;
    canvas.width = Math.min(w, 1200);
    canvas.height = Math.min(h, 700);
    if (currentAnim && currentAnim.resize) {
        currentAnim.resize(canvas.width, canvas.height);
    }
}

// Load an animation
function loadAnimation(key) {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (currentAnim && currentAnim.destroy) currentAnim.destroy();

    const config = ANIMATIONS[key];
    if (!config) return;

    titleEl.textContent = config.title;
    descEl.textContent = config.description;
    formulaEl.innerHTML = `<h3>Key Formula</h3><div class="formula">${config.formula}</div>`;
    conceptEl.innerHTML = `<h3>Concept</h3><p>${config.concept}</p>`;
    controlsEl.innerHTML = '';

    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.anim === key);
    });

    resizeCanvas();

    // Add fallback if module is not yet implemented
    try {
        currentAnim = new config.module(canvas, ctx, controlsEl);
    } catch (e) {
        console.log("Animation not fully implemented yet:", e);
        currentAnim = {
            animate: () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.font = '24px Space Grotesk';
                ctx.textAlign = 'center';
                ctx.fillText('Animation Coming Soon', canvas.width / 2, canvas.height / 2);
            },
            destroy: () => { }
        };
    }

    if (!isFirstLoad) {
        animateHeaderTransition();
        animateInfoPanel();
        animateCanvasEntrance();
    } else {
        isFirstLoad = false;
        setTimeout(() => {
            animateHeaderTransition();
            animateInfoPanel();
            animateCanvasEntrance();
        }, 400);
    }

    function loop() {
        currentAnim.animate();
        animFrameId = requestAnimationFrame(loop);
    }
    loop();
}

// Event listeners
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        loadAnimation(item.dataset.anim);
        if (window.innerWidth <= 900) sidebar.classList.remove('open');
    });
});

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

window.addEventListener('resize', resizeCanvas);

// Initial load
animateSidebarEntrance();
loadAnimation('kingdom-monera');
