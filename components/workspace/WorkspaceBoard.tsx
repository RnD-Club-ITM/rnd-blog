import dynamic from "next/dynamic";
import React, { memo } from "react";

// Dynamically import Tldraw with SSR disabled to avoid production issues with browser-only APIs
const TldrawComponent = dynamic(async () => (await import("tldraw")).Tldraw, {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white gap-3">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#e85d2c] border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,1)] flex items-center justify-center animate-pulse">
        <span className="text-white text-xl">🎨</span>
      </div>
      <p className="font-head font-bold text-sm text-gray-600">
        Loading Canvas...
      </p>
    </div>
  ),
});

interface WorkspaceBoardProps {
  collaborationId: string;
}

export const WorkspaceBoard = memo(function WorkspaceBoard({ collaborationId }: WorkspaceBoardProps) {
  if (!collaborationId) return null;
  
  return (
    <div className="w-full h-full relative border-2 border-black rounded-lg overflow-hidden bg-white shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
      <div className="absolute inset-0 z-0">
        <TldrawComponent 
          key={collaborationId} 
          persistenceKey={`workspace-${collaborationId}`} 
          autoFocus={false}
        />
      </div>
    </div>
  );
});
