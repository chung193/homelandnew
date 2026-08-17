'use client';

import { useEffect, useState } from 'react';

type GalleryImage = { id: string; url: string | null };

export default function PropertyGallery({ images, title }: { images: GalleryImage[]; title: string }) {
    const [selected, setSelected] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const active = images[selected] ?? images[0];

    useEffect(() => {
        if (!lightbox) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setLightbox(false);
            if (event.key === 'ArrowLeft') setSelected((value) => (value - 1 + images.length) % images.length);
            if (event.key === 'ArrowRight') setSelected((value) => (value + 1) % images.length);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKeyDown); };
    }, [images.length, lightbox]);

    const move = (offset: number) => setSelected((value) => (value + offset + images.length) % images.length);

    return <>
        <div className="space-y-2">
            <div className="group relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={active?.url ?? ''} alt={`${title} - ảnh ${selected + 1}`} onClick={() => setLightbox(true)} className="h-[clamp(20rem,48vw,36rem)] w-full cursor-zoom-in object-cover" />
                {images.length > 1 ? <>
                    <button type="button" onClick={() => move(-1)} className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl shadow transition hover:bg-white" aria-label="Ảnh trước">‹</button>
                    <button type="button" onClick={() => move(1)} className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-2xl shadow transition hover:bg-white" aria-label="Ảnh tiếp theo">›</button>
                </> : null}
                <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-sm text-white">{selected + 1} / {images.length}</span>
            </div>
            {images.length > 1 ? <div className="flex gap-2 overflow-x-auto pb-1">{images.map((image, index) => <button key={image.id} type="button" onClick={() => setSelected(index)} className={`shrink-0 overflow-hidden rounded-lg border-2 ${selected === index ? 'border-emerald-500' : 'border-transparent'}`} aria-label={`Chọn ảnh ${index + 1}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url ?? ''} alt="" className="h-16 w-24 object-cover sm:h-20 sm:w-28" />
            </button>)}</div> : null}
        </div>
        {lightbox ? <div className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4" role="dialog" aria-modal="true" aria-label="Xem ảnh bất động sản">
            <button type="button" onClick={() => setLightbox(false)} className="absolute right-4 top-4 rounded-full bg-white/15 px-4 py-2 text-white">Đóng ×</button>
            {images.length > 1 ? <button type="button" onClick={() => move(-1)} className="absolute left-4 rounded-full bg-white/15 px-4 py-3 text-3xl text-white" aria-label="Ảnh trước">‹</button> : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active?.url ?? ''} alt={`${title} - ảnh ${selected + 1}`} className="max-h-[90vh] max-w-[90vw] object-contain" />
            {images.length > 1 ? <button type="button" onClick={() => move(1)} className="absolute right-4 rounded-full bg-white/15 px-4 py-3 text-3xl text-white" aria-label="Ảnh tiếp theo">›</button> : null}
        </div> : null}
    </>;
}
