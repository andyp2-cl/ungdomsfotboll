
// Function to download a CSV template
export const downloadCSVTemplate = () => {
  const headers = "id,name,date,type,time,location_name,location_description,location_gps_link,cup_id";
  const sample1 = "f47ac10b-58cc-4372-a567-0e02b2c3d479,Träning,2025-05-10,training,18:00,Österås IP,Konstgräsplan 1,https://goo.gl/maps/abc123,";
  const sample2 = "550e8400-e29b-41d4-a716-446655440000,Match vs Team B,2025-05-15,match,15:30,Borta,Deras plan,,";
  
  const content = `${headers}\n${sample1}\n${sample2}`;
  
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "activities_template.csv");
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to download export instructions
export const downloadExportInstructions = () => {
  const content = `# Instruktioner för export av data från Supabase

## Exportera aktiviteter från activities-tabellen
1. Logga in på Supabase Admin-panelen för produktionsmiljön
2. Gå till "Table Editor" i vänstermenyn
3. Välj tabellen "activities"
4. Klicka på "..." (fler alternativ) längst upp till höger
5. Välj "Download CSV"
6. Spara filen på din dator

## Exportera spelare från players-tabellen
1. Logga in på Supabase Admin-panelen för produktionsmiljön
2. Gå till "Table Editor" i vänstermenyn
3. Välj tabellen "players"
4. Klicka på "..." (fler alternativ) längst upp till höger
5. Välj "Download CSV"
6. Spara filen på din dator

## Exportera spelardeltagande från player_activities-tabellen
1. Logga in på Supabase Admin-panelen för produktionsmiljön
2. Gå till "Table Editor" i vänstermenyn
3. Välj tabellen "player_activities"
4. Klicka på "..." (fler alternativ) längst upp till höger
5. Välj "Download CSV"
6. Spara filen på din dator

## Importera data
1. Gå till "Aktiviteter" -> "Verktyg" -> "Importera från fil" i utvecklingsmiljön
2. Välj CSV-format
3. Ladda upp de exporterade filerna en efter en
`;
  
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "supabase_export_instructions.txt");
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
