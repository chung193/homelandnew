'use client';

import { useEffect, useState } from 'react';
import { Carousel } from '@astryxdesign/core/Carousel';

type GalleryImage = { id: string; url: string | null };

export default function PropertyGallery({ images, title }: { images: GalleryImage[]; title: string }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [zoom, setZoom] = useState(1);
    const activeImage = activeIndex === null ? null : images[activeIndex];

    useEffect(() => {
        if (activeIndex === null) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const keydown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setActiveIndex(null);
            if (event.key === 'ArrowLeft') setActiveIndex((current) => current === null ? null : (current - 1 + images.length) % images.length);
            if (event.key === 'ArrowRight') setActiveIndex((current) => current === null ? null : (current + 1) % images.length);
        };
        window.addEventListener('keydown', keydown);
        return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', keydown); };
    }, [activeIndex, images.length]);

    function open(index: number) { setActiveIndex(index); setZoom(1); }
    function move(offset: number) { setActiveIndex((current) => current === null ? null : (current + offset + images.length) % images.length); setZoom(1); }

    return <>
        {activeImage === null ? <Carousel hasSnap hasEdgeFade gap={2} aria-label={title}>
            {images.map((image, index) => <button key={image.id} type="button" onClick={() => open(index)} className="group relative shrink-0 cursor-zoom-in overflow-hidden rounded-xl" aria-label={`Xem ảnh ${index + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url ?? ''} alt={`${title} - ảnh ${index + 1}`} className="h-72 w-[min(100vw-3rem,42rem)] object-cover transition-transform group-hover:scale-[1.02]" loading="lazy"/>
                <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-sm text-white">Phóng to</span>
            </button>)}
        </Carousel> : null}
        {activeImage ? <div className="fixed inset-0 z-[100] flex flex-col bg-black/90" role="dialog" aria-modal="true" aria-label="Xem ảnh bất động sản">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 text-white"><span>{activeIndex! + 1} / {images.length}</span><div className="flex items-center gap-2"><button type="button" className="rounded bg-white/15 px-3 py-2" onClick={() => setZoom((value) => Math.max(.5, value - .25))}>−</button><span className="min-w-14 text-center">{Math.round(zoom * 100)}%</span><button type="button" className="rounded bg-white/15 px-3 py-2" onClick={() => setZoom((value) => Math.min(4, value + .25))}>+</button><button type="button" className="rounded bg-white/15 px-3 py-2" onClick={() => setZoom(1)}>Đặt lại</button><button type="button" className="rounded bg-white/15 px-3 py-2" onClick={() => setActiveIndex(null)}>Đóng ✕</button></div></div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-4" onWheel={(event) => { if (event.ctrlKey) { event.preventDefault(); setZoom((value) => Math.min(4, Math.max(.5, value + (event.deltaY < 0 ? .1 : -.1)))); } }}>
                {images.length > 1 ? <button type="button" className="fixed left-3 z-10 rounded-full bg-black/60 px-4 py-3 text-2xl text-white" onClick={() => move(-1)} aria-label="Ảnh trước">‹</button> : null}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeImage.url ?? ''} alt={`${title} - ảnh ${activeIndex! + 1}`} className="max-h-full max-w-full select-none object-contain transition-transform" style={{ transform: `scale(${zoom})` }}/>
                {images.length > 1 ? <button type="button" className="fixed right-3 z-10 rounded-full bg-black/60 px-4 py-3 text-2xl text-white" onClick={() => move(1)} aria-label="Ảnh tiếp theo">›</button> : null}
            </div>
        </div> : null}
    </>;
}
