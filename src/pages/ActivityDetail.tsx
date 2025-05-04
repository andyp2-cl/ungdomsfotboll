
import React from "react";
import { useParams } from "react-router-dom";
import { PageContainer } from "@/components/page-containers/PageContainer";

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <PageContainer isLoading={false}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Aktivitetsdetaljer</h1>
        <p>Visar detaljer för aktivitet med ID: {id}</p>
        {/* Här kan vi senare lägga till en komponent för aktivitetsdetaljer */}
      </div>
    </PageContainer>
  );
}
