
import React from "react";
import { PageContainer } from "./PageContainer";
import { PullToRefresh } from "../pull-to-refresh";

interface RefreshablePageContainerProps {
  children: React.ReactNode;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export function RefreshablePageContainer({ 
  children, 
  isLoading, 
  onRefresh,
  disabled = false
}: RefreshablePageContainerProps) {
  return (
    <PageContainer isLoading={isLoading}>
      <PullToRefresh onRefresh={onRefresh} disabled={disabled}>
        {children}
      </PullToRefresh>
    </PageContainer>
  );
}
