import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { cn } from '../lib/utils';
import { API_URL } from '../utils/api';

export const SafeImage = ({ src, alt, className, fallbackSize = 24, ...props }) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!src) {
            setImgSrc(null);
            return;
        }

        // If it's a relative path (starts with /uploads), prepend API_URL
        if (src.startsWith('/uploads')) {
            setImgSrc(`${API_URL}${src}`);
        } else if (src.startsWith('http')) {
            // Absolute URL - use as is
            setImgSrc(src);
        } else {
            // Treat as relative path under /uploads
            setImgSrc(`${API_URL}/uploads/${src}`);
        }
        setHasError(false);
    }, [src]);

    if (!imgSrc || hasError) {
        return (
            <div className={cn('bg-secondary/50 rounded-lg flex items-center justify-center', className)}>
                <Package className={`h-${fallbackSize} w-${fallbackSize} text-muted-foreground`} />
            </div>
        );
    }

    return (
        <img
            src={imgSrc}
            alt={alt || 'Image'}
            onError={() => setHasError(true)}
            className={className}
            {...props}
        />
    );
};
