'use client';

import { useState } from 'react';
import DownloadForm from './DownloadForm';
import VideoResult from './VideoResult';
import type { VideoInfo } from '@/types';

export default function DownloadSection() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  return (
    <div className="w-full">
      {!videoInfo && <DownloadForm onResult={setVideoInfo} onClear={() => setVideoInfo(null)} />}
      {videoInfo && <VideoResult info={videoInfo} onClear={() => setVideoInfo(null)} />}
    </div>
  );
}
