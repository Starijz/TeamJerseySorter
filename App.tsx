import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from './hooks/useTranslations';
import type { Team } from './types';
import { LanguageSelector } from './components/LanguageSelector';
import { TeamCard } from './components/TeamCard';
import { ShareIcon, UsersIcon, PaletteIcon, MoveIcon, ShuffleIcon, ClearIcon } from './components/Icons';

const TWO_TEAM_COLORS = ['#222222', '#F0F0F0'];
const FOUR_TEAM_COLORS = ['#222222', '#F0F0F0', '#F59E0B', '#10B981'];


const App: React.FC = () => {
  const t = useTranslations();
  const [namesInput, setNamesInput] = useState('');
  const [numberOfTeams, setNumberOfTeams] = useState<2 | 4>(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<number | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [dragOverTeamId, setDragOverTeamId] = useState<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // This effect resets the teams completely when the number of teams changes.
  useEffect(() => {
    const colors = numberOfTeams === 2 ? TWO_TEAM_COLORS : FOUR_TEAM_COLORS;
    const initialTeams: Team[] = Array.from({ length: numberOfTeams }, (_, i) => ({
      id: i + 1,
      name: `${t('team')} ${i + 1}`,
      members: [],
      color: colors[i],
    }));
    setTeams(initialTeams);
    setActiveTeamId(null);
    // We disable the lint rule because we INTENTIONALLY do not want this effect
    // to re-run when `t` (language) changes, as that is handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfTeams]);

  // This effect updates only the team names when the language changes, preserving members.
  useEffect(() => {
    setTeams(currentTeams =>
      currentTeams.map((team, i) => ({
        ...team,
        name: `${t('team')} ${i + 1}`
      }))
    );
  }, [t]);


  const allPlayers = useMemo(() => 
    [...new Set(namesInput
      .split(/[\n,;]+/)
      .map(name => name.trim())
      .filter(name => name.length > 0))]
  , [namesInput]);
      
  const assignedPlayers = useMemo(() => 
    new Set(teams.flatMap(t => t.members)), 
  [teams]);
      
  const unassignedPlayers = useMemo(() => 
    allPlayers.filter(p => !assignedPlayers.has(p)),
  [allPlayers, assignedPlayers]);


  const handleColorChange = useCallback((teamId: number, color: string) => {
    setTeams(currentTeams =>
      currentTeams.map(team =>
        team.id === teamId ? { ...team, color } : team
      )
    );
  }, []);
  
  const handleAssignPlayer = useCallback((playerName: string) => {
    if (activeTeamId === null) {
        alert(t('selectTeamFirst'));
        return;
    }
    setTeams(currentTeams => 
        currentTeams.map(team => 
            team.id === activeTeamId 
                ? { ...team, members: [...team.members, playerName].sort() }
                : team
        )
    );
  }, [activeTeamId, t]);
  
  const handleUnassignMember = useCallback((memberName: string, fromTeamId: number) => {
    setTeams(currentTeams => 
      currentTeams.map(team => 
        team.id === fromTeamId 
          ? { ...team, members: team.members.filter(m => m !== memberName) }
          : team
      )
    );
  }, []);

  const handleShare = useCallback(async () => {
    if (!resultsRef.current) return;
      
    setIsGeneratingImage(true);
    try {
      // Dynamically import the library only when needed
      const htmlToImage = await import('html-to-image');
      const dataUrl = await htmlToImage.toPng(resultsRef.current, { 
        quality: 1.0, 
        pixelRatio: 2,
        backgroundColor: '#111827'
      });
      const blob = await(await fetch(dataUrl)).blob();
      const file = new File([blob], 'teams_result.png', { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: t('shareTitle'),
          text: t('shareText'),
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'teams_result.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error(t('shareError'), error);
      // Check if it's a module loading error
      if (error instanceof Error && error.message.includes('Failed to fetch dynamically imported module')) {
        alert(t('shareLibraryError'));
      } else {
        alert(t('shareError'));
      }
    } finally {
      setIsGeneratingImage(false);
    }
  }, [t]);

  const handleDragStart = useCallback((e: React.DragEvent, playerName: string, sourceTeamId: number | null) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ playerName, sourceTeamId }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  
  const handleDragEnter = useCallback((teamId: number) => {
    setDragOverTeamId(teamId);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setDragOverTeamId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetTeamId: number) => {
    e.preventDefault();
    setDragOverTeamId(null);
    try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        const { playerName, sourceTeamId } = data as { playerName: string; sourceTeamId: number | null };

        if (sourceTeamId === targetTeamId) return;
  
        setTeams(currentTeams => {
            let newTeams = [...currentTeams];
            if (sourceTeamId !== null) {
                newTeams = newTeams.map(team =>
                    team.id === sourceTeamId
                        ? { ...team, members: team.members.filter(m => m !== playerName) }
                        : team
                );
            }
            newTeams = newTeams.map(team =>
                team.id === targetTeamId && !team.members.includes(playerName)
                    ? { ...team, members: [...team.members, playerName].sort() }
                    : team
            );
            return newTeams;
        });
    } catch (error) {
        console.error("Failed to parse drag-and-drop data", error);
    }
  }, []);

  const handleRandomize = useCallback(() => {
    if (allPlayers.length === 0) return;

    const shuffledPlayers = [...allPlayers];
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
    }

    const newTeams = teams.map(team => ({ ...team, members: [] as string[] }));

    shuffledPlayers.forEach((player, index) => {
        const teamIndex = index % numberOfTeams;
        newTeams[teamIndex].members.push(player);
    });
    
    newTeams.forEach(team => team.members.sort());

    setTeams(newTeams);
  }, [allPlayers, teams, numberOfTeams]);
  
  const handleClearNames = useCallback(() => {
    setNamesInput('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl flex justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Team Jersey Color
        </h1>
        <LanguageSelector />
      </header>

      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls Section */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="names" className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                <UsersIcon /> {t('enterNames')}
                <span className="text-sm font-normal bg-gray-700 text-gray-300 px-2 py-1 rounded-md">{allPlayers.length}</span>
              </label>
              {allPlayers.length > 0 && (
                <button 
                  onClick={handleClearNames}
                  className="text-sm text-gray-400 hover:text-white hover:bg-red-500/20 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                  title={t('clearNames')}
                >
                  <ClearIcon />
                  {t('clear')}
                </button>
              )}
            </div>
            <textarea
              id="names"
              value={namesInput}
              onChange={e => setNamesInput(e.target.value)}
              placeholder={t('namesPlaceholder')}
              className="w-full h-40 p-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-y"
            ></textarea>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-purple-300 flex items-center gap-2">
              <PaletteIcon /> {t('selectTeams')}
            </h3>
            <div className="flex gap-4">
              {[2, 4].map(num => (
                <button
                  key={num}
                  onClick={() => setNumberOfTeams(num as 2 | 4)}
                  className={`w-full py-3 px-4 rounded-lg text-center font-bold transition duration-200 ${
                    numberOfTeams === num
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {num} {t('teams')}
                </button>
              ))}
            </div>
          </div>
          
          <div className="pt-2">
            <h3 className="text-lg font-semibold mb-3 text-blue-300">{t('selectTeamToAssign')}</h3>
            <div className="flex gap-4 items-center justify-start">
              {teams.map(team => (
                <div 
                  key={team.id} 
                  className="flex flex-col items-center gap-2 cursor-pointer"
                  onClick={() => setActiveTeamId(team.id)}
                  title={t('clickToSelectTeam')}
                >
                   <label className="text-sm font-medium text-gray-400 cursor-pointer select-none">{team.name}</label>
                   <div 
                     className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                        activeTeamId === team.id 
                          ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-gray-800 border-transparent' 
                          : 'border-gray-600 hover:scale-110'
                      }`}
                     style={{ backgroundColor: team.color }}
                   ></div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-gray-700 pt-4 flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-gray-300">{t('actions')}</h3>
            <button 
              onClick={handleRandomize}
              disabled={allPlayers.length === 0}
              className="w-full py-3 px-4 rounded-lg text-center font-bold transition duration-200 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title={t('randomizeTooltip')}
            >
              <ShuffleIcon />
              {t('randomize')}
            </button>
          </div>
          
          <div className="flex-grow min-h-0 overflow-y-auto border-t-2 border-gray-700 pt-4">
             <h3 className="text-lg font-semibold mb-3 text-green-300">{t('unassignedPlayers')} ({unassignedPlayers.length})</h3>
             {allPlayers.length > 0 ? (
                unassignedPlayers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {unassignedPlayers.map(player => (
                            <button 
                                key={player}
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, player, null)}
                                onClick={() => handleAssignPlayer(player)}
                                className="px-3 py-1 bg-gray-600 text-gray-200 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-200 flex items-center gap-2 cursor-grab"
                                title={`${t('clickToAssign')} / ${t('dragToMove')}`}
                            >
                                <MoveIcon />
                                <span>{player}</span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">{t('allPlayersAssigned')}</p>
                )
             ) : (
                <p className="text-gray-500 italic">{t('noPlayers')}</p>
             )}
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-300">{t('results')}</h2>
          {teams.length > 0 ? (
            <div className="flex-grow flex flex-col justify-between">
              <div ref={resultsRef} id="results-container" className="bg-gray-800 p-4 rounded-lg">
                <div className={`grid ${numberOfTeams === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'} gap-4`}>
                  {teams.map(team => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      isActive={activeTeamId === team.id}
                      isDragOver={dragOverTeamId === team.id}
                      onColorChange={handleColorChange}
                      onUnassignMember={handleUnassignMember}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onPlayerDragStart={handleDragStart}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleShare}
                disabled={isGeneratingImage || allPlayers.length === 0}
                className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShareIcon />
                {isGeneratingImage ? t('sharing') : t('share')}
              </button>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-gray-500">
              <p>{t('noResults')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;