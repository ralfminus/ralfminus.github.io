document.addEventListener('DOMContentLoaded', () => {
    // --- Sticky Header Logic ---
    const header = document.querySelector('.header');
    const scrollThreshold = 50;

    const handleHeaderScroll = () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    };

    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Initial check


    // --- Scroll-Based Canvas Animation (Prompt 2) ---
    const canvas = document.getElementById('hero-scan-canvas');
    if (!canvas) return; // Guard clause if canvas is missing

    const context = canvas.getContext('2d');
    const frameCount = 31; // 0 to 30 = 31 frames
    const imgFolder = 'img/skarosserie_scan_seq/';
    const images = [];
    const scanFrame = {
        frame: 0
    };

    // 1. Preload Images
    // Filenames: frame_00_delay-0.2s.webp to frame_30...
    const preloadImages = () => {
        for (let i = 0; i < frameCount; i++) {
            const img = new Image();
            // Zero-pad numbers to 2 digits (00, 01, ..., 30)
            const paddedIndex = i.toString().padStart(2, '0');
            img.src = `${imgFolder}frame_${paddedIndex}_delay-0.2s.webp`;
            images.push(img);

            // Draw first frame when loaded
            if (i === 0) {
                img.onload = () => {
                    renderFrame(0);
                };
            }
        }
    };

    // 2. Render Logic
    const renderFrame = (index) => {
        if (index >= 0 && index < frameCount && images[index] && images[index].complete) {
            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Image - Maintain Aspect Ratio (Contain)
            const img = images[index];

            // Calculate aspect ratios
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;

            let drawWidth, drawHeight, offsetX, offsetY;

            if (canvasRatio > imgRatio) {
                // Canvas is wider than image -> Fit to height
                drawHeight = canvas.height;
                drawWidth = img.width * (canvas.height / img.height);
                offsetX = (canvas.width - drawWidth) / 2;
                offsetY = 0;
            } else {
                // Canvas is taller than image -> Fit to width
                drawWidth = canvas.width;
                drawHeight = img.height * (canvas.width / img.width);
                offsetX = 0;
                offsetY = (canvas.height - drawHeight) / 2;
            }

            context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }
    };

    // 3. Scroll Sync Logic
    const handleCanvasScroll = () => {
        const wrapper = document.querySelector('.hero-scroll-wrapper');
        if (!wrapper) return;

        const rect = wrapper.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Total scrollable distance within the wrapper (wrapper height - sticky element height)
        // Sticky element is 100vh, so we subtract viewportHeight
        const totalTravel = wrapper.offsetHeight - viewportHeight;

        // Calculate progress: how far have we scrolled into the wrapper?
        // rect.top becomes negative as we scroll down.
        // Multiplied by -1 gives us pixels scrolled past top.
        let scrollFraction = -rect.top / totalTravel;

        // Clone/Clamp
        if (scrollFraction < 0) scrollFraction = 0;
        if (scrollFraction > 1) scrollFraction = 1;

        // Map to frame index
        const frameIndex = Math.min(
            frameCount - 1,
            Math.floor(scrollFraction * frameCount)
        );

        requestAnimationFrame(() => renderFrame(frameIndex));
    };

    // 4. Resize Handling
    const handleResize = () => {
        // Make canvas resolution match CSS size for sharpness
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;

        // Redraw current frame
        handleCanvasScroll();
    };

    // Initialize
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleCanvasScroll);

    // Initial Setup
    handleResize(); // Set dimensions
    preloadImages(); // Start loading
});
