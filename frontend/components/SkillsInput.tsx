'use client';

import { KeyboardEvent, useState } from 'react';

interface SkillsInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsInput({ skills, onChange }: SkillsInputProps) {
  const [input, setInput] = useState('');

  function addSkill(value: string) {
    const trimmed = value.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(input);
    } else if (e.key === 'Backspace' && !input && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((s) => s !== skill));
  }

  return (
    <div className="border border-border-subtle rounded-md p-2.5 flex flex-wrap gap-1.5 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-colors bg-background">
      {skills.map((skill) => (
        <span
          key={skill}
          className="flex items-center gap-1.5 bg-hover text-primary text-sm px-2.5 py-1 rounded-md border border-border-subtle font-medium"
        >
          {skill}
          <button
            type="button"
            onClick={() => removeSkill(skill)}
            className="text-secondary hover:text-primary leading-none transition-colors cursor-pointer"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addSkill(input)}
        placeholder={skills.length === 0 ? 'Ex: Python, React (Enter ou vírgula)' : ''}
        className="flex-1 min-w-[150px] outline-none text-sm bg-transparent text-primary placeholder:text-secondary"
      />
    </div>
  );
}
