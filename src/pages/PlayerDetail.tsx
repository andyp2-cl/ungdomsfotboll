
import React from "react";
import { useParams } from "react-router-dom";
import { PageContainer } from "@/components/page-containers/PageContainer";
import { PlayerDetail as PlayerDetailComponent } from "@/components/PlayerDetail";
import { usePlayers } from "@/hooks/usePlayers";

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const { players, activities, handlePlayerUpdate } = usePlayers();
  
  const player = id ? players.find(p => p.id === id) : null;
  
  if (!player) {
    return (
      <PageContainer>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Spelare hittades inte</h1>
          <p>Den begärda spelaren kunde inte hittas.</p>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <PlayerDetailComponent
        player={player}
        activities={activities || []}
        onClose={() => window.history.back()}
        onEdit={() => {}}
        onPlayerUpdate={handlePlayerUpdate}
        allPlayers={players}
      />
    </PageContainer>
  );
}
