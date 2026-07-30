'use client';

/**
 * Contexte léger exposant le projet Supabase courant (id + si l'utilisateur en
 * est le propriétaire/planner). Renseigné par ProjectSync au chargement, lu par
 * le panneau de partage. Séparé du store métier (pas de dépendance au plan).
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

interface ProjectContextValue {
  projectId: string | null;
  isOwner: boolean;
  setProject: (id: string | null, isOwner: boolean) => void;
}

const ProjectContext = createContext<ProjectContextValue>({
  projectId: null,
  isOwner: false,
  setProject: () => {},
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ projectId: string | null; isOwner: boolean }>({
    projectId: null,
    isOwner: false,
  });
  return (
    <ProjectContext.Provider
      value={{
        projectId: state.projectId,
        isOwner: state.isOwner,
        setProject: (projectId, isOwner) => setState({ projectId, isOwner }),
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
