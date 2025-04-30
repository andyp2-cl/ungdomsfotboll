
import { useEffect } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { Players } from "./pages/Players";
import { Activities } from "./pages/Activities";
import { Navbar } from "./components/Navbar";
import { Container } from "./components/Container";
import { setupAutoBackup } from "./utils/storage/backup/autoBackup";
import { Toaster } from "sonner";

export function App() {
  // Initialize auto-backup system
  useEffect(() => {
    const cleanup = setupAutoBackup();
    return cleanup;
  }, []);

  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Navbar />
        <Container>
          <Routes>
            <Route path="/" element={<Players />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/players" element={<Players />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </>
  );
}
