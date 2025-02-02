declare module 'react-image-filter' {
  import { ComponentType } from 'react';

  interface ImageFilterProps {
    image: string;
    filter: number[];
    colorOne?: string;
    colorTwo?: string;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    className?: string;
  }

  export const ImageFilter: ComponentType<ImageFilterProps>;
} 