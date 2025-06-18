import { utils, writeFile } from 'xlsx';
import { Activity, Player } from '@/types/player';
import { formatDate } from './formatDate';

interface ExportRow {
  Datum: string;
  Hemmalag: string;
  Bortalag: string;
  [key: string]: string | number; // For dynamic player columns
}

export function exportMatchesToExcel(
  activities: Activity[],
  players: Player[],
  fileName: string = 'alla-matcher.xlsx'
) {
  // Filter to only include matches
  const matches = activities.filter(activity => activity.type === 'match');

  // Find the maximum number of players in any match
  const maxPlayers = Math.max(...matches.map(match => match.participants?.length || 0));

  // Create worksheet data
  const wsData: ExportRow[] = matches.map(match => {
    // Create base row with match info
    const row: ExportRow = {
      Datum: formatDate(match.date),
      Hemmalag: match.homeTeam || '',
      Bortalag: match.awayTeam || '',
    };

    // Add player columns
    if (match.participants) {
      match.participants.forEach((playerId, index) => {
        const player = players.find(p => p.id === playerId);
        row[`Spelare ${index + 1}`] = player ? player.name : playerId;
      });
    }

    // Fill remaining player columns with empty strings
    for (let i = (match.participants?.length || 0); i < maxPlayers; i++) {
      row[`Spelare ${i + 1}`] = '';
    }

    return row;
  });

  // Create workbook and worksheet
  const wb = utils.book_new();
  const ws = utils.json_to_sheet(wsData);

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Datum
    { wch: 20 }, // Hemmalag
    { wch: 20 }, // Bortalag
  ];
  
  // Add widths for player columns
  for (let i = 0; i < maxPlayers; i++) {
    columnWidths.push({ wch: 20 }); // Spelare 1, Spelare 2, etc.
  }
  
  ws['!cols'] = columnWidths;

  // Add worksheet to workbook
  utils.book_append_sheet(wb, ws, 'Matcher');

  // Save file
  writeFile(wb, fileName);
} 