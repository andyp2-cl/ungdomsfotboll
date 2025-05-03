
/**
 * Helper functions for download functionality
 */

export const downloadCSVTemplate = (): void => {
  // Create CSV template
  const csvContent = "id,name,date,type,time,location_name,location_description,location_gps_link,cup_id\n" + 
                    "uuid-format,Exempel match,2024-05-01,match,13:00,Österås IP,F-plan 7-manna,https://maps.app.goo.gl/example,\n" + 
                    ",Annan match,2024-05-02,match,15:30,Österås IP,,,\n" +
                    ",Cup exempel,2024-05-10,cup,,,,";
  
  downloadFile(csvContent, "aktiviteter_mall.csv", "text/csv");
};

export const downloadExportInstructions = (): void => {
  // Create instructions
  const instructions = `
# Instruktioner för export från Supabase

För att exportera data från din live Supabase-miljö och importera till utvecklingsmiljön:

## Tabeller att exportera

1. activities - Innehåller alla aktiviteter (matcher, träningar, etc)
2. players - Innehåller alla spelare
3. player_activities - Kopplar ihop spelare med aktiviteter

## Steg för export

1. Logga in på Supabase Admin (https://supabase.com)
2. Välj ditt projekt
3. Gå till "Table Editor" i sidomenyn
4. Välj tabellen du vill exportera (activities, players, eller player_activities)
5. Klicka på "..." (tre punkter) längst till höger i tabellrubriken
6. Välj "Download CSV"
7. Upprepa för varje tabell

## Importera i utvecklingsmiljön

1. Använd verktyget på denna sida för att importera activities-tabellen
2. För players och player_activities, gå till Supabase i utvecklingsmiljön
3. Välj respektive tabell
4. Klicka på "Insert" och välj "Import data from CSV"

## Ordning för import (viktigt!)

1. Importera först players
2. Importera sedan activities
3. Importera sist player_activities

Detta säkerställer att alla relationer blir korrekta.
`;
  
  downloadFile(instructions, "supabase_exportera_instruktioner.txt", "text/plain");
};

// Helper function to download a file
const downloadFile = (content: string, fileName: string, fileType: string): void => {
  const blob = new Blob([content], { type: `${fileType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
