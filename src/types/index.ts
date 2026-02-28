export interface VideoFormat {
  quality: 'hd' | 'sd';
  label: string;
  url: string;
  ext: string;
  formatId?: string;
  width?: number;
  height?: number;
  filesize?: number;
}

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  uploader?: string;
  formats: VideoFormat[];
  sourceUrl: string;
}
