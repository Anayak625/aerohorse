import { useState } from 'react';

interface DevicePerformance {
    isLowEnd: boolean;
    dpr: [number, number];
    shadows: boolean;
    antialias: boolean;
}

export function useDevicePerformance(): DevicePerformance {
    const [performance] = useState<DevicePerformance>(() => {
        if (typeof window === 'undefined') {
            return { isLowEnd: false, dpr: [1, 2], shadows: true, antialias: true };
        }
        const cores = navigator.hardwareConcurrency || 4;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const memory = (navigator as any).deviceMemory || 4;

        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        // Consider low end if it's a mobile device with low specs, or just very low specs generally
        const isLowEnd = (isMobile && cores <= 4) || cores < 4 || memory < 4;

        if (isLowEnd) {
            return {
                isLowEnd: true,
                dpr: [1, 1], // Cap at 1x on low-end
                shadows: false, // Turn off shadows
                antialias: false, // Turn off MSAA
            };
        } else if (isMobile) {
            // Mid-tier mobile
            return {
                isLowEnd: false, // Still allow some effects
                dpr: [1, 1.2], // Slightly reduced max DPR
                shadows: true,
                antialias: false, // Save processing
            };
        }

        return {
            isLowEnd: false,
            dpr: [1, 2],
            shadows: true,
            antialias: true,
        };
    });

    return performance;
}
