'use client';
import React, { useEffect, useRef } from 'react';

export default function CanvasPainter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas dimensions
    const updateSize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Load image
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&q=80';

    let points: {x: number, y: number, radius: number}[] = [];
    
    img.onload = () => {
      let animationId: number;

      // Painting algorithm variables
      let currentX = -100;
      let currentY = 50;
      let direction = 1; // 1 for right, -1 for left
      const brushSize = 80;
      const speed = 25;

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'source-over';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'black';

        // Algorithm to sweep back and forth like a painter
        currentX += speed * direction;
        
        if (currentX > canvas.width + 100 && direction === 1) {
          direction = -1;
          currentY += brushSize * 1.5;
        } else if (currentX < -100 && direction === -1) {
          direction = 1;
          currentY += brushSize * 1.5;
        }

        // Add new point
        points.push({ x: currentX, y: currentY, radius: brushSize });
        
        // Reset if we painted the whole house to loop the animation
        if (currentY > canvas.height + 100) {
          points = [];
          currentX = -100;
          currentY = 50;
          direction = 1;
        }

        points.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = 'black';
          ctx.fill();
        });

        // Draw the image ONLY where the strokes are
        ctx.globalCompositeOperation = 'source-in';
        
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (canvasRatio > imgRatio) {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * imgRatio;
          drawHeight = canvas.height;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
        
        animationId = requestAnimationFrame(draw);
      };

      draw();
      
      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', updateSize);
      };
    };
  }, []);

  return (
    <div ref={containerRef} style={{
      width: '100%', height: '100%', position: 'relative',
      borderRadius: '24px', overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      animation: 'floatImage 6s ease-in-out infinite'
    }}>
      {/* Grayscale background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&q=80')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'grayscale(100%) opacity(0.5)',
        zIndex: 1
      }} />
      
      {/* Interactive Canvas revealing color */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          zIndex: 2, pointerEvents: 'none'
        }}
      />
      
    </div>
  );
}
