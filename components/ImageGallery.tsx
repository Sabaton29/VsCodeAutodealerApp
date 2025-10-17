import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from './Icon';

type ImageType = 'Ingreso' | 'Avance' | 'Entrega' | 'Diagnóstico';
interface ImageSource {
    src: string;
    type: ImageType;
    timestamp: string;
    notes?: string;
}

interface ImageGalleryProps {
    images: ImageSource[];
}

const typeStyles: Record<ImageType, { bg: string; text: string }> = {
    'Ingreso': { bg: 'bg-blue-800/50', text: 'text-blue-200' },
    'Diagnóstico': { bg: 'bg-purple-800/50', text: 'text-purple-200' },
    'Avance': { bg: 'bg-yellow-800/50', text: 'text-yellow-200' },
    'Entrega': { bg: 'bg-green-800/50', text: 'text-green-200' },
};

const Lightbox: React.FC<{
    image: ImageSource;
    onClose: () => void;
    onNavigate: (direction: 'next' | 'prev') => void;
}> = ({ image, onClose, onNavigate }) => {
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') onNavigate('next');
            if (e.key === 'ArrowLeft') onNavigate('prev');
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNavigate, onClose]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = image.src;
        // Create a filename from type and timestamp
        const filename = `foto_${image.type.toLowerCase()}_${new Date(image.timestamp).toISOString().split('T')[0]}.jpg`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black dark:bg-gray-900/90 animate-fade-in-scale" onClick={onClose}>
            <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Image Display */}
                <div className="flex-1 flex items-center justify-center p-4">
                    <img src={image.src} alt={`Evidencia de ${image.type}`} className="max-w-full max-h-full object-contain" />
                </div>
                {/* Info and Actions Panel */}
                <div className="flex-shrink-0 bg-black dark:bg-gray-900/50 backdrop-blur-sm p-4 text-white flex justify-between items-center">
                    <div>
                        <span className={`px-2 py-1 text-xs font-bold rounded-md ${typeStyles[image.type].bg} ${typeStyles[image.type].text}`}>{image.type}</span>
                        <p className="text-sm mt-1">{image.notes || 'Sin descripción'}</p>
                        <p className="text-xs text-gray-400">{new Date(image.timestamp).toLocaleString('es-CO')}</p>
                    </div>
                    <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-brand-red rounded-lg hover:bg-red-700">
                        <Icon name="upload" className="w-4 h-4" /> Descargar
                    </button>
                </div>
            </div>

            {/* Navigation and Close Buttons */}
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black dark:bg-gray-900/50 rounded-full hover:bg-black dark:bg-gray-900/80"><Icon name="x" className="w-6 h-6 text-white" /></button>
            <button onClick={() => onNavigate('prev')} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black dark:bg-gray-900/50 rounded-full hover:bg-black dark:bg-gray-900/80"><Icon name="chevron-down" className="w-6 h-6 text-white rotate-90" /></button>
            <button onClick={() => onNavigate('next')} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black dark:bg-gray-900/50 rounded-full hover:bg-black dark:bg-gray-900/80"><Icon name="chevron-right" className="w-6 h-6 text-white" /></button>
        </div>
    );
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

    const handleImageError = (index: number) => {
        setImageErrors(prev => new Set([...prev, index]));
    };

    const handleNavigate = useCallback((direction: 'next' | 'prev') => {
        if (selectedImageIndex === null) return;
        if (direction === 'next') {
            setSelectedImageIndex((prev) => (prev! + 1) % images.length);
        } else {
            setSelectedImageIndex((prev) => (prev! - 1 + images.length) % images.length);
        }
    }, [selectedImageIndex, images.length]);
    
    return (
        <div className="bg-dark-light rounded-xl p-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 mb-4"><Icon name="camera" className="w-6 h-6 text-brand-red"/> Imprevisto</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {images.map((image, index) => (
                    <div key={index} className="relative group cursor-pointer" onClick={() => !imageErrors.has(index) && setSelectedImageIndex(index)}>
                        {imageErrors.has(index) ? (
                            <div className="w-full h-24 bg-gray-700 rounded-md flex items-center justify-center">
                                <div className="text-center">
                                    <Icon name="exclamation-triangle" className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-400">Error al cargar</p>
                                </div>
                            </div>
                        ) : (
                            <img 
                                src={image.src} 
                                alt={`Evidencia ${index + 1}`} 
                                className="w-full h-24 object-cover rounded-md" 
                                onError={() => handleImageError(index)}
                            />
                        )}
                        <div className="absolute inset-0 bg-black dark:bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"></div>
                        <span className={`absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-bold rounded ${typeStyles[image.type].bg} ${typeStyles[image.type].text}`}>
                            {image.type}
                        </span>
                    </div>
                ))}
            </div>

            {selectedImageIndex !== null && (
                <Lightbox
                    image={images[selectedImageIndex]}
                    onClose={() => setSelectedImageIndex(null)}
                    onNavigate={handleNavigate}
                />
            )}
        </div>
    );
};

export default ImageGallery;