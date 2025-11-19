
import React, { useState, useRef, useEffect } from 'react';
import type { Team } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { CloseIcon, MoveIcon } from './Icons';

interface TeamCardProps {
  team: Team;
  isActive: boolean;
  isDragOver: boolean;
  onColorChange: (teamId: number, color: string) => void;
  onTeamNameChange: (teamId: number, newName: string) => void;
  onUnassignMember: (memberName: string, fromTeamId: number) => void;
  onDrop: (e: React.DragEvent, teamId: number, index?: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (teamId: number) => void;
  onDragLeave: () => void;
  onPlayerDragStart: (e: React.DragEvent, memberName: string, fromTeamId: number, index: number) => void;
}

const getContrastingTextColor = (hex: string): string => {
  if (!hex) return '#FFFFFF';
  
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  if (cleanHex.length !== 6 && cleanHex.length !== 3) return '#FFFFFF';

  let r, g, b;
  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  }

  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

  return (yiq >= 128) ? '#000000' : '#FFFFFF';
};


export const TeamCard: React.FC<TeamCardProps> = ({ 
  team, 
  onColorChange, 
  onTeamNameChange,
  onUnassignMember, 
  isActive, 
  isDragOver, 
  onDrop, 
  onDragLeave, 
  onDragEnter, 
  onDragOver, 
  onPlayerDragStart 
}) => {
  const t = useTranslations();
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentName, setCurrentName] = useState(team.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    if (!isEditingName) {
      setCurrentName(team.name);
    }
  }, [team.name, isEditingName]);

  const handleNameSave = () => {
    if (currentName.trim() && currentName.trim() !== team.name) {
      onTeamNameChange(team.id, currentName.trim());
    } else {
      setCurrentName(team.name);
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setCurrentName(team.name);
      setIsEditingName(false);
    }
  };
  
  return (
    <div
      onDrop={(e) => onDrop(e, team.id)}
      onDragOver={onDragOver}
      onDragEnter={() => onDragEnter(team.id)}
      onDragLeave={onDragLeave}
      className={`flex flex-col rounded-xl overflow-hidden shadow-lg bg-gray-700 h-full transition-all duration-200 ring-4 ${
        isDragOver ? 'ring-green-500' : isActive ? 'ring-blue-500' : 'ring-transparent'
      }`}
    >
      <div
        className="p-3 font-bold text-lg flex items-center justify-between"
        style={{ backgroundColor: team.color, color: getContrastingTextColor(team.color) }}
      >
        {isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={currentName}
            onChange={(e) => setCurrentName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-b-2 font-bold text-lg w-full focus:outline-none flex-grow"
            style={{ 
                borderColor: getContrastingTextColor(team.color),
                color: getContrastingTextColor(team.color)
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Edit name for ${team.name}`}
          />
        ) : (
          <span
            onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }}
            className="cursor-pointer hover:opacity-75 flex-grow truncate"
            title={t('editTeamName')}
          >
            {team.name}
          </span>
        )}

        <div className="relative w-8 h-8 ml-2 flex-shrink-0">
          <input
            type="color"
            value={team.color}
            onChange={(e) => {
                e.stopPropagation();
                onColorChange(team.id, e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label={`Change color for ${team.name}`}
          />
          <div
            className="w-full h-full rounded-full border-2"
            style={{ 
              backgroundColor: team.color,
              borderColor: getContrastingTextColor(team.color) === '#000000' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
            }}
          ></div>
        </div>
      </div>
      <div className="p-4 flex-grow">
        <h4 className="font-semibold text-gray-400 mb-2 text-sm">{t('members')}: {team.members.length}</h4>
        {team.members.length > 0 ? (
            <ul className="space-y-1 text-gray-200 text-sm">
            {team.members.map((member, index) => (
                <React.Fragment key={`${member}-${index}`}>
                    <li 
                        draggable="true"
                        onDragStart={(e) => onPlayerDragStart(e, member, team.id, index)}
                        onDragOver={(e) => e.preventDefault()} 
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); // Prevent drop on container
                            onDrop(e, team.id, index);
                        }}
                        // touch-none is crucial for mobile-drag-drop
                        className="px-2 py-1 rounded flex items-center justify-between font-medium transition-opacity hover:opacity-80 touch-none"
                        style={{
                            backgroundColor: team.color,
                            color: getContrastingTextColor(team.color),
                        }}
                        title={t('dragToMove')}
                    >
                        <div className="flex items-center gap-2 flex-grow cursor-grab">
                            <MoveIcon />
                            <span className="truncate pr-2">{member}</span>
                        </div>
                        <button
                            onClick={() => onUnassignMember(member, team.id)}
                            className="p-1 rounded-full opacity-70 hover:opacity-100 hover:bg-black/20 transition-all"
                            aria-label={`${t('unassign')} ${member}`}
                            title={`${t('unassign')} ${member}`}
                        >
                            <CloseIcon />
                        </button>
                    </li>
                    {index === 4 && team.members.length > 5 && (
                        <li className="h-0.5 w-full bg-gray-500/50 my-2 rounded-full" aria-hidden="true"></li>
                    )}
                </React.Fragment>
            ))}
            </ul>
        ) : (
            <p className="text-gray-500 text-center italic mt-4">{t('noMembersYet')}</p>
        )}
      </div>
    </div>
  );
};
